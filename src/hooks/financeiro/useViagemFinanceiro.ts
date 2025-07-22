import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ViagemReceita {
  id: string;
  viagem_id: string;
  descricao: string;
  categoria: 'passageiro' | 'patrocinio' | 'vendas' | 'extras';
  valor: number;
  forma_pagamento: string;
  status: 'recebido' | 'pendente' | 'cancelado';
  data_recebimento: string;
  observacoes?: string;
  created_at: string;
}

export interface ViagemDespesa {
  id: string;
  viagem_id: string;
  fornecedor: string;
  categoria: 'transporte' | 'hospedagem' | 'alimentacao' | 'ingressos' | 'pessoal' | 'administrativo';
  subcategoria?: string;
  valor: number;
  forma_pagamento: string;
  status: 'pago' | 'pendente' | 'cancelado';
  data_despesa: string;
  comprovante_url?: string;
  observacoes?: string;
  created_at: string;
}

export interface CobrancaHistorico {
  id: string;
  viagem_passageiro_id: string;
  tipo_contato: 'whatsapp' | 'email' | 'telefone' | 'presencial';
  template_usado?: string;
  mensagem_enviada?: string;
  status_envio: 'enviado' | 'lido' | 'respondido' | 'erro';
  data_tentativa: string;
  proximo_followup?: string;
  observacoes?: string;
  passageiro_nome?: string;
  passageiro_telefone?: string;
}

export interface PassageiroPendente {
  viagem_passageiro_id: string;
  cliente_id: string;
  nome: string;
  telefone: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  dias_atraso: number;
  ultimo_contato?: string;
  status_pagamento: string;
}

export interface ResumoFinanceiro {
  total_receitas: number;
  total_despesas: number;
  lucro_bruto: number;
  margem_lucro: number;
  total_pendencias: number;
  count_pendencias: number;
  taxa_inadimplencia: number;
}

export function useViagemFinanceiro(viagemId: string | undefined) {
  const [receitas, setReceitas] = useState<ViagemReceita[]>([]);
  const [despesas, setDespesas] = useState<ViagemDespesa[]>([]);
  const [passageirosPendentes, setPassageirosPendentes] = useState<PassageiroPendente[]>([]);
  const [historicoCobranca, setHistoricoCobranca] = useState<CobrancaHistorico[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiro>({
    total_receitas: 0,
    total_despesas: 0,
    lucro_bruto: 0,
    margem_lucro: 0,
    total_pendencias: 0,
    count_pendencias: 0,
    taxa_inadimplencia: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Buscar receitas da viagem
  const fetchReceitas = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_receitas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      toast.error('Erro ao carregar receitas da viagem');
    }
  };

  // Buscar despesas da viagem
  const fetchDespesas = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_despesa', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      toast.error('Erro ao carregar despesas da viagem');
    }
  };

  // Buscar passageiros com pendências
  const fetchPassageirosPendentes = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          cliente_id,
          valor,
          desconto,
          status_pagamento,
          created_at,
          clientes!viagem_passageiros_cliente_id_fkey (
            nome,
            telefone
          ),
          viagem_passageiros_parcelas (
            valor_parcela
          )
        `)
        .eq('viagem_id', viagemId);

      if (error) throw error;

      const pendentes: PassageiroPendente[] = [];

      data?.forEach((passageiro: any) => {
        const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
        const valorPago = (passageiro.viagem_passageiros_parcelas || [])
          .reduce((sum: number, p: any) => sum + (p.valor_parcela || 0), 0);
        const valorPendente = valorTotal - valorPago;

        if (valorPendente > 0.01) { // Margem para centavos
          const diasAtraso = Math.floor(
            (new Date().getTime() - new Date(passageiro.created_at).getTime()) / (1000 * 60 * 60 * 24)
          );

          pendentes.push({
            viagem_passageiro_id: passageiro.id,
            cliente_id: passageiro.cliente_id,
            nome: passageiro.clientes.nome,
            telefone: passageiro.clientes.telefone,
            valor_total: valorTotal,
            valor_pago: valorPago,
            valor_pendente: valorPendente,
            dias_atraso: diasAtraso,
            status_pagamento: passageiro.status_pagamento
          });
        }
      });

      // Ordenar por dias de atraso (mais urgente primeiro)
      pendentes.sort((a, b) => b.dias_atraso - a.dias_atraso);
      setPassageirosPendentes(pendentes);
    } catch (error) {
      console.error('Erro ao buscar pendências:', error);
      toast.error('Erro ao carregar pendências');
    }
  };

  // Buscar histórico de cobrança
  const fetchHistoricoCobranca = async () => {
    if (!viagemId) return;

    try {
      const { data, error } = await supabase
        .from('viagem_cobranca_historico')
        .select(`
          *,
          viagem_passageiros!viagem_cobranca_historico_viagem_passageiro_id_fkey (
            clientes!viagem_passageiros_cliente_id_fkey (
              nome,
              telefone
            )
          )
        `)
        .order('data_tentativa', { ascending: false })
        .limit(50);

      if (error) throw error;

      const historico: CobrancaHistorico[] = (data || []).map((item: any) => ({
        ...item,
        passageiro_nome: item.viagem_passageiros?.clientes?.nome,
        passageiro_telefone: item.viagem_passageiros?.clientes?.telefone
      }));

      setHistoricoCobranca(historico);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast.error('Erro ao carregar histórico de cobrança');
    }
  };

  // Calcular resumo financeiro
  const calcularResumoFinanceiro = async () => {
    if (!viagemId) return;

    try {
      // Buscar receitas de passageiros
      const { data: passageiros, error: passageirosError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          viagem_passageiros_parcelas (valor_parcela)
        `)
        .eq('viagem_id', viagemId);

      if (passageirosError) throw passageirosError;

      let receitasPassageiros = 0;
      let totalPendencias = 0;
      let countPendencias = 0;

      passageiros?.forEach((p: any) => {
        const valorLiquido = (p.valor || 0) - (p.desconto || 0);
        const valorPago = (p.viagem_passageiros_parcelas || [])
          .reduce((sum: number, parcela: any) => sum + (parcela.valor_parcela || 0), 0);
        
        receitasPassageiros += valorLiquido;
        
        const pendente = valorLiquido - valorPago;
        if (pendente > 0.01) {
          totalPendencias += pendente;
          countPendencias++;
        }
      });

      // Somar outras receitas
      const totalOutrasReceitas = receitas.reduce((sum, r) => sum + r.valor, 0);
      const totalReceitas = receitasPassageiros + totalOutrasReceitas;

      // Somar despesas
      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);

      // Calcular métricas
      const lucroBruto = totalReceitas - totalDespesas;
      const margemLucro = totalReceitas > 0 ? (lucroBruto / totalReceitas) * 100 : 0;
      const taxaInadimplencia = passageiros?.length > 0 ? (countPendencias / passageiros.length) * 100 : 0;

      setResumoFinanceiro({
        total_receitas: totalReceitas,
        total_despesas: totalDespesas,
        lucro_bruto: lucroBruto,
        margem_lucro: margemLucro,
        total_pendencias: totalPendencias,
        count_pendencias: countPendencias,
        taxa_inadimplencia: taxaInadimplencia
      });
    } catch (error) {
      console.error('Erro ao calcular resumo:', error);
    }
  };

  // Registrar tentativa de cobrança
  const registrarCobranca = async (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('viagem_cobranca_historico')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          tipo_contato: tipoContato,
          template_usado: templateUsado,
          mensagem_enviada: mensagem,
          status_envio: 'enviado',
          observacoes: observacoes
        });

      if (error) throw error;

      toast.success('Cobrança registrada com sucesso!');
      await fetchHistoricoCobranca();
    } catch (error) {
      console.error('Erro ao registrar cobrança:', error);
      toast.error('Erro ao registrar cobrança');
    }
  };

  // Adicionar receita
  const adicionarReceita = async (receita: Omit<ViagemReceita, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .insert(receita);

      if (error) throw error;

      toast.success('Receita adicionada com sucesso!');
      await fetchAllData(); // Recarregar todos os dados
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      toast.error('Erro ao adicionar receita');
    }
  };

  // Editar receita
  const editarReceita = async (id: string, receita: Partial<Omit<ViagemReceita, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .update(receita)
        .eq('id', id);

      if (error) throw error;

      toast.success('Receita atualizada com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao editar receita:', error);
      toast.error('Erro ao editar receita');
    }
  };

  // Excluir receita
  const excluirReceita = async (id: string) => {
    try {
      const { error } = await supabase
        .from('viagem_receitas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Receita excluída com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      toast.error('Erro ao excluir receita');
    }
  };

  // Adicionar despesa
  const adicionarDespesa = async (despesa: Omit<ViagemDespesa, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .insert(despesa);

      if (error) throw error;

      toast.success('Despesa adicionada com sucesso!');
      await fetchAllData(); // Recarregar todos os dados
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      toast.error('Erro ao adicionar despesa');
    }
  };

  // Editar despesa
  const editarDespesa = async (id: string, despesa: Partial<Omit<ViagemDespesa, 'id' | 'created_at'>>) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .update(despesa)
        .eq('id', id);

      if (error) throw error;

      toast.success('Despesa atualizada com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao editar despesa:', error);
      toast.error('Erro ao editar despesa');
    }
  };

  // Excluir despesa
  const excluirDespesa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('viagem_despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Despesa excluída com sucesso!');
      await fetchAllData();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast.error('Erro ao excluir despesa');
    }
  };

  // Atualizar status de pagamento do passageiro
  const atualizarStatusPagamento = async (
    viagemPassageiroId: string,
    novoStatus: 'pago' | 'pendente' | 'cancelado'
  ) => {
    try {
      const { error } = await supabase
        .from('viagem_passageiros')
        .update({ status_pagamento: novoStatus })
        .eq('id', viagemPassageiroId);

      if (error) throw error;

      toast.success('Status de pagamento atualizado com sucesso!');
      await fetchPassageirosPendentes();
      await calcularResumoFinanceiro();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status de pagamento');
    }
  };

  // Registrar pagamento de parcela
  const registrarPagamento = async (
    viagemPassageiroId: string,
    valorParcela: number,
    formaPagamento: string,
    dataPagamento: string = new Date().toISOString(),
    observacoes?: string
  ) => {
    try {
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          valor_parcela: valorParcela,
          forma_pagamento: formaPagamento,
          data_pagamento: dataPagamento,
          observacoes: observacoes
        });

      if (error) throw error;

      // Verificar se o passageiro está totalmente pago
      await verificarStatusPagamento(viagemPassageiroId);

      toast.success('Pagamento registrado com sucesso!');
      await fetchPassageirosPendentes();
      await calcularResumoFinanceiro();
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  // Verificar e atualizar status de pagamento automaticamente
  const verificarStatusPagamento = async (viagemPassageiroId: string) => {
    try {
      // Buscar dados do passageiro
      const { data: passageiro, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          viagem_passageiros_parcelas (valor_parcela)
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
      const valorPago = (passageiro.viagem_passageiros_parcelas || [])
        .reduce((sum: number, p: any) => sum + (p.valor_parcela || 0), 0);

      // Determinar novo status
      let novoStatus: 'pago' | 'pendente' | 'cancelado';
      if (valorPago >= valorTotal - 0.01) { // Margem para centavos
        novoStatus = 'pago';
      } else if (valorPago > 0) {
        novoStatus = 'pendente';
      } else {
        novoStatus = 'pendente';
      }

      // Atualizar status se necessário
      const { error: updateError } = await supabase
        .from('viagem_passageiros')
        .update({ status_pagamento: novoStatus })
        .eq('id', viagemPassageiroId);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Marcar passageiro como pago
  const marcarComoPago = async (viagemPassageiroId: string) => {
    try {
      // Buscar valor pendente
      const { data: passageiro, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          valor,
          desconto,
          viagem_passageiros_parcelas (valor_parcela)
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      const valorTotal = (passageiro.valor || 0) - (passageiro.desconto || 0);
      const valorPago = (passageiro.viagem_passageiros_parcelas || [])
        .reduce((sum: number, p: any) => sum + (p.valor_parcela || 0), 0);
      const valorPendente = valorTotal - valorPago;

      if (valorPendente > 0.01) {
        // Registrar pagamento do valor pendente
        await registrarPagamento(
          viagemPassageiroId,
          valorPendente,
          'dinheiro', // Forma padrão, pode ser alterada
          new Date().toISOString(),
          'Pagamento marcado como pago manualmente'
        );
      } else {
        // Apenas atualizar status
        await atualizarStatusPagamento(viagemPassageiroId, 'pago');
      }
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao marcar como pago');
    }
  };

  // Cancelar pagamento do passageiro
  const cancelarPagamento = async (viagemPassageiroId: string, motivo?: string) => {
    try {
      await atualizarStatusPagamento(viagemPassageiroId, 'cancelado');
      
      if (motivo) {
        // Registrar no histórico de cobrança
        await registrarCobranca(
          viagemPassageiroId,
          'presencial',
          undefined,
          undefined,
          `Pagamento cancelado: ${motivo}`
        );
      }

      toast.success('Pagamento cancelado com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error);
      toast.error('Erro ao cancelar pagamento');
    }
  };

  // Carregar todos os dados
  const fetchAllData = async () => {
    if (!viagemId) return;

    setIsLoading(true);
    try {
      await Promise.all([
        fetchReceitas(),
        fetchDespesas(),
        fetchPassageirosPendentes(),
        fetchHistoricoCobranca()
      ]);
      await calcularResumoFinanceiro();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [viagemId]);

  useEffect(() => {
    calcularResumoFinanceiro();
  }, [receitas, despesas]);

  return {
    // Dados
    receitas,
    despesas,
    passageirosPendentes,
    historicoCobranca,
    resumoFinanceiro,
    isLoading,
    
    // Ações
    fetchAllData,
    registrarCobranca,
    adicionarReceita,
    editarReceita,
    excluirReceita,
    adicionarDespesa,
    editarDespesa,
    excluirDespesa,
    fetchReceitas,
    fetchDespesas,
    fetchPassageirosPendentes,
    fetchHistoricoCobranca,
    
    // Gerenciamento de Status dos Passageiros
    atualizarStatusPagamento,
    registrarPagamento,
    verificarStatusPagamento,
    marcarComoPago,
    cancelarPagamento
  };
}