
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

// New hook for multiple viagens with real capacity calculation
export function useMultiplePassageirosCount(viagemIds: string[]) {
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});
  const [capacidadeReal, setCapacidadeReal] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllCounts = async () => {
      try {
        setIsLoading(true);
        const counts: Record<string, number> = {};
        const capacidades: Record<string, number> = {};

        if (viagemIds.length > 0) {
          // Use individual queries instead of .in() to match useViagemDetails behavior
          // This fixes the discrepancy between .eq() and .in() queries
          for (const viagemId of viagemIds) {
            const { data: passageiros, error: passageirosError } = await supabase
              .from('viagem_passageiros')
              .select('id')
              .eq('viagem_id', viagemId);
              // EXACT same query as useViagemDetails - no filters

            if (passageirosError) {
              console.error(`Erro ao buscar passageiros da viagem ${viagemId}:`, passageirosError);
              continue; // Skip this viagem but continue with others
            }

            // Count passengers for this viagem
            counts[viagemId] = passageiros?.length || 0;
          }

          // Fetch real capacity from viagem_onibus
          const { data: onibus, error: onibusError } = await supabase
            .from('viagem_onibus')
            .select('viagem_id, capacidade_onibus, lugares_extras')
            .in('viagem_id', viagemIds);

          if (onibusError) {
            console.error('Erro ao buscar capacidade dos ônibus:', onibusError);
            // Se não conseguir buscar ônibus, usar capacidade padrão das viagens
            viagemIds.forEach(id => {
              capacidades[id] = 0; // Será usado o valor padrão da viagem
            });
          } else {
            // Calculate real capacity per viagem
            onibus?.forEach(o => {
              const capacidadeOnibus = (o.capacidade_onibus || 0) + (o.lugares_extras || 0);
              capacidades[o.viagem_id] = (capacidades[o.viagem_id] || 0) + capacidadeOnibus;
            });

            // Ensure all viagens have a capacity entry (even if 0)
            viagemIds.forEach(id => {
              if (!(id in capacidades)) {
                capacidades[id] = 0;
              }
            });
          }
        }

        setPassageirosCount(counts);
        setCapacidadeReal(capacidades);
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
    capacidadeReal,
    isLoading,
  };
}
