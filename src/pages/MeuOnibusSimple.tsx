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

  const { viagem, passageiros, isLoading, fetchPassageiros } = useViagemDetails(id || '');

  // Expor função para recarregar passageiros globalmente
  React.useEffect(() => {
    if (fetchPassageiros && id) {
      (window as any).reloadViagemPassageiros = () => {
        console.log('🔄 [MeuOnibusSimple] Função global chamada - recarregando passageiros da viagem:', id);
        console.log('🔄 [MeuOnibusSimple] fetchPassageiros disponível:', !!fetchPassageiros);
        fetchPassageiros(id);
        console.log('✅ [MeuOnibusSimple] fetchPassageiros executado para viagem:', id);
      };
      console.log('✅ [MeuOnibusSimple] Função global reloadViagemPassageiros registrada para viagem:', id);
      console.log('✅ [MeuOnibusSimple] Função registrada no window:', !!(window as any).reloadViagemPassageiros);
    }
    return () => {
      console.log('🧹 [MeuOnibusSimple] Removendo função global reloadViagemPassageiros');
      delete (window as any).reloadViagemPassageiros;
    };
  }, [fetchPassageiros, id]);

  const handleSearch = () => {
    console.log('🔍 Buscando:', searchTerm);
    const found = passageiros.find(p => 
      (p.nome || '').toLowerCase().includes(searchTerm.toLowerCase())
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
      <h1>Confira aqui em qual ônibus você estará 🚍</h1>
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
            <p><strong>Olá, {searchResult.nome}!</strong></p>
            <p style={{ color: '#d97706', fontWeight: 'bold', margin: '10px 0' }}>
              Se prepara, campeão! O Maracanã te espera pra um jogão histórico! 🏟️🔥
            </p>
            <p><strong>CPF:</strong> {searchResult.cpf || 'Não informado'}</p>
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

      {/* Card do Instagram */}
      <Card style={{ marginTop: '30px', backgroundColor: '#f8fafc', border: '2px solid #e2e8f0' }}>
        <CardHeader>
          <CardTitle style={{ color: '#1e40af', textAlign: 'center' }}>
            📸✨ Siga nosso Instagram!
          </CardTitle>
        </CardHeader>
        <CardContent style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px', marginBottom: '10px' }}>
            Siga nosso Instagram e marque a gente nas fotos da sua viagem 📸✨
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc2626' }}>
            @NetoToursViagens
          </p>
        </CardContent>
      </Card>

      {/* Card de Dúvidas */}
      <Card style={{ marginTop: '20px', backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
        <CardHeader>
          <CardTitle style={{ color: '#92400e', textAlign: 'center' }}>
            ❓ Dúvidas?
          </CardTitle>
        </CardHeader>
        <CardContent style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '16px' }}>
            Entre em contato conosco para qualquer dúvida sobre sua viagem!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeuOnibusSimple;