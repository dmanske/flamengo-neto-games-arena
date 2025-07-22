import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Despesa, FiltroFinanceiro } from '@/types/financeiro';

interface UseDespesasReturn {
  despesas: Despesa[];
  loading: boolean;
  error: string | null;
  totalDespesas: number;
  despesasVencidas: number;
  despesasVencendoHoje: number;
  despesasVencendo30Dias: number;
  createDespesa: (despesa: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateDespesa: (id: string, despesa: Partial<Despesa>) => Promise<boolean>;
  deleteDespesa: (id: string) => Promise<boolean>;
  fetchDespesas: (filtros?: FiltroFinanceiro) => Promise<void>;
  getDespesaById: (id: string) => Promise<Despesa | null>;
  getDespesasPorViagem: (viagemId: string) => Promise<Despesa[]>;
  marcarComoPago: (id: string, dataPagamento: string, metodoPagamento?: string) => Promise<boolean>;
  getTotalDespesasPorPeriodo: (dataInicio: string, dataFim: string) => Promise<number>;
  getDespesasVencendo: (dias: number) => Promise<Despesa[]>;
}

export const useDespesas = (): UseDespesasReturn => {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [despesasVencidas, setDespesasVencidas] = useState(0);
  const [despesasVencendoHoje, setDespesasVencendoHoje] = useState(0);
  const [despesasVencendo30Dias, setDespesasVencendo30Dias] = useState(0);

  // Calcular estatísticas de vencimento
  const calcularEstatisticas = (despesasList: Despesa[]) => {
    const hoje = new Date().toISOString().split('T')[0];
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const vencidas = despesasList.filter(d => 
      d.status === 'vencido' || (d.data_vencimento < hoje && d.status === 'pendente')
    ).length;

    const vencendoHoje = despesasList.filter(d => 
      d.data_vencimento === hoje && d.status === 'pendente'
    ).length;

    const vencendo30 = despesasList.filter(d => 
      d.data_vencimento <= em30Dias && d.data_vencimento >= hoje && d.status === 'pendente'
    ).length;

    const total = despesasList.reduce((sum, despesa) => sum + Number(despesa.valor), 0);

    setDespesasVencidas(vencidas);
    setDespesasVencendoHoje(vencendoHoje);
    setDespesasVencendo30Dias(vencendo30);
    setTotalDespesas(total);
  };

  // Buscar despesas com filtros opcionais
  const fetchDespesas = async (filtros?: FiltroFinanceiro) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('despesas')
        .select('*')
        .order('data_vencimento', { ascending: true });

      // Aplicar filtros se fornecidos
      if (filtros) {
        if (filtros.data_inicio) {
          query = query.gte('data_vencimento', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('data_vencimento', filtros.data_fim);
        }
        if (filtros.categoria) {
          query = query.eq('categoria', filtros.categoria);
        }
        if (filtros.status) {
          query = query.eq('status', filtros.status);
        }
        if (filtros.viagem_id) {
          query = query.eq('viagem_id', filtros.viagem_id);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setDespesas(data || []);
      calcularEstatisticas(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar despesas:', err);
      setError(err.message);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova despesa
  const createDespesa = async (despesaData: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('despesas')
        .insert([despesaData])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      const novasDespesas = [data, ...despesas];
      setDespesas(novasDespesas);
      calcularEstatisticas(novasDespesas);

      // Toast será mostrado no componente
      return true;

    } catch (err: any) {
      console.error('Erro ao criar despesa:', err);
      setError(err.message);
      // Toast será mostrado no componente
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar despesa existente
  const updateDespesa = async (id: string, despesaData: Partial<Despesa>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('despesas')
        .update(despesaData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      const despesasAtualizadas = despesas.map(despesa => 
        despesa.id === id ? { ...despesa, ...data } : despesa
      );
      setDespesas(despesasAtualizadas);
      calcularEstatisticas(despesasAtualizadas);

      toast.success('Despesa atualizada com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao atualizar despesa:', err);
      setError(err.message);
      toast.error('Erro ao atualizar despesa');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar despesa
  const deleteDespesa = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      const despesasAtualizadas = despesas.filter(despesa => despesa.id !== id);
      setDespesas(despesasAtualizadas);
      calcularEstatisticas(despesasAtualizadas);

      toast.success('Despesa removida com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao deletar despesa:', err);
      setError(err.message);
      toast.error('Erro ao remover despesa');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar despesa por ID
  const getDespesaById = async (id: string): Promise<Despesa | null> => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;

    } catch (err: any) {
      console.error('Erro ao buscar despesa por ID:', err);
      toast.error('Erro ao carregar despesa');
      return null;
    }
  };

  // Buscar despesas por viagem
  const getDespesasPorViagem = async (viagemId: string): Promise<Despesa[]> => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar despesas por viagem:', err);
      toast.error('Erro ao carregar despesas da viagem');
      return [];
    }
  };

  // Marcar despesa como paga
  const marcarComoPago = async (id: string, dataPagamento: string, metodoPagamento?: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const updateData: Partial<Despesa> = {
        status: 'pago',
        data_pagamento: dataPagamento
      };

      if (metodoPagamento) {
        updateData.metodo_pagamento = metodoPagamento;
      }

      const { data, error: updateError } = await supabase
        .from('despesas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      const despesasAtualizadas = despesas.map(despesa => 
        despesa.id === id ? { ...despesa, ...data } : despesa
      );
      setDespesas(despesasAtualizadas);
      calcularEstatisticas(despesasAtualizadas);

      toast.success('Despesa marcada como paga!');
      return true;

    } catch (err: any) {
      console.error('Erro ao marcar despesa como paga:', err);
      setError(err.message);
      toast.error('Erro ao atualizar despesa');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calcular total de despesas por período
  const getTotalDespesasPorPeriodo = async (dataInicio: string, dataFim: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('despesas')
        .select('valor')
        .gte('data_vencimento', dataInicio)
        .lte('data_vencimento', dataFim)
        .eq('status', 'pago');

      if (error) throw error;

      return (data || []).reduce((sum, despesa) => sum + Number(despesa.valor), 0);

    } catch (err: any) {
      console.error('Erro ao calcular total de despesas:', err);
      return 0;
    }
  };

  // Buscar despesas que vencem em X dias
  const getDespesasVencendo = async (dias: number): Promise<Despesa[]> => {
    try {
      const dataLimite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', dataLimite)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar despesas vencendo:', err);
      return [];
    }
  };

  // Carregar despesas iniciais
  useEffect(() => {
    fetchDespesas();
  }, []);

  return {
    despesas,
    loading,
    error,
    totalDespesas,
    despesasVencidas,
    despesasVencendoHoje,
    despesasVencendo30Dias,
    createDespesa,
    updateDespesa,
    deleteDespesa,
    fetchDespesas,
    getDespesaById,
    getDespesasPorViagem,
    marcarComoPago,
    getTotalDespesasPorPeriodo,
    getDespesasVencendo
  };
};