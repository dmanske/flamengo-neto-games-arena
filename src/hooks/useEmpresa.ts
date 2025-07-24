import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmpresaData {
  id: string;
  nome: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  logo_url: string;
  logo_bucket_path: string;
  site: string;
  instagram: string;
  facebook: string;
  descricao: string;
}

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<EmpresaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregarEmpresa = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('empresa_config')
        .select('*')
        .eq('ativo', true)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        throw supabaseError;
      }

      setEmpresa(data);
    } catch (err) {
      console.error('Erro ao carregar dados da empresa:', err);
      setError('Erro ao carregar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEmpresa();
  }, []);

  return {
    empresa,
    loading,
    error,
    recarregar: carregarEmpresa
  };
}