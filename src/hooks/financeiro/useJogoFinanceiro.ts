import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// =====================================================
// TIPOS E INTERFACES
// =====================================================

export interface ReceitaJogo {
  id: string;
  jogo_key: string;
  tipo: 'patrocinio' | 'comissao' | 'venda_extra' | 'outros';
  descricao: string;
  valor: number;
  data_receita: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface DespesaJogo {
  id: string;
  jogo_key: string;
  tipo: 'custo_ingresso' | 'transporte' | 'alimentacao' | 'comissao' | 'marketing' | 'outros';
  categoria: 'fixa' | 'variavel';
  descricao: string;
  fornecedor?: string;
  valor: number;
  data_despesa: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResumoFinanceiroJogo {
  jogo_key: string;
  adversario: string;
  jogo_data: string;
  local_jogo: string;
  total_ingressos: number;
  ingressos_pagos: number;
  ingressos_pendentes: number;
  ingressos_cancelados: number;
  receita_ingressos_paga: number;
  receita_ingressos_pendente: number;
  receita_ingressos_total: number;
  custo_ingressos_total: number;
  receitas_manuais: number;
  despesas_operacionais: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  ticket_medio: number;
}

export interface SetorAnalytics {
  jogo_key: string;
  adversario: string;
  jogo_data: string;
  local_jogo: string;
  setor_estadio: string;
  quantidade_total: number;
  quantidade_paga: number;
  quantidade_pendente: number;
  receita_total: number;
  receita_paga: number;
  receita_pendente: number;
  custo_total: number;
  lucro_total: number;
  preco_medio_venda: number;
  preco_medio_custo: number;
  margem_percentual: number;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useJogoFinanceiro(jogoKey: string) {
  // Estados
  const [receitas, setReceitas] = useState<ReceitaJogo[]>([]);
  const [despesas, setDespesas] = useState<DespesaJogo[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiroJogo | null>(null);
  const [setorAnalytics, setSetorAnalytics] = useState<SetorAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =====================================================
  // FUNÇÕES DE BUSCA DE DADOS
  // =====================================================

  const buscarReceitas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('receitas_jogos')
        .select('*')
        .eq('jogo_key', jogoKey)
        .order('data_receita', { ascending: false });

      if (error) throw error;
      setReceitas(data || []);
    } catch (err) {
      console.error('Erro ao buscar receitas:', err);
      setError('Erro ao carregar receitas');
    }
  }, [jogoKey]);

  const buscarDespesas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('despesas_jogos')
        .select('*')
        .eq('jogo_key', jogoKey)
        .order('data_despesa', { ascending: false });

      if (error) throw error;
      setDespesas(data || []);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
      setError('Erro ao carregar despesas');
    }
  }, [jogoKey]);

  const buscarResumoFinanceiro = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vw_resumo_financeiro_jogo')
        .select('*')
        .eq('jogo_key', jogoKey)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      setResumoFinanceiro(data || null);
    } catch (err) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setError('Erro ao carregar resumo financeiro');
    }
  }, [jogoKey]);

  const buscarSetorAnalytics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('vw_analytics_setor_jogo')
        .select('*')
        .eq('jogo_key', jogoKey)
        .order('receita_total', { ascending: false });

      if (error) throw error;
      setSetorAnalytics(data || []);
    } catch (err) {
      console.error('Erro ao buscar analytics por setor:', err);
      setError('Erro ao carregar analytics por setor');
    }
  }, [jogoKey]);

  // =====================================================
  // FUNÇÕES CRUD - RECEITAS
  // =====================================================

  const adicionarReceita = useCallback(async (receita: Omit<ReceitaJogo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('receitas_jogos')
        .insert([{ ...receita, jogo_key: jogoKey }])
        .select()
        .single();

      if (error) throw error;

      setReceitas(prev => [data, ...prev]);
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Receita adicionada com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar receita:', err);
      toast.error('Erro ao adicionar receita');
      throw err;
    }
  }, [jogoKey, buscarResumoFinanceiro]);

  const editarReceita = useCallback(async (id: string, receita: Partial<ReceitaJogo>) => {
    try {
      const { data, error } = await supabase
        .from('receitas_jogos')
        .update(receita)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReceitas(prev => prev.map(r => r.id === id ? data : r));
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Receita atualizada com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao editar receita:', err);
      toast.error('Erro ao atualizar receita');
      throw err;
    }
  }, [buscarResumoFinanceiro]);

  const excluirReceita = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('receitas_jogos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setReceitas(prev => prev.filter(r => r.id !== id));
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Receita excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir receita:', err);
      toast.error('Erro ao excluir receita');
      throw err;
    }
  }, [buscarResumoFinanceiro]);

  // =====================================================
  // FUNÇÕES CRUD - DESPESAS
  // =====================================================

  const adicionarDespesa = useCallback(async (despesa: Omit<DespesaJogo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('despesas_jogos')
        .insert([{ ...despesa, jogo_key: jogoKey }])
        .select()
        .single();

      if (error) throw error;

      setDespesas(prev => [data, ...prev]);
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Despesa adicionada com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao adicionar despesa:', err);
      toast.error('Erro ao adicionar despesa');
      throw err;
    }
  }, [jogoKey, buscarResumoFinanceiro]);

  const editarDespesa = useCallback(async (id: string, despesa: Partial<DespesaJogo>) => {
    try {
      const { data, error } = await supabase
        .from('despesas_jogos')
        .update(despesa)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDespesas(prev => prev.map(d => d.id === id ? data : d));
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Despesa atualizada com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao editar despesa:', err);
      toast.error('Erro ao atualizar despesa');
      throw err;
    }
  }, [buscarResumoFinanceiro]);

  const excluirDespesa = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('despesas_jogos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDespesas(prev => prev.filter(d => d.id !== id));
      await buscarResumoFinanceiro(); // Atualizar resumo
      
      toast.success('Despesa excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
      toast.error('Erro ao excluir despesa');
      throw err;
    }
  }, [buscarResumoFinanceiro]);

  // =====================================================
  // FUNÇÃO PARA RECARREGAR TODOS OS DADOS
  // =====================================================

  const recarregarDados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        buscarReceitas(),
        buscarDespesas(),
        buscarResumoFinanceiro(),
        buscarSetorAnalytics()
      ]);
    } catch (err) {
      console.error('Erro ao recarregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, [buscarReceitas, buscarDespesas, buscarResumoFinanceiro, buscarSetorAnalytics]);

  // =====================================================
  // EFFECT PARA CARREGAR DADOS INICIAIS
  // =====================================================

  useEffect(() => {
    if (jogoKey) {
      recarregarDados();
    }
  }, [jogoKey, recarregarDados]);

  // =====================================================
  // RETORNO DO HOOK
  // =====================================================

  return {
    // Estados
    receitas,
    despesas,
    resumoFinanceiro,
    setorAnalytics,
    isLoading,
    error,
    
    // Funções de receitas
    adicionarReceita,
    editarReceita,
    excluirReceita,
    
    // Funções de despesas
    adicionarDespesa,
    editarDespesa,
    excluirDespesa,
    
    // Função para recarregar
    recarregarDados
  };
}