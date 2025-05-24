
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface BusStats {
  totalOnibus: number;
  capacidadeTotal: number;
  empresas: string[];
  tiposOnibus: string[];
  onibusComImagem: number;
}

export function useBusStats() {
  const [stats, setStats] = useState<BusStats>({
    totalOnibus: 0,
    capacidadeTotal: 0,
    empresas: [],
    tiposOnibus: [],
    onibusComImagem: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBusStats = async () => {
      try {
        setIsLoading(true);
        
        const { data: onibus, error } = await supabase
          .from('onibus')
          .select('*');

        if (error) {
          throw error;
        }

        if (onibus) {
          const totalOnibus = onibus.length;
          const capacidadeTotal = onibus.reduce((sum, bus) => sum + (bus.capacidade || 0), 0);
          const empresas = Array.from(new Set(onibus.map(bus => bus.empresa).filter(Boolean)));
          const tiposOnibus = Array.from(new Set(onibus.map(bus => bus.tipo_onibus).filter(Boolean)));
          const onibusComImagem = onibus.filter(bus => bus.image_path).length;

          setStats({
            totalOnibus,
            capacidadeTotal,
            empresas,
            tiposOnibus,
            onibusComImagem,
          });
        }
      } catch (error: any) {
        console.error('Erro ao buscar estatísticas dos ônibus:', error);
        toast.error('Erro ao carregar estatísticas dos ônibus');
      } finally {
        setIsLoading(false);
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
        totalOnibus: prevStats.totalOnibus - 1,
      }));

      toast.success('Ônibus excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir ônibus:', error);
      toast.error('Erro ao excluir ônibus');
    }
  };

  return {
    stats,
    isLoading,
    deleteBus,
  };
}
