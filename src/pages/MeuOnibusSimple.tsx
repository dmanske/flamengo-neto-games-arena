import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Users } from 'lucide-react';
import { useViagemDetails } from '@/hooks/useViagemDetails';

const MeuOnibusSimple = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);

  const { viagem, passageiros, isLoading } = useViagemDetails(id || '');

  const handleSearch = () => {
    console.log('🔍 Buscando:', searchTerm);
    const found = passageiros.find(p => 
      (p.clientes?.nome || p.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResult(found || null);
    console.log('📊 Resultado:', found);
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Carregando...</div>;
  }

  if (!viagem) {
    return <div style={{ padding: '20px' }}>Viagem não encontrada</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚌 Teste Simples - Meu Ônibus</h1>
      <p><strong>Viagem:</strong> {viagem.adversario}</p>
      <p><strong>Total de passageiros:</strong> {passageiros.length}</p>
      
      <div style={{ margin: '20px 0' }}>
        <Input
          type="text"
          placeholder="Digite o nome"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginRight: '10px', width: '200px' }}
        />
        <Button onClick={handleSearch}>
          <Search style={{ width: '16px', height: '16px', marginRight: '8px' }} />
          Buscar
        </Button>
      </div>

      {searchResult && (
        <Card style={{ marginTop: '20px' }}>
          <CardHeader>
            <CardTitle>✅ Passageiro Encontrado!</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Nome:</strong> {searchResult.clientes?.nome || searchResult.nome}</p>
            <p><strong>CPF:</strong> {searchResult.clientes?.cpf || searchResult.cpf || 'Não informado'}</p>
            <p><strong>Ônibus:</strong> {searchResult.onibus_id || 'Não alocado'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
              <Users style={{ width: '16px', height: '16px' }} />
              <span>Teste do ícone Users funcionando!</span>
            </div>
          </CardContent>
        </Card>
      )}

      {searchResult === null && searchTerm && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fee', border: '1px solid #fcc' }}>
          ❌ Nenhum passageiro encontrado com o nome "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default MeuOnibusSimple;