import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  status_viagem: string;
  logo_flamengo?: string;
  logo_adversario?: string;
}

interface Onibus {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
}

const ScannerPresenca = () => {
  const { viagemId, onibusId } = useParams<{ viagemId: string; onibusId?: string }>();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [onibus, setOnibus] = useState<Onibus | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmacoes, setConfirmacoes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    confirmados: 0,
    pendentes: 0
  });

  useEffect(() => {
    if (viagemId) {
      loadData();
    }
  }, [viagemId, onibusId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar dados da viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from('viagens')
        .select('*')
        .eq('id', viagemId)
        .single();

      if (viagemError) throw viagemError;
      setViagem(viagemData);

      // Buscar dados do ônibus se especificado
      if (onibusId) {
        const { data: onibusData, error: onibusError } = await supabase
          .from('viagem_onibus')
          .select('*')
          .eq('id', onibusId)
          .single();

        if (onibusError) throw onibusError;
        setOnibus(onibusData);
      }

      // Buscar estatísticas de confirmação
      await loadStats();

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da viagem');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      let query = supabase
        .from('viagem_passageiros')
        .select('id, status_presenca, confirmation_method, confirmed_at, clientes(nome)')
        .eq('viagem_id', viagemId);

      if (onibusId) {
        query = query.eq('onibus_id', onibusId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const total = data?.length || 0;
      const confirmados = data?.filter(p => p.status_presenca === 'presente').length || 0;
      const pendentes = total - confirmados;

      setStats({ total, confirmados, pendentes });

      // Buscar confirmações recentes
      const confirmacaoesRecentes = data
        ?.filter(p => p.status_presenca === 'presente' && p.confirmed_at)
        .sort((a, b) => new Date(b.confirmed_at).getTime() - new Date(a.confirmed_at).getTime())
        .slice(0, 5) || [];

      setConfirmacoes(confirmacaoesRecentes);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const handleScanSuccess = (result: any) => {
    console.log('✅ Confirmação via scanner:', result);
    loadStats(); // Recarregar estatísticas
    
    // Adicionar à lista de confirmações recentes
    if (result.data) {
      const novaConfirmacao = {
        clientes: { nome: result.data.passageiro.nome },
        confirmed_at: new Date().toISOString(),
        confirmation_method: 'qr_code_responsavel'
      };
      
      setConfirmacoes(prev => [novaConfirmacao, ...prev.slice(0, 4)]);
    }
  };

  const handleScanError = (error: string) => {
    console.error('❌ Erro no scanner:', error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Viagem não encontrada</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              A viagem solicitada não foi encontrada ou você não tem permissão para acessá-la.
            </p>
            <Button asChild>
              <Link to="/dashboard/viagens">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Viagens
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to={`/dashboard/viagem/${viagemId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scanner de Presença</h1>
            <p className="text-muted-foreground">
              {viagem.adversario} - {format(new Date(viagem.data_jogo), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Informações do Ônibus */}
        {onibus && (
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">{onibus.numero_identificacao}</h2>
                <p className="text-sm text-muted-foreground">
                  {onibus.tipo_onibus} - {onibus.empresa}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">
                  {onibus ? 'Passageiros do Ônibus' : 'Total de Passageiros'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.confirmados}</p>
                <p className="text-sm text-muted-foreground">Confirmados</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Scanner */}
          <div>
            <QRScanner
              viagemId={viagemId}
              onibusId={onibusId}
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </div>

          {/* Confirmações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmacoes.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma confirmação ainda
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    As confirmações aparecerão aqui em tempo real
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmacoes.map((confirmacao, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{confirmacao.clientes.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(confirmacao.confirmed_at), "HH:mm:ss", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className="bg-green-100 text-green-800">
                        {confirmacao.confirmation_method === 'qr_code_responsavel' ? 'Scanner' : 'QR Code'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status da Viagem */}
        {viagem.status_viagem !== 'Em andamento' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Atenção:</span>
              </div>
              <p className="text-yellow-700 mt-1">
                Esta viagem não está com status "Em andamento". 
                Algumas funcionalidades podem estar limitadas.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Como usar o scanner:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Clique em "Iniciar Scanner" para ativar a câmera</li>
              <li>Peça para o passageiro mostrar o QR code na tela do celular</li>
              <li>Aponte a câmera para o QR code até ele ser lido</li>
              <li>A presença será confirmada automaticamente</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScannerPresenca;