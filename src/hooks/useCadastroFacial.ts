import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CadastroFacialData {
  [clienteId: string]: boolean;
}

export const useCadastroFacial = (clienteIds: string[]) => {
  const [cadastroFacialData, setCadastroFacialData] = useState<CadastroFacialData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCadastroFacial = async () => {
      if (!clienteIds || clienteIds.length === 0) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, cadastro_facial')
          .in('id', clienteIds);

        if (error) {
          console.error('Erro ao buscar cadastro facial:', error);
          return;
        }

        const cadastroMap: CadastroFacialData = {};
        data?.forEach(cliente => {
          cadastroMap[cliente.id] = cliente.cadastro_facial ?? false;
        });

        setCadastroFacialData(cadastroMap);
      } catch (error) {
        console.error('Erro ao buscar cadastro facial:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCadastroFacial();
  }, [clienteIds.join(',')]);

  const toggleCadastroFacial = async (clienteId: string, novoStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .update({ cadastro_facial: novoStatus })
        .eq('id', clienteId);

      if (error) {
        console.error('Erro ao atualizar cadastro facial:', error);
        throw error;
      }

      // Atualizar estado local
      setCadastroFacialData(prev => ({
        ...prev,
        [clienteId]: novoStatus
      }));

      return true;
    } catch (error) {
      console.error('Erro ao alterar cadastro facial:', error);
      return false;
    }
  };

  return { cadastroFacialData, loading, toggleCadastroFacial };
};