// Hook para gerenciar pagamentos separados (viagem vs passeios)
// Task 19.2: Modificar hooks financeiros

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  ViagemPassageiroComPagamentos,
  HistoricoPagamentoCategorizado,
  CategoriaPagamento,
  StatusPagamentoAvancado,
  BreakdownPagamento,
  RegistroPagamentoRequest
} from '@/types/pagamentos-separados';
import { calcularBreakdownPagamento, determinarStatusPagamento } from '@/types/pagamentos-separados';
import { calcularValorTotalPasseios } from '@/utils/passeiosUtils';

export interface UsePagamentosSeparadosReturn {
  passageiro: ViagemPassageiroComPagamentos | null;
  breakdown: BreakdownPagamento | null;
  historicoPagamentos: HistoricoPagamentoCategorizado[];
  loading: boolean;
  error: string | null;
  
  // Ações de pagamento
  registrarPagamento: (request: RegistroPagamentoRequest) => Promise<boolean>;
  pagarViagem: (valor: number, formaPagamento?: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
  pagarPasseios: (valor: number, formaPagamento?: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
  pagarTudo: (valor: number, formaPagamento?: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
  
  // Gestão de pagamentos
  deletarPagamento: (pagamentoId: string) => Promise<boolean>;
  editarPagamento: (pagamentoId: string, dadosAtualizados: Partial<HistoricoPagamentoCategorizado>) => Promise<boolean>;
  
  // Utilitários
  calcularValorViagem: () => number;
  calcularValorPasseios: () => number;
  calcularValorTotal: () => number;
  verificarViagemPaga: () => boolean;
  verificarPasseiosPagos: () => boolean;
  verificarPagoCompleto: () => boolean;
  obterStatusAtual: () => StatusPagamentoAvancado;
  
  // Refresh
  refetch: () => Promise<void>;
}

export const usePagamentosSeparados = (
  viagemPassageiroId: string | undefined
): UsePagamentosSeparadosReturn => {
  const [passageiro, setPassageiro] = useState<ViagemPassageiroComPagamentos | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownPagamento | null>(null);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamentoCategorizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados completos do passageiro com pagamentos
  const fetchDadosPassageiro = useCallback(async () => {
    if (!viagemPassageiroId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Buscar dados básicos do passageiro
      const { data: passageiroData, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          cliente_id,
          viagem_id,
          valor,
          desconto,
          status_pagamento,
          viagem_paga,
          passeios_pagos,
          forma_pagamento,
          observacoes,
          created_at,
          gratuito
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      // 2. Buscar valor total dos passeios do passageiro
      const { data: passeiosData, error: passeiosError } = await supabase
        .from('passageiro_passeios')
        .select('*')
        .eq('viagem_passageiro_id', viagemPassageiroId);

      if (passeiosError) throw passeiosError;

      // Calcular valor dos passeios - lógica corrigida
      let valorTotalPasseios = 0;
      
      if (passeiosData && passeiosData.length > 0) {
        // Separar passeios com valor_cobrado válido (> 0) dos que precisam buscar na tabela
        const passeiosComValor: any[] = [];
        const passeiosSemValor: any[] = [];
        
        passeiosData.forEach(pp => {
          if (pp.valor_cobrado && pp.valor_cobrado > 0) {
            passeiosComValor.push(pp);
          } else {
            passeiosSemValor.push(pp);
          }
        });
        
        // Somar valores já definidos
        valorTotalPasseios = passeiosComValor.reduce((total, pp) => total + pp.valor_cobrado, 0);
        
        // Buscar valores dos passeios sem valor_cobrado na tabela passeios
        if (passeiosSemValor.length > 0) {
          const nomesPasseios = passeiosSemValor.map(pp => pp.passeio_nome).filter(Boolean);
          
          if (nomesPasseios.length > 0) {
            const { data: passeiosInfo, error: passeiosInfoError } = await supabase
              .from('passeios')
              .select('nome, valor')
              .in('nome', nomesPasseios);
            
            if (!passeiosInfoError && passeiosInfo) {
              const valorPasseiosSemValor = passeiosInfo.reduce((total, p) => total + (p.valor || 0), 0);
              valorTotalPasseios += valorPasseiosSemValor;
            }
          }
        }
      } else {
      }

      // 3. Buscar histórico de pagamentos categorizados
      const { data: historico, error: historicoError } = await supabase
        .from('historico_pagamentos_categorizado')
        .select('*')
        .eq('viagem_passageiro_id', viagemPassageiroId)
        .order('data_pagamento', { ascending: false });

      if (historicoError) throw historicoError;

      // 4. Montar objeto completo do passageiro
      const passageiroCompleto: ViagemPassageiroComPagamentos = {
        ...passageiroData,
        historico_pagamentos: historico || [],
        valor_total_passeios: valorTotalPasseios,
        valor_liquido_viagem: (passageiroData.valor || 0) - (passageiroData.desconto || 0)
      };

      // 5. Calcular breakdown
      const breakdownCalculado = calcularBreakdownPagamento(passageiroCompleto);

      // 6. Atualizar estados
      setPassageiro(passageiroCompleto);
      setBreakdown(breakdownCalculado);
      setHistoricoPagamentos(historico || []);

    } catch (err: any) {
      console.error('Erro ao buscar dados do passageiro:', err);
      setError(err.message);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [viagemPassageiroId]);

  // Registrar pagamento genérico
  const registrarPagamento = useCallback(async (
    request: RegistroPagamentoRequest
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .insert({
          viagem_passageiro_id: request.viagem_passageiro_id,
          categoria: request.categoria,
          valor_pago: request.valor_pago,
          forma_pagamento: request.forma_pagamento || 'pix',
          observacoes: request.observacoes,
          data_pagamento: request.data_pagamento || new Date().toISOString()
        });

      if (error) throw error;

      toast.success(`Pagamento de ${request.categoria} registrado com sucesso!`);
      await fetchDadosPassageiro();
      return true;

    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
      return false;
    }
  }, [fetchDadosPassageiro]);

  // Pagar apenas viagem
  const pagarViagem = useCallback(async (
    valor: number,
    formaPagamento = 'pix',
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    if (!viagemPassageiroId) return false;

    return registrarPagamento({
      viagem_passageiro_id: viagemPassageiroId,
      categoria: 'viagem',
      valor_pago: valor,
      forma_pagamento: formaPagamento,
      observacoes: observacoes,
      data_pagamento: dataPagamento
    });
  }, [viagemPassageiroId, registrarPagamento]);

  // Pagar apenas passeios
  const pagarPasseios = useCallback(async (
    valor: number,
    formaPagamento = 'pix',
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    if (!viagemPassageiroId) return false;

    return registrarPagamento({
      viagem_passageiro_id: viagemPassageiroId,
      categoria: 'passeios',
      valor_pago: valor,
      forma_pagamento: formaPagamento,
      observacoes: observacoes,
      data_pagamento: dataPagamento
    });
  }, [viagemPassageiroId, registrarPagamento]);

  // Pagar tudo (viagem + passeios)
  const pagarTudo = useCallback(async (
    valor: number,
    formaPagamento = 'pix',
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    if (!viagemPassageiroId) return false;

    return registrarPagamento({
      viagem_passageiro_id: viagemPassageiroId,
      categoria: 'ambos',
      valor_pago: valor,
      forma_pagamento: formaPagamento,
      observacoes: observacoes,
      data_pagamento: dataPagamento
    });
  }, [viagemPassageiroId, registrarPagamento]);

  // Deletar pagamento
  const deletarPagamento = useCallback(async (pagamentoId: string): Promise<boolean> => {
    if (!pagamentoId) return false;

    try {
      console.log('🗑️ Deletando pagamento:', pagamentoId);
      
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .delete()
        .eq('id', pagamentoId);

      if (error) throw error;

      // Atualizar o estado local imediatamente para feedback visual
      setHistoricoPagamentos(prev => 
        prev.filter(pagamento => pagamento.id !== pagamentoId)
      );

      toast.success('Pagamento deletado com sucesso!');
      await fetchDadosPassageiro(); // Recarregar dados completos
      return true;

    } catch (error: any) {
      console.error('Erro ao deletar pagamento:', error);
      toast.error('Erro ao deletar pagamento');
      return false;
    }
  }, [fetchDadosPassageiro]);

  // Editar pagamento
  const editarPagamento = useCallback(async (
    pagamentoId: string, 
    dadosAtualizados: Partial<HistoricoPagamentoCategorizado>
  ): Promise<boolean> => {
    if (!pagamentoId) return false;

    try {
      console.log('✏️ Editando pagamento:', pagamentoId, dadosAtualizados);
      
      // Preparar dados para atualização (apenas campos permitidos)
      const dadosParaAtualizar: any = {};
      
      if (dadosAtualizados.valor_pago !== undefined) {
        dadosParaAtualizar.valor_pago = dadosAtualizados.valor_pago;
      }
      if (dadosAtualizados.data_pagamento !== undefined) {
        dadosParaAtualizar.data_pagamento = dadosAtualizados.data_pagamento;
      }
      if (dadosAtualizados.categoria !== undefined) {
        dadosParaAtualizar.categoria = dadosAtualizados.categoria;
      }
      if (dadosAtualizados.forma_pagamento !== undefined) {
        dadosParaAtualizar.forma_pagamento = dadosAtualizados.forma_pagamento;
      }
      if (dadosAtualizados.observacoes !== undefined) {
        dadosParaAtualizar.observacoes = dadosAtualizados.observacoes;
      }

      // Adicionar timestamp de atualização
      dadosParaAtualizar.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .update(dadosParaAtualizar)
        .eq('id', pagamentoId);

      if (error) throw error;

      // Atualizar o estado local imediatamente para feedback visual
      setHistoricoPagamentos(prev => 
        prev.map(pagamento => 
          pagamento.id === pagamentoId 
            ? { ...pagamento, ...dadosAtualizados }
            : pagamento
        )
      );

      toast.success('Pagamento editado com sucesso!');
      await fetchDadosPassageiro(); // Recarregar dados completos
      return true;

    } catch (error: any) {
      console.error('Erro ao editar pagamento:', error);
      toast.error('Erro ao editar pagamento');
      return false;
    }
  }, [fetchDadosPassageiro]);

  // Utilitários de cálculo
  const calcularValorViagem = useCallback((): number => {
    if (!passageiro) return 0;
    return (passageiro.valor || 0) - (passageiro.desconto || 0);
  }, [passageiro]);

  const calcularValorPasseios = useCallback((): number => {
    return passageiro?.valor_total_passeios || 0;
  }, [passageiro]);

  const calcularValorTotal = useCallback((): number => {
    return calcularValorViagem() + calcularValorPasseios();
  }, [calcularValorViagem, calcularValorPasseios]);

  const verificarViagemPaga = useCallback((): boolean => {
    return passageiro?.viagem_paga || false;
  }, [passageiro]);

  const verificarPasseiosPagos = useCallback((): boolean => {
    return passageiro?.passeios_pagos || false;
  }, [passageiro]);

  const verificarPagoCompleto = useCallback((): boolean => {
    return verificarViagemPaga() && (verificarPasseiosPagos() || calcularValorPasseios() === 0);
  }, [verificarViagemPaga, verificarPasseiosPagos, calcularValorPasseios]);

  const obterStatusAtual = useCallback((): StatusPagamentoAvancado => {
    if (!breakdown) return 'Pendente';
    return determinarStatusPagamento(breakdown, passageiro);
  }, [breakdown, passageiro]);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchDadosPassageiro();
  }, [fetchDadosPassageiro]);

  return {
    passageiro,
    breakdown,
    historicoPagamentos,
    loading,
    error,
    
    // Ações
    registrarPagamento,
    pagarViagem,
    pagarPasseios,
    pagarTudo,
    deletarPagamento,
    editarPagamento,
    
    // Utilitários
    calcularValorViagem,
    calcularValorPasseios,
    calcularValorTotal,
    verificarViagemPaga,
    verificarPasseiosPagos,
    verificarPagoCompleto,
    obterStatusAtual,
    
    // Refresh
    refetch: fetchDadosPassageiro
  };
};