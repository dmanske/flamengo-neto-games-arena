import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// =====================================================
// TIPOS
// =====================================================

export interface EditarTransacaoData {
  transacao_id: string;
  novo_valor: number;
  nova_descricao: string;
}

export interface CancelarTransacaoData {
  transacao_id: string;
  motivo: string;
}

export interface AjustarSaldoData {
  cliente_id: string;
  novo_saldo: number;
  motivo: string;
}

interface WalletOperationResult {
  success: boolean;
  message?: string;
  error?: string;
  [key: string]: any;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export const useWalletAdmin = () => {
  const queryClient = useQueryClient();

  // =====================================================
  // MUTATION: Editar Transação
  // =====================================================
  const editarTransacao = useMutation({
    mutationFn: async (dados: EditarTransacaoData): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_editar_transacao', {
          p_transacao_id: dados.transacao_id,
          p_novo_valor: dados.novo_valor,
          p_nova_descricao: dados.nova_descricao,
          p_editado_por: 'admin' // TODO: pegar do contexto de autenticação
        });

        if (error) {
          throw new Error(error.message);
        }

        // Verificar se a função retornou erro
        if (data && !data.success) {
          throw new Error(data.error || 'Erro ao editar transação');
        }

        return data || { success: true, message: 'Transação editada com sucesso!' };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message || 'Transação editada com sucesso!');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao editar transação:', error);
      toast.error(error.message || 'Erro ao editar transação');
    }
  });

  // =====================================================
  // MUTATION: Cancelar Transação
  // =====================================================
  const cancelarTransacao = useMutation({
    mutationFn: async (dados: CancelarTransacaoData): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_cancelar_transacao', {
          p_transacao_id: dados.transacao_id,
          p_motivo: dados.motivo,
          p_cancelado_por: 'admin' // TODO: pegar do contexto de autenticação
        });

        if (error) {
          throw new Error(error.message);
        }

        // Verificar se a função retornou erro
        if (data && !data.success) {
          throw new Error(data.error || 'Erro ao cancelar transação');
        }

        return data || { success: true, message: 'Transação cancelada com sucesso!' };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message || 'Transação cancelada com sucesso!');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao cancelar transação:', error);
      toast.error(error.message || 'Erro ao cancelar transação');
    }
  });

  // =====================================================
  // MUTATION: Ajustar Saldo
  // =====================================================
  const ajustarSaldo = useMutation({
    mutationFn: async (dados: AjustarSaldoData): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_ajustar_saldo', {
          p_cliente_id: dados.cliente_id,
          p_novo_saldo: dados.novo_saldo,
          p_motivo: dados.motivo,
          p_ajustado_por: 'admin' // TODO: pegar do contexto de autenticação
        });

        if (error) {
          throw new Error(error.message);
        }

        // Verificar se a função retornou erro
        if (data && !data.success) {
          throw new Error(data.error || 'Erro ao ajustar saldo');
        }

        return data || { success: true, message: 'Saldo ajustado com sucesso!' };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message || 'Saldo ajustado com sucesso!');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet', 'saldo', variables.cliente_id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transacoes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao ajustar saldo:', error);
      toast.error(error.message || 'Erro ao ajustar saldo');
    }
  });

  // =====================================================
  // MUTATION: Deletar Carteira
  // =====================================================
  const deletarCarteira = useMutation({
    mutationFn: async (clienteId: string): Promise<WalletOperationResult> => {
      try {
        const { data, error } = await supabase.rpc('wallet_deletar_carteira', {
          p_cliente_id: clienteId
        });

        if (error) {
          throw new Error(error.message);
        }

        // Verificar se a função retornou erro
        if (data && !data.success) {
          throw new Error(data.error || 'Erro ao deletar carteira');
        }

        return data || { success: true, message: 'Carteira excluída com sucesso!' };
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (result, variables) => {
      toast.success(result.message || 'Carteira excluída com sucesso!');
      
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'clientes'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'resumo'] });
    },
    onError: (error: Error) => {
      console.error('Erro ao deletar carteira:', error);
      toast.error(error.message || 'Erro ao deletar carteira');
    }
  });

  return {
    editarTransacao,
    cancelarTransacao,
    ajustarSaldo,
    deletarCarteira
  };
};
