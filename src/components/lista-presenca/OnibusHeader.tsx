import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, Users, UserCheck, UserX, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { OnibusInfo, ViagemInfo, EstatisticasOnibus } from '@/hooks/useListaPresencaOnibus';

interface OnibusHeaderProps {
  onibus: OnibusInfo;
  viagem: ViagemInfo;
  estatisticas: EstatisticasOnibus;
}

export const OnibusHeader: React.FC<OnibusHeaderProps> = ({
  onibus,
  viagem,
  estatisticas
}) => {
  return (
    <div className="space-y-6">
      {/* Informações do Jogo */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                {viagem.logo_flamengo ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={viagem.logo_flamengo} 
                      alt="Flamengo" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">FLA</span>
                  </div>
                )}
                <span className="text-xl font-bold">vs</span>
                {viagem.logo_adversario ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={viagem.logo_adversario} 
                      alt={viagem.adversario} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="font-bold">{viagem.adversario.substring(0, 3).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg">{viagem.adversario}</h2>
                <p className="text-muted-foreground">
                  {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="mb-1">Maracanã</Badge>
              <span className="text-sm text-muted-foreground">Rio de Janeiro, RJ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Ônibus */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                <Bus className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Ônibus {onibus.numero_identificacao || 'S/N'}
                </h1>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {onibus.tipo_onibus}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {onibus.empresa}
                  </Badge>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    Capacidade: {onibus.capacidade_onibus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {estatisticas.taxa_presenca}%
              </div>
              <div className="text-sm text-blue-700">Taxa de Presença</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Presença */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{estatisticas.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <UserCheck className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{estatisticas.presentes}</p>
              <p className="text-sm text-muted-foreground">Presentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <UserX className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{estatisticas.pendentes}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{estatisticas.taxa_presenca}%</p>
              <p className="text-sm text-muted-foreground">Taxa Presença</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};