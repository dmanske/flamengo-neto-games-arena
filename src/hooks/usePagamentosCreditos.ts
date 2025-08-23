import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface HistoricoPagamentoCredito {
  id: string;
  credito_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
  created_at: string;
}

interface PagamentoCreditoFormData {
  credito_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
}

interface EstadosPagamentosCreditos {
  carregando: boolean;
  salvando: boolean;
  deletando: boolean;
  erro: string | null;
}

export function usePagamentosCreditos() {
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamentoCredito[]>([]);
  const [estados, setEstados] = useState<EstadosPagamentosCreditos>({
    carregando: false,
    salvando: false,
    deletando: false,
    erro: null
  });

  // Buscar histórico de pagamentos de um crédito
  const buscarHistoricoPagamentos = useCallback(async (creditoId: string): Promise<HistoricoPagamentoCredito[]> => {
    try {
      setEstados(prev => ({ ...prev, carregando: true, erro: null }));

      const { data, error } = await supabase
        .from('credito_pagamentos')
        .select('*')
        .eq('credito_id', creditoId)
        .order('data_pagamento', { ascending: false });

      if (error) throw error;

      const pagamentos = data || [];
      setHistoricoPagamentos(pagamentos);
      return pagamentos;
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      const mensagem = 'Erro ao carregar histórico de pagamentos';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return [];
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  }, []);

  // Registrar novo pagamento
  const registrarPagamento = useCallback(async (dados: PagamentoCreditoFormData): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      // Validar se o crédito existe
      const { data: credito, error: creditoError } = await supabase
        .from('cliente_creditos')
        .select('id, valor_credito, saldo_disponivel')
        .eq('id', dados.credito_id)
        .single();

      if (creditoError) throw creditoError;
      if (!credito) throw new Error('Crédito não encontrado');

      // Inserir pagamento
      const { error: insertError } = await supabase
        .from('credito_pagamentos')
        .insert({
          credito_id: dados.credito_id,
          valor_pago: dados.valor_pago,
          data_pagamento: dados.data_pagamento,
          forma_pagamento: dados.forma_pagamento,
          observacoes: dados.observacoes
        });

      if (insertError) throw insertError;

      // Atualizar saldo do crédito (se necessário)
      // Nota: Dependendo da lógica de negócio, pode ser necessário atualizar o saldo_disponivel
      // Por enquanto, vamos apenas registrar o pagamento

      toast.success('Pagamento registrado com sucesso!');
      
      // Recarregar histórico
      await buscarHistoricoPagamentos(dados.credito_id);
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao registrar pagamento';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarHistoricoPagamentos]);

  // Editar pagamento existente
  const editarPagamento = useCallback(async (pagamentoId: string, dados: PagamentoCreditoFormData): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, salvando: true, erro: null }));

      const { error } = await supabase
        .from('credito_pagamentos')
        .update({
          valor_pago: dados.valor_pago,
          data_pagamento: dados.data_pagamento,
          forma_pagamento: dados.forma_pagamento,
          observacoes: dados.observacoes
        })
        .eq('id', pagamentoId);

      if (error) throw error;

      toast.success('Pagamento atualizado com sucesso!');
      
      // Recarregar histórico
      await buscarHistoricoPagamentos(dados.credito_id);
      
      return true;
    } catch (error) {
      console.error('Erro ao editar pagamento:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao editar pagamento';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarHistoricoPagamentos]);

  // Deletar pagamento
  const deletarPagamento = useCallback(async (pagamentoId: string): Promise<boolean> => {
    try {
      setEstados(prev => ({ ...prev, deletando: true, erro: null }));

      // Buscar dados do pagamento antes de deletar para recarregar o histórico
      const { data: pagamento } = await supabase
        .from('credito_pagamentos')
        .select('credito_id')
        .eq('id', pagamentoId)
        .single();

      const { error } = await supabase
        .from('credito_pagamentos')
        .delete()
        .eq('id', pagamentoId);

      if (error) throw error;

      toast.success('Pagamento removido com sucesso!');
      
      // Recarregar histórico se temos o credito_id
      if (pagamento?.credito_id) {
        await buscarHistoricoPagamentos(pagamento.credito_id);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro ao deletar pagamento';
      setEstados(prev => ({ ...prev, erro: mensagem }));
      toast.error(mensagem);
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  }, [buscarHistoricoPagamentos]);

  // Calcular resumo de pagamentos
  const calcularResumo = useCallback((valorTotal: number, pagamentos: HistoricoPagamentoCredito[] = historicoPagamentos) => {
    const totalPago = pagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
    const saldoRestante = Math.max(0, valorTotal - totalPago);
    const percentualPago = valorTotal > 0 ? (totalPago / valorTotal) * 100 : 0;

    return {
      totalPago,
      saldoRestante,
      percentualPago,
      quantidadePagamentos: pagamentos.length,
      ultimoPagamento: pagamentos.length > 0 ? pagamentos[0] : null
    };
  }, [historicoPagamentos]);

  // Formas de pagamento disponíveis
  const formasPagamento = [
    { value: 'dinheiro', label: '💵 Dinheiro' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'cartao_credito', label: '💳 Cartão de Crédito' },
    { value: 'cartao_debito', label: '💳 Cartão de Débito' },
    { value: 'transferencia_bancaria', label: '🏦 Transferência Bancária' },
    { value: 'boleto', label: '📄 Boleto' },
    { value: 'outros', label: '🔄 Outros' }
  ];

  return {
    historicoPagamentos,
    estados,
    buscarHistoricoPagamentos,
    registrarPagamento,
    editarPagamento,
    deletarPagamento,
    calcularResumo,
    formasPagamento
  };
}