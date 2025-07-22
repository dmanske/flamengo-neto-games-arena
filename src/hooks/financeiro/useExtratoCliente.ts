import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface ExtratoCliente {
  id: string;
  cliente_id: string;
  viagem_id?: string;
  tipo: 'debito' | 'credito';
  valor: number;
  descricao: string;
  data_transacao: string;
  referencia_id?: string;
  referencia_tipo?: string;
  saldo_anterior: number;
  saldo_atual: number;
  created_at: string;
  // Dados relacionados
  viagem?: {
    adversario: string;
    data_jogo: string;
  };
}

export interface SaldoCliente {
  cliente_id: string;
  nome: string;
  email: string;
  saldo_atual: number;
  situacao: 'devedor' | 'credor' | 'quitado';
  ultima_movimentacao?: string;
}

interface UseExtratoClienteReturn {
  extrato: ExtratoCliente[];
  saldos: SaldoCliente[];
  loading: boolean;
  error: string | null;
  
  fetchExtratoCliente: (clienteId: string) => Promise<void>;
  fetchSaldoCliente: (clienteId: string) => Promise<SaldoCliente | null>;
  fetchTodosSaldos: () => Promise<void>;
  adicionarMovimentacao: (data: {
    cliente_id: string;
    viagem_id?: string;
    tipo: 'debito' | 'credito';
    valor: number;
    descricao: string;
    data_transacao: string;
    referencia_id?: string;
    referencia_tipo?: string;
  }) => Promise<boolean>;
  getClientesDevedores: () => SaldoCliente[];
  getClientesCredores: () => SaldoCliente[];
}

export const useExtratoCliente = (): UseExtratoClienteReturn => {
  const [extrato, setExtrato] = useState<ExtratoCliente[]>([]);
  const [saldos, setSaldos] = useState<SaldoCliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar extrato de um cliente
  const fetchExtratoCliente = async (clienteId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('extrato_cliente')
        .select(`
          *,
          viagem:viagens(adversario, data_jogo)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setExtrato(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar extrato do cliente:', err);
      setError(err.message);
      toast.error('Erro ao carregar extrato do cliente');
    } finally {
      setLoading(false);
    }
  };

  // Buscar saldo de um cliente específico
  const fetchSaldoCliente = async (clienteId: string): Promise<SaldoCliente | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('view_saldo_cliente')
        .select('*')
        .eq('cliente_id', clienteId)
        .single();

      if (fetchError) throw fetchError;
      return data;

    } catch (err: any) {
      console.error('Erro ao buscar saldo do cliente:', err);
      return null;
    }
  };

  // Buscar todos os saldos
  const fetchTodosSaldos = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('view_saldo_cliente')
        .select('*')
        .order('saldo_atual', { ascending: false });

      if (fetchError) throw fetchError;
      setSaldos(data || []);

    } catch (err: any) {
      console.error('Erro ao buscar saldos dos clientes:', err);
      setError(err.message);
      toast.error('Erro ao carregar saldos dos clientes');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar movimentação no extrato
  const adicionarMovimentacao = async (data: {
    cliente_id: string;
    viagem_id?: string;
    tipo: 'debito' | 'credito';
    valor: number;
    descricao: string;
    data_transacao: string;
    referencia_id?: string;
    referencia_tipo?: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Buscar saldo atual do cliente
      const { data: ultimoExtrato } = await supabase
        .from('extrato_cliente')
        .select('saldo_atual')
        .eq('cliente_id', data.cliente_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const saldoAnterior = ultimoExtrato?.saldo_atual || 0;
      let novoSaldo: number;

      if (data.tipo === 'debito') {
        novoSaldo = saldoAnterior + data.valor;
      } else {
        novoSaldo = saldoAnterior - data.valor;
      }

      const movimentacao = {
        ...data,
        saldo_anterior: saldoAnterior,
        saldo_atual: novoSaldo
      };

      const { data: novaMovimentacao, error: createError } = await supabase
        .from('extrato_cliente')
        .insert([movimentacao])
        .select(`
          *,
          viagem:viagens(adversario, data_jogo)
        `)
        .single();

      if (createError) throw createError;

      // Atualizar extrato local se for do mesmo cliente
      if (extrato.length > 0 && extrato[0].cliente_id === data.cliente_id) {
        setExtrato(prev => [novaMovimentacao, ...prev]);
      }

      // Atualizar saldos locais
      setSaldos(prev => prev.map(saldo => 
        saldo.cliente_id === data.cliente_id 
          ? { 
              ...saldo, 
              saldo_atual: novoSaldo,
              situacao: novoSaldo > 0 ? 'devedor' : novoSaldo < 0 ? 'credor' : 'quitado',
              ultima_movimentacao: new Date().toISOString()
            }
          : saldo
      ));

      toast.success('Movimentação registrada com sucesso!');
      return true;

    } catch (err: any) {
      console.error('Erro ao adicionar movimentação:', err);
      setError(err.message);
      toast.error('Erro ao registrar movimentação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Filtrar clientes devedores
  const getClientesDevedores = (): SaldoCliente[] => {
    return saldos.filter(cliente => cliente.saldo_atual > 0);
  };

  // Filtrar clientes credores
  const getClientesCredores = (): SaldoCliente[] => {
    return saldos.filter(cliente => cliente.saldo_atual < 0);
  };

  return {
    extrato,
    saldos,
    loading,
    error,
    fetchExtratoCliente,
    fetchSaldoCliente,
    fetchTodosSaldos,
    adicionarMovimentacao,
    getClientesDevedores,
    getClientesCredores
  };
};