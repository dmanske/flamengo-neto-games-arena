import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const RegrasViagem = () => {
  const [url, setUrl] = useState<string>('https://regras-de-viagem-4kqyq4b.gamma.site/');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUrl = async () => {
      try {
        const { data, error } = await supabase
          .from('empresa_config')
          .select('regras_viagem_url')
          .eq('ativo', true)
          .single();

        if (data && data.regras_viagem_url) {
          setUrl(data.regras_viagem_url);
        }
      } catch (error) {
        console.error('Erro ao carregar URL das regras:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarUrl();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <iframe 
        src={url}
        className="w-full h-screen border-0"
        title="Regras de Viagem - Neto Tours"
        style={{ minHeight: '100vh' }}
      />
    </div>
  );
};

export default RegrasViagem;