// @ts-nocheck
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { ParcelaConfig, ParcelamentoConfig } from '@/types/parcelamento';

export function useParcelamento() {
  const [isLoading, setIsLoading] = useState(false);

  // Salvar configuração de parcelamento para uma viagem
  const salvarConfiguracaoViagem = useCallback(async (
    viagemId: string, 
    config: Partial<ParcelamentoConfig>
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagem_parcelamento_config')
        .upsert({
          viagem_id: viagemId,
          ...config,
          ativo: true
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração de parcelamento');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar configuração de parcelamento de uma viagem
  const buscarConfiguracaoViagem = useCallback(async (viagemId: string) => {
    try {
      const { data, error } = await supabase
        .from('viagem_parcelamento_config')
        .select('*')
        .eq('viagem_id', viagemId)
        .eq('ativo', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data;
    } catch (error) {
      console.error('Erro ao buscar configuração:', error);
      return null;
    }
  }, []);

  // Salvar parcelas de um passageiro
  const salvarParcelasPassageiro = useCallback(async (
    passageiroId: string,
    parcelas: ParcelaConfig[],
    tipoParcelamento: string = 'personalizado'
  ) => {
    setIsLoading(true);
    try {
      // Primeiro, remover parcelas existentes
      await supabase
        .from('viagem_passageiros_parcelas')
        .delete()
        .eq('viagem_passageiro_id', passageiroId);

      // Inserir novas parcelas
      const parcelasParaInserir = parcelas.map(parcela => ({
        viagem_passageiro_id: passageiroId,
        numero_parcela: parcela.numero,
        total_parcelas: parcelas.length,
        valor_parcela: parcela.valor,
        data_vencimento: parcela.dataVencimento.toISOString().split('T')[0],
        status: parcela.status || 'pendente',
        tipo_parcelamento: tipoParcelamento
      }));

      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert(parcelasParaInserir)
        .select();

      if (error) throw error;

      toast.success(`${parcelas.length} parcelas configuradas com sucesso!`);
      return data;
    } catch (error) {
      console.error('Erro ao salvar parcelas:', error);
      toast.error('Erro ao salvar parcelas do passageiro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar parcelas de um passageiro
  const buscarParcelasPassageiro = useCallback(async (passageiroId: string) => {
    try {
      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .select('*')
        .eq('viagem_passageiro_id', passageiroId)
        .order('numero_parcela');

      if (error) throw error;

      // Converter para formato ParcelaConfig
      const parcelas: ParcelaConfig[] = (data || []).map(parcela => ({
        numero: parcela.numero_parcela,
        valor: parcela.valor_parcela,
        dataVencimento: new Date(parcela.data_vencimento),
        status: parcela.status,
        dataPagamento: parcela.data_pagamento ? new Date(parcela.data_pagamento) : undefined
      }));

      return parcelas;
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      return [];
    }
  }, []);

  // Marcar parcela como paga
  const marcarParcelaPaga = useCallback(async (
    parcelaId: string,
    valorPago: number,
    formaPagamento: string = 'pix'
  ) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .update({
          status: 'pago',
          valor_parcela: valorPago,
          data_pagamento: new Date().toISOString(),
          forma_pagamento: formaPagamento
        })
        .eq('id', parcelaId)
        .select()
        .single();

      if (error) throw error;

      // Registrar no histórico
      await supabase
        .from('parcela_historico')
        .insert({
          parcela_id: parcelaId,
          acao: 'pagamento',
          valor_anterior: null,
          valor_novo: valorPago,
          observacoes: `Pagamento via ${formaPagamento}`
        });

      toast.success('Parcela marcada como paga!');
      return data;
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast.error('Erro ao registrar pagamento');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar parcelas vencendo (para alertas)
  const buscarParcelasVencendo = useCallback(async (diasAntecedencia: number = 5) => {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() + diasAntecedencia);

      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .select(`
          *,
          viagem_passageiros!inner(
            clientes(nome, telefone),
            viagens(adversario, data_jogo)
          )
        `)
        .eq('status', 'pendente')
        .lte('data_vencimento', dataLimite.toISOString().split('T')[0])
        .order('data_vencimento');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar parcelas vencendo:', error);
      return [];
    }
  }, []);

  // Enviar alerta de vencimento
  const enviarAlertaVencimento = useCallback(async (
    parcelaId: string,
    tipoAlerta: '5_dias_antes' | 'vencimento' | 'atraso',
    canal: 'whatsapp' | 'email' = 'whatsapp'
  ) => {
    try {
      const { data, error } = await supabase
        .from('parcela_alertas')
        .insert({
          parcela_id: parcelaId,
          tipo_alerta: tipoAlerta,
          canal: canal,
          template_usado: `template_${tipoAlerta}`,
          status_envio: 'enviado'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar flag na parcela
      const flagColumn = `alerta_${tipoAlerta.replace('_dias_antes', '_5dias')}_enviado`;
      await supabase
        .from('viagem_passageiros_parcelas')
        .update({ [flagColumn]: true })
        .eq('id', parcelaId);

      return data;
    } catch (error) {
      console.error('Erro ao registrar alerta:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    salvarConfiguracaoViagem,
    buscarConfiguracaoViagem,
    salvarParcelasPassageiro,
    buscarParcelasPassageiro,
    marcarParcelaPaga,
    buscarParcelasVencendo,
    enviarAlertaVencimento
  };
}