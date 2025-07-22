import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface PagamentoViagem {
  id: string;
  viagem_id: string;
  cliente_id: string;
  valor_total: number;
  valor_pago: number;
  valor_pendente: number;
  data_vencimento?: string;
  status: 'pendente' | 'pago' | 'parcial' | 'vencido' | 'cancelado';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Dados relacionados
  cliente?: {
    nome: string;
    email: string;
    telefone?: string;
  };
  viagem?: {
    adversario: string;
    data_jogo: string;
    valor_padrao: number;
  };
}

export interface ParcelaPagamento {
  id: string;
  pagamento_viagem_id: string;
  valor: number;
  data_pagamento: string;
  metodo_pagamento?: string;
  comprovante_url?: string;
  observacoes?: string;
  created_at: string;
}

export interface ResumoPagamentosViagem {
  viagem_id: string;
  adversario: string;
  data_jogo: string;
  receita_prevista: number;
  receita_recebida: number;
  receita_pendente: number;
  total_passageiros: number;
  passageiros_pagos: number;
  passageiros_pendentes: number;
}

interface UsePagamentosViagemReturn {
  pagamentos: PagamentoViagem[];
  parcelas: ParcelaPagamento[];
  resumos: ResumoPagamentosViagem[];
  loading: boolean;
  error: string | null;
  
  // Funções para pagamentos
  fetchPagamentosByViagem: (viagemId: string) => Promise<void>;
  fetchPagamentosByCliente: (clienteId: string) => Promise<void>;
  createPagamentoViagem: (data: Omit<PagamentoViagem, 'id' | 'valor_pendente' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updatePagamentoViagem: (id: string, data: Partial<PagamentoViagem>) => Promise<boolean>;
  deletePagamentoViagem: (id: string) => Promise<boolean>;
  
  // Funções para parcelas
  addParcela: (pagamentoId: string, data: Omit<ParcelaPagamento, 'id' | 'pagamento_viagem_id' | 'created_at'>) => Promise<boolean>;
  fetchParcelasByPagamento: (pagamentoId: string) => Promise<void>;
  
  // Funções para resumos
  fetchResumoFinanceiroViagens: () => Promise<void>;
  getResumoViagem: (viagemId: string) => Promise<ResumoPagamentosViagem | null>;
}

export const usePagamentosViagem = (): UsePagamentosViagemReturn => {
  const [pagamentos, setPagamentos] = useState<PagamentoViagem[]>([]);
  const [parcelas, setParcelas] = useState<ParcelaPagamento[]>([]);
  const [resumos, setResumos] = useState<ResumoPagamentosViagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar pagamentos por viagem
  const fetchPagamentosByViagem = async (viagemId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pagamentos_viagem')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          viagem:viagens(adversario, data_jogo, valor_padrao)
        `)
        .eq('viagem_id', viagemId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPagamentos(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar pagamentos da viagem:', err);
      setError(err.message);
      toast.error('Erro ao carregar pagamentos da viagem');
    } finally {
      setLoading(false);
    }
  };

  // Buscar pagamentos por cliente
  const fetchPagamentosByCliente = async (clienteId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pagamentos_viagem')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          viagem:viagens(adversario, data_jogo, valor_padrao)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setPagamentos(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar pagamentos do cliente:', err);
      setError(err.message);
      toast.error('Erro ao carregar pagamentos do cliente');
    } finally {
      setLoading(false);
    }
  };

  // Criar pagamento de viagem
  const createPagamentoViagem = async (data: Omit<PagamentoViagem, 'id' | 'valor_pendente' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: newPagamento, error: createError } = await supabase
        .from('pagamentos_viagem')
        .insert([data])
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          viagem:viagens(adversario, data_jogo, valor_padrao)
        `)
        .single();

      if (createError) throw createError;

      setPagamentos(prev => [newPagamento, ...prev]);
      toast.success('Pagamento criado com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao criar pagamento:', err);
      setError(err.message);
      toast.error('Erro ao criar pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar pagamento
  const updatePagamentoViagem = async (id: string, data: Partial<PagamentoViagem>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data: updatedPagamento, error: updateError } = await supabase
        .from('pagamentos_viagem')
        .update(data)
        .eq('id', id)
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          viagem:viagens(adversario, data_jogo, valor_padrao)
        `)
        .single();

      if (updateError) throw updateError;

      setPagamentos(prev => prev.map(p => p.id === id ? updatedPagamento : p));
      toast.success('Pagamento atualizado com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao atualizar pagamento:', err);
      setError(err.message);
      toast.error('Erro ao atualizar pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar pagamento
  const deletePagamentoViagem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('pagamentos_viagem')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast.success('Pagamento removido com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao deletar pagamento:', err);
      setError(err.message);
      toast.error('Erro ao remover pagamento');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar parcela de pagamento
  const addParcela = async (pagamentoId: string, data: Omit<ParcelaPagamento, 'id' | 'pagamento_viagem_id' | 'created_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const parcelaData = {
        ...data,
        pagamento_viagem_id: pagamentoId
      };

      const { data: newParcela, error: createError } = await supabase
        .from('parcelas_pagamento')
        .insert([parcelaData])
        .select()
        .single();

      if (createError) throw createError;

      setParcelas(prev => [newParcela, ...prev]);
      
      // Recarregar pagamento para atualizar valor pago
      const { data: updatedPagamento } = await supabase
        .from('pagamentos_viagem')
        .select(`
          *,
          cliente:clientes(nome, email, telefone),
          viagem:viagens(adversario, data_jogo, valor_padrao)
        `)
        .eq('id', pagamentoId)
        .single();

      if (updatedPagamento) {
        setPagamentos(prev => prev.map(p => p.id === pagamentoId ? updatedPagamento : p));
      }

      toast.success('Parcela registrada com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao adicionar parcela:', err);
      setError(err.message);
      toast.error('Erro ao registrar parcela');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar parcelas por pagamento
  const fetchParcelasByPagamento = async (pagamentoId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('parcelas_pagamento')
        .select('*')
        .eq('pagamento_viagem_id', pagamentoId)
        .order('data_pagamento', { ascending: false });

      if (fetchError) throw fetchError;
      setParcelas(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar parcelas:', err);
      toast.error('Erro ao carregar parcelas');
    }
  };

  // Buscar resumo financeiro das viagens
  const fetchResumoFinanceiroViagens = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('view_resumo_financeiro_viagem')
        .select('*')
        .order('data_jogo', { ascending: false });

      if (fetchError) throw fetchError;
      setResumos(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar resumo financeiro:', err);
      setError(err.message);
      toast.error('Erro ao carregar resumo financeiro');
    } finally {
      setLoading(false);
    }
  };

  // Buscar resumo de uma viagem específica
  const getResumoViagem = async (viagemId: string): Promise<ResumoPagamentosViagem | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('view_resumo_financeiro_viagem')
        .select('*')
        .eq('viagem_id', viagemId)
        .single();

      if (fetchError) throw fetchError;
      return data;

    } catch (err: any) {
      console.error('Erro ao buscar resumo da viagem:', err);
      return null;
    }
  };

  return {
    pagamentos,
    parcelas,
    resumos,
    loading,
    error,
    fetchPagamentosByViagem,
    fetchPagamentosByCliente,
    createPagamentoViagem,
    updatePagamentoViagem,
    deletePagamentoViagem,
    addParcela,
    fetchParcelasByPagamento,
    fetchResumoFinanceiroViagens,
    getResumoViagem
  };
};