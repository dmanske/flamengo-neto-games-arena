import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  ExternalLink,
  TrendingUp,
  Users,
  Trophy,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useClienteViagens } from '@/hooks/useClienteViagens';

interface HistoricoViagensProps {
  clienteId: string;
}

const HistoricoViagens: React.FC<HistoricoViagensProps> = ({ clienteId }) => {
  const { viagens, estatisticas, loading, error } = useClienteViagens(clienteId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'finalizado':
        return <Badge className="bg-green-100 text-green-800">✅ Finalizado</Badge>;
      case 'confirmado':
        return <Badge className="bg-blue-100 text-blue-800">🎫 Confirmado</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">❌ Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Erro ao carregar histórico de viagens</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  if (!estatisticas || estatisticas.total_viagens === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma viagem encontrada
        </h3>
        <p className="text-gray-500 mb-4">
          Este cliente ainda não participou de nenhuma viagem.
        </p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link to="/dashboard/viagens">
            <Users className="h-4 w-4 mr-2" />
            Ver Viagens Disponíveis
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo Estatístico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total_viagens}</div>
            <div className="text-sm text-gray-500">Total de Viagens</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(estatisticas.total_gasto)}
            </div>
            <div className="text-sm text-gray-500">Valor Total Gasto</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(estatisticas.viagem_mais_cara.valor)}
            </div>
            <div className="text-sm text-gray-500">Viagem Mais Cara</div>
            <div className="text-xs text-gray-400">{estatisticas.viagem_mais_cara.adversario}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {estatisticas.adversario_favorito.quantidade}
            </div>
            <div className="text-sm text-gray-500">Adversário Favorito</div>
            <div className="text-xs text-gray-400">{estatisticas.adversario_favorito.nome}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Viagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Histórico de Viagens ({estatisticas.total_viagens} viagens)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {viagens.map((viagem, index) => (
              <div 
                key={viagem.id || index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {/* Data */}
                  <div className="text-center min-w-[80px]">
                    <div className="text-sm font-medium text-gray-900">
                      {viagem.data_jogo ? format(new Date(viagem.data_jogo), 'dd/MM', { locale: ptBR }) : 'Data não informada'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {viagem.data_jogo ? format(new Date(viagem.data_jogo), 'yyyy', { locale: ptBR }) : ''}
                    </div>
                  </div>
                  
                  {/* Detalhes da viagem */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">
                        Flamengo x {viagem.adversario}
                      </h4>
                      {getStatusBadge(viagem.status)}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-1">
                      {viagem.setor_maracana && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>Setor {viagem.setor_maracana}</span>
                        </div>
                      )}
                      
                      {viagem.numero_onibus && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>Ônibus {viagem.numero_onibus}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Status de pagamento */}
                    <div className="flex items-center space-x-2 text-sm">
                      {viagem.total_parcelas > 1 ? (
                        <div className="flex items-center space-x-1">
                          <CreditCard className="h-3 w-3 text-blue-600" />
                          <span className="text-blue-600">
                            {viagem.parcelas_pagas}/{viagem.total_parcelas} parcelas pagas
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          {viagem.status_pagamento === 'Pago' ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span className="text-green-600">Pago à vista</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <span className="text-yellow-600">Pendente</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Valor e ações */}
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(viagem.valor_pago)}
                  </div>
                  
                  {viagem.desconto > 0 && (
                    <div className="text-sm text-green-600">
                      Desconto: {formatCurrency(viagem.desconto)}
                    </div>
                  )}
                  
                  <div className="mt-2">
                    {viagem.id && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                      >
                        <Link to={`/dashboard/viagem/${viagem.id}`}>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Rápidos */}
      {estatisticas.total_viagens > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Trophy className="h-5 w-5" />
              <span>Insights de Viagens</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong className="text-blue-800">Ticket médio:</strong>
                <span className="ml-2 text-gray-700">
                  {formatCurrency(estatisticas.ticket_medio)}
                </span>
              </div>
              
              <div>
                <strong className="text-blue-800">Adversário favorito:</strong>
                <span className="ml-2 text-gray-700">
                  {estatisticas.adversario_favorito.nome}
                  {estatisticas.adversario_favorito.quantidade > 0 && (
                    <span className="text-gray-500">
                      ({estatisticas.adversario_favorito.percentual}% das viagens)
                    </span>
                  )}
                </span>
              </div>
              
              <div>
                <strong className="text-blue-800">Status predominante:</strong>
                <span className="ml-2 text-gray-700">
                  {viagens.filter(v => v.status === 'finalizado').length > estatisticas.total_viagens / 2 
                    ? 'Finalizado' 
                    : 'Confirmado'
                  }
                </span>
              </div>
              
              <div>
                <strong className="text-blue-800">Economia total:</strong>
                <span className="ml-2 text-green-600">
                  {formatCurrency(estatisticas.economia_total)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoricoViagens;