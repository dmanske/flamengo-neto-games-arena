import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Receita, FiltroFinanceiro } from '@/types/financeiro';

interface UseReceitasReturn {
  receitas: Receita[];
  loading: boolean;
  error: string | null;
  totalReceitas: number;
  createReceita: (receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateReceita: (id: string, receita: Partial<Receita>) => Promise<boolean>;
  deleteReceita: (id: string) => Promise<boolean>;
  fetchReceitas: (filtros?: FiltroFinanceiro) => Promise<void>;
  getReceitaById: (id: string) => Promise<Receita | null>;
  getReceitasPorViagem: (viagemId: string) => Promise<Receita[]>;
  getReceitasPorCliente: (clienteId: string) => Promise<Receita[]>;
  getTotalReceitasPorPeriodo: (dataInicio: string, dataFim: string) => Promise<number>;
}

export const useReceitas = (): UseReceitasReturn => {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalReceitas, setTotalReceitas] = useState(0);

  // Buscar receitas com filtros opcionais
  const fetchReceitas = async (filtros?: FiltroFinanceiro) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('receitas')
        .select('*')
        .order('data_recebimento', { ascending: false });

      // Aplicar filtros se fornecidos
      if (filtros) {
        if (filtros.data_inicio) {
          query = query.gte('data_recebimento', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('data_recebimento', filtros.data_fim);
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
        if (filtros.cliente_id) {
          query = query.eq('cliente_id', filtros.cliente_id);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setReceitas(data || []);
      
      // Calcular total das receitas
      const total = (data || []).reduce((sum, receita) => sum + Number(receita.valor), 0);
      setTotalReceitas(total);

    } catch (err: any) {
      console.error('Erro ao buscar receitas:', err);
      setError(err.message);
      toast.error('Erro ao carregar receitas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova receita
  const createReceita = async (receitaData: Omit<Receita, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('receitas')
        .insert([receitaData])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      setReceitas(prev => [data, ...prev]);
      setTotalReceitas(prev => prev + Number(receitaData.valor));

      // Não mostrar toast aqui, deixar para o componente
      return true;

    } catch (err: any) {
      console.error('Erro ao criar receita:', err);
      setError(err.message);
      // Não mostrar toast aqui, deixar para o componente
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar receita existente
  const updateReceita = async (id: string, receitaData: Partial<Receita>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('receitas')
        .update(receitaData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      setReceitas(prev => prev.map(receita => 
        receita.id === id ? { ...receita, ...data } : receita
      ));

      // Recalcular total se o valor foi alterado
      if (receitaData.valor !== undefined) {
        await fetchReceitas();
      }

      toast.success('Receita atualizada com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao atualizar receita:', err);
      setError(err.message);
      toast.error('Erro ao atualizar receita');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar receita
  const deleteReceita = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar receita antes de deletar para atualizar o total
      const receitaParaDeletar = receitas.find(r => r.id === id);

      const { error: deleteError } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      setReceitas(prev => prev.filter(receita => receita.id !== id));
      
      // Atualizar total
      if (receitaParaDeletar) {
        setTotalReceitas(prev => prev - Number(receitaParaDeletar.valor));
      }

      toast.success('Receita removida com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao deletar receita:', err);
      setError(err.message);
      toast.error('Erro ao remover receita');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar receita por ID
  const getReceitaById = async (id: string): Promise<Receita | null> => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;

    } catch (err: any) {
      console.error('Erro ao buscar receita por ID:', err);
      toast.error('Erro ao carregar receita');
      return null;
    }
  };

  // Buscar receitas por viagem
  const getReceitasPorViagem = async (viagemId: string): Promise<Receita[]> => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar receitas por viagem:', err);
      toast.error('Erro ao carregar receitas da viagem');
      return [];
    }
  };

  // Buscar receitas por cliente
  const getReceitasPorCliente = async (clienteId: string): Promise<Receita[]> => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('data_recebimento', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar receitas por cliente:', err);
      toast.error('Erro ao carregar receitas do cliente');
      return [];
    }
  };

  // Calcular total de receitas por período
  const getTotalReceitasPorPeriodo = async (dataInicio: string, dataFim: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .select('valor')
        .gte('data_recebimento', dataInicio)
        .lte('data_recebimento', dataFim)
        .eq('status', 'recebido');

      if (error) throw error;

      return (data || []).reduce((sum, receita) => sum + Number(receita.valor), 0);

    } catch (err: any) {
      console.error('Erro ao calcular total de receitas:', err);
      return 0;
    }
  };

  // Carregar receitas iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchReceitas();
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        setError('Erro ao conectar com o banco de dados');
      }
    };
    
    loadInitialData();
  }, []);

  return {
    receitas,
    loading,
    error,
    totalReceitas,
    createReceita,
    updateReceita,
    deleteReceita,
    fetchReceitas,
    getReceitaById,
    getReceitasPorViagem,
    getReceitasPorCliente,
    getTotalReceitasPorPeriodo
  };
};