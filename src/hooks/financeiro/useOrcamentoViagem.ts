import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface OrcamentoViagem {
  id: string;
  viagem_id: string;
  categoria: string;
  descricao: string;
  valor_planejado: number;
  valor_real: number;
  status: 'planejado' | 'executado' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumoOrcamento {
  viagem_id: string;
  total_planejado: number;
  total_real: number;
  diferenca: number;
  percentual_execucao: number;
  itens_planejados: number;
  itens_executados: number;
}

interface UseOrcamentoViagemReturn {
  orcamentos: OrcamentoViagem[];
  resumo: ResumoOrcamento | null;
  loading: boolean;
  error: string | null;
  
  fetchOrcamentoByViagem: (viagemId: string) => Promise<void>;
  createItemOrcamento: (data: Omit<OrcamentoViagem, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateItemOrcamento: (id: string, data: Partial<OrcamentoViagem>) => Promise<boolean>;
  deleteItemOrcamento: (id: string) => Promise<boolean>;
  marcarComoExecutado: (id: string, valorReal: number) => Promise<boolean>;
  getResumoOrcamento: (viagemId: string) => Promise<ResumoOrcamento | null>;
}

export const useOrcamentoViagem = (): UseOrcamentoViagemReturn => {
  const [orcamentos, setOrcamentos] = useState<OrcamentoViagem[]>([]);
  const [resumo, setResumo] = useState<ResumoOrcamento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar orçamento por viagem
  const fetchOrcamentoByViagem = async (viagemId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('orcamento_viagem')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('categoria', { ascending: true });

      if (fetchError) throw fetchError;
      setOrcamentos(data || []);

      // Calcular resumo
      const resumoCalculado = calcularResumo(data || [], viagemId);
      setResumo(resumoCalculado);

    } catch (err: any) {
      console.error('Erro ao buscar orçamento da viagem:', err);
      setError(err.message);
      toast.error('Erro ao carregar orçamento da viagem');
    } finally {
      setLoading(false);
    }
  };

  // Calcular resumo do orçamento
  const calcularResumo = (items: OrcamentoViagem[], viagemId: string): ResumoOrcamento => {
    const totalPlanejado = items.reduce((sum, item) => sum + Number(item.valor_planejado), 0);
    const totalReal = items.reduce((sum, item) => sum + Number(item.valor_real), 0);
    const diferenca = totalReal - totalPlanejado;
    const percentualExecucao = totalPlanejado > 0 ? (totalReal / totalPlanejado) * 100 : 0;
    const itensExecutados = items.filter(item => item.status === 'executado').length;

    return {
      viagem_id: viagemId,
      total_planejado: totalPlanejado,
      total_real: totalReal,
      diferenca,
      percentual_execucao: percentualExecucao,
      itens_planejados: items.length,
      itens_executados: itensExecutados
    };
  };

  // Criar item de orçamento
  const createItemOrcamento = async (data: Omit<OrcamentoViagem, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: newItem, error: createError } = await supabase
        .from('orcamento_viagem')
        .insert([data])
        .select()
        .single();

      if (createError) throw createError;

      const updatedOrcamentos = [...orcamentos, newItem];
      setOrcamentos(updatedOrcamentos);
      
      // Atualizar resumo
      const novoResumo = calcularResumo(updatedOrcamentos, data.viagem_id);
      setResumo(novoResumo);

      toast.success('Item de orçamento criado com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao criar item de orçamento:', err);
      setError(err.message);
      toast.error('Erro ao criar item de orçamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar item de orçamento
  const updateItemOrcamento = async (id: string, data: Partial<OrcamentoViagem>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: updatedItem, error: updateError } = await supabase
        .from('orcamento_viagem')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedOrcamentos = orcamentos.map(item => item.id === id ? updatedItem : item);
      setOrcamentos(updatedOrcamentos);
      
      // Atualizar resumo
      if (resumo) {
        const novoResumo = calcularResumo(updatedOrcamentos, resumo.viagem_id);
        setResumo(novoResumo);
      }

      toast.success('Item de orçamento atualizado com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao atualizar item de orçamento:', err);
      setError(err.message);
      toast.error('Erro ao atualizar item de orçamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar item de orçamento
  const deleteItemOrcamento = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('orcamento_viagem')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      const updatedOrcamentos = orcamentos.filter(item => item.id !== id);
      setOrcamentos(updatedOrcamentos);
      
      // Atualizar resumo
      if (resumo) {
        const novoResumo = calcularResumo(updatedOrcamentos, resumo.viagem_id);
        setResumo(novoResumo);
      }

      toast.success('Item de orçamento removido com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao deletar item de orçamento:', err);
      setError(err.message);
      toast.error('Erro ao remover item de orçamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Marcar como executado
  const marcarComoExecutado = async (id: string, valorReal: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: updatedItem, error: updateError } = await supabase
        .from('orcamento_viagem')
        .update({ 
          valor_real: valorReal, 
          status: 'executado' 
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedOrcamentos = orcamentos.map(item => item.id === id ? updatedItem : item);
      setOrcamentos(updatedOrcamentos);
      
      // Atualizar resumo
      if (resumo) {
        const novoResumo = calcularResumo(updatedOrcamentos, resumo.viagem_id);
        setResumo(novoResumo);
      }

      toast.success('Item marcado como executado!');
      return true;

    } catch (err: any) {
      console.error('Erro ao marcar item como executado:', err);
      setError(err.message);
      toast.error('Erro ao marcar item como executado');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar resumo de orçamento
  const getResumoOrcamento = async (viagemId: string): Promise<ResumoOrcamento | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('orcamento_viagem')
        .select('*')
        .eq('viagem_id', viagemId);

      if (fetchError) throw fetchError;
      
      return calcularResumo(data || [], viagemId);

    } catch (err: any) {
      console.error('Erro ao buscar resumo de orçamento:', err);
      return null;
    }
  };

  return {
    orcamentos,
    resumo,
    loading,
    error,
    fetchOrcamentoByViagem,
    createItemOrcamento,
    updateItemOrcamento,
    deleteItemOrcamento,
    marcarComoExecutado,
    getResumoOrcamento
  };
};