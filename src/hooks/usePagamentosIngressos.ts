import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  HistoricoPagamentoIngresso, 
  PagamentoIngressoFormData,
  SituacaoFinanceiraIngresso
} from '@/types/ingressos';

interface EstadosPagamentos {
  carregando: boolean;
  salvando: boolean;
  deletando: boolean;
}

export function usePagamentosIngressos() {
  const [pagamentos, setPagamentos] = useState<HistoricoPagamentoIngresso[]>([]);
  const [estados, setEstados] = useState<EstadosPagamentos>({
    carregando: false,
    salvando: false,
    deletando: false
  });

  // Função para atualizar status do ingresso baseado nos pagamentos
  const atualizarStatusIngresso = useCallback(async (ingressoId: string) => {
    try {
      // Buscar dados do ingresso
      const { data: ingresso, error: errorIngresso } = await supabase
        .from('ingressos')
        .select('valor_final, situacao_financeira')
        .eq('id', ingressoId)
        .single();

      if (errorIngresso || !ingresso) {
        console.error('Erro ao buscar ingresso para atualizar status:', errorIngresso);
        return false;
      }

      // Buscar total pago
      const { data: pagamentos, error: errorPagamentos } = await supabase
        .from('historico_pagamentos_ingressos')
        .select('valor_pago')
        .eq('ingresso_id', ingressoId);

      if (errorPagamentos) {
        console.error('Erro ao buscar pagamentos para calcular status:', errorPagamentos);
        return false;
      }

      const totalPago = pagamentos?.reduce((sum, pag) => sum + pag.valor_pago, 0) || 0;
      const valorFinal = ingresso.valor_final;

      // Determinar novo status
      let novoStatus: SituacaoFinanceiraIngresso;
      
      if (totalPago >= valorFinal) {
        novoStatus = 'pago';
      } else if (totalPago > 0) {
        novoStatus = 'pendente'; // Parcialmente pago, mas ainda pendente
      } else {
        novoStatus = 'pendente';
      }

      // Atualizar apenas se o status mudou
      if (novoStatus !== ingresso.situacao_financeira) {
        const { error: errorUpdate } = await supabase
          .from('ingressos')
          .update({ 
            situacao_financeira: novoStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', ingressoId);

        if (errorUpdate) {
          console.error('Erro ao atualizar status do ingresso:', errorUpdate);
          return false;
        }

        console.log(`Status do ingresso ${ingressoId} atualizado para: ${novoStatus}`);
      }

      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar status do ingresso:', error);
      return false;
    }
  }, []);

  // Função para buscar pagamentos de um ingresso
  const buscarPagamentos = useCallback(async (ingressoId: string) => {
    if (!ingressoId) {
      console.warn('ID do ingresso não fornecido para buscar pagamentos');
      return;
    }

    setEstados(prev => ({ ...prev, carregando: true }));

    try {
      console.log('Buscando pagamentos para ingresso:', ingressoId);
      
      const { data, error } = await supabase
        .from('historico_pagamentos_ingressos')
        .select('*')
        .eq('ingresso_id', ingressoId)
        .order('data_pagamento', { ascending: false });

      console.log('=== DEBUG BUSCAR PAGAMENTOS ===');
      console.log('Query executada para ingresso_id:', ingressoId);
      console.log('Resultado da query:', { data, error });
      console.log('Dados encontrados:', data);
      console.log('Erro (se houver):', error);

      if (error) {
        console.error('Erro ao buscar pagamentos:', error);
        toast.error('Erro ao carregar histórico de pagamentos');
        setPagamentos([]);
        return;
      }

      console.log('Pagamentos encontrados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Detalhes dos pagamentos:', data);
      }
      setPagamentos(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar pagamentos:', error);
      toast.error('Erro inesperado ao carregar pagamentos');
      setPagamentos([]);
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  }, []);

  // Função para registrar pagamento
  const registrarPagamento = useCallback(async (dados: PagamentoIngressoFormData): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));

    try {
      // Inserir pagamento
      const { error: errorPagamento } = await supabase
        .from('historico_pagamentos_ingressos')
        .insert([{
          ...dados,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (errorPagamento) {
        console.error('Erro ao registrar pagamento:', errorPagamento);
        toast.error('Erro ao registrar pagamento');
        return false;
      }

      // Atualizar status do ingresso baseado nos pagamentos
      const statusAtualizado = await atualizarStatusIngresso(dados.ingresso_id);
      
      if (!statusAtualizado) {
        console.warn('Status do ingresso não foi atualizado corretamente');
      }

      toast.success('Pagamento registrado com sucesso!');
      
      // Recarregar pagamentos
      await buscarPagamentos(dados.ingresso_id);
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao registrar pagamento:', error);
      toast.error('Erro inesperado ao registrar pagamento');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarPagamentos, atualizarStatusIngresso]);

  // Função para editar pagamento
  const editarPagamento = useCallback(async (id: string, dados: Partial<PagamentoIngressoFormData>): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));

    try {
      const { error } = await supabase
        .from('historico_pagamentos_ingressos')
        .update({
          ...dados,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao editar pagamento:', error);
        toast.error('Erro ao editar pagamento');
        return false;
      }

      // Se temos o ingresso_id, atualizar status
      if (dados.ingresso_id) {
        const statusAtualizado = await atualizarStatusIngresso(dados.ingresso_id);
        
        if (!statusAtualizado) {
          console.warn('Status do ingresso não foi atualizado corretamente após edição');
        }
        
        await buscarPagamentos(dados.ingresso_id);
      }

      toast.success('Pagamento editado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro inesperado ao editar pagamento:', error);
      toast.error('Erro inesperado ao editar pagamento');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarPagamentos, atualizarStatusIngresso]);

  // Função para deletar pagamento
  const deletarPagamento = useCallback(async (id: string, ingressoId: string): Promise<boolean> => {
    setEstados(prev => ({ ...prev, deletando: true }));

    try {
      const { error } = await supabase
        .from('historico_pagamentos_ingressos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar pagamento:', error);
        toast.error('Erro ao deletar pagamento');
        return false;
      }

      // Atualizar status do ingresso
      const statusAtualizado = await atualizarStatusIngresso(ingressoId);
      
      if (!statusAtualizado) {
        console.warn('Status do ingresso não foi atualizado corretamente após deletar pagamento');
      }

      toast.success('Pagamento deletado com sucesso!');
      
      // Recarregar pagamentos
      await buscarPagamentos(ingressoId);
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar pagamento:', error);
      toast.error('Erro inesperado ao deletar pagamento');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  }, [buscarPagamentos, atualizarStatusIngresso]);

  // Função para calcular resumo de pagamentos
  const calcularResumo = useCallback((valorFinal: number) => {
    const totalPago = pagamentos.reduce((sum, pag) => sum + pag.valor_pago, 0);
    const saldoDevedor = Math.max(0, valorFinal - totalPago);
    const percentualPago = valorFinal > 0 ? (totalPago / valorFinal) * 100 : 0;

    return {
      totalPago,
      saldoDevedor,
      percentualPago: Math.round(percentualPago * 100) / 100,
      quitado: saldoDevedor === 0 && totalPago > 0
    };
  }, [pagamentos]);

  // Função para obter formas de pagamento disponíveis
  const formasPagamento = [
    { value: 'dinheiro', label: '💵 Dinheiro' },
    { value: 'pix', label: '📱 PIX' },
    { value: 'cartao_credito', label: '💳 Cartão de Crédito' },
    { value: 'cartao_debito', label: '💳 Cartão de Débito' },
    { value: 'transferencia', label: '🏦 Transferência Bancária' },
    { value: 'boleto', label: '📄 Boleto' },
    { value: 'outros', label: '🔄 Outros' }
  ];

  return {
    // Estados
    pagamentos,
    estados,

    // Funções principais
    buscarPagamentos,
    registrarPagamento,
    editarPagamento,
    deletarPagamento,

    // Utilitários
    calcularResumo,
    atualizarStatusIngresso,
    formasPagamento,

    // Limpeza
    limparPagamentos: () => setPagamentos([])
  };
}