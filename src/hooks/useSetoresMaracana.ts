import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { SetorMaracana } from '@/types/ingressos';

export function useSetoresMaracana() {
  const [setores, setSetores] = useState<SetorMaracana[]>([]);
  const [carregando, setCarregando] = useState(false);

  // Função para buscar setores
  const buscarSetores = useCallback(async () => {
    setCarregando(true);

    try {
      const { data, error } = await supabase
        .from('setores_maracana')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Erro ao buscar setores:', error);
        // Se não conseguir buscar do banco, usar lista padrão
        setSetores(setoresPadrao);
        return;
      }

      setSetores(data || setoresPadrao);
    } catch (error) {
      console.error('Erro inesperado ao buscar setores:', error);
      setSetores(setoresPadrao);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Carregar setores na inicialização
  useEffect(() => {
    buscarSetores();
  }, [buscarSetores]);

  return {
    setores,
    carregando,
    buscarSetores
  };
}

// Lista padrão de setores (fallback)
const setoresPadrao: SetorMaracana[] = [
  { id: 1, nome: 'Sul Inferior', descricao: 'Setor Sul - Arquibancada Inferior', ativo: true },
  { id: 2, nome: 'Sul Superior', descricao: 'Setor Sul - Arquibancada Superior', ativo: true },
  { id: 3, nome: 'Norte Inferior', descricao: 'Setor Norte - Arquibancada Inferior', ativo: true },
  { id: 4, nome: 'Norte Superior', descricao: 'Setor Norte - Arquibancada Superior', ativo: true },
  { id: 5, nome: 'Leste Inferior', descricao: 'Setor Leste - Arquibancada Inferior', ativo: true },
  { id: 6, nome: 'Leste Superior', descricao: 'Setor Leste - Arquibancada Superior', ativo: true },
  { id: 7, nome: 'Oeste Inferior', descricao: 'Setor Oeste - Arquibancada Inferior', ativo: true },
  { id: 8, nome: 'Oeste Superior', descricao: 'Setor Oeste - Arquibancada Superior', ativo: true },
  { id: 9, nome: 'Cadeira Especial', descricao: 'Cadeiras Especiais', ativo: true },
  { id: 10, nome: 'Camarote', descricao: 'Camarotes', ativo: true },
  { id: 11, nome: 'Premium', descricao: 'Setor Premium', ativo: true }
];