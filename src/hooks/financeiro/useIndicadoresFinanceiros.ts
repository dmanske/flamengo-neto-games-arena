import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { IndicadorFinanceiro } from '@/types/financeiro';

interface UseIndicadoresFinanceirosReturn {
  indicadores: IndicadorFinanceiro;
  loading: boolean;
  error: string | null;
  fetchIndicadores: (dataInicio?: string, dataFim?: string) => Promise<void>;
  getIndicadoresPorPeriodo: (dataInicio: string, dataFim: string) => Promise<IndicadorFinanceiro>;
}

export const useIndicadoresFinanceiros = (): UseIndicadoresFinanceirosReturn => {
  const [indicadores, setIndicadores] = useState<IndicadorFinanceiro>({
    receita_total: 0,
    despesa_total: 0,
    lucro_liquido: 0,
    margem_lucro: 0,
    contas_vencidas: 0,
    contas_a_vencer_30_dias: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar indicadores financeiros
  const fetchIndicadores = async (dataInicio?: string, dataFim?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Se não fornecidas, usar o mês atual
      if (!dataInicio || !dataFim) {
        const hoje = new Date();
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];
      }

      // Buscar receitas do período
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('valor')
        .gte('data_recebimento', dataInicio)
        .lte('data_recebimento', dataFim)
        .eq('status', 'recebido');

      if (receitasError) throw receitasError;

      // Buscar despesas do período
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim)
        .eq('status', 'pago');

      if (despesasError) throw despesasError;

      // Buscar contas vencidas
      const hoje = new Date().toISOString().split('T')[0];
      const { data: contasVencidas, error: vencidasError } = await supabase
        .from('contas_pagar')
        .select('id')
        .lt('data_vencimento', hoje)
        .eq('status', 'pendente');

      if (vencidasError) throw vencidasError;

      // Buscar contas a vencer em 30 dias
      const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: contasVencendo, error: vencendoError } = await supabase
        .from('contas_pagar')
        .select('id')
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', em30Dias)
        .eq('status', 'pendente');

      if (vencendoError) throw vencendoError;

      // Calcular totais
      const receitaTotal = (receitas || []).reduce((sum, r) => sum + Number(r.valor), 0);
      const despesaTotal = (despesas || []).reduce((sum, d) => sum + Number(d.valor), 0);
      const lucroLiquido = receitaTotal - despesaTotal;
      const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

      const novosIndicadores: IndicadorFinanceiro = {
        receita_total: receitaTotal,
        despesa_total: despesaTotal,
        lucro_liquido: lucroLiquido,
        margem_lucro: margemLucro,
        contas_vencidas: (contasVencidas || []).length,
        contas_a_vencer_30_dias: (contasVencendo || []).length
      };

      setIndicadores(novosIndicadores);

    } catch (err: any) {
      console.error('Erro ao buscar indicadores financeiros:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar indicadores para um período específico
  const getIndicadoresPorPeriodo = async (dataInicio: string, dataFim: string): Promise<IndicadorFinanceiro> => {
    try {
      // Buscar receitas do período
      const { data: receitas, error: receitasError } = await supabase
        .from('receitas')
        .select('valor')
        .gte('data_recebimento', dataInicio)
        .lte('data_recebimento', dataFim)
        .eq('status', 'recebido');

      if (receitasError) throw receitasError;

      // Buscar despesas do período
      const { data: despesas, error: despesasError } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim)
        .eq('status', 'pago');

      if (despesasError) throw despesasError;

      // Calcular totais
      const receitaTotal = (receitas || []).reduce((sum, r) => sum + Number(r.valor), 0);
      const despesaTotal = (despesas || []).reduce((sum, d) => sum + Number(d.valor), 0);
      const lucroLiquido = receitaTotal - despesaTotal;
      const margemLucro = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

      return {
        receita_total: receitaTotal,
        despesa_total: despesaTotal,
        lucro_liquido: lucroLiquido,
        margem_lucro: margemLucro,
        contas_vencidas: 0, // Não aplicável para períodos históricos
        contas_a_vencer_30_dias: 0 // Não aplicável para períodos históricos
      };

    } catch (err: any) {
      console.error('Erro ao buscar indicadores por período:', err);
      return {
        receita_total: 0,
        despesa_total: 0,
        lucro_liquido: 0,
        margem_lucro: 0,
        contas_vencidas: 0,
        contas_a_vencer_30_dias: 0
      };
    }
  };

  // Carregar indicadores iniciais
  useEffect(() => {
    fetchIndicadores();
  }, []);

  return {
    indicadores,
    loading,
    error,
    fetchIndicadores,
    getIndicadoresPorPeriodo
  };
};