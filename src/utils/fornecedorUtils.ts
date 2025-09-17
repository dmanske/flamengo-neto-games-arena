import { supabase } from '@/lib/supabase';
import { Fornecedor } from '@/types/fornecedores';

// Função utilitária para buscar fornecedor por ID
// Esta função é independente e não causa loops de dependência
export const getFornecedorById = async (id: string): Promise<Fornecedor | null> => {
  try {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrado - não é erro, retorna null
        return null;
      }
      throw error;
    }

    return data;
  } catch (err: any) {
    console.error('Erro ao buscar fornecedor:', err);
    return null;
  }
};