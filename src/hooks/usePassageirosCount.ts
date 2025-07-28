
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { converterStatusParaInteligente } from '@/lib/status-utils';
import { toast } from 'sonner';

interface PassageirosCount {
  total: number;
  confirmados: number;
  pendentes: number;
}

export function usePassageirosCount(viagemId: string) {
  const [count, setCount] = useState<PassageirosCount>({
    total: 0,
    confirmados: 0,
    pendentes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPassageirosCount = async () => {
      try {
        setIsLoading(true);
        
        const { data: passageiros, error } = await supabase
          .from('viagem_passageiros')
          .select(`
            status_pagamento,
            valor,
            desconto,
            historico_pagamentos_categorizado (categoria, valor_pago, data_pagamento)
          `)
          .eq('viagem_id', viagemId);

        if (error) {
          throw error;
        }

        if (passageiros) {
          const total = passageiros.length;
          
          // Usar status inteligente para contagem
          const confirmados = passageiros.filter(p => {
            // Sistema unificado - usar status direto
            return ['Pago Completo', 'Pago'].includes(p.status_pagamento);
          }).length;
          
          const pendentes = passageiros.filter(p => {
            // Sistema unificado - usar status direto
            return ['Pendente', 'Viagem Paga', 'Passeios Pagos'].includes(p.status_pagamento);
          }).length;

          setCount({
            total,
            confirmados,
            pendentes,
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar contagem de passageiros:', error);
        toast.error('Erro ao carregar contagem de passageiros');
      } finally {
        setIsLoading(false);
      }
    };

    if (viagemId) {
      fetchPassageirosCount();
    }
  }, [viagemId]);

  return {
    count,
    isLoading,
  };
}

// New hook for multiple viagens
export function useMultiplePassageirosCount(viagemIds: string[]) {
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        setIsLoading(true);
        const counts: Record<string, number> = {};

        // Fetch counts for all viagens at once
        if (viagemIds.length > 0) {
          const { data: passageiros, error } = await supabase
            .from('viagem_passageiros')
            .select('viagem_id')
            .in('viagem_id', viagemIds);

          if (error) {
            throw error;
          }

          // Count passengers per viagem
          passageiros?.forEach(p => {
            counts[p.viagem_id] = (counts[p.viagem_id] || 0) + 1;
          });
        }

        setPassageirosCount(counts);
      } catch (error: any) {
        console.error('Erro ao buscar contagem de passageiros:', error);
        toast.error('Erro ao carregar contagem de passageiros');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCounts();
  }, [viagemIds.join(',')]);

  return {
    passageirosCount,
    isLoading,
  };
}
