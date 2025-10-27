import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  ClienteWallet, 
  WalletTransacao, 
  WalletResumo,
  WalletTransacoesPorMes,
  FiltrosWallet,
  DepositoFormData,
  UsoFormData,
  WalletOperationResult,
  WalletError,
  WALLET_ERROR_MESSAGES
} from '@/types/wallet';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// HOOK PARA SALDO DE CLIENTE ESPECÍFICO
// =====================================================

export const useWalletSaldo = (clienteId: string) => {
  return useQuery({
    queryKey: ['wallet', 'saldo', clienteId],
    queryFn: async (): Promise<ClienteWallet | null> => {
      const { data, error } = await supabase
        .from('cliente_wallet')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email)
        `)
        .eq('cliente_id', clienteId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar saldo: ${error.message}`);
      }

      return data || null;
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
  });
};

// =====================================================
// HOOK PARA HISTÓRICO DE TRANSAÇÕES
// =====================================================

export const useWalletTransacoes = (
  clienteId?: string, 
  filtros?: FiltrosWallet,
  limite: number = 50
) => {
  return useQuery({
    queryKey: ['wallet', 'transacoes', clienteId, filtros, limite],
    queryFn: async (): Promise<WalletTransacao[]> => {
      let query = supabase
        .from('wallet_transacoes')
        .select(`
          *,
          cliente:clientes(nome, telefone)
        `)
        .order('created_at', { ascending: false })
        .limit(limite);

      // Filtrar por cliente se especificado
      if (clienteId) {
        query = query.eq('cliente_id', clienteId);
      }

      // Aplicar filtros
      if (filtros) {
        if (filtros.tipo) {
          query = query.eq('tipo', filtros.tipo);
        }
        if (filtros.data_inicio) {
          query = query.gte('created_at', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('created_at', filtros.data_fim);
        }
        if (filtros.valor_minimo) {
          query = query.gte('valor', filtros.valor_minimo);
        }
        if (filtros.valor_maximo) {
          query = query.lte('valor', filtros.valor_maximo);
        }
        if (filtros.busca_descricao) {
          query = query.ilike('descricao', `%${filtros.busca_descricao}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar transações: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 60000, // 1 minuto
  });
};

// =====================================================
// HOOK PARA TRANSAÇÕES AGRUPADAS POR MÊS
// =====================================================

export const useWalletTransacoesAgrupadas = (
  clienteId: string,
  filtroRapido?: 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo'
) => {
  const { data: transacoes, ...query } = useWalletTransacoes(clienteId, {
    filtro_rapido: filtroRapido
  }, 200); // Limite maior para agrupamento

  const transacoesAgrupadas: WalletTransacoesPorMes[] = React.useMemo(() => {
    if (!transacoes) return [];

    const grupos = transacoes.reduce((acc, transacao) => {
      const data = new Date(transacao.created_at);
      const chaveAnoMes = format(data, 'yyyy-MM');
      const nomeAnoMes = format(data, 'MMMM yyyy', { locale: ptBR });
      
      if (!acc[chaveAnoMes]) {
        acc[chaveAnoMes] = {
          chave: chaveAnoMes,
          nome: nomeAnoMes.charAt(0).toUpperCase() + nomeAnoMes.slice(1),
          resumo: {
            total_depositos: 0,
            total_usos: 0,
            saldo_liquido: 0,
            quantidade_transacoes: 0,
          },
          transacoes: [],
        };
      }
      
      acc[chaveAnoMes].transacoes.push(transacao);
      acc[chaveAnoMes].resumo.quantidade_transacoes++;
      
      if (transacao.tipo === 'deposito') {
        acc[chaveAnoMes].resumo.total_depositos += transacao.valor;
      } else {
        acc[chaveAnoMes].resumo.total_usos += transacao.valor;
      }
      
      acc[chaveAnoMes].resumo.saldo_liquido = 
        acc[chaveAnoMes].resumo.total_depositos - acc[chaveAnoMes].resumo.total_usos;
      
      return acc;
    }, {} as Record<string, WalletTransacoesPorMes>);

    // Ordenar por data (mais recente primeiro)
    return Object.values(grupos).sort((a, b) => b.chave.localeCompare(a.chave));
  }, [transacoes]);

  return {
    ...query,
    data: transacoesAgrupadas,
  };
};

// =====================================================
// HOOK PARA RESUMO GERAL DO DASHBOARD
// =====================================================

export const useWalletResumo = () => {
  return useQuery({
    queryKey: ['wallet', 'resumo'],
    queryFn: async (): Promise<WalletResumo> => {
      try {
        // Buscar dados das carteiras (incluindo carteiras com saldo zero)
        const { data: carteiras, error: errorCarteiras } = await supabase
          .from('cliente_wallet')
          .select('saldo_atual, total_depositado, total_usado');

        if (errorCarteiras) {
          throw new Error(`Erro ao buscar resumo: ${errorCarteiras.message}`);
        }

        // Buscar transações do mês atual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const { data: transacoesMes, error: errorTransacoes } = await supabase
          .from('wallet_transacoes')
          .select('tipo, valor')
          .gte('created_at', inicioMes.toISOString());

        if (errorTransacoes) {
          throw new Error(`Erro ao buscar transações do mês: ${errorTransacoes.message}`);
        }

        // Calcular métricas
        const carteirasComSaldo = carteiras?.filter(c => c.saldo_atual > 0) || [];
        const totalClientes = carteirasComSaldo.length;
        const valorTotalCarteiras = carteirasComSaldo.reduce((sum, c) => sum + c.saldo_atual, 0);
        const saldoMedio = totalClientes > 0 ? valorTotalCarteiras / totalClientes : 0;
        const clientesSaldoBaixo = carteirasComSaldo.filter(c => c.saldo_atual < 100).length;

        const depositosMes = transacoesMes?.filter(t => t.tipo === 'deposito')
          .reduce((sum, t) => sum + t.valor, 0) || 0;
        const usosMes = transacoesMes?.filter(t => t.tipo === 'uso')
          .reduce((sum, t) => sum + t.valor, 0) || 0;

        return {
          total_clientes_com_saldo: totalClientes,
          valor_total_carteiras: valorTotalCarteiras,
          depositos_mes_atual: depositosMes,
          usos_mes_atual: usosMes,
          saldo_medio_por_cliente: saldoMedio,
          clientes_saldo_baixo: clientesSaldoBaixo,
        };
      } catch (error) {
        console.error('Erro no useWalletResumo:', error);
        // Retornar valores padrão em caso de erro
        return {
          total_clientes_com_saldo: 0,
          valor_total_carteiras: 0,
          depositos_mes_atual: 0,
          usos_mes_atual: 0,
          saldo_medio_por_cliente: 0,
          clientes_saldo_baixo: 0,
        };
      }
    },
    staleTime: 300000, // 5 minutos
    refetchInterval: 300000, // Atualizar a cada 5 minutos
  });
};

// =====================================================
// HOOK PARA FAZER DEPÓSITO
// =====================================================

export const useWalletDeposito = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: DepositoFormData): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_depositar', {
          p_cliente_id: dados.cliente_id,
          p_valor: dados.valor,
          p_descricao: dados.descricao || null,
          p_forma_pagamento: dados.forma_pagamento,
          p_usuario_admin: 'admin', // TODO: pegar do contexto de auth
          p_data_deposito: dados.data_deposito + 'T12:00:00', // Adiciona meio-dia
        });

        if (error) {
          throw new WalletError(error.message, 'VALOR_INVALIDO');
        }

        return {
          success: true,
          message: `Depósito de R$ ${dados.valor.toFixed(2)} realizado com sucesso!`,
          transacao_id: data,
        };
      } catch (error) {
        if (error instanceof WalletError) {
          throw error;
        }
        throw new WalletError(
          error instanceof Error ? error.message : 'Erro desconhecido',
          'VALOR_INVALIDO'
        );
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet', 'saldo', variables.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: WalletError) => {
      toast.error(error.message);
    },
  });
};

// =====================================================
// HOOK PARA USAR CRÉDITOS
// =====================================================

export const useWalletUso = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: UsoFormData): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_usar_creditos', {
          p_cliente_id: dados.cliente_id,
          p_valor: dados.valor,
          p_descricao: dados.descricao,
          p_referencia_externa: dados.referencia_externa || null,
          p_usuario_admin: 'admin', // TODO: pegar do contexto de auth
        });

        if (error) {
          if (error.message.includes('Saldo insuficiente')) {
            throw new WalletError(error.message, 'SALDO_INSUFICIENTE');
          }
          throw new WalletError(error.message, 'VALOR_INVALIDO');
        }

        return {
          success: true,
          message: `Uso de R$ ${dados.valor.toFixed(2)} registrado com sucesso!`,
          transacao_id: data,
        };
      } catch (error) {
        if (error instanceof WalletError) {
          throw error;
        }
        throw new WalletError(
          error instanceof Error ? error.message : 'Erro desconhecido',
          'VALOR_INVALIDO'
        );
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message);
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet', 'saldo', variables.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: WalletError) => {
      toast.error(error.message);
    },
  });
};

// =====================================================
// HOOK PARA LISTAR TODOS OS CLIENTES (PARA SELEÇÃO)
// =====================================================

export const useWalletClientes = (filtros?: { busca?: string; saldo_minimo?: number }) => {
  return useQuery({
    queryKey: ['wallet', 'clientes', filtros],
    queryFn: async (): Promise<ClienteWallet[]> => {
      let query = supabase
        .from('cliente_wallet')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email)
        `)
        .order('saldo_atual', { ascending: false });

      // Aplicar filtros
      if (filtros?.saldo_minimo) {
        query = query.gte('saldo_atual', filtros.saldo_minimo);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }

      let resultado = data || [];

      // Filtro de busca por nome (no frontend para ser mais flexível)
      if (filtros?.busca) {
        const busca = filtros.busca.toLowerCase();
        resultado = resultado.filter(item => 
          item.cliente?.nome.toLowerCase().includes(busca) ||
          item.cliente?.telefone?.includes(busca)
        );
      }

      return resultado;
    },
    staleTime: 60000, // 1 minuto
  });
};

// =====================================================
// HOOK PARA LISTAR TODOS OS CLIENTES (PARA MODAL DE DEPÓSITO)
// =====================================================

export const useClientesParaWallet = () => {
  return useQuery({
    queryKey: ['clientes', 'todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, telefone, email')
        .order('nome');

      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 300000, // 5 minutos
  });
};

// =====================================================
// HOOK UTILITÁRIO PARA VERIFICAR STATUS DO SALDO
// =====================================================

export const useWalletStatus = (saldo: number) => {
  return React.useMemo(() => {
    let cor: 'green' | 'yellow' | 'red' = 'green';
    let alerta = undefined;

    if (saldo < 100) {
      cor = 'red';
      alerta = {
        tipo: 'saldo_baixo' as const,
        mensagem: 'Saldo baixo - considere fazer um depósito',
        cor: 'red' as const,
        icone: '⚠️',
      };
    } else if (saldo < 500) {
      cor = 'yellow';
    }

    return { cor, alerta };
  }, [saldo]);
};