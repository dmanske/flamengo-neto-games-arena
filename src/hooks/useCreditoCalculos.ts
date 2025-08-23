import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  CalculoCredito, 
  Credito,
  TipoCreditoViagem 
} from '@/types/creditos';
import { 
  calcularCreditoVsViagem, 
  podeVincularCredito,
  calcularNovoStatusCredito 
} from '@/utils/creditoUtils';

export function useCreditoCalculos() {
  const [calculando, setCalculando] = useState(false);
  const [vinculando, setVinculando] = useState(false);

  // Calcular diferença entre crédito e viagem
  const calcularDiferenca = useCallback((
    creditoDisponivel: number,
    valorViagem: number
  ): CalculoCredito => {
    return calcularCreditoVsViagem(creditoDisponivel, valorViagem);
  }, []);

  // Buscar viagens disponíveis para vinculação
  const buscarViagensDisponiveis = useCallback(async () => {
    try {
      setCalculando(true);

      const { data, error } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo, valor_padrao, local_jogo, status')
        .in('status', ['Aberta', 'Em andamento']) // Apenas viagens ativas
        .order('data_jogo', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
      toast.error('Erro ao carregar viagens disponíveis');
      return [];
    } finally {
      setCalculando(false);
    }
  }, []);

  // Vincular crédito a uma viagem
  const vincularCredito = useCallback(async (
    creditoId: string,
    viagemId: string,
    valorUtilizado: number,
    observacoes?: string
  ): Promise<boolean> => {
    try {
      setVinculando(true);

      // Buscar dados do crédito
      const { data: credito, error: creditoError } = await supabase
        .from('cliente_creditos')
        .select('*')
        .eq('id', creditoId)
        .single();

      if (creditoError) throw creditoError;

      // Verificar se há saldo suficiente
      if (credito.saldo_disponivel < valorUtilizado) {
        toast.error('Saldo insuficiente no crédito');
        return false;
      }

      // Calcular novo saldo
      const novoSaldo = credito.saldo_disponivel - valorUtilizado;
      const novoStatus = calcularNovoStatusCredito(credito.valor_credito, novoSaldo);

      // Iniciar transação
      const { error: vinculacaoError } = await supabase
        .from('credito_viagem_vinculacoes')
        .insert({
          credito_id: creditoId,
          viagem_id: viagemId,
          valor_utilizado: valorUtilizado,
          observacoes,
        });

      if (vinculacaoError) throw vinculacaoError;

      // Atualizar saldo do crédito
      const { error: updateError } = await supabase
        .from('cliente_creditos')
        .update({
          saldo_disponivel: novoSaldo,
          status: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creditoId);

      if (updateError) throw updateError;

      // Registrar no histórico
      const { data: viagem } = await supabase
        .from('viagens')
        .select('adversario, data_jogo')
        .eq('id', viagemId)
        .single();

      await supabase
        .from('credito_historico')
        .insert({
          credito_id: creditoId,
          tipo_movimentacao: 'utilizacao',
          valor_anterior: credito.saldo_disponivel,
          valor_movimentado: -valorUtilizado, // Negativo porque é uma saída
          valor_posterior: novoSaldo,
          descricao: viagem 
            ? `Utilizado R$ ${valorUtilizado.toFixed(2)} na viagem ${viagem.adversario}`
            : `Utilizado R$ ${valorUtilizado.toFixed(2)}`,
          viagem_id: viagemId,
        });

      toast.success('Crédito vinculado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao vincular crédito:', error);
      toast.error('Erro ao vincular crédito');
      return false;
    } finally {
      setVinculando(false);
    }
  }, []);

  // Reembolsar crédito
  const reembolsarCredito = useCallback(async (
    creditoId: string,
    valorReembolso: number,
    motivo: string,
    observacoes?: string
  ): Promise<boolean> => {
    try {
      setVinculando(true);

      // Buscar dados do crédito
      const { data: credito, error: creditoError } = await supabase
        .from('cliente_creditos')
        .select('*')
        .eq('id', creditoId)
        .single();

      if (creditoError) throw creditoError;

      // Verificar se valor do reembolso é válido
      if (valorReembolso > credito.saldo_disponivel) {
        toast.error('Valor do reembolso não pode ser maior que o saldo disponível');
        return false;
      }

      // Calcular novo saldo
      const novoSaldo = credito.saldo_disponivel - valorReembolso;
      const novoStatus = novoSaldo <= 0 ? 'reembolsado' : 
                        novoSaldo < credito.valor_credito ? 'parcial' : 'disponivel';

      // Atualizar crédito
      const { error: updateError } = await supabase
        .from('cliente_creditos')
        .update({
          saldo_disponivel: novoSaldo,
          status: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creditoId);

      if (updateError) throw updateError;

      // Registrar no histórico
      await supabase
        .from('credito_historico')
        .insert({
          credito_id: creditoId,
          tipo_movimentacao: 'reembolso',
          valor_anterior: credito.saldo_disponivel,
          valor_movimentado: -valorReembolso, // Negativo porque é uma saída
          valor_posterior: novoSaldo,
          descricao: `Reembolso de R$ ${valorReembolso.toFixed(2)} - ${motivo}${observacoes ? ` (${observacoes})` : ''}`,
        });

      toast.success('Reembolso processado com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao processar reembolso:', error);
      toast.error('Erro ao processar reembolso');
      return false;
    } finally {
      setVinculando(false);
    }
  }, []);

  // Verificar se crédito pode ser vinculado
  const verificarCompatibilidade = useCallback((
    credito: Credito,
    valorViagem: number,
    tipoUso: TipoCreditoViagem
  ) => {
    return podeVincularCredito(credito, valorViagem, tipoUso);
  }, []);

  // Simular vinculação (sem salvar)
  const simularVinculacao = useCallback((
    credito: Credito,
    valorViagem: number
  ): CalculoCredito & { podeVincular: boolean; motivo?: string } => {
    const calculo = calcularCreditoVsViagem(credito.saldo_disponivel, valorViagem);
    const compatibilidade = podeVincularCredito(credito, valorViagem, 'geral');
    
    return {
      ...calculo,
      podeVincular: compatibilidade.pode,
      motivo: compatibilidade.motivo,
    };
  }, []);

  return {
    calculando,
    vinculando,
    calcularDiferenca,
    buscarViagensDisponiveis,
    vincularCredito,
    reembolsarCredito,
    verificarCompatibilidade,
    simularVinculacao,
  };
}