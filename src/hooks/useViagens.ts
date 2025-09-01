import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  valor_padrao: number;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
}

export function useViagens() {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Função para buscar viagens
  const buscarViagens = useCallback(async (limite?: number) => {
    setCarregando(true);

    try {
      let query = supabase
        .from('viagens')
        .select('id, adversario, data_jogo, valor_padrao, capacidade_onibus, status_viagem, created_at')
        .order('data_jogo', { ascending: false });

      if (limite) {
        query = query.limit(limite);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar viagens:', error);
        return;
      }

      setViagens(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar viagens:', error);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Função para buscar viagens disponíveis para ingressos (apenas abertas e em andamento)
  const buscarViagensAtivas = useCallback(async () => {
    setCarregando(true);

    try {
      const { data, error } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo, valor_padrao, capacidade_onibus, status_viagem, created_at')
        .in('status_viagem', ['Aberta', 'Em andamento', 'Fechada']) // Incluindo 'Fechada' pois ainda pode vender ingressos
        .order('data_jogo', { ascending: false }); // Mais recentes primeiro

      if (error) {
        console.error('Erro ao buscar viagens ativas:', error);
        return;
      }

      console.log('Viagens ativas encontradas:', data?.length || 0, data?.map(v => `${v.adversario} (${v.status_viagem})`)); // Debug detalhado
      setViagens(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar viagens ativas:', error);
    } finally {
      setCarregando(false);
    }
  }, []);
  
  // Função para buscar viagens específicas para ingressos
  const buscarViagensIngressos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('viagens_ingressos')
        .select('*')
        .eq('status', 'Ativa')
        .order('data_jogo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar viagens de ingressos:', error);
        return [];
      }

      console.log('Viagens de ingressos encontradas:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar viagens de ingressos:', error);
      return [];
    }
  }, []);

  // Função para buscar viagem por ID
  const buscarViagemPorId = useCallback(async (id: string): Promise<Viagem | null> => {
    try {
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar viagem:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar viagem:', error);
      return null;
    }
  }, []);

  return {
    viagens,
    carregando,
    buscarViagens,
    buscarViagensAtivas,
    buscarViagemPorId,
    buscarViagensIngressos
  };
}