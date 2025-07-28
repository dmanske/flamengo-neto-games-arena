import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  ControleFinanceiroUnificado,
  TipoPagamento,
  SaldoDevedor,
  ParcelamentoFlexivel,
  ParcelamentoObrigatorio,
  PagamentoLivre,
  UsePagamentoAvancadoReturn
} from '@/types/pagamento-avancado';

export const usePagamentoAvancado = (
  viagemPassageiroId: string | undefined
): UsePagamentoAvancadoReturn => {
  console.warn('⚠️ HOOK DEPRECIADO: usePagamentoAvancado foi substituído pelo sistema de pagamentos separados. Use usePagamentosSeparados.');
  const [controleFinanceiro, setControleFinanceiro] = useState<ControleFinanceiroUnificado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar dados do controle financeiro
  const fetchControleFinanceiro = useCallback(async () => {
    if (!viagemPassageiroId) return;

    try {
      setLoading(true);
      setError(null);

      // Buscar dados básicos do passageiro e viagem
      const { data: passageiroData, error: passageiroError } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          valor,
          desconto,
          status_pagamento,
          gratuito,
          viagens!viagem_passageiros_viagem_id_fkey (
            id,
            adversario,
            tipo_pagamento,
            exige_pagamento_completo,
            dias_antecedencia,
            permite_viagem_com_pendencia
          ),
          passageiro_passeios (
            passeio_id,
            passeios!inner (
              nome,
              valor
            )
          )
        `)
        .eq('id', viagemPassageiroId)
        .single();

      if (passageiroError) throw passageiroError;

      const viagem = passageiroData.viagens;
      const tipoPagamento = (viagem.tipo_pagamento || 'livre') as TipoPagamento;

      // Calcular valores base
      const valorViagem = (passageiroData.valor || 0) - (passageiroData.desconto || 0);
      const valorPasseios = (passageiroData.passageiro_passeios || [])
        .reduce((total: number, pp: any) => total + (pp.passeios?.valor || 0), 0);
      const valorTotal = valorViagem + valorPasseios;

      // Buscar histórico de pagamentos baseado no tipo
      let valorPago = 0;
      let dadosEspecificos: any = {};

      if (tipoPagamento === 'livre') {
        // Cenário 1: Pagamento Livre
        const { data: pagamentos, error: pagamentosError } = await supabase
          .from('viagem_passageiros_parcelas')
          .select('*')
          .eq('viagem_passageiro_id', viagemPassageiroId)
          .order('created_at', { ascending: false });

        if (pagamentosError) throw pagamentosError;

        const historicoPagamentos: PagamentoLivre[] = (pagamentos || []).map(p => ({
          id: p.id,
          viagem_passageiro_id: p.viagem_passageiro_id,
          valor: p.valor_parcela,
          data_pagamento: p.data_pagamento || p.created_at,
          forma_pagamento: p.forma_pagamento || 'pix',
          observacoes: p.observacoes,
          created_at: p.created_at
        }));

        valorPago = historicoPagamentos
          .filter(p => p.data_pagamento)
          .reduce((sum, p) => sum + p.valor, 0);

        const diasEmAberto = Math.floor(
          (new Date().getTime() - new Date(passageiroData.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24)
        );

        let categoriaInadimplencia: 'ok' | 'atencao' | 'critico' = 'ok';
        if (diasEmAberto > 60) categoriaInadimplencia = 'critico';
        else if (diasEmAberto > 30) categoriaInadimplencia = 'atencao';

        dadosEspecificos.pagamento_livre = {
          viagem_passageiro_id: viagemPassageiroId,
          valor_total: valorTotal,
          valor_viagem: valorViagem,
          valor_passeios: valorPasseios,
          valor_pago: valorPago,
          saldo_devedor: valorTotal - valorPago,
          dias_em_aberto: diasEmAberto,
          categoria_inadimplencia: categoriaInadimplencia,
          historico_pagamentos: historicoPagamentos
        } as SaldoDevedor;

      } else if (tipoPagamento === 'parcelado_flexivel') {
        // Cenário 2: Parcelamento Flexível
        const { data: parcelas, error: parcelasError } = await supabase
          .from('viagem_passageiros_parcelas')
          .select('*')
          .eq('viagem_passageiro_id', viagemPassageiroId)
          .order('numero_parcela');

        if (parcelasError) throw parcelasError;

        const parcelasSugeridas = (parcelas || [])
          .filter(p => p.numero_parcela && p.total_parcelas)
          .map(p => ({
            id: p.id,
            numero_parcela: p.numero_parcela,
            valor_parcela: p.valor_parcela,
            data_vencimento: p.data_vencimento,
            status: p.data_pagamento ? 'pago' : (new Date(p.data_vencimento) < new Date() ? 'vencido' : 'pendente'),
            data_pagamento: p.data_pagamento,
            forma_pagamento: p.forma_pagamento,
            tipo: 'sugerida' as const
          }));

        const pagamentosExtras: PagamentoLivre[] = (parcelas || [])
          .filter(p => !p.numero_parcela || !p.total_parcelas)
          .map(p => ({
            id: p.id,
            viagem_passageiro_id: p.viagem_passageiro_id,
            valor: p.valor_parcela,
            data_pagamento: p.data_pagamento || p.created_at,
            forma_pagamento: p.forma_pagamento || 'pix',
            observacoes: p.observacoes,
            created_at: p.created_at
          }));

        const valorParcelasPagas = parcelasSugeridas
          .filter(p => p.status === 'pago')
          .reduce((sum, p) => sum + p.valor_parcela, 0);

        const valorPagamentosExtras = pagamentosExtras
          .reduce((sum, p) => sum + p.valor, 0);

        valorPago = valorParcelasPagas + valorPagamentosExtras;

        dadosEspecificos.parcelamento_flexivel = {
          viagem_passageiro_id: viagemPassageiroId,
          parcelas_sugeridas: parcelasSugeridas,
          pagamentos_extras: pagamentosExtras,
          valor_parcelas_pagas: valorParcelasPagas,
          valor_pagamentos_extras: valorPagamentosExtras,
          saldo_restante: valorTotal - valorPago,
          permite_alteracao: true
        } as ParcelamentoFlexivel;

      } else if (tipoPagamento === 'parcelado_obrigatorio') {
        // Cenário 3: Parcelamento Obrigatório
        const { data: parcelas, error: parcelasError } = await supabase
          .from('viagem_passageiros_parcelas')
          .select('*')
          .eq('viagem_passageiro_id', viagemPassageiroId)
          .order('numero_parcela');

        if (parcelasError) throw parcelasError;

        const parcelasFixas = (parcelas || []).map(p => {
          const hoje = new Date();
          const dataVencimento = new Date(p.data_vencimento);
          const diasAtraso = p.data_pagamento ? 0 : Math.max(0, Math.floor((hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24)));

          return {
            id: p.id,
            numero_parcela: p.numero_parcela,
            total_parcelas: p.total_parcelas,
            valor_parcela: p.valor_parcela,
            data_vencimento: p.data_vencimento,
            status: p.data_pagamento ? 'pago' : (diasAtraso > 0 ? 'vencido' : 'pendente'),
            data_pagamento: p.data_pagamento,
            forma_pagamento: p.forma_pagamento,
            dias_atraso: diasAtraso,
            tipo: 'fixa' as const
          };
        });

        const parcelasPagas = parcelasFixas.filter(p => p.status === 'pago').length;
        const parcelasVencidas = parcelasFixas.filter(p => p.status === 'vencido').length;
        const parcelasFuturas = parcelasFixas.filter(p => p.status === 'pendente').length;

        valorPago = parcelasFixas
          .filter(p => p.status === 'pago')
          .reduce((sum, p) => sum + p.valor_parcela, 0);

        dadosEspecificos.parcelamento_obrigatorio = {
          viagem_passageiro_id: viagemPassageiroId,
          parcelas_fixas: parcelasFixas,
          parcelas_pagas: parcelasPagas,
          parcelas_vencidas: parcelasVencidas,
          parcelas_futuras: parcelasFuturas,
          valor_total_parcelas: valorTotal,
          permite_alteracao: false
        } as ParcelamentoObrigatorio;
      }

      // Determinar status e se pode viajar
      const saldoDevedor = valorTotal - valorPago;
      let statusPagamento: 'pago' | 'pendente' | 'vencido' | 'bloqueado' = 'pendente';
      
      if (saldoDevedor <= 0.01) {
        statusPagamento = 'pago';
      } else if (tipoPagamento === 'parcelado_obrigatorio' && dadosEspecificos.parcelamento_obrigatorio?.parcelas_vencidas > 0) {
        statusPagamento = 'vencido';
      }

      const podeViajar = viagem.permite_viagem_com_pendencia || saldoDevedor <= 0.01;

      const controle: ControleFinanceiroUnificado = {
        viagem_passageiro_id: viagemPassageiroId,
        tipo_pagamento: tipoPagamento,
        valor_viagem: valorViagem,
        valor_passeios: valorPasseios,
        valor_total: valorTotal,
        valor_pago: valorPago,
        saldo_devedor: saldoDevedor,
        status_pagamento: statusPagamento,
        pode_viajar: podeViajar,
        ...dadosEspecificos
      };

      setControleFinanceiro(controle);

    } catch (err: any) {
      console.error('Erro ao buscar controle financeiro:', err);
      setError(err.message);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, [viagemPassageiroId]);

  // Registrar pagamento livre
  const registrarPagamentoLivre = useCallback(async (
    valor: number,
    formaPagamento: string,
    observacoes?: string
  ): Promise<boolean> => {
    if (!viagemPassageiroId) return false;

    try {
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert({
          viagem_passageiro_id: viagemPassageiroId,
          valor_parcela: valor,
          forma_pagamento: formaPagamento,
          data_pagamento: new Date().toISOString(),
          observacoes: observacoes
        });

      if (error) throw error;

      toast.success('Pagamento registrado com sucesso!');
      await fetchControleFinanceiro();
      return true;

    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
      return false;
    }
  }, [viagemPassageiroId, fetchControleFinanceiro]);

  // Pagar parcela específica
  const pagarParcela = useCallback(async (
    parcelaId: string,
    valor: number,
    formaPagamento: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .update({
          data_pagamento: new Date().toISOString(),
          forma_pagamento: formaPagamento,
          valor_parcela: valor
        })
        .eq('id', parcelaId);

      if (error) throw error;

      toast.success('Parcela paga com sucesso!');
      await fetchControleFinanceiro();
      return true;

    } catch (error: any) {
      console.error('Erro ao pagar parcela:', error);
      toast.error('Erro ao pagar parcela');
      return false;
    }
  }, [fetchControleFinanceiro]);

  // Criar parcelamento (para cenários flexível e obrigatório)
  const criarParcelamento = useCallback(async (parcelas: any[]): Promise<boolean> => {
    if (!viagemPassageiroId) return false;

    try {
      // Remover parcelas existentes
      await supabase
        .from('viagem_passageiros_parcelas')
        .delete()
        .eq('viagem_passageiro_id', viagemPassageiroId)
        .not('numero_parcela', 'is', null);

      // Inserir novas parcelas
      const parcelasParaInserir = parcelas.map((parcela, index) => ({
        viagem_passageiro_id: viagemPassageiroId,
        numero_parcela: index + 1,
        total_parcelas: parcelas.length,
        valor_parcela: parcela.valor,
        data_vencimento: parcela.dataVencimento,
        forma_pagamento: parcela.formaPagamento || 'pix'
      }));

      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert(parcelasParaInserir);

      if (error) throw error;

      toast.success(`Parcelamento criado com ${parcelas.length} parcelas!`);
      await fetchControleFinanceiro();
      return true;

    } catch (error: any) {
      console.error('Erro ao criar parcelamento:', error);
      toast.error('Erro ao criar parcelamento');
      return false;
    }
  }, [viagemPassageiroId, fetchControleFinanceiro]);

  // Utilitários
  const calcularSaldoDevedor = useCallback((): number => {
    return controleFinanceiro?.saldo_devedor || 0;
  }, [controleFinanceiro]);

  const verificarPodeViajar = useCallback((): boolean => {
    return controleFinanceiro?.pode_viajar || false;
  }, [controleFinanceiro]);

  const obterProximoVencimento = useCallback((): Date | null => {
    if (!controleFinanceiro) return null;

    if (controleFinanceiro.parcelamento_flexivel) {
      const proximaParcela = controleFinanceiro.parcelamento_flexivel.parcelas_sugeridas
        .filter(p => p.status === 'pendente')
        .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];
      
      return proximaParcela ? new Date(proximaParcela.data_vencimento) : null;
    }

    if (controleFinanceiro.parcelamento_obrigatorio) {
      const proximaParcela = controleFinanceiro.parcelamento_obrigatorio.parcelas_fixas
        .filter(p => p.status === 'pendente')
        .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];
      
      return proximaParcela ? new Date(proximaParcela.data_vencimento) : null;
    }

    return null;
  }, [controleFinanceiro]);

  // Carregar dados na inicialização
  useEffect(() => {
    fetchControleFinanceiro();
  }, [fetchControleFinanceiro]);

  return {
    controleFinanceiro,
    loading,
    error,
    registrarPagamentoLivre,
    pagarParcela,
    criarParcelamento,
    calcularSaldoDevedor,
    verificarPodeViajar,
    obterProximoVencimento,
    refetch: fetchControleFinanceiro
  };
};