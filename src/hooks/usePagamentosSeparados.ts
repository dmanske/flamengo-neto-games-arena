// Hook para gerenciar pagamentos separados (viagem vs passeios)
// Task 19.2: Modificar hooks financeiros

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
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
  // pagarTudo removido
  
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
  
  // ✅ NOVO: Atualização específica para vinculação de crédito
  atualizarAposVinculacaoCredito: () => Promise<void>;
}

export const usePagamentosSeparados = (
  viagemPassageiroId: string | undefined
): UsePagamentosSeparadosReturn => {
  console.log('🎯 usePagamentosSeparados iniciado:', { viagemPassageiroId });
  
  const [passageiro, setPassageiro] = useState<ViagemPassageiroComPagamentos | null>(null);
  const [breakdown, setBreakdown] = useState<BreakdownPagamento | null>(null);
  const [historicoPagamentos, setHistoricoPagamentos] = useState<HistoricoPagamentoCategorizado[]>([]);
  const [loading, setLoading] = useState(false); // ✅ CORREÇÃO: Iniciar como false para IDs inválidos
  const [error, setError] = useState<string | null>(null);

  // ✅ CORREÇÃO CRÍTICA: Verificação mais rigorosa para IDs inválidos
  const isValidId = React.useMemo(() => {
    if (!viagemPassageiroId) return false;
    if (viagemPassageiroId === 'fallback-id') return false;
    if (viagemPassageiroId === 'undefined') return false;
    if (viagemPassageiroId === 'null') return false;
    if (viagemPassageiroId.length < 10) return false; // IDs muito curtos são suspeitos
    return true;
  }, [viagemPassageiroId]);

  // ✅ CORREÇÃO: Definir se deve carregar dados baseado no ID válido
  React.useEffect(() => {
    if (!isValidId) {
      console.warn('⚠️ ID inválido fornecido:', viagemPassageiroId);
      setError('ID inválido fornecido');
      setLoading(false);
      return;
    }
  }, [isValidId, viagemPassageiroId]);

  // Buscar dados completos do passageiro com pagamentos
  const fetchDadosPassageiro = useCallback(async () => {
    console.log('🔍 fetchDadosPassageiro iniciado:', { viagemPassageiroId, isValidId });
    
    if (!isValidId || !viagemPassageiroId) {
      console.warn('⚠️ ID inválido ou não fornecido');
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
      
      console.log('📊 Dados do passageiro encontrados:', passageiroData);

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

      // ✅ NOVO: 3.5. Buscar créditos vinculados ao passageiro
      const { data: creditosVinculados, error: creditosError } = await supabase
        .from('credito_viagem_vinculacoes')
        .select(`
          id,
          valor_utilizado,
          data_vinculacao,
          observacoes,
          credito:cliente_creditos(
            id,
            cliente_id,
            valor_credito
          )
        `)
        .eq('viagem_id', passageiroData.viagem_id)
        .eq('passageiro_id', passageiroData.cliente_id);

      if (creditosError) {
        console.warn('⚠️ Erro ao buscar créditos vinculados:', creditosError);
      }

      console.log('💳 Créditos vinculados encontrados:', creditosVinculados);

      // 4. Montar objeto completo do passageiro
      const passageiroCompleto: ViagemPassageiroComPagamentos = {
        ...passageiroData,
        historico_pagamentos: historico || [],
        valor_total_passeios: valorTotalPasseios,
        valor_liquido_viagem: (passageiroData.valor || 0) - (passageiroData.desconto || 0),
        // ✅ NOVO: Incluir créditos vinculados
        creditos_vinculados: creditosVinculados || []
      };

      // 5. Calcular breakdown
      console.log('🧮 Calculando breakdown para:', passageiroCompleto);
      const breakdownCalculado = calcularBreakdownPagamento(passageiroCompleto);
      console.log('📊 Breakdown calculado:', breakdownCalculado);

      // 6. Atualizar estados
      setPassageiro(passageiroCompleto);
      setBreakdown(breakdownCalculado);
      setHistoricoPagamentos(historico || []);
      
      console.log('✅ Estados atualizados com sucesso');

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados do passageiro:', err);
      console.error('❌ Detalhes do erro:', {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint
      });
      setError(err.message);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [viagemPassageiroId, isValidId]);

  // Registrar pagamento genérico
  const registrarPagamento = useCallback(async (
    request: RegistroPagamentoRequest
  ): Promise<boolean> => {
    console.log('📝 registrarPagamento iniciado:', request);
    
    try {
      const dadosInsert = {
        viagem_passageiro_id: request.viagem_passageiro_id,
        categoria: request.categoria,
        valor_pago: request.valor_pago,
        forma_pagamento: request.forma_pagamento || 'pix',
        observacoes: request.observacoes,
        data_pagamento: request.data_pagamento || new Date().toISOString()
      };
      
      console.log('💾 Dados para inserir:', dadosInsert);
      
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .insert(dadosInsert);

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Pagamento inserido com sucesso');
      toast.success(`Pagamento de ${request.categoria} registrado com sucesso!`);
      
      // Refresh duplo para garantir atualização
      await fetchDadosPassageiro();
      
      // Segundo refresh com delay para casos de quitação completa
      setTimeout(async () => {
        console.log('🔄 Segundo refresh com delay...');
        await fetchDadosPassageiro();
      }, 300);
      
      return true;

    } catch (error: any) {
      console.error('❌ Erro ao registrar pagamento:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
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
    console.log('💰 pagarViagem iniciado:', { viagemPassageiroId, valor, formaPagamento });
    
    if (!isValidId || !viagemPassageiroId || !breakdown) {
      console.error('❌ pagarViagem: dados insuficientes', { isValidId, viagemPassageiroId, breakdown });
      return false;
    }

    // VALIDAÇÃO: Não permitir pagar mais que o pendente
    const valorPendente = breakdown.pendente_viagem;
    if (valor > valorPendente) {
      console.warn('⚠️ Valor maior que pendente:', { valor, valorPendente });
      toast.error(`Valor maior que o pendente da viagem: ${formatCurrency(valorPendente)}`);
      return false;
    }

    if (valorPendente <= 0) {
      toast.error('Viagem já está paga!');
      return false;
    }

    try {
      const resultado = await registrarPagamento({
        viagem_passageiro_id: viagemPassageiroId,
        categoria: 'viagem',
        valor_pago: valor,
        forma_pagamento: formaPagamento,
        observacoes: observacoes,
        data_pagamento: dataPagamento
      });
      
      console.log('✅ Resultado pagarViagem:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Erro em pagarViagem:', error);
      return false;
    }
  }, [isValidId, viagemPassageiroId, breakdown, registrarPagamento]);

  // Pagar apenas passeios
  const pagarPasseios = useCallback(async (
    valor: number,
    formaPagamento = 'pix',
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    console.log('🎢 pagarPasseios iniciado:', { viagemPassageiroId, valor, formaPagamento });
    
    if (!isValidId || !viagemPassageiroId) {
      console.error('❌ pagarPasseios: ID inválido ou não fornecido');
      return false;
    }

    // FALLBACK: Se breakdown estiver null, permitir pagamento sem validação rigorosa
    if (!breakdown) {
      console.warn('⚠️ Breakdown null, permitindo pagamento sem validação rigorosa');
      
      try {
        const resultado = await registrarPagamento({
          viagem_passageiro_id: viagemPassageiroId,
          categoria: 'passeios',
          valor_pago: valor,
          forma_pagamento: formaPagamento,
          observacoes: observacoes,
          data_pagamento: dataPagamento
        });
        
        console.log('✅ Resultado pagarPasseios (fallback):', resultado);
        return resultado;
      } catch (error) {
        console.error('❌ Erro em pagarPasseios (fallback):', error);
        return false;
      }
    }

    // VALIDAÇÃO: Não permitir pagar mais que o pendente (quando breakdown disponível)
    const valorPendente = breakdown.pendente_passeios;
    if (valor > valorPendente) {
      console.warn('⚠️ Valor maior que pendente:', { valor, valorPendente });
      toast.error(`Valor maior que o pendente dos passeios: ${formatCurrency(valorPendente)}`);
      return false;
    }

    if (valorPendente <= 0) {
      toast.error('Passeios já estão pagos!');
      return false;
    }

    try {
      const resultado = await registrarPagamento({
        viagem_passageiro_id: viagemPassageiroId,
        categoria: 'passeios',
        valor_pago: valor,
        forma_pagamento: formaPagamento,
        observacoes: observacoes,
        data_pagamento: dataPagamento
      });
      
      console.log('✅ Resultado pagarPasseios:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Erro em pagarPasseios:', error);
      return false;
    }
  }, [isValidId, viagemPassageiroId, breakdown, registrarPagamento]);

  // Função pagarTudo removida

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

  // Carregar dados na inicialização - apenas se ID for válido
  useEffect(() => {
    if (isValidId) {
      console.log('🔄 useEffect executado, chamando fetchDadosPassageiro...');
      fetchDadosPassageiro();
    }
  }, [fetchDadosPassageiro, isValidId]);

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
    // pagarTudo removido
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
    refetch: fetchDadosPassageiro,
    
    // ✅ NOVO: Função específica para atualizar após vinculação de crédito
    atualizarAposVinculacaoCredito: async () => {
      console.log('🔄 Atualizando dados após vinculação de crédito...');
      // Aguardar um pouco para garantir que as operações no banco foram concluídas
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchDadosPassageiro();
    }
  };
};