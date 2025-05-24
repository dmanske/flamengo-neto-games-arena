
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BusStats {
  totalBuses: number;
  totalCapacity: number;
  companies: string[];
  busTypes: string[];
  busesWithImage: number;
  mostUsedBus?: {
    tipo: string;
    count: number;
  };
  isLoading: boolean;
}

export function useBusStats() {
  const [stats, setStats] = useState<BusStats>({
    totalBuses: 0,
    totalCapacity: 0,
    companies: [],
    busTypes: [],
    busesWithImage: 0,
    mostUsedBus: undefined,
    isLoading: true,
  });

  useEffect(() => {
    const fetchBusStats = async () => {
      try {
        setStats(prevStats => ({
          ...prevStats,
          isLoading: true,
        }));

        const { data: onibus, error } = await supabase
          .from('onibus')
          .select('*');

        if (error) {
          throw error;
        }

        if (onibus) {
          const totalBuses = onibus.length;
          const totalCapacity = onibus.reduce((sum, bus) => sum + (bus.capacidade || 0), 0);
          const companies = Array.from(new Set(onibus.map(bus => bus.empresa).filter(Boolean)));
          const busTypes = Array.from(new Set(onibus.map(bus => bus.tipo_onibus).filter(Boolean)));
          const busesWithImage = onibus.filter(bus => bus.image_path).length;

          const mostUsedBus = onibus.reduce((acc, bus) => {
            if (acc[bus.tipo_onibus]) {
              acc[bus.tipo_onibus]++;
            } else {
              acc[bus.tipo_onibus] = 1;
            }
            return acc;
          }, {});

          const mostUsedBusType = Object.keys(mostUsedBus).reduce((a, b) => mostUsedBus[a] > mostUsedBus[b] ? a : b);

          setStats({
            totalBuses,
            totalCapacity,
            companies,
            busTypes,
            busesWithImage,
            mostUsedBus: mostUsedBusType ? { tipo: mostUsedBusType, count: mostUsedBus[mostUsedBusType] } : undefined,
            isLoading: false,
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas dos ônibus:', error);
        toast.error('Erro ao carregar estatísticas dos ônibus');
      } finally {
        setStats(prevStats => ({
          ...prevStats,
          isLoading: false,
        }));
      }
    };

    fetchBusStats();
  }, []);

  const deleteBus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('onibus')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Atualizar o estado removendo o ônibus excluído
      setStats(prevStats => ({
        ...prevStats,
        totalBuses: prevStats.totalBuses - 1,
      }));

      toast.success('Ônibus excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir ônibus:', error);
      toast.error('Erro ao excluir ônibus');
    }
  };

  return {
    stats,
    deleteBus,
  };
}
