
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
          .select('status_pagamento')
          .eq('viagem_id', viagemId);

        if (error) {
          throw error;
        }

        if (passageiros) {
          const total = passageiros.length;
          const confirmados = passageiros.filter(p => p.status_pagamento === 'Pago').length;
          const pendentes = passageiros.filter(p => p.status_pagamento === 'Pendente').length;

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
