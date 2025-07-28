import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ParcelaSimples {
  numero: number;
  valor: number;
  dataVencimento: Date;
  status: string;
}

export function useParcelamentoSimples() {
  console.warn('⚠️ HOOK DEPRECIADO: useParcelamentoSimples foi substituído pelo sistema de pagamentos separados. Use usePagamentosSeparados.');
  const [isLoading, setIsLoading] = useState(false);

  // Salvar parcelas de um passageiro
  const salvarParcelasPassageiro = async (
    passageiroId: string,
    parcelas: ParcelaSimples[],
    tipoParcelamento: string = 'personalizado'
  ) => {
    setIsLoading(true);
    try {
      // Primeiro, remover parcelas existentes se houver
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
        tipo_parcelamento: tipoParcelamento,
        forma_pagamento: 'pix' // Padrão PIX
      }));

      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert(parcelasParaInserir)
        .select();

      if (error) throw error;

      toast.success(`${parcelas.length} parcela${parcelas.length > 1 ? 's' : ''} configurada${parcelas.length > 1 ? 's' : ''} com sucesso!`);
      return data;
    } catch (error) {
      console.error('Erro ao salvar parcelas:', error);
      toast.error('Erro ao salvar parcelas do passageiro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar parcelas de um passageiro
  const buscarParcelasPassageiro = async (passageiroId: string) => {
    try {
      const { data, error } = await supabase
        .from('viagem_passageiros_parcelas')
        .select('*')
        .eq('viagem_passageiro_id', passageiroId)
        .order('numero_parcela');

      if (error) throw error;

      // Converter para formato ParcelaSimples
      const parcelas: ParcelaSimples[] = (data || []).map(parcela => ({
        numero: parcela.numero_parcela,
        valor: parcela.valor_parcela,
        dataVencimento: new Date(parcela.data_vencimento),
        status: parcela.status
      }));

      return parcelas;
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      return [];
    }
  };

  // Marcar parcela como paga
  const marcarParcelaPaga = async (
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

      toast.success('Parcela marcada como paga!');
      return data;
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast.error('Erro ao registrar pagamento');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    salvarParcelasPassageiro,
    buscarParcelasPassageiro,
    marcarParcelaPaga
  };
}