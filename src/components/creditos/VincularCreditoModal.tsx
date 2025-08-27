import { useState, useEffect } from 'react';
import { X, Search, Calculator, CreditCard, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';
import { useViagens } from '@/hooks/useViagens';
import { useClientes } from '@/hooks/useClientes';
import { useCreditos } from '@/hooks/useCreditos';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VincularCreditoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grupoCliente: any | null;
  onSuccess: () => void;
  onViagemUpdated?: () => void; // Callback para recarregar dados da viagem
}

export function VincularCreditoModal({
  open,
  onOpenChange,
  grupoCliente,
  onSuccess,
  onViagemUpdated
}: VincularCreditoModalProps) {
  const { viagens, buscarViagens } = useViagens();
  const { clientes, buscarClientes } = useClientes();
  const { vincularCreditoComViagem, buscarOnibusComVagas } = useCreditos();
  
  const [viagemSelecionada, setViagemSelecionada] = useState<any>(null);
  const [buscaPassageiro, setBuscaPassageiro] = useState('');
  const [calculoResultado, setCalculoResultado] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);
  
  // ✅ NOVO: Estados para seleção de ônibus
  const [onibusDisponiveis, setOnibusDisponiveis] = useState<any[]>([]);
  const [onibusEscolhido, setOnibusEscolhido] = useState<string>('');
  const [carregandoOnibus, setCarregandoOnibus] = useState(false);
  
  // Estados para seleção múltipla
  const [incluirTitular, setIncluirTitular] = useState(true);
  const [passageirosSelecionados, setPassageirosSelecionados] = useState<any[]>([]);
  
  // Estados para seleção de passeios
  const [passeiosSelecionados, setPasseiosSelecionados] = useState<string[]>([]);
  const [valorTotalPorPassageiro, setValorTotalPorPassageiro] = useState(0);
  
  // Estados para o modal de resultado
  const [resultadoVinculacao, setResultadoVinculacao] = useState<any>(null);
  
  // Estados para controle de abas e resultado
  const [abaAtiva, setAbaAtiva] = useState<'vinculacao' | 'resultado'>('vinculacao');
  const [vinculacaoConcluida, setVinculacaoConcluida] = useState(false);
  
  // ✅ NOVO: Estados para validações e melhorias
  const [passageirosJaNaViagem, setPassageirosJaNaViagem] = useState<string[]>([]);
  
  // ✅ NOVO: Estados para ingresso e passeios melhorados
  const [ingressoSelecionado, setIngressoSelecionado] = useState<string>('');
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
  const continuarVinculacao = async () => {
    try {
      setSalvando(true);
      
      // Pegar o primeiro crédito disponível
      const creditoDisponivel = grupoCliente.creditos.find((c: any) => c.saldo_disponivel > 0);
      if (!creditoDisponivel) {
        toast.error('Nenhum crédito disponível encontrado');
        return;
      }

      // Preparar lista de passageiros para vincular
      const passageirosParaVincular = [];
      
      if (incluirTitular) {
        passageirosParaVincular.push({
          id: grupoCliente.cliente.id,
          nome: grupoCliente.cliente.nome,
          tipo: 'titular'
        });
      }
      
      passageirosSelecionados.forEach(passageiro => {
        passageirosParaVincular.push({
          id: passageiro.id,
          nome: passageiro.nome,
          tipo: 'outro'
        });
      });

      // Calcular valor por passageiro
      const valorPorPassageiro = calculoResultado.valorUtilizado / passageirosParaVincular.length;
      
      // Vincular crédito para cada passageiro
      const resultados = [];
      const passageirosVinculados = []; // Para registrar pagamentos adicionais
      
      for (const passageiro of passageirosParaVincular) {
        const sucesso = await vincularCreditoComViagem({
          creditoId: creditoDisponivel.id,
          viagemId: viagemSelecionada.id,
          passageiroId: passageiro.id,
          valorUtilizado: valorPorPassageiro,
          tipoPassageiro: passageiro.tipo as 'titular' | 'outro',
          passeiosSelecionados: passeiosSelecionados,
          onibusId: onibusEscolhido
        });

        if (sucesso) {
          resultados.push(passageiro.nome);
          passageirosVinculados.push({
            id: passageiro.id,
            nome: passageiro.nome
          });
        } else {
          throw new Error(`Erro ao vincular ${passageiro.nome}`);
        }
      }

      // ✅ NOVO: Se escolheu registrar pagamento agora, criar registro de pagamento para o valor faltante
      if (registrarPagamentoAgora && valorFaltante > 0) {
        console.log('📝 Registrando pagamento adicional de:', formatCurrency(valorFaltante));
        
        // Para cada passageiro vinculado, registrar o pagamento faltante
        for (const passageiro of passageirosVinculados) {
          try {
            // Buscar o viagem_passageiro_id do passageiro recém-vinculado
            const { data: viagemPassageiro, error: vpError } = await supabase
              .from('viagem_passageiros')
              .select('id')
              .eq('viagem_id', viagemSelecionada.id)
              .eq('cliente_id', passageiro.id)
              .single();

            if (vpError || !viagemPassageiro) {
              console.warn(`⚠️ Não foi possível encontrar viagem_passageiro para ${passageiro.nome}`);
              continue;
            }

            // Calcular valor faltante por passageiro
            const valorFaltantePorPassageiro = valorFaltante / passageirosVinculados.length;

            // Registrar pagamento adicional na tabela de histórico categorizado
            const { error: pagamentoError } = await supabase
              .from('historico_pagamentos_categorizado')
              .insert({
                viagem_passageiro_id: viagemPassageiro.id,
                categoria: 'viagem', // Assumindo que o valor faltante é para a viagem
                valor_pago: valorFaltantePorPassageiro,
                forma_pagamento: 'pix', // Valor padrão
                observacoes: `Pagamento adicional registrado automaticamente após vinculação de crédito`,
                data_pagamento: new Date().toISOString()
              });

            if (pagamentoError) {
              console.error(`❌ Erro ao registrar pagamento para ${passageiro.nome}:`, pagamentoError);
            } else {
              console.log(`✅ Pagamento adicional registrado para ${passageiro.nome}`);
            }
          } catch (error) {
            console.error(`❌ Erro ao processar pagamento adicional para ${passageiro.nome}:`, error);
          }
        }
        
        toast.success('✅ Vinculação realizada e pagamento adicional registrado!');
      } else {
        toast.success('✅ Vinculação realizada com sucesso!');
      }
      
      // Preparar dados do resultado
      const nomesPassageiros = resultados.join(', ');
      const novoSaldoCredito = creditoDisponivel.saldo_disponivel - calculoResultado.valorUtilizado;

      setResultadoVinculacao({
        creditoUtilizado: calculoResultado.valorUtilizado,
        valorViagem: calculoResultado.valorViagem,
        valorIngresso: calculoResultado.valorIngresso || 0,
        valorPasseios: calculoResultado.valorPasseios || 0,
        sobra: calculoResultado.sobra,
        falta: calculoResultado.falta,
        statusResultado: calculoResultado.statusResultado,
        novoSaldoCredito,
        passageiro: `${nomesPassageiros} (${passageirosParaVincular.length} passageiro${passageirosParaVincular.length > 1 ? 's' : ''})`,
        viagem: `${viagemSelecionada.adversario} - ${new Date(viagemSelecionada.data_jogo).toLocaleDateString('pt-BR')}`,
        
        // Novas informações para maior clareza
        titularCredito: grupoCliente.cliente?.nome || 'N/A',
        beneficiario: passageirosSelecionados.length > 0 ? passageirosSelecionados.map(p => p.nome).join(', ') : grupoCliente.cliente?.nome || 'N/A',
        tipoPassageiro: passageirosSelecionados.length > 0 ? 'outro' : 'titular',
        viagemId: viagemSelecionada.id, // ID da viagem para navegação
        pagamentoAdicionalRegistrado: registrarPagamentoAgora && valorFaltante > 0
      });

      // Resetar formulário
      setViagemSelecionada(null);
      setPassageirosSelecionados([]);
      setPasseiosSelecionados([]);
      setIngressoSelecionado('');
      setOnibusEscolhido('');
      setIncluirTitular(true);
      setCalculoResultado(null);
      setAbaAtiva('resultado');
      setVinculacaoConcluida(true);
      
      // Callbacks
      onSuccess();
      if (onViagemUpdated) onViagemUpdated();
      
    } catch (error) {
      console.error('❌ Erro na vinculação:', error);
      toast.error('Erro ao vincular crédito');
    } finally {
      setSalvando(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      buscarViagens();
      buscarClientes();
    }
  }, [open, buscarViagens, buscarClientes]);

  // Filtrar clientes para busca
  const clientesFiltrados = clientes.filter(cliente => {
    if (!buscaPassageiro) return true;
    const termo = buscaPassageiro.toLowerCase();
    return (
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.telefone?.toLowerCase().includes(termo) ||
      cliente.email?.toLowerCase().includes(termo)
    );
  });

  // Calcular valor total por passageiro (viagem + passeios)
  useEffect(() => {
    if (viagemSelecionada) {
      const valorViagem = viagemSelecionada.valor_padrao || 0;
      
      // Calcular valor dos passeios selecionados
      const valorPasseios = passeiosSelecionados.reduce((total, passeioId) => {
        const passeio = viagemSelecionada.viagem_passeios?.find((vp: any) => vp.passeio_id === passeioId);
        return total + (passeio?.passeios?.valor || 0);
      }, 0);
      
      const valorTotal = valorViagem + valorPasseios;
      setValorTotalPorPassageiro(valorTotal);
    }
  }, [viagemSelecionada, passeiosSelecionados]);

  // ✅ ATUALIZADO: Calcular resultado usando nova função
  useEffect(() => {
    if (viagemSelecionada && grupoCliente) {
      const creditoDisponivel = grupoCliente.resumo.valor_disponivel;
      
      // ✅ NOVO: Usar função de cálculo atualizada
      const valorPorPassageiro = calcularValorTotalPorPassageiro();
      
      // Calcular total de passageiros
      const totalPassageiros = (incluirTitular ? 1 : 0) + passageirosSelecionados.length;
      const valorTotalNecessario = valorPorPassageiro * totalPassageiros;
      
      const valorUtilizado = Math.min(creditoDisponivel, valorTotalNecessario);
      const sobra = Math.max(0, creditoDisponivel - valorTotalNecessario);
      const falta = Math.max(0, valorTotalNecessario - creditoDisponivel);
      
      let statusResultado = 'completo';
      if (sobra > 0) statusResultado = 'sobra';
      if (falta > 0) statusResultado = 'falta';
      
      // ✅ NOVO: Cálculo detalhado dos componentes
      const valorViagem = viagemSelecionada.valor_padrao || 0;
      const valorIngresso = ingressoSelecionado 
        ? ingressosDisponiveis.find(i => i.id === ingressoSelecionado)?.valor || 0
        : 0;
      const valorPasseios = passeiosSelecionados.reduce((total, passeioId) => {
        const passeio = passeiosDisponiveis.find(vp => vp.passeio_id === passeioId);
        return total + (passeio?.passeios?.valor || 0);
      }, 0);
      
      setCalculoResultado({
        creditoDisponivel,
        valorViagem,
        valorIngresso,
        valorPasseios,
        valorTotalPorPassageiro: valorPorPassageiro,
        totalPassageiros,
        valorTotalNecessario,
        valorUtilizado,
        sobra,
        falta,
        statusResultado
      });
    }
  }, [viagemSelecionada, grupoCliente, incluirTitular, passageirosSelecionados, ingressoSelecionado, passeiosSelecionados, ingressosDisponiveis, passeiosDisponiveis]);

  // Função para confirmar vinculação
  const handleConfirmar = async () => {
    if (!viagemSelecionada || !calculoResultado) {
      toast.error('Selecione uma viagem primeiro');
      return;
    }

    // ✅ NOVO: Validar seleção obrigatória de ônibus
    if (!onibusEscolhido) {
      toast.error('Seleção de ônibus é obrigatória');
      return;
    }

    // Validar se pelo menos um passageiro foi selecionado
    const totalPassageiros = (incluirTitular ? 1 : 0) + passageirosSelecionados.length;
    if (totalPassageiros === 0) {
      toast.error('Selecione pelo menos um passageiro');
      return;
    }

    // ✅ NOVO: Verificar se há valor faltante e oferecer opções
    if (calculoResultado.falta > 0) {
      setValorFaltante(calculoResultado.falta);
      setModalPagamentoFaltante(true);
      return; // Parar aqui para mostrar o modal de pagamento faltante
    }

    // ✅ NOVO: Se não há valor faltante, prosseguir diretamente
    await continuarVinculacao();

  };

  if (!grupoCliente) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sobra':
        return 'border-green-500';
      case 'falta':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'sobra':
        return {
          title: 'Crédito Sobrou!',
          message: 'O crédito disponível foi maior do que o necessário. O passageiro ficará como "Pago Completo" e você manterá o crédito disponível.'
        };
      case 'falta':
        return {
          title: 'Ainda falta pagar!',
          message: 'O crédito disponível foi menor do que o necessário. O passageiro ficará como "Parcial" e precisará pagar o restante.'
        };
      default:
        return {
          title: 'Crédito Utilizado',
          message: 'O crédito disponível foi exatamente o suficiente para cobrir o valor total necessário. O passageiro ficará como "Pago Completo".'
        };
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {vinculacaoConcluida ? 'Resultado da Vinculação' : 'Usar Crédito de ' + grupoCliente.cliente?.nome}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {vinculacaoConcluida ? 'Vinculação concluída com sucesso' : 'Vincular crédito com uma viagem específica'}
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



          {/* Resumo do Crédito */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Crédito Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(grupoCliente.resumo.valor_disponivel)}
              </div>
              <p className="text-sm text-gray-500">
                De {grupoCliente.resumo.total_creditos} pagamentos realizados
              </p>
            </CardContent>
          </Card>
        </DialogHeader>

        {/* Abas */}
        <Tabs value={abaAtiva} onValueChange={(value) => setAbaAtiva(value as 'vinculacao' | 'resultado')} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vinculacao" disabled={vinculacaoConcluida}>
              🔗 Vincular Crédito
            </TabsTrigger>
            <TabsTrigger value="resultado" disabled={!vinculacaoConcluida}>
              ✅ Resultado
            </TabsTrigger>
          </TabsList>

          {/* Aba de Vinculação */}
          <TabsContent value="vinculacao" className="flex-1 overflow-y-auto max-h-[60vh] space-y-6 pr-2">
            {/* Conteúdo da aba de vinculação */}
            <div className="space-y-6">
              {/* Seleção de Viagem */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">🎯 Selecionar Viagem</Label>
                

                
                <Select onValueChange={async (value) => {
                  const viagem = viagens.find(v => v.id === value);
                  
                  // Buscar dados completos da viagem incluindo passeios e ingressos
                  const { data: viagemCompleta, error: viagemError } = await supabase
                    .from('viagens')
                    .select(`
                      *,
                      viagem_passeios(
                        passeio_id,
                        passeios(
                          id,
                          nome,
                          valor,
                          categoria,
                          descricao
                        )
                      )
                    `)
                    .eq('id', value)
                    .single();
                    
                  if (!viagemError && viagemCompleta) {
                    setViagemSelecionada(viagemCompleta);
                  } else {
                    setViagemSelecionada(viagem);
                  }
                  setPasseiosSelecionados([]); // Reset passeios quando mudar viagem
                  setOnibusEscolhido(''); // Reset ônibus quando mudar viagem
                  setIngressoSelecionado(''); // Reset ingresso
                  
                  // Buscar ônibus com vagas disponíveis
                  if (viagem) {
                    setCarregandoOnibus(true);
                    try {
                      const onibus = await buscarOnibusComVagas(viagem.id);
                      setOnibusDisponiveis(onibus);
                      
                      // Buscar passageiros já na viagem para evitar duplicação
                      const { data: passageirosExistentes, error: passageirosError } = await supabase
                        .from('viagem_passageiros')
                        .select('cliente_id')
                        .eq('viagem_id', viagem.id);
                        
                      if (!passageirosError && passageirosExistentes) {
                        const idsExistentes = passageirosExistentes.map(p => p.cliente_id);
                        setPassageirosJaNaViagem(idsExistentes);
                      }
                      
                      // 2. Buscar todos os ingressos da viagem (padrão)
                      const { data: ingressos, error: ingressosError } = await supabase
                        .from('ingressos')
                        .select('*')
                        .eq('viagem_id', viagem.id);
                        
                      if (!ingressosError && ingressos && ingressos.length > 0) {
                        setIngressosDisponiveis(ingressos);
                      } else {
                        setIngressosDisponiveis([]);
                      }
                      
                      // 3. Usar passeios já carregados da viagem completa
                      if (viagemCompleta && viagemCompleta.viagem_passeios && viagemCompleta.viagem_passeios.length > 0) {
                        setPasseiosDisponiveis(viagemCompleta.viagem_passeios);
                      } else {
                        setPasseiosDisponiveis([]);
                      }
                      
                      if (onibus.length === 0) {
                        toast.error('❌ Todos os ônibus desta viagem estão lotados!');
                      }
                    } catch (error) {
                      toast.error('Erro ao carregar ônibus disponíveis');
                    } finally {
                      setCarregandoOnibus(false);
                    }
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma viagem disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    {viagens.map((viagem) => (
                      <SelectItem key={viagem.id} value={viagem.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}</span>
                          <span className="ml-4 font-medium">{formatCurrency(viagem.valor_padrao || 0)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Seleção de Passeios */}
              {viagemSelecionada && viagemSelecionada.viagem_passeios && viagemSelecionada.viagem_passeios.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">🎢 Passeios Disponíveis</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Selecione os passeios que deseja incluir no pacote
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {viagemSelecionada.viagem_passeios.map((viagemPasseio: any) => (
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
                          </label>
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(viagemPasseio.passeios.valor)}
                        </div>
                      </div>
                    ))}
                    
                    {/* Resumo dos passeios */}
                    {passeiosSelecionados.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm">
                          <span className="font-medium">Passeios selecionados: </span>
                          <span className="text-blue-600">{passeiosSelecionados.length}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Valor dos passeios: </span>
                          <span className="text-blue-600">
                            {formatCurrency(valorTotalPorPassageiro - (viagemSelecionada.valor_padrao || 0))}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Seleção de Passageiros */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">👥 Selecionar Passageiros</Label>
                
                {/* Explicação simples */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>💰 Crédito de {grupoCliente.cliente?.nome}</strong> - Você pode usar para qualquer pessoa viajar
                  </p>
                </div>

                {/* Seleção simples: Titular + Outros */}
                <div className="space-y-3">
                  {/* Titular */}
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      id="incluirTitular"
                      checked={incluirTitular}
                      onChange={(e) => setIncluirTitular(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <div>
                      <Label htmlFor="incluirTitular" className="font-medium">
                        {grupoCliente.cliente?.nome} (você mesmo)
                      </Label>
                      <p className="text-xs text-gray-500">Titular do crédito</p>
                    </div>
                  </div>

                  {/* Outros passageiros */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Adicionar outras pessoas:</Label>
                    
                    {/* Campo de busca simples */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Digite o nome da pessoa..."
                        value={buscaPassageiro}
                        onChange={(e) => setBuscaPassageiro(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    {/* Resultados da busca */}
                    {buscaPassageiro && (
                      <div className="border rounded-lg bg-white max-h-32 overflow-y-auto">
                        {clientesFiltrados.slice(0, 5).map((cliente) => (
                          <div
                            key={cliente.id}
                            onClick={() => {
                              // ✅ NOVO: Validar se passageiro já está na viagem
                              if (passageirosJaNaViagem.includes(cliente.id)) {
                                toast.error(`${cliente.nome} já está nesta viagem!`);
                                return;
                              }
                              
                              // Adicionar se não estiver na lista
                              if (!passageirosSelecionados.find(p => p.id === cliente.id)) {
                                setPassageirosSelecionados([...passageirosSelecionados, cliente]);
                                setBuscaPassageiro(''); // Limpar busca
                                toast.success(`${cliente.nome} adicionado!`);
                              }
                            }}
                            className={`p-2 border-b last:border-b-0 ${
                              passageirosJaNaViagem.includes(cliente.id) 
                                ? 'bg-red-50 border-red-200 cursor-not-allowed' 
                                : 'hover:bg-gray-50 cursor-pointer'
                            }`}
                          >
                            <div className="font-medium">{cliente.nome}</div>
                            {passageirosJaNaViagem.includes(cliente.id) && (
                              <div className="text-xs text-red-600 font-medium">⚠️ Já está na viagem</div>
                            )}
                            {cliente.telefone && (
                              <div className="text-xs text-gray-500">{cliente.telefone}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Lista dos selecionados */}
                    {passageirosSelecionados.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Pessoas selecionadas:</p>
                        {passageirosSelecionados.map((passageiro) => (
                          <div
                            key={passageiro.id}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded"
                          >
                            <span className="text-sm font-medium">{passageiro.nome}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setPassageirosSelecionados(passageirosSelecionados.filter(p => p.id !== passageiro.id));
                              }}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

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
                  </div>
                </div>
              </div>

              {/* Cálculo do Resultado */}
              {calculoResultado && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Cálculo da Vinculação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor da Viagem:</span>
                        <span className="font-medium">{formatCurrency(calculoResultado.valorViagem)}</span>
                      </div>
                      
                      {calculoResultado.valorIngresso > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor do Ingresso:</span>
                          <span className="font-medium text-blue-600">{formatCurrency(calculoResultado.valorIngresso)}</span>
                        </div>
                      )}
                      
                      {calculoResultado.valorPasseios > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Valor dos Passeios:</span>
                          <span className="font-medium text-green-600">{formatCurrency(calculoResultado.valorPasseios)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Total por Passageiro:</span>
                        <span className="font-medium text-blue-600">{formatCurrency(calculoResultado.valorTotalPorPassageiro)}</span>
                      </div>
                      
                      {calculoResultado.totalPassageiros > 1 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Número de Passageiros:</span>
                            <span className="font-medium">{calculoResultado.totalPassageiros}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Valor Total Necessário:</span>
                            <span className="font-medium">{formatCurrency(calculoResultado.valorTotalNecessario)}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Crédito a Utilizar:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(calculoResultado.valorUtilizado)}</span>
                      </div>
                    </div>

                    {calculoResultado.statusResultado === 'sobra' && (
                      <div className="p-3 bg-green-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">✅ Sobra de Crédito:</span>
                          <span className="font-bold text-green-700">{formatCurrency(calculoResultado.sobra)}</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          O passageiro ficará como "Pago Completo" e você manterá crédito disponível.
                        </p>
                      </div>
                    )}

                    {calculoResultado.statusResultado === 'falta' && (
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600 font-medium">⚠️ Falta Pagar:</span>
                          <span className="font-bold text-yellow-700">{formatCurrency(calculoResultado.falta)}</span>
                        </div>
                        <p className="text-sm text-yellow-600 mt-1">
                          O passageiro ficará como "Parcial" e precisará pagar o restante.
                        </p>
                      </div>
                    )}

                    {calculoResultado.statusResultado === 'completo' && (
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">🎯 Valor Exato:</span>
                          <span className="font-bold text-blue-700">Pago Completo</span>
                        </div>
                        <p className="text-sm text-blue-600 mt-1">
                          O crédito será totalmente utilizado e o passageiro ficará como "Pago".
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Botões de Ação */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleConfirmar}
                  disabled={
                    !viagemSelecionada || 
                    !onibusEscolhido || 
                    onibusDisponiveis.length === 0 ||
                    salvando || 
                    ((incluirTitular ? 1 : 0) + passageirosSelecionados.length === 0)
                  }
                  className="gap-2"
                >
                  {salvando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Vinculando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Confirmar Vinculação
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Aba de Resultado */}
          <TabsContent value="resultado" className="flex-1 overflow-auto space-y-6">
            {resultadoVinculacao && (
              <div className="space-y-6">
                {/* Status da Vinculação */}
                <Card className={`border-2 ${getStatusColor(resultadoVinculacao.statusResultado)}`}>
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-lg mb-2">{getStatusMessage(resultadoVinculacao.statusResultado).title}</h3>
                      <p className="text-sm text-gray-600">{getStatusMessage(resultadoVinculacao.statusResultado).message}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Informações Essenciais */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">📋 Resumo da Operação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Titular:</span>
                        <div className="font-medium">{resultadoVinculacao.titularCredito}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Beneficiário:</span>
                        <div className="font-medium">{resultadoVinculacao.beneficiario}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Viagem:</span>
                        <div className="font-medium">{resultadoVinculacao.viagem}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <div className="font-medium text-blue-600">{formatCurrency(resultadoVinculacao.creditoUtilizado)}</div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Novo Saldo:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(resultadoVinculacao.novoSaldoCredito)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Ações - SEMPRE VISÍVEIS */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="pt-4">
                    <h4 className="font-medium text-gray-800 mb-3">🎯 O que fazer agora?</h4>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="default" 
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (resultadoVinculacao.viagemId) {
                            window.open(`/dashboard/viagem/${resultadoVinculacao.viagemId}`, '_blank');
                          }
                        }}
                      >
                        🚌 Ver Viagem e Passageiros
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                      >
                        ✅ Fechar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Aviso sobre pagamento faltante */}
                {resultadoVinculacao.statusResultado === 'falta' && (
                  <Card className={`${resultadoVinculacao.pagamentoAdicionalRegistrado ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                    <CardContent className="pt-4">
                      {resultadoVinculacao.pagamentoAdicionalRegistrado ? (
                        <>
                          <h4 className="font-medium text-green-800 mb-2">✅ Pagamento Adicional Registrado</h4>
                          <p className="text-sm text-green-700 mb-3">
                            O valor faltante de <strong>{formatCurrency(resultadoVinculacao.falta)}</strong> foi registrado automaticamente como pago.
                          </p>
                          <p className="text-xs text-green-600">
                            💡 <strong>Status:</strong> O passageiro agora está como "Pago Completo" no sistema.
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-medium text-orange-800 mb-2">⚠️ Ainda falta pagar</h4>
                          <p className="text-sm text-orange-700 mb-3">
                            Falta <strong>{formatCurrency(resultadoVinculacao.falta)}</strong> para completar o pagamento.
                          </p>
                          <p className="text-xs text-orange-600">
                            💡 <strong>Dica:</strong> Vá para a viagem e registre o pagamento adicional na aba de passageiros.
                          </p>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Modal de Resultado - REMOVIDO, agora integrado nas abas */}
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
              <div className="text-sm text-orange-700 mb-2">
                O crédito disponível não cobre o valor total da vinculação.
              </div>
              <div className="text-lg font-bold text-orange-800">
                Valor faltante: {formatCurrency(valorFaltante)}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Como deseja proceder com o valor faltante?
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="opcaoPagamento"
                  checked={registrarPagamentoAgora}
                  onChange={() => setRegistrarPagamentoAgora(true)}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">💳 Registrar Pagamento Agora</div>
                  <div className="text-xs text-gray-500">
                    Registrar que o valor faltante foi pago por outro meio
                  </div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="opcaoPagamento"
                  checked={!registrarPagamentoAgora}
                  onChange={() => setRegistrarPagamentoAgora(false)}
                  className="h-4 w-4 text-blue-600"
                />
                <div>
                  <div className="font-medium">⏳ Deixar Pendente</div>
                  <div className="text-xs text-gray-500">
                    Vincular com crédito disponível e deixar saldo pendente
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalPagamentoFaltante(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                setModalPagamentoFaltante(false);
                // Continuar com a vinculação usando a opção escolhida
                await continuarVinculacao();
              }}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}