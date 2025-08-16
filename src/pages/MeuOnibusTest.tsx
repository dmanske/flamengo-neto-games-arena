import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const MeuOnibusTest = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viagem, setViagem] = useState<any>(null);

  useEffect(() => {
    console.log('🔍 MeuOnibusTest - ID recebido:', id);
    if (id) {
      testConnection();
    }
  }, [id]);

  const testConnection = async () => {
    try {
      console.log('🔍 Testando conexão com Supabase...');
      
      const { data, error } = await supabase
        .from('viagens')
        .select('id, adversario, data_jogo')
        .eq('id', id)
        .single();

      console.log('📊 Resultado da query:', { data, error });

      if (error) {
        setError(`Erro na query: ${error.message}`);
      } else {
        setViagem(data);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
      setError(`Erro geral: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <h1>🔄 Carregando...</h1>
        <p>ID da viagem: {id}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial', color: 'red' }}>
        <h1>❌ Erro</h1>
        <p>ID da viagem: {id}</p>
        <p>Erro: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>✅ Teste Funcionando!</h1>
      <p><strong>ID da viagem:</strong> {id}</p>
      {viagem && (
        <div>
          <p><strong>Adversário:</strong> {viagem.adversario}</p>
          <p><strong>Data do jogo:</strong> {viagem.data_jogo}</p>
        </div>
      )}
      
      <hr style={{ margin: '20px 0' }} />
      
      <h2>🚌 Teste de Busca</h2>
      <p>Se chegou até aqui, a rota está funcionando!</p>
      <p>URL atual: {window.location.href}</p>
    </div>
  );
};

export default MeuOnibusTest;