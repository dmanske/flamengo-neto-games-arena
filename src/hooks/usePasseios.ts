import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { Passeio, UsePasseiosReturn } from '@/types/passeio';

export const usePasseios = (): UsePasseiosReturn => {
  const [passeios, setPasseios] = useState<Passeio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPasseios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('passeios')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('valor', { ascending: false });

      if (fetchError) {
        // Se a tabela não existir, não quebrar a aplicação
        console.warn('Erro ao carregar passeios:', fetchError);
        setPasseios([]);
        setError('Tabela de passeios não encontrada');
        return;
      }

      setPasseios(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar passeios';
      console.error('Erro no usePasseios:', err);
      setError(errorMessage);
      setPasseios([]);
      // Não mostrar toast de erro para não poluir a interface
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPasseios();
  }, [fetchPasseios]);

  // Separar passeios por categoria
  const passeiosPagos = passeios.filter(p => p.categoria === 'pago');
  const passeiosGratuitos = passeios.filter(p => p.categoria === 'gratuito');

  // Função para calcular total dos passeios selecionados
  const calcularTotal = useCallback((passeioIds: string[]): number => {
    return passeios
      .filter(passeio => passeioIds.includes(passeio.id))
      .reduce((total, passeio) => total + passeio.valor, 0);
  }, [passeios]);

  return {
    passeios,
    passeiosPagos,
    passeiosGratuitos,
    loading,
    error,
    calcularTotal,
    refetch: fetchPasseios
  };
};