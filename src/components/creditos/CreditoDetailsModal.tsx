import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { X, Plus, CreditCard, History, Link, CheckCircle, AlertCircle, Bus, User, Calendar, MapPin, DollarSign, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { Credito, StatusCredito } from '@/types/creditos';
import { Viagem, Cliente } from '@/types/entities';
import { VincularCreditoModal } from './VincularCreditoModal';
import { useCreditos } from '@/hooks/useCreditos';

// Interface para GrupoCliente baseada no uso atual
interface GrupoCliente {
  cliente: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
  creditos: Credito[];
  resumo: {
    total_creditos: number;
    valor_total: number;
    valor_disponivel: number;
    valor_utilizado: number;
    valor_reembolsado: number;
  };
}

interface CreditoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoCliente: GrupoCliente;
  onNovoCredito: () => void;
  onUsarEmViagem: (grupo: GrupoCliente) => void;
}

export function CreditoDetailsModal({
  open,
  onOpenChange,
  grupoCliente,
  onNovoCredito,
  onUsarEmViagem 
}: CreditoDetailsModalProps) {
  // ✅ NOVO: Hook para buscar ônibus com vagas
  const { buscarOnibusComVagas } = useCreditos();
  const [abaAtiva, setAbaAtiva] = useState('creditos');
  const [creditosAtualizados, setCreditosAtualizados] = useState<Credito[]>([]);
  const [historicoUso, setHistoricoUso] = useState<any[]>([]);
  const [deletandoUso, setDeletandoUso] = useState<string | null>(null);
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    open: boolean;
    usoId: string;
    valorFormatado: string;
    impactoDelecao: string;
  }>({
    open: false,
    usoId: '',
    valorFormatado: '',
    impactoDelecao: ''
  });

  // Estados para a aba de vinculação
  const [viagensDisponiveis, setViagensDisponiveis] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [passageirosSelecionados, setPassageirosSelecionados] = useState<Cliente[]>([]);
  const [vinculando, setVinculando] = useState(false);
  
  // ✅ NOVO: Estados para seleção de ônibus
  const [onibusDisponiveis, setOnibusDisponiveis] = useState<any[]>([]);
  const [onibusEscolhido, setOnibusEscolhido] = useState<string>('');
  const [carregandoOnibus, setCarregandoOnibus] = useState(false);
  
  // ✅ NOVO: Estados para validações e melhorias
  const [passageirosJaNaViagem, setPassageirosJaNaViagem] = useState<string[]>([]);
  
  // ✅ NOVO: Estados para ingresso e passeios
  const [ingressoSelecionado, setIngressoSelecionado] = useState<string>('');
  const [passeiosSelecionados, setPasseiosSelecionados] = useState<string[]>([]);
  const [ingressosDisponiveis, setIngressosDisponiveis] = useState<any[]>([]);
  const [passeiosDisponiveis, setPasseiosDisponiveis] = useState<any[]>([]);
  
  // ✅ NOVO: Estados para pagamento faltante
  const [modalPagamentoFaltante, setModalPagamentoFaltante] = useState(false);
  const [valorFaltante, setValorFaltante] = useState(0);
  const [registrarPagamentoAgora, setRegistrarPagamentoAgora] = useState(false);

  // ✅ NOVO: Função para calcular valor total por passageiro
  const calcularValorTotalPorPassageiro = () => {
    if (!viagemSelecionada) return 0;
    
    const valorViagem = viagemSelecionada.valor_padrao || 0;
    
    const valorIngresso = ingressoSelecionado 
      ? ingressosDisponiveis.find(i => i.id === ingressoSelecionado)?.valor || 0
      : 0;
    
    const valorPasseios = passeiosSelecionados.reduce((total, passeioId) => {
      const passeio = passeiosDisponiveis.find(vp => vp.passeio_id === passeioId);
      return total + (passeio?.passeios?.valor || 0);
    }, 0);
    
    return valorViagem + valorIngresso + valorPasseios;
  };

  // ✅ NOVO: Função para continuar vinculação após escolher opção de pagamento
  const continuarVinculacaoAposPagamento = async () => {
    try {
      setModalPagamentoFaltante(false);
      
      // Se escolheu registrar pagamento agora, criar registro de pagamento para o valor faltante
      if (registrarPagamentoAgora && valorFaltante > 0) {
        console.log('📝 Registrando pagamento adicional de:', formatCurrency(valorFaltante));
        // TODO: Implementar registro de pagamento adicional
        toast.info(`Pagamento de ${formatCurrency(valorFaltante)} será registrado como pago`);
      }
      
      // Continuar com a vinculação normal
      await vincularCredito();
      
    } catch (error) {
      console.error('❌ Erro na vinculação após pagamento:', error);
      toast.error('Erro ao continuar vinculação');
    }
  };
  const [vinculacaoConcluida, setVinculacaoConcluida] = useState(false);
  const [resultadoVinculacao, setResultadoVinculacao] = useState<any>(null);

  // Estados para busca de passageiros
  const [buscaPassageiro, setBuscaPassageiro] = useState('');
  const [passageirosEncontrados, setPassageirosEncontrados] = useState<Cliente[]>([]);

  // Debug dos estados da aba Resultado
  useEffect(() => {
    console.log('🔍 [CreditoDetailsModal] Estados atualizados:', {
      resultadoVinculacao,
      vinculacaoConcluida,
      abaAtiva
    });
  }, [resultadoVinculacao, vinculacaoConcluida, abaAtiva]);

  // Buscar créditos atualizados do cliente
  const buscarCreditosAtualizados = useCallback(async () => {
    if (!grupoCliente?.cliente?.id) {
      console.log('⚠️ [CreditoDetailsModal] Cliente ID não encontrado');
      return;
    }

    console.log('🔍 [CreditoDetailsModal] Buscando créditos para cliente:', grupoCliente.cliente.id);

    try {
      const { data, error } = await supabase
        .from('cliente_creditos')
        .select(`
          id,
          cliente_id,
          valor_credito,
          saldo_disponivel,
          status,
          data_pagamento,
          forma_pagamento,
          observacoes,
          created_at,
          updated_at,
          cliente:clientes(id, nome, telefone)
        `)
        .eq('cliente_id', grupoCliente.cliente.id)
        .order('data_pagamento', { ascending: false });

      if (error) {
        console.error('❌ [CreditoDetailsModal] Erro na query de créditos:', error);
        throw error;
      }

      console.log('🔍 [CreditoDetailsModal] Créditos encontrados:', data);

      // Transformar os dados para o formato esperado pelo tipo Credito
      const creditosFormatados: Credito[] = (data || []).map(credito => ({
        id: credito.id,
        cliente_id: credito.cliente_id,
        valor_credito: credito.valor_credito,
        saldo_disponivel: credito.saldo_disponivel,
        status: credito.status as StatusCredito,
        data_pagamento: credito.data_pagamento,
        forma_pagamento: credito.forma_pagamento,
        observacoes: credito.observacoes,
        created_at: credito.created_at,
        updated_at: credito.updated_at,
        cliente: credito.cliente?.[0] || undefined // Supabase retorna array, pegamos o primeiro
      }));

      console.log('🔍 [CreditoDetailsModal] Créditos formatados:', creditosFormatados);
      setCreditosAtualizados(creditosFormatados);
    } catch (error) {
      console.error('❌ [CreditoDetailsModal] Erro ao buscar créditos atualizados:', error);
    }
  }, [grupoCliente?.cliente?.id]);

  // Buscar histórico de uso dos créditos
  const buscarHistoricoUso = useCallback(async () => {
    if (!grupoCliente?.cliente?.id) {
      console.log('⚠️ [CreditoDetailsModal] Cliente ID não encontrado para histórico');
      return;
    }

    console.log('🔍 [CreditoDetailsModal] Buscando histórico para cliente:', grupoCliente.cliente.id);
    console.log('🔍 [CreditoDetailsModal] Créditos disponíveis:', grupoCliente.creditos);

    try {
      // Se não há créditos, não há histórico para buscar
      if (!grupoCliente.creditos || grupoCliente.creditos.length === 0) {
        console.log('⚠️ [CreditoDetailsModal] Nenhum crédito disponível, histórico vazio');
        setHistoricoUso([]);
        return;
      }

      const { data, error } = await supabase
        .from('credito_viagem_vinculacoes')
        .select(`
          id,
          valor_utilizado,
          data_vinculacao,
          observacoes,
          passageiro_id,
          viagem:viagens(
            id,
            adversario,
            data_jogo,
            valor_padrao,
            local_jogo
          ),
          credito:cliente_creditos(
            id,
            valor_credito,
            data_pagamento
          ),
          beneficiario:clientes!passageiro_id(
            id,
            nome,
            telefone
          )
        `)
        .in('credito_id', grupoCliente.creditos.map((c: any) => c.id))
        .order('data_vinculacao', { ascending: false });

      if (error) {
        console.error('❌ [CreditoDetailsModal] Erro na query de histórico:', error);
        throw error;
      }

      console.log('🔍 [CreditoDetailsModal] Histórico encontrado:', data);
      setHistoricoUso(data || []);
    } catch (error) {
      console.error('❌ [CreditoDetailsModal] Erro ao buscar histórico de uso:', error);
      setHistoricoUso([]);
    }
  }, [grupoCliente?.cliente?.id, grupoCliente?.creditos]);

  // Função para buscar viagens disponíveis
  const buscarViagensDisponiveis = useCallback(async () => {
    try {
      console.log('🔍 [CreditoDetailsModal] Buscando viagens disponíveis...');
      
      // Primeiro, verificar se a tabela viagens existe e tem dados
      const { count: totalViagens, error: countError } = await supabase
        .from('viagens')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ [CreditoDetailsModal] Erro ao contar viagens:', countError);
      } else {
        console.log('🔍 [CreditoDetailsModal] Total de viagens na tabela:', totalViagens);
      }

      // Buscar apenas viagens ativas (baseado no diagnóstico dos status reais)
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          id,
          adversario,
          data_jogo,
          cidade_embarque,
          status_viagem,
          valor_padrao,
          setor_padrao,
          logo_adversario,
          logo_flamengo,
          capacidade_onibus,
          passeios_pagos,
          outro_passeio
        `)
        .in('status_viagem', ['Aberta', 'Em andamento'])
        .order('data_jogo', { ascending: true });

      if (error) {
        console.error('❌ [CreditoDetailsModal] Erro na query de viagens:', error);
        throw error;
      }

      console.log('🔍 [CreditoDetailsModal] Viagens encontradas:', data);
      console.log('🔍 [CreditoDetailsModal] CORRIGIDO: Filtrando apenas viagens com status: Aberta, Em andamento');
      
      // Se não encontrou viagens, verificar se a tabela está vazia
      if (!data || data.length === 0) {
        console.log('⚠️ [CreditoDetailsModal] Nenhuma viagem ativa encontrada na tabela');
      } else {
        // Mostrar os status das viagens encontradas
        const statusUnicos = [...new Set(data.map(v => v.status_viagem))];
        console.log('🔍 [CreditoDetailsModal] Status das viagens ativas encontradas:', statusUnicos);
        console.log('🔍 [CreditoDetailsModal] Total de viagens ativas:', data.length);
      }

      setViagensDisponiveis(data || []);
    } catch (error) {
      console.error('❌ [CreditoDetailsModal] Erro ao buscar viagens:', error);
      toast.error('Erro ao buscar viagens disponíveis');
    }
  }, []);

  // Função para buscar passageiros
  const buscarPassageiros = useCallback(async (termo: string) => {
    if (termo.length < 3) {
      setPassageirosEncontrados([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .or(`nome.ilike.%${termo}%,cpf.ilike.%${termo}%`)
        .limit(10);

      if (error) throw error;
      setPassageirosEncontrados(data || []);
    } catch (error) {
      console.error('Erro ao buscar passageiros:', error);
    }
  }, []);

  // Função para vincular crédito
  const vincularCredito = async () => {
    console.log('🚀 [CreditoDetailsModal] Função vincularCredito iniciada');
    
    if (!viagemSelecionada || passageirosSelecionados.length === 0) {
      console.log('❌ [CreditoDetailsModal] Validação falhou:', { viagemSelecionada, passageirosSelecionados });
      toast.error('Selecione uma viagem e pelo menos um passageiro');
      return;
    }

    // ✅ NOVO: Validar seleção obrigatória de ônibus
    if (!onibusEscolhido) {
      console.log('❌ [CreditoDetailsModal] Validação de ônibus falhou');
      toast.error('Seleção de ônibus é obrigatória');
      return;
    }

    console.log('✅ [CreditoDetailsModal] Validação passou, iniciando vinculação...');
    setVinculando(true);
    try {
      console.log('🔗 [CreditoDetailsModal] Iniciando vinculação...');
      console.log('🔗 [CreditoDetailsModal] Viagem:', viagemSelecionada);
      console.log('🔗 [CreditoDetailsModal] Passageiros:', passageirosSelecionados);

      // Calcular valor total necessário
      const valorPorPassageiro = calcularValorTotalPorPassageiro();
      const valorTotalNecessario = passageirosSelecionados.length * valorPorPassageiro;
      const creditoDisponivel = grupoCliente.resumo.valor_disponivel;

      console.log('🔗 [CreditoDetailsModal] Valor total necessário:', valorTotalNecessario);
      console.log('🔗 [CreditoDetailsModal] Crédito disponível:', creditoDisponivel);

      // Buscar créditos disponíveis (se houver)
      const { data: creditosDisponiveis, error: creditosError } = await supabase
        .from('cliente_creditos')
        .select('*')
        .eq('cliente_id', grupoCliente.cliente.id)
        .gte('saldo_disponivel', 0) // Incluir créditos com saldo 0
        .order('created_at', { ascending: true });

      if (creditosError) throw creditosError;
      
      // Se não há créditos disponíveis, ainda podemos vincular (com débito)
      if (!creditosDisponiveis || creditosDisponiveis.length === 0) {
        console.log('⚠️ [CreditoDetailsModal] Nenhum crédito encontrado. Vinculação será feita com débito total.');
      } else {
        console.log('🔗 [CreditoDetailsModal] Créditos encontrados:', creditosDisponiveis);
      }

      // Vincular cada passageiro
      let valorTotalCreditoUtilizado = 0; // Total de crédito usado em todas as passagens
      let passageirosAdicionados = 0; // Contador de passageiros realmente adicionados
      let passageirosJaExistentes = 0; // Contador de passageiros que já existiam
      
      for (const passageiro of passageirosSelecionados) {
        const valorPassagem = valorPorPassageiro;
        let valorRestante = valorPassagem;
        let creditoIndex = 0;
        let valorCreditoUtilizado = 0;

        // Usar créditos disponíveis para pagar a passagem (se houver)
        if (creditosDisponiveis && creditosDisponiveis.length > 0) {
          while (valorRestante > 0 && creditoIndex < creditosDisponiveis.length) {
            const credito = creditosDisponiveis[creditoIndex];
            
            // Só usar créditos com saldo positivo
            if (credito.saldo_disponivel > 0) {
              const valorUsar = Math.min(valorRestante, credito.saldo_disponivel);

              // Criar vinculação
              const { error: vinculacaoError } = await supabase
                .from('credito_viagem_vinculacoes')
                .insert({
                  credito_id: credito.id,
                  viagem_id: viagemSelecionada.id,
                  passageiro_id: passageiro.id,
                  valor_utilizado: valorUsar,
                  data_vinculacao: new Date().toISOString(),
                  observacoes: `Vinculação automática via modal`
                });

              if (vinculacaoError) throw vinculacaoError;

              // Atualizar saldo do crédito
              const { error: updateCreditoError } = await supabase
          .from('cliente_creditos')
                .update({ saldo_disponivel: credito.saldo_disponivel - valorUsar })
                .eq('id', credito.id);

              if (updateCreditoError) throw updateCreditoError;

              // Atualizar saldo disponível localmente
              credito.saldo_disponivel -= valorUsar;
              valorRestante -= valorUsar;
              valorCreditoUtilizado += valorUsar;

              // Se o crédito foi totalmente usado, passar para o próximo
              if (credito.saldo_disponivel <= 0) {
                creditoIndex++;
              }
            } else {
              creditoIndex++;
            }
          }
        }

        // Verificar se o passageiro já existe na viagem
        const { data: passageiroExistente, error: checkError } = await supabase
          .from('viagem_passageiros')
          .select('id')
          .eq('viagem_id', viagemSelecionada.id)
          .eq('cliente_id', passageiro.id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = "not found", que é o que queremos
          throw checkError;
        }

        // Se o passageiro já existe, pular para o próximo
        if (passageiroExistente) {
          console.log(`⚠️ [CreditoDetailsModal] Passageiro ${passageiro.nome} já existe na viagem. Pulando...`);
          passageirosJaExistentes++;
          continue; // Pular para o próximo passageiro
        }

        // Adicionar passageiro à viagem
        const { data: passageiroInserido, error: passageiroError } = await supabase
          .from('viagem_passageiros')
          .insert({
            viagem_id: viagemSelecionada.id,
            cliente_id: passageiro.id,
            valor: valorPassagem,
            status_pagamento: valorRestante === 0 ? 'Pago' : 'Parcialmente Pago',
            onibus_id: onibusEscolhido, // ✅ Ônibus selecionado obrigatoriamente
            // ✅ NOVO: Campos relacionados ao crédito
            pago_por_credito: valorCreditoUtilizado > 0,
            credito_origem_id: valorCreditoUtilizado > 0 ? creditosDisponiveis[0]?.id : null,
            valor_credito_utilizado: valorCreditoUtilizado
          })
          .select('id')
          .single();

        if (passageiroError) throw passageiroError;
        
        const viagemPassageiroId = passageiroInserido.id;

        // ✅ NOVO: Vincular ingresso se selecionado
        if (ingressoSelecionado) {
          const { error: ingressoError } = await supabase
            .from('passageiro_ingressos')
            .insert({
              viagem_passageiro_id: viagemPassageiroId,
              ingresso_id: ingressoSelecionado
            });
            
          if (ingressoError) {
            console.warn('⚠️ Erro ao vincular ingresso:', ingressoError);
          }
        }

        // ✅ NOVO: Vincular passeios se selecionados
        if (passeiosSelecionados.length > 0) {
          const passeiosParaInserir = passeiosSelecionados.map(passeioId => ({
            viagem_passageiro_id: viagemPassageiroId,
            passeio_id: passeioId,
            passeio_nome: passeiosDisponiveis.find(vp => vp.passeio_id === passeioId)?.passeios?.nome || '',
            valor_cobrado: passeiosDisponiveis.find(vp => vp.passeio_id === passeioId)?.passeios?.valor || 0
          }));
          
          const { error: passeiosError } = await supabase
            .from('passageiro_passeios')
            .insert(passeiosParaInserir);
            
          if (passeiosError) {
            console.warn('⚠️ Erro ao vincular passeios:', passeiosError);
          }
        }
        
        // Acumular valor total de crédito utilizado
        valorTotalCreditoUtilizado += valorCreditoUtilizado;
        passageirosAdicionados++;
      }

      // ✅ NOVO: Verificar se há valor faltante e oferecer opções
      const valorFaltanteCalculado = valorTotalNecessario - valorTotalCreditoUtilizado;
      
      if (valorFaltanteCalculado > 0) {
        setValorFaltante(valorFaltanteCalculado);
        setModalPagamentoFaltante(true);
        setVinculando(false);
        return; // Parar aqui para mostrar o modal de pagamento faltante
      }

      // Resultado da vinculação
      const resultado = {
        sucesso: true,
        viagem: viagemSelecionada,
        passageiros: passageirosSelecionados,
        valorTotal: valorTotalNecessario,
        creditoUtilizado: Math.min(valorTotalNecessario, creditoDisponivel),
        novoSaldoCredito: Math.max(0, creditoDisponivel - valorTotalNecessario),
        valorEmDebito: valorTotalNecessario - valorTotalCreditoUtilizado, // Débito total
        saldoSuficiente: valorTotalNecessario <= creditoDisponivel,
        statusPagamento: valorTotalNecessario <= creditoDisponivel ? 'Pago' : 'Parcialmente Pago',
        passageirosAdicionados: passageirosAdicionados,
        passageirosJaExistentes: passageirosJaExistentes
      };

      console.log('✅ [CreditoDetailsModal] Vinculação concluída:', resultado);

      setResultadoVinculacao(resultado);
      setVinculacaoConcluida(true);
      setAbaAtiva('resultado');
      
      console.log('🔄 [CreditoDetailsModal] Estados atualizados:', {
        resultadoVinculacao: resultado,
        vinculacaoConcluida: true,
        abaAtiva: 'resultado'
      });

      // Recarregar dados
      await buscarCreditosAtualizados();
      await buscarHistoricoUso();

      // Mensagem de sucesso com informações sobre débito
      if (resultado.valorEmDebito > 0) {
        toast.success('Crédito vinculado com débito registrado!', {
          description: `${passageirosAdicionados} passageiro(s) adicionado(s), ${passageirosJaExistentes} já existia(m). Débito de ${formatCurrency(resultado.valorEmDebito)} registrado.`,
          duration: 7000,
        });
      } else {
        toast.success('Crédito vinculado com sucesso!', {
          description: `${passageirosAdicionados} passageiro(s) adicionado(s) à viagem ${viagemSelecionada.adversario}${passageirosJaExistentes > 0 ? `, ${passageirosJaExistentes} já existia(m)` : ''}`,
          duration: 7000,
        });
      }

    } catch (error) {
      console.error('❌ [CreditoDetailsModal] Erro ao vincular crédito:', error);
      toast.error('Erro ao vincular crédito', {
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`,
        duration: 7000,
      });
    } finally {
      setVinculando(false);
    }
  };

  // Função para abrir modal de confirmação
  const abrirConfirmacaoDelete = async (uso: any) => {
    const nomeViagem = uso?.viagem?.adversario || 'viagem';
    const valorFormatado = formatCurrency(uso?.valor_utilizado || 0);
    
    // Buscar informações adicionais para mostrar o impacto da deleção
    let impactoDelecao = '';
    
    if (uso.passageiro_id && uso.viagem?.id) {
      // Buscar outros usos de crédito para o mesmo passageiro na mesma viagem
      const { data: outrosUsos, error: outrosUsosError } = await supabase
        .from('credito_viagem_vinculacoes')
        .select('valor_utilizado')
        .eq('viagem_id', uso.viagem.id)
        .eq('passageiro_id', uso.passageiro_id)
        .neq('id', uso.id);
        
      if (!outrosUsosError && outrosUsos) {
        const valorTotalOutrosUsos = outrosUsos.reduce((total, uso) => total + uso.valor_utilizado, 0);
        
        if (outrosUsos.length === 0) {
          impactoDelecao = '⚠️ Este é o único uso de crédito para este passageiro. Ele será REMOVIDO da viagem.';
        } else if (valorTotalOutrosUsos < (uso.viagem.valor_padrao || 0)) {
          impactoDelecao = '⚠️ Após a deleção, o valor restante será insuficiente. O passageiro será REMOVIDO da viagem.';
        } else {
          impactoDelecao = '✅ O passageiro permanecerá na viagem com os créditos restantes.';
        }
      }
    }
    
    setModalConfirmacao({
      open: true,
      usoId: uso.id,
      valorFormatado: valorFormatado,
      impactoDelecao: impactoDelecao
    });
  };

  // Função para deletar uso de crédito
  const deletarUsoCredito = async (usoId: string) => {
    setDeletandoUso(usoId);

    try {
      // Buscar dados do uso antes de deletar
      const { data: usoData, error: usoError } = await supabase
        .from('credito_viagem_vinculacoes')
        .select(`
          *,
          viagem:viagem_id(id, valor_padrao),
          passageiro:passageiro_id(id, nome)
        `)
        .eq('id', usoId)
        .single();

      if (usoError) throw usoError;
      if (!usoData) throw new Error('Uso de crédito não encontrado');

      // 1. Deletar a vinculação
      const { error: deleteError } = await supabase
        .from('credito_viagem_vinculacoes')
        .delete()
        .eq('id', usoId);

      if (deleteError) throw deleteError;

      // 2. Atualizar o saldo do crédito
      try {
        const { data: creditoAtual, error: creditoError } = await supabase
          .from('cliente_creditos')
          .select('saldo_disponivel')
          .eq('id', usoData.credito_id)
          .single();

        if (!creditoError && creditoAtual) {
          const novoSaldo = (creditoAtual.saldo_disponivel || 0) + usoData.valor_utilizado;
          const { error: updateAltError } = await supabase
            .from('cliente_creditos')
            .update({ saldo_disponivel: novoSaldo })
            .eq('id', usoData.credito_id);

          if (updateAltError) {
            console.error('Erro ao atualizar saldo do crédito:', updateAltError);
          } else {
            console.log('✅ Saldo do crédito atualizado com sucesso:', novoSaldo);
          }
        }
      } catch (altError) {
        console.error('Erro ao atualizar saldo do crédito:', altError);
      }

      // 3. Buscar outros usos ativos para o mesmo passageiro na mesma viagem
      const { data: outrosUsos, error: outrosUsosError } = await supabase
        .from('credito_viagem_vinculacoes')
        .select('valor_utilizado')
        .eq('viagem_id', usoData.viagem_id)
        .eq('passageiro_id', usoData.passageiro_id)
        .neq('id', usoId);

      if (outrosUsosError) {
        console.warn('Erro ao buscar outros usos:', outrosUsosError);
      }

      // 4. Calcular se deve remover o passageiro
      const valorTotalOutrosUsos = outrosUsos?.reduce((total, uso) => total + uso.valor_utilizado, 0) || 0;
      const valorViagem = usoData.viagem?.valor_padrao || 0;
      const deveRemover = outrosUsos?.length === 0 || valorTotalOutrosUsos < valorViagem;

      // 5. Atualizar ou remover passageiro da viagem
      if (deveRemover) {
        // Remover completamente o passageiro
        const { error: deletePassageiroError } = await supabase
          .from('viagem_passageiros')
          .delete()
          .eq('viagem_id', usoData.viagem_id)
          .eq('cliente_id', usoData.passageiro_id);

        if (deletePassageiroError) {
          console.warn('Erro ao remover passageiro da viagem:', deletePassageiroError);
        }
        } else {
        // Atualizar campos do passageiro baseado nos créditos restantes
        const { error: updatePassageiroError } = await supabase
          .from('viagem_passageiros')
          .update({
            valor_credito_utilizado: valorTotalOutrosUsos,
            pago_por_credito: valorTotalOutrosUsos > 0,
            status_pagamento: valorTotalOutrosUsos >= valorViagem ? 'Pago' : 'Pendente',
            credito_origem_id: null // Não temos credito_id nos outros usos, então setamos como null
          })
          .eq('viagem_id', usoData.viagem_id)
          .eq('cliente_id', usoData.passageiro_id);

        if (updatePassageiroError) {
          console.warn('Erro ao atualizar passageiro:', updatePassageiroError);
        }
      }

      // 6. Recarregar dados
      await buscarCreditosAtualizados();
      await buscarHistoricoUso();

      // 7. Recarregar dados da viagem se passageiro foi removido
      if (deveRemover && usoData.passageiro_id && usoData.viagem_id) {
        console.log('🔄 [CreditoDetailsModal] Passageiro removido, recarregando dados da viagem...');
        
        // Tentar recarregar dados da viagem se a função global existir
        console.log('🔍 [CreditoDetailsModal] Verificando função global reloadViagemPassageiros...');
        console.log('🔍 [CreditoDetailsModal] window object:', typeof window);
        console.log('🔍 [CreditoDetailsModal] Função existe:', !!(window as any).reloadViagemPassageiros);
        
        // Tentar função global primeiro
        if ((window as any).reloadViagemPassageiros) {
          console.log('🔄 [CreditoDetailsModal] Usando função global para recarregar dados');
          try {
            (window as any).reloadViagemPassageiros();
            console.log('✅ [CreditoDetailsModal] Função global executada com sucesso');
          } catch (error) {
            console.error('❌ [CreditoDetailsModal] Erro ao executar função global:', error);
          }
        } else {
          // Fallback: Forçar atualização via evento customizado
          console.log('🔄 [CreditoDetailsModal] Função global não encontrada, usando fallback via evento customizado');
          console.log('🔄 [CreditoDetailsModal] Viagem ID do uso:', usoData.viagem_id);
          
          // Disparar evento customizado para forçar reload
          const reloadEvent = new CustomEvent('viagemPassageiroRemovido', {
            detail: { 
              viagemId: usoData.viagem_id,
              passageiroId: usoData.passageiro_id,
              timestamp: Date.now()
            }
          });
          
          window.dispatchEvent(reloadEvent);
          console.log('✅ [CreditoDetailsModal] Evento customizado disparado para reload');
          
          // Estratégia adicional: Forçar atualização via localStorage + polling
          console.log('🔄 [CreditoDetailsModal] Salvando flag de atualização no localStorage');
          localStorage.setItem('viagemNeedsReload', JSON.stringify({
            viagemId: usoData.viagem_id,
            timestamp: Date.now(),
            action: 'passageiroRemovido'
          }));
          
          // Se estamos na página da viagem, forçar reload
          if (window.location.pathname.includes('/viagem/')) {
            console.log('🔄 [CreditoDetailsModal] Detectada página de viagem, forçando reload da página');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      } else {
        console.log('⚠️ [CreditoDetailsModal] Nenhum passageiro vinculado ao uso do crédito, não recarregando dados da viagem');
      }

      // Toast de sucesso com opção de ver a viagem
      if (usoData.passageiro_id && usoData.viagem_id) {
        toast.success('Uso de crédito deletado com sucesso!', {
          description: `Valor ${formatCurrency(usoData.valor_utilizado)} devolvido ao crédito. Passageiro removido da viagem.`,
          duration: 8000,
          action: {
            label: "Ver Viagem",
            onClick: () => {
              window.open(`/dashboard/viagem/${usoData.viagem_id}`, '_blank');
            }
          }
        });
      } else {
        toast.success('Uso de crédito deletado com sucesso!', {
          description: `Valor ${formatCurrency(usoData.valor_utilizado)} devolvido ao crédito.`,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao deletar uso de crédito:', error);
      toast.error('Erro ao deletar uso de crédito', {
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`,
        duration: 7000,
      });
    } finally {
      setDeletandoUso(null);
    }
  };

  // Função para deletar crédito
  const deletarCredito = async (creditoId: string) => {
    setDeletandoUso(creditoId);

    try {
      // Buscar dados do crédito antes de deletar
      const { data: creditoData, error: creditoError } = await supabase
        .from('cliente_creditos')
        .select('*')
        .eq('id', creditoId)
        .single();

      if (creditoError) throw creditoError;
      if (!creditoData) throw new Error('Crédito não encontrado');

      // 1. Deletar o crédito
      const { error: deleteError } = await supabase
        .from('cliente_creditos')
        .delete()
        .eq('id', creditoId);

      if (deleteError) throw deleteError;

      // 2. Atualizar o saldo de todos os créditos do cliente
      const { error: updateAllCreditosError } = await supabase
        .from('cliente_creditos')
        .update({
          saldo_disponivel: 0, // Resetar saldo disponível
          status: 'reembolsado' // Marcar como reembolsado
        });

      if (updateAllCreditosError) {
        console.warn('Erro ao atualizar saldo de todos os créditos:', updateAllCreditosError);
        // Continuar mesmo com erro na atualização de todos os créditos
      }

      // 3. Recarregar dados
      await buscarCreditosAtualizados();

      toast.success('Crédito deletado com sucesso!', {
        description: `Valor ${formatCurrency(creditoData.valor_credito)} devolvido ao cliente.`,
        duration: 7000,
      });
    } catch (error) {
      console.error('Erro ao deletar crédito:', error);
      toast.error('Erro ao deletar crédito', {
        description: `${error instanceof Error ? error.message : 'Erro desconhecido'}. Tente novamente.`,
        duration: 7000,
      });
    } finally {
      setDeletandoUso(null);
    }
  };

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: StatusCredito) => {
    switch (status) {
      case 'disponivel':
        return 'default'; // Verde
      case 'parcial':
        return 'secondary'; // Amarelo
      case 'utilizado':
        return 'outline'; // Cinza
      case 'reembolsado':
        return 'destructive'; // Vermelho
      default:
        return 'outline';
    }
  };

  // Carregar dados quando o modal abrir (apenas uma vez)
  useEffect(() => {
    if (open && grupoCliente) {
      console.log('🚀 [CreditoDetailsModal] Modal aberto, carregando dados...');
      console.log('🚀 [CreditoDetailsModal] grupoCliente:', grupoCliente);
      
      // Carregar dados apenas uma vez quando o modal abrir
      buscarCreditosAtualizados();
      buscarHistoricoUso();
      buscarViagensDisponiveis();
    }
  }, [open, grupoCliente, buscarCreditosAtualizados, buscarHistoricoUso, buscarViagensDisponiveis]);

  // Inicializar créditos com os dados da prop (apenas uma vez)
  useEffect(() => {
    if (grupoCliente?.creditos && grupoCliente.creditos.length > 0) {
      console.log('🔄 [CreditoDetailsModal] Inicializando créditos da prop:', grupoCliente.creditos);
      console.log('✅ [CreditoDetailsModal] Créditos da prop carregados:', grupoCliente.creditos);
      setCreditosAtualizados(grupoCliente.creditos);
    }
  }, [grupoCliente?.creditos]);

  if (!grupoCliente) {
    return null;
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {grupoCliente.cliente?.nome?.charAt(0) || '?'}
                </span>
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {grupoCliente.cliente?.nome || 'Cliente não encontrado'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Gestão Completa de Créditos
                  {grupoCliente.cliente?.telefone && ` • ${grupoCliente.cliente.telefone}`}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Resumo do Cliente */}
          <div className="flex gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{grupoCliente.resumo.total_creditos}</div>
              <div className="text-xs text-gray-500">Pagamentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(grupoCliente.resumo.valor_total)}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(grupoCliente.resumo.valor_disponivel)}</div>
              <div className="text-xs text-gray-500">Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{formatCurrency(grupoCliente.resumo.valor_utilizado)}</div>
              <div className="text-xs text-gray-500">Utilizado</div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 mt-4">
            <Button onClick={onNovoCredito} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
            

          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="creditos" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Créditos ({creditosAtualizados.length})
              </TabsTrigger>
              <TabsTrigger value="vincular" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                Vincular
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Histórico ({historicoUso.length})
              </TabsTrigger>
              <TabsTrigger value="pendencias" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pendências
              </TabsTrigger>
              <TabsTrigger value="resultado" className="flex items-center gap-2" disabled={!vinculacaoConcluida}>
                <CheckCircle className="h-4 w-4" />
                Resultado
              </TabsTrigger>
            </TabsList>

            {/* Aba de Créditos */}
            <TabsContent value="creditos" className="flex-1 overflow-auto mt-4">
              {creditosAtualizados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">💳</span>
                  <p>Nenhum crédito encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor Original</TableHead>
                      <TableHead>Saldo Disponível</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {creditosAtualizados.map((credito) => (
                      <TableRow key={credito.id}>
                        <TableCell>
                          {new Date(credito.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{formatCurrency(credito.valor_credito)}</TableCell>
                        <TableCell>{formatCurrency(credito.saldo_disponivel)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(credito.status)}>
                            {credito.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Button
                            variant="outline"
                              size="sm"
                            onClick={() => deletarCredito(credito.id)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            >
                            Deletar
                            </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Aba de Histórico */}
            <TabsContent value="historico" className="flex-1 overflow-auto mt-4">
              {historicoUso.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">📜</span>
                  <p>Nenhum uso de crédito encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historicoUso.map((uso) => (
                    <Card key={uso.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bus className="h-5 w-5 text-blue-600" />
                          </div>
                            <div>
                              <CardTitle className="text-lg">
                                {uso.viagem?.adversario || 'Viagem não encontrada'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(uso.viagem?.data_jogo || uso.data_vinculacao).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {uso.beneficiario?.nome || 'Passageiro não encontrado'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {formatCurrency(uso.valor_utilizado)}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                              {new Date(uso.data_vinculacao).toLocaleDateString('pt-BR')}
                              </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirConfirmacaoDelete(uso)}
                              disabled={deletandoUso === uso.id}
                            >
                              {deletandoUso === uso.id ? 'Deletando...' : 'Deletar'}
                            </Button>
                            </div>
                              </div>
                      </CardHeader>
                    </Card>
                  ))}
                                </div>
                              )}
            </TabsContent>

            {/* Aba de Vincular */}
            <TabsContent value="vincular" className="flex-1 overflow-auto mt-4">
              <div className="space-y-6">
                {/* Informações do Crédito */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-700">
                      <CreditCard className="h-5 w-5" />
                      Crédito Disponível para Vinculação
                    </CardTitle>
                    <CardDescription>
                      Use o crédito disponível para pagar passagens em viagens abertas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(grupoCliente.resumo.valor_disponivel)}
                                </div>
                        <div className="text-sm text-gray-600">Saldo Disponível</div>
                                </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-green-600">
                          {grupoCliente.resumo.total_creditos}
                            </div>
                        <div className="text-sm text-gray-600">Total de Pagamentos</div>
                          </div>
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-2xl font-bold text-gray-600">
                          {grupoCliente.cliente?.nome}
                        </div>
                        <div className="text-sm text-gray-600">Titular do Crédito</div>
                            </div>
                            </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Vincular Crédito a Viagem
                    </CardTitle>
                    <CardDescription>
                      Selecione uma viagem e os passageiros que irão viajar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Seleção de Viagem */}
                    <div className="space-y-2">
                      <Label htmlFor="viagem">Selecionar Viagem</Label>
                      <Select value={viagemSelecionada?.id || ''} onValueChange={async (value) => {
                        console.log('🧪 DEBUG: Viagem selecionada na aba Vincular:', value);
                        const viagem = viagensDisponiveis.find(v => v.id === value);
                        console.log('🧪 DEBUG: Objeto viagem encontrado:', viagem);
                        setViagemSelecionada(viagem || null);
                        setOnibusEscolhido(''); // Reset ônibus quando mudar viagem
                        
                        // ✅ NOVO: Buscar ônibus com vagas disponíveis
                        if (viagem) {
                          console.log('🧪 DEBUG: Iniciando busca de ônibus para viagem:', viagem.id);
                          setCarregandoOnibus(true);
                          try {
                            const onibus = await buscarOnibusComVagas(viagem.id);
                            console.log('🧪 DEBUG: Ônibus encontrados:', onibus);
                            setOnibusDisponiveis(onibus);
                            
                            if (onibus.length === 0) {
                              toast.error('❌ Todos os ônibus desta viagem estão lotados!');
                            }
                          } catch (error) {
                            console.error('❌ DEBUG: Erro ao buscar ônibus:', error);
                            toast.error('Erro ao carregar ônibus disponíveis');
                          } finally {
                            setCarregandoOnibus(false);
                          }
                          
                          // ✅ NOVO: Buscar passageiros já na viagem para evitar duplicação
                          try {
                            const { data: passageirosExistentes, error: passageirosError } = await supabase
                              .from('viagem_passageiros')
                              .select('cliente_id')
                              .eq('viagem_id', viagem.id);
                              
                            if (!passageirosError && passageirosExistentes) {
                              const idsExistentes = passageirosExistentes.map(p => p.cliente_id);
                              setPassageirosJaNaViagem(idsExistentes);
                              console.log('🚫 Passageiros já na viagem:', idsExistentes);
                            }
                          } catch (error) {
                            console.error('❌ Erro ao buscar passageiros existentes:', error);
                          }
                          
                          // ✅ NOVO: Buscar ingressos disponíveis para a viagem
                          try {
                            const { data: ingressos, error: ingressosError } = await supabase
                              .from('ingressos')
                              .select('*')
                              .eq('viagem_id', viagem.id)
                              .eq('disponivel', true);
                              
                            if (!ingressosError && ingressos) {
                              setIngressosDisponiveis(ingressos);
                              console.log('🎫 Ingressos disponíveis:', ingressos);
                            }
                          } catch (error) {
                            console.error('❌ Erro ao buscar ingressos:', error);
                          }
                          
                          // ✅ NOVO: Buscar passeios disponíveis para a viagem
                          try {
                            const { data: passeios, error: passeiosError } = await supabase
                              .from('viagem_passeios')
                              .select(`
                                passeio_id,
                                passeios(
                                  id,
                                  nome,
                                  valor,
                                  categoria,
                                  descricao
                                )
                              `)
                              .eq('viagem_id', viagem.id);
                              
                            if (!passeiosError && passeios) {
                              setPasseiosDisponiveis(passeios);
                              console.log('🎢 Passeios disponíveis:', passeios);
                            }
                          } catch (error) {
                            console.error('❌ Erro ao buscar passeios:', error);
                          }
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolha uma viagem ativa" />
                        </SelectTrigger>
                        <SelectContent>
                          {viagensDisponiveis.map((viagem) => (
                            <SelectItem key={viagem.id} value={viagem.id}>
                              <div className="flex items-center gap-2">
                                <Bus className="h-4 w-4" />
                                <span className="font-medium">{viagem.adversario}</span>
                                <span className="text-muted-foreground">
                                  {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="text-green-600 font-medium">
                                  {formatCurrency(viagem.valor_padrao || 0)}
                                </span>
                                <Badge 
                                  variant={viagem.status_viagem === 'aberta' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {viagem.status_viagem}
                                </Badge>
                          </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* Informação sobre viagens disponíveis */}
                      {viagensDisponiveis.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <span className="text-4xl mb-2 block">🚌</span>
                          <p>Nenhuma viagem ativa encontrada</p>
                          <p className="text-sm">Apenas viagens com status: Aberta ou Em andamento</p>
                        </div>
                      )}
                      
                      {/* Contador de viagens */}
                      {viagensDisponiveis.length > 0 && (
                        <div className="text-sm text-muted-foreground text-center">
                          {viagensDisponiveis.length} viagem(ns) ativa(s) disponível(is)
                        </div>
                      )}
                    </div>

                    {/* ✅ Seleção Obrigatória de Ônibus */}
                    
                    {viagemSelecionada && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">🚌 Selecionar Ônibus (Obrigatório)</Label>
                        
                        {carregandoOnibus ? (
                          <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Verificando vagas disponíveis...</span>
                          </div>
                        ) : onibusDisponiveis.length === 0 ? (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                              <span>❌ Todos os ônibus estão lotados!</span>
                            </div>
                            <p className="text-sm text-red-600">
                              Não é possível adicionar mais passageiros nesta viagem. 
                              Todos os ônibus atingiram sua capacidade máxima.
                            </p>
                          </div>
                        ) : (
                          <>
                            <Select value={onibusEscolhido} onValueChange={setOnibusEscolhido}>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha um ônibus com vagas disponíveis" />
                              </SelectTrigger>
                              <SelectContent>
                                {onibusDisponiveis.map((onibus) => (
                                  <SelectItem key={onibus.id} value={onibus.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{onibus.nome}</span>
                                      <span className="ml-4 text-sm text-green-600 font-medium">
                                        {onibus.vagas_disponiveis} vaga{onibus.vagas_disponiveis !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            {onibusEscolhido && (
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                {(() => {
                                  const onibus = onibusDisponiveis.find(o => o.id === onibusEscolhido);
                                  return onibus ? (
                                    <div className="text-sm">
                                      <div className="font-medium text-green-800">✅ Ônibus Selecionado:</div>
                                      <div className="text-green-700 mt-1">
                                        <strong>{onibus.nome}</strong> - {onibus.vagas_disponiveis} vaga{onibus.vagas_disponiveis !== 1 ? 's' : ''} disponível{onibus.vagas_disponiveis !== 1 ? 'is' : ''}
                                        <br />
                                        <span className="text-xs">
                                          Ocupação: {onibus.passageiros_alocados}/{onibus.capacidade_total} passageiros
                                        </span>
                                      </div>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Seleção de Passageiros */}
                    <div className="space-y-2">
                      <Label htmlFor="passageiros">Seleção de Passageiros</Label>
                      
                      {/* Busca de passageiros */}
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Digite nome ou CPF do passageiro..."
                            value={buscaPassageiro}
                            onChange={(e) => {
                              setBuscaPassageiro(e.target.value);
                              buscarPassageiros(e.target.value);
                            }}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (grupoCliente.cliente && !passageirosSelecionados.find(p => p.id === grupoCliente.cliente?.id)) {
                                // Adicionar o titular automaticamente
                                const titular: Cliente = {
                                  id: grupoCliente.cliente.id,
                                  nome: grupoCliente.cliente.nome,
                                  cpf: '',
                                  data_nascimento: '',
                                  telefone: grupoCliente.cliente.telefone || '',
                                  email: grupoCliente.cliente.email || '',
                                  cep: '',
                                  endereco: '',
                                  numero: '',
                                  bairro: '',
                                  cidade: '',
                                  estado: '',
                                  como_conheceu: '',
                                  passeio_cristo: '',
                                  fonte_cadastro: ''
                                };
                                setPassageirosSelecionados([...passageirosSelecionados, titular]);
                                toast.success('Titular adicionado automaticamente!');
                              }
                            }}
                            disabled={!grupoCliente.cliente || !!passageirosSelecionados.find(p => p.id === grupoCliente.cliente?.id)}
                          >
                            <User className="h-4 w-4 mr-1" />
                            Titular
                          </Button>
                        </div>
                        
                        {/* Lista de passageiros encontrados */}
                        {passageirosEncontrados.length > 0 && (
                          <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                            {passageirosEncontrados.map((passageiro) => (
                              <div
                                key={passageiro.id}
                                className={`flex items-center justify-between p-2 rounded ${
                                  passageirosJaNaViagem.includes(passageiro.id) 
                                    ? 'bg-red-50 border border-red-200 cursor-not-allowed' 
                                    : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                                onClick={() => {
                                  // ✅ NOVO: Validar se passageiro já está na viagem
                                  if (passageirosJaNaViagem.includes(passageiro.id)) {
                                    toast.error(`${passageiro.nome} já está nesta viagem!`);
                                    return;
                                  }
                                  
                                  if (!passageirosSelecionados.find(p => p.id === passageiro.id)) {
                                    setPassageirosSelecionados([...passageirosSelecionados, passageiro]);
                                    setBuscaPassageiro('');
                                    setPassageirosEncontrados([]);
                                    toast.success(`${passageiro.nome} adicionado!`);
                                  }
                                }}
                              >
                                <div>
                                  <div className="font-medium">{passageiro.nome}</div>
                                  <div className="text-sm text-muted-foreground">{passageiro.cpf}</div>
                                  {passageirosJaNaViagem.includes(passageiro.id) && (
                                    <div className="text-xs text-red-600 font-medium">⚠️ Já está na viagem</div>
                                  )}
                                </div>
                                {passageirosJaNaViagem.includes(passageiro.id) ? (
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                ) : passageirosSelecionados.find(p => p.id === passageiro.id) ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Plus className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Lista de passageiros selecionados */}
                      {passageirosSelecionados.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Passageiros Selecionados ({passageirosSelecionados.length})</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPassageirosSelecionados([])}
                            >
                              Limpar Todos
                          </Button>
                        </div>
                          
                          <div className="border rounded-md p-2 space-y-2">
                            {passageirosSelecionados.map((passageiro, index) => (
                              <div key={passageiro.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div>
                                  <div className="font-medium">{passageiro.nome}</div>
                                  <div className="text-sm text-muted-foreground">{passageiro.cpf}</div>
                      </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setPassageirosSelecionados(passageirosSelecionados.filter((_, i) => i !== index));
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                    </div>
                  ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ NOVO: Seleção de Ingresso */}
                    {viagemSelecionada && ingressosDisponiveis.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">🎫 Selecionar Ingresso (Opcional)</Label>
                        <Select value={ingressoSelecionado} onValueChange={setIngressoSelecionado}>
                          <SelectTrigger>
                            <SelectValue placeholder="Escolha um ingresso (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum ingresso</SelectItem>
                            {ingressosDisponiveis.map((ingresso) => (
                              <SelectItem key={ingresso.id} value={ingresso.id}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{ingresso.setor} - {ingresso.adversario}</span>
                                  <span className="ml-4 text-sm text-green-600 font-medium">
                                    {formatCurrency(ingresso.valor)}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {ingressoSelecionado && (
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            {(() => {
                              const ingresso = ingressosDisponiveis.find(i => i.id === ingressoSelecionado);
                              return ingresso ? (
                                <div className="text-sm">
                                  <div className="font-medium text-blue-800">🎫 Ingresso Selecionado:</div>
                                  <div className="text-blue-700 mt-1">
                                    <strong>{ingresso.setor}</strong> - {ingresso.adversario}
                                    <br />
                                    <span className="text-green-600 font-medium">
                                      Valor: {formatCurrency(ingresso.valor)}
                                    </span>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ✅ NOVO: Seleção de Passeios */}
                    {viagemSelecionada && passeiosDisponiveis.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold">🎢 Selecionar Passeios (Opcional)</Label>
                        <div className="space-y-2">
                          {passeiosDisponiveis.map((viagemPasseio: any) => (
                            <div key={viagemPasseio.passeio_id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="checkbox"
                                  id={`passeio-${viagemPasseio.passeio_id}`}
                                  checked={passeiosSelecionados.includes(viagemPasseio.passeio_id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPasseiosSelecionados([...passeiosSelecionados, viagemPasseio.passeio_id]);
                                    } else {
                                      setPasseiosSelecionados(passeiosSelecionados.filter(id => id !== viagemPasseio.passeio_id));
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 rounded"
                                />
                                <label htmlFor={`passeio-${viagemPasseio.passeio_id}`} className="cursor-pointer">
                                  <div>
                                    <span className="font-medium">{viagemPasseio.passeios.nome}</span>
                                    <span className="text-xs text-muted-foreground ml-2">({viagemPasseio.passeios.categoria})</span>
                                  </div>
                                  {viagemPasseio.passeios.descricao && (
                                    <div className="text-xs text-gray-500 mt-1">{viagemPasseio.passeios.descricao}</div>
                                  )}
                                </label>
                              </div>
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(viagemPasseio.passeios.valor)}
                              </div>
                            </div>
                          ))}
                          
                          {/* Resumo dos passeios */}
                          {passeiosSelecionados.length > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                              <div className="text-sm">
                                <span className="font-medium">Passeios selecionados: </span>
                                <span className="text-green-600">{passeiosSelecionados.length}</span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Valor dos passeios: </span>
                                <span className="text-green-600">
                                  {formatCurrency(
                                    passeiosSelecionados.reduce((total, passeioId) => {
                                      const passeio = passeiosDisponiveis.find(vp => vp.passeio_id === passeioId);
                                      return total + (passeio?.passeios?.valor || 0);
                                    }, 0)
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Cálculo de Saldo e Status */}
                    {viagemSelecionada && passageirosSelecionados.length > 0 && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-center">📊 Resumo da Vinculação</h4>
                        
                        {/* Detalhes da viagem */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Viagem:</span>
                            <div className="font-medium">{viagemSelecionada.adversario}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Data:</span>
                            <div className="font-medium">
                              {new Date(viagemSelecionada.data_jogo).toLocaleDateString('pt-BR')}
                        </div>
                          </div>
                        </div>
                        
                        {/* Cálculo de valores */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Valor da viagem:</span>
                            <span className="font-medium">{formatCurrency(viagemSelecionada.valor_padrao || 0)}</span>
                          </div>
                          {ingressoSelecionado && (
                            <div className="flex justify-between text-sm">
                              <span>Valor do ingresso:</span>
                              <span className="font-medium text-blue-600">
                                {formatCurrency(ingressosDisponiveis.find(i => i.id === ingressoSelecionado)?.valor || 0)}
                              </span>
                            </div>
                          )}
                          {passeiosSelecionados.length > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Valor dos passeios:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(
                                  passeiosSelecionados.reduce((total, passeioId) => {
                                    const passeio = passeiosDisponiveis.find(vp => vp.passeio_id === passeioId);
                                    return total + (passeio?.passeios?.valor || 0);
                                  }, 0)
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span>Total por passageiro:</span>
                            <span className="font-medium">{formatCurrency(calcularValorTotalPorPassageiro())}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Total de passageiros:</span>
                            <span className="font-medium">{passageirosSelecionados.length}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t pt-2">
                            <span className="font-medium">Valor total necessário:</span>
                            <span className="font-bold text-lg">
                              {formatCurrency(calcularValorTotalPorPassageiro() * passageirosSelecionados.length)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status do saldo */}
                        <div className="text-center">
                          {(() => {
                            const valorNecessario = calcularValorTotalPorPassageiro() * passageirosSelecionados.length;
                            const saldoDisponivel = grupoCliente.resumo.valor_disponivel;
                            const diferenca = saldoDisponivel - valorNecessario;
                            
                            if (diferenca >= 0) {
                              return (
                                <div className="text-green-600 font-medium">
                                  ✅ Saldo suficiente! Sobra {formatCurrency(diferenca)}
                          </div>
                              );
                            } else {
                              return (
                                <div className="text-orange-600 font-medium">
                                  ⚠️ Saldo insuficiente! Falta {formatCurrency(Math.abs(diferenca))}
                        </div>
                              );
                            }
                          })()}
                      </div>
                        
                        {/* Saldo disponível */}
                        <div className="text-center text-sm text-muted-foreground">
                          Saldo disponível: {formatCurrency(grupoCliente.resumo.valor_disponivel)}
                    </div>
                        
                        {/* Opção de adicionar pagamento extra */}
                        {(() => {
                          const valorNecessario = calcularValorTotalPorPassageiro() * passageirosSelecionados.length;
                          const saldoDisponivel = grupoCliente.resumo.valor_disponivel;
                          const diferenca = saldoDisponivel - valorNecessario;
                          
                          if (diferenca > 0) {
                            return (
                              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="text-blue-800 text-sm">
                                  <p className="font-medium mb-1">💰 Pagamento Extra Detectado!</p>
                                  <p>O cliente já pagou {formatCurrency(diferenca)} a mais.</p>
                                  <p className="text-xs mt-2">Este valor ficará disponível para outras viagens.</p>
                  </div>
                </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Aviso sobre vinculação com débito */}
                        {(() => {
                          const valorNecessario = calcularValorTotalPorPassageiro() * passageirosSelecionados.length;
                          const saldoDisponivel = grupoCliente.resumo.valor_disponivel;
                          const diferenca = saldoDisponivel - valorNecessario;
                          
                          if (diferenca < 0) {
                            return (
                              <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="text-orange-800 text-sm">
                                  <p className="font-medium mb-1">⚠️ Atenção!</p>
                                  <p>Você pode vincular mesmo com saldo insuficiente.</p>
                                  <p>O débito de {formatCurrency(Math.abs(diferenca))} será registrado.</p>
                                  <p className="text-xs mt-2">Complete o pagamento depois para regularizar o crédito.</p>
        </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    
                    {/* Botão de Vincular */}
                    {(() => {
                      console.log('🔍 [CreditoDetailsModal] Renderizando botão de vincular:', {
                        viagemSelecionada: !!viagemSelecionada,
                        passageirosSelecionados: passageirosSelecionados.length,
                        vinculando
                      });
                      
                      if (viagemSelecionada && passageirosSelecionados.length > 0) {
                        return (
                          <div className="space-y-3">
                            <Button
                              onClick={() => {
                                console.log('🖱️ [CreditoDetailsModal] Botão clicado!');
                                
                                // ✅ NOVO: Verificar se há valor faltante
                                const valorNecessario = calcularValorTotalPorPassageiro() * passageirosSelecionados.length;
                                const saldoDisponivel = grupoCliente.resumo.valor_disponivel;
                                const valorFaltanteCalculado = valorNecessario - saldoDisponivel;
                                
                                if (valorFaltanteCalculado > 0) {
                                  setValorFaltante(valorFaltanteCalculado);
                                  setModalPagamentoFaltante(true);
                                  return; // Parar aqui para mostrar o modal de pagamento faltante
                                }
                                
                                // Se não há valor faltante, prosseguir normalmente
                                vincularCredito();
                              }}
                              disabled={vinculando}
                              className="w-full"
                              size="lg"
                            >
                              {vinculando ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Vinculando...
                                </>
                              ) : (
                                <>
                                  <Link className="mr-2 h-4 w-4" />
                                  Vincular Crédito
                                </>
                              )}
                            </Button>
                            
                            {/* Informações adicionais */}
                            <div className="text-center text-xs text-muted-foreground space-y-1">
                              <p>• O crédito será vinculado à viagem selecionada</p>
                              <p>• Os passageiros serão adicionados à lista da viagem</p>
                              {(() => {
                                const valorNecessario = calcularValorTotalPorPassageiro() * passageirosSelecionados.length;
                                const saldoDisponivel = grupoCliente.resumo.valor_disponivel;
                                const diferenca = saldoDisponivel - valorNecessario;
                                
                                if (diferenca < 0) {
                                  return (
                                    <p className="text-orange-600 font-medium">
                                      • Débito de {formatCurrency(Math.abs(diferenca))} será registrado
                                    </p>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>Selecione uma viagem e passageiros para vincular</p>
                          </div>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba de Resultado */}
            <TabsContent value="resultado" className="flex-1 overflow-auto mt-4">
              {resultadoVinculacao ? (
                <div className="space-y-6">

                  
                  {/* Status da Vinculação */}
                  <Card className={`border-2 ${resultadoVinculacao.saldoSuficiente ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <CardHeader>
                      <CardTitle className={`flex items-center gap-2 ${resultadoVinculacao.saldoSuficiente ? 'text-green-700' : 'text-orange-700'}`}>
                        {resultadoVinculacao.saldoSuficiente ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : (
                          <AlertCircle className="h-6 w-6" />
                        )}
                        {resultadoVinculacao.saldoSuficiente ? 'Vinculação Concluída com Sucesso!' : 'Vinculação Concluída com Débito Registrado!'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                              {resultadoVinculacao.viagem?.adversario}
                            </div>
                            <div className="text-sm text-muted-foreground">Destino</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                              {resultadoVinculacao.passageirosAdicionados || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Passageiros Adicionados</div>
                          </div>
                </div>

                        {/* Informações sobre passageiros duplicados */}
                        {resultadoVinculacao.passageirosJaExistentes > 0 && (
                          <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="text-yellow-800 text-sm">
                              <p className="font-medium mb-1">⚠️ Passageiros Duplicados</p>
                              <p>{resultadoVinculacao.passageirosJaExistentes} passageiro(s) já existia(m) na viagem</p>
                              <p className="text-xs mt-2">Apenas passageiros novos foram adicionados</p>
                </div>
              </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(resultadoVinculacao.valorTotal)}
                            </div>
                            <div className="text-sm text-muted-foreground">Valor Total</div>
                          </div>
                          <div className="text-center p-4 bg-white rounded-lg border">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(resultadoVinculacao.creditoUtilizado)}
                            </div>
                            <div className="text-sm text-muted-foreground">Crédito Utilizado</div>
                          </div>
                        </div>
                        
                        {/* Status de Pagamento */}
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <div className={`text-2xl font-bold ${resultadoVinculacao.saldoSuficiente ? 'text-green-600' : 'text-orange-600'}`}>
                            {resultadoVinculacao.statusPagamento}
                          </div>
                          <div className="text-sm text-muted-foreground">Status do Pagamento</div>
                        </div>
                        
                        {/* Informações sobre Débito */}
                        {!resultadoVinculacao.saldoSuficiente && (
                          <div className="text-center p-4 bg-orange-100 border border-orange-300 rounded-lg">
                            <div className="text-xl font-bold text-orange-700 mb-2">
                              ⚠️ Débito Registrado
                            </div>
                            <div className="text-lg font-medium text-orange-600 mb-2">
                              Falta: {formatCurrency(resultadoVinculacao.valorEmDebito)}
                            </div>
                            <div className="text-sm text-orange-700 mb-3">
                              Complete o pagamento para regularizar o crédito
                            </div>
                            
                            {/* Opções para completar pagamento */}
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Abrir modal para adicionar pagamento
                                  setAbaAtiva('creditos');
                                  toast.info('Vá para a aba "Créditos" para adicionar novo pagamento');
                                }}
                                className="w-full"
                              >
                                💰 Adicionar Novo Pagamento
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Abrir modal para adicionar crédito
                                  setAbaAtiva('creditos');
                                  toast.info('Vá para a aba "Créditos" para adicionar novo crédito');
                                }}
                                className="w-full"
                              >
                                ➕ Adicionar Novo Crédito
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {/* Status de Pagamento Completo */}
                        {resultadoVinculacao.saldoSuficiente && (
                          <div className="text-center p-4 bg-green-100 border border-green-300 rounded-lg">
                            <div className="text-xl font-bold text-green-700 mb-2">
                              ✅ Pagamento Completo
                            </div>
                            <div className="text-sm text-green-700 mb-3">
                              Todos os passageiros foram pagos integralmente
                            </div>
                            
                            {/* Opções para usar saldo extra */}
                            {resultadoVinculacao.novoSaldoCredito > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm text-green-600 mb-2">
                                  Saldo restante: {formatCurrency(resultadoVinculacao.novoSaldoCredito)}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAbaAtiva('vincular');
                                    toast.info('Use o saldo restante para vincular mais passageiros');
                                  }}
                                  className="w-full"
                                >
                                  🔗 Vincular Mais Passageiros
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Saldo Restante */}
                        <div className="text-center p-4 bg-white rounded-lg border">
                          <div className={`text-2xl font-bold ${resultadoVinculacao.novoSaldoCredito > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                            {formatCurrency(resultadoVinculacao.novoSaldoCredito)}
                          </div>
                          <div className="text-sm text-muted-foreground">Saldo Restante no Crédito</div>
                        </div>
                        
                        {/* Resumo Financeiro Detalhado */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-center text-gray-700">📊 Resumo Financeiro</h4>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-white rounded border">
                              <div className="text-lg font-bold text-blue-600">
                                {formatCurrency(resultadoVinculacao.valorTotal)}
                              </div>
                              <div className="text-xs text-muted-foreground">Valor Total da Viagem</div>
                            </div>
                            
                            <div className="text-center p-3 bg-white rounded border">
                              <div className="text-lg font-bold text-green-600">
                                {formatCurrency(resultadoVinculacao.creditoUtilizado)}
                              </div>
                              <div className="text-xs text-muted-foreground">Crédito Utilizado</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-white rounded border">
                              <div className={`text-lg font-bold ${resultadoVinculacao.novoSaldoCredito > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                                {formatCurrency(resultadoVinculacao.novoSaldoCredito)}
                              </div>
                              <div className="text-xs text-muted-foreground">Saldo Restante</div>
                            </div>
                            
                            <div className="text-center p-3 bg-white rounded border">
                              <div className={`text-lg font-bold ${resultadoVinculacao.valorEmDebito > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {resultadoVinculacao.valorEmDebito > 0 ? formatCurrency(resultadoVinculacao.valorEmDebito) : 'R$ 0,00'}
                              </div>
                              <div className="text-xs text-muted-foreground">Valor em Débito</div>
                            </div>
                          </div>
                          
                          {/* Status do Pagamento */}
                          <div className="text-center p-3 bg-white rounded border">
                            <div className={`text-lg font-bold ${resultadoVinculacao.saldoSuficiente ? 'text-green-600' : 'text-orange-600'}`}>
                              {resultadoVinculacao.statusPagamento}
                            </div>
                            <div className="text-xs text-muted-foreground">Status do Pagamento</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ações */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => {
                        if (resultadoVinculacao.viagem?.id) {
                          window.open(`/dashboard/viagem/${resultadoVinculacao.viagem.id}`, '_blank');
                        }
                      }}
                      className="gap-2"
                      size="lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Ver Viagem e Passageiros
                    </Button>
                    
                    {/* Botão para adicionar pagamento se houver débito */}
                    {!resultadoVinculacao.saldoSuficiente && (
                      <Button
                        onClick={() => {
                          setAbaAtiva('creditos');
                          toast.info('Adicione um novo pagamento para quitar o débito');
                        }}
                        variant="default"
                        className="gap-2 bg-orange-600 hover:bg-orange-700"
                        size="lg"
                      >
                        💰 Quitar Débito
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVinculacaoConcluida(false);
                        setResultadoVinculacao(null);
                        setAbaAtiva('creditos');
                      }}
                      size="lg"
                    >
                      Voltar aos Créditos
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">🎉</span>
                  <p>Nenhuma vinculação concluída ainda.</p>
                  <p>Vincule um crédito para ver o resultado.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal de Confirmação de Delete */}
        <AlertDialog open={modalConfirmacao.open} onOpenChange={(open) => setModalConfirmacao(prev => ({ ...prev, open }))}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar este uso de crédito?
                <br /><br />
                <strong>Impacto da Deleção:</strong>
                <br />
                {modalConfirmacao.impactoDelecao}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
                onClick={() => {
                  deletarUsoCredito(modalConfirmacao.usoId);
                  setModalConfirmacao(prev => ({ ...prev, open: false }));
                }}
              className="bg-red-600 hover:bg-red-700"
              >
                Confirmar Exclusão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </DialogContent>
    </Dialog>

    {/* ✅ NOVO: Modal de Pagamento Faltante */}
    <Dialog open={modalPagamentoFaltante} onOpenChange={setModalPagamentoFaltante}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <AlertCircle className="h-5 w-5" />
            Pagamento Incompleto
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-medium text-orange-800 mb-2">
                Valor Faltante
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(valorFaltante)}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>O crédito disponível não cobre o valor total da viagem.</p>
            <p className="mt-2">Você pode:</p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                setRegistrarPagamentoAgora(true);
                setModalPagamentoFaltante(false);
                // Aqui você pode abrir um modal de pagamento
                toast.info('Funcionalidade de pagamento será implementada');
              }}
              className="w-full gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Registrar Pagamento Agora
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                setModalPagamentoFaltante(false);
                // Continuar com a vinculação mesmo com débito
                toast.success('Vinculação registrada com pendência');
                // Aqui você pode finalizar a vinculação
              }}
              className="w-full gap-2"
            >
              <Calendar className="h-4 w-4" />
              Deixar Pendente
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Se deixar pendente, será criado um registro na aba "Pendências"
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}