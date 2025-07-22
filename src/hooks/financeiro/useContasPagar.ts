import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ContaPagar, FiltroFinanceiro } from '@/types/financeiro';

interface UseContasPagarReturn {
  contasPagar: ContaPagar[];
  loading: boolean;
  error: string | null;
  totalContasPagar: number;
  contasVencidas: number;
  contasVencendoHoje: number;
  contasVencendo7Dias: number;
  contasVencendo30Dias: number;
  createContaPagar: (conta: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateContaPagar: (id: string, conta: Partial<ContaPagar>) => Promise<boolean>;
  deleteContaPagar: (id: string) => Promise<boolean>;
  fetchContasPagar: (filtros?: FiltroFinanceiro) => Promise<void>;
  getContaPagarById: (id: string) => Promise<ContaPagar | null>;
  marcarComoPago: (id: string, dataPagamento: string) => Promise<boolean>;
  getContasVencendo: (dias: number) => Promise<ContaPagar[]>;
  getContasRecorrentes: () => Promise<ContaPagar[]>;
  getTotalContasPorStatus: (status: string) => Promise<number>;
  getAlertasVencimento: () => Promise<{
    vencidas: ContaPagar[];
    vencendoHoje: ContaPagar[];
    vencendo7Dias: ContaPagar[];
  }>;
}

export const useContasPagar = (): UseContasPagarReturn => {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalContasPagar, setTotalContasPagar] = useState(0);
  const [contasVencidas, setContasVencidas] = useState(0);
  const [contasVencendoHoje, setContasVencendoHoje] = useState(0);
  const [contasVencendo7Dias, setContasVencendo7Dias] = useState(0);
  const [contasVencendo30Dias, setContasVencendo30Dias] = useState(0);

  // Calcular estatísticas de vencimento
  const calcularEstatisticas = (contasList: ContaPagar[]) => {
    const hoje = new Date().toISOString().split('T')[0];
    const em7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const em30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const vencidas = contasList.filter(c => 
      c.status === 'vencido' || (c.data_vencimento < hoje && c.status === 'pendente')
    ).length;

    const vencendoHoje = contasList.filter(c => 
      c.data_vencimento === hoje && c.status === 'pendente'
    ).length;

    const vencendo7 = contasList.filter(c => 
      c.data_vencimento <= em7Dias && c.data_vencimento >= hoje && c.status === 'pendente'
    ).length;

    const vencendo30 = contasList.filter(c => 
      c.data_vencimento <= em30Dias && c.data_vencimento >= hoje && c.status === 'pendente'
    ).length;

    const total = contasList
      .filter(c => c.status === 'pendente')
      .reduce((sum, conta) => sum + Number(conta.valor), 0);

    setContasVencidas(vencidas);
    setContasVencendoHoje(vencendoHoje);
    setContasVencendo7Dias(vencendo7);
    setContasVencendo30Dias(vencendo30);
    setTotalContasPagar(total);
  };

  // Buscar contas a pagar com filtros opcionais
  const fetchContasPagar = async (filtros?: FiltroFinanceiro) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('contas_pagar')
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
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setContasPagar(data || []);
      calcularEstatisticas(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar contas a pagar:', err);
      setError(err.message);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova conta a pagar
  const createContaPagar = async (contaData: Omit<ContaPagar, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: createError } = await supabase
        .from('contas_pagar')
        .insert([contaData])
        .select()
        .single();

      if (createError) throw createError;

      // Atualizar lista local
      const novasContas = [data, ...contasPagar];
      setContasPagar(novasContas);
      calcularEstatisticas(novasContas);

      // Toast será mostrado no componente
      return true;

    } catch (err: any) {
      console.error('Erro ao criar conta a pagar:', err);
      setError(err.message);
      // Toast será mostrado no componente
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar conta a pagar existente
  const updateContaPagar = async (id: string, contaData: Partial<ContaPagar>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('contas_pagar')
        .update(contaData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      const contasAtualizadas = contasPagar.map(conta => 
        conta.id === id ? { ...conta, ...data } : conta
      );
      setContasPagar(contasAtualizadas);
      calcularEstatisticas(contasAtualizadas);

      toast.success('Conta a pagar atualizada com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao atualizar conta a pagar:', err);
      setError(err.message);
      toast.error('Erro ao atualizar conta a pagar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Deletar conta a pagar
  const deleteContaPagar = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Atualizar lista local
      const contasAtualizadas = contasPagar.filter(conta => conta.id !== id);
      setContasPagar(contasAtualizadas);
      calcularEstatisticas(contasAtualizadas);

      toast.success('Conta a pagar removida com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao deletar conta a pagar:', err);
      setError(err.message);
      toast.error('Erro ao remover conta a pagar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar conta a pagar por ID
  const getContaPagarById = async (id: string): Promise<ContaPagar | null> => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;

    } catch (err: any) {
      console.error('Erro ao buscar conta a pagar por ID:', err);
      toast.error('Erro ao carregar conta a pagar');
      return null;
    }
  };

  // Marcar conta como paga
  const marcarComoPago = async (id: string, dataPagamento: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: updateError } = await supabase
        .from('contas_pagar')
        .update({
          status: 'pago',
          data_pagamento: dataPagamento
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Atualizar lista local
      const contasAtualizadas = contasPagar.map(conta => 
        conta.id === id ? { ...conta, ...data } : conta
      );
      setContasPagar(contasAtualizadas);
      calcularEstatisticas(contasAtualizadas);

      toast.success('Conta marcada como paga!');
      return true;

    } catch (err: any) {
      console.error('Erro ao marcar conta como paga:', err);
      setError(err.message);
      toast.error('Erro ao atualizar conta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Buscar contas que vencem em X dias
  const getContasVencendo = async (dias: number): Promise<ContaPagar[]> => {
    try {
      const dataLimite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const hoje = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', dataLimite)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar contas vencendo:', err);
      return [];
    }
  };

  // Buscar contas recorrentes
  const getContasRecorrentes = async (): Promise<ContaPagar[]> => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('recorrente', true)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data || [];

    } catch (err: any) {
      console.error('Erro ao buscar contas recorrentes:', err);
      return [];
    }
  };

  // Calcular total de contas por status
  const getTotalContasPorStatus = async (status: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('status', status);

      if (error) throw error;

      return (data || []).reduce((sum, conta) => sum + Number(conta.valor), 0);

    } catch (err: any) {
      console.error('Erro ao calcular total de contas por status:', err);
      return 0;
    }
  };

  // Buscar alertas de vencimento
  const getAlertasVencimento = async () => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const em7Dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Contas vencidas
      const { data: vencidas, error: errorVencidas } = await supabase
        .from('contas_pagar')
        .select('*')
        .lt('data_vencimento', hoje)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true });

      // Contas vencendo hoje
      const { data: vencendoHoje, error: errorHoje } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('data_vencimento', hoje)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true });

      // Contas vencendo em 7 dias
      const { data: vencendo7Dias, error: error7Dias } = await supabase
        .from('contas_pagar')
        .select('*')
        .gte('data_vencimento', hoje)
        .lte('data_vencimento', em7Dias)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true });

      if (errorVencidas || errorHoje || error7Dias) {
        throw new Error('Erro ao buscar alertas de vencimento');
      }

      return {
        vencidas: vencidas || [],
        vencendoHoje: vencendoHoje || [],
        vencendo7Dias: vencendo7Dias || []
      };

    } catch (err: any) {
      console.error('Erro ao buscar alertas de vencimento:', err);
      return {
        vencidas: [],
        vencendoHoje: [],
        vencendo7Dias: []
      };
    }
  };

  // Carregar contas iniciais
  useEffect(() => {
    fetchContasPagar();
  }, []);

  return {
    contasPagar,
    loading,
    error,
    totalContasPagar,
    contasVencidas,
    contasVencendoHoje,
    contasVencendo7Dias,
    contasVencendo30Dias,
    createContaPagar,
    updateContaPagar,
    deleteContaPagar,
    fetchContasPagar,
    getContaPagarById,
    marcarComoPago,
    getContasVencendo,
    getContasRecorrentes,
    getTotalContasPorStatus,
    getAlertasVencimento
  };
};