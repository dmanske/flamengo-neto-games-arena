
import React from 'react';
import { Bus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Onibus {
  id: string;
  viagem_id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  passageiros_count?: number;
}

interface OnibusCardsProps {
  onibusList: Onibus[];
  selectedOnibusId: string | null;
  onSelectOnibus: (id: string | null) => void;
}

export function OnibusCards({ onibusList, selectedOnibusId, onSelectOnibus }: OnibusCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {onibusList.map((onibus) => {
        const passageirosCount = onibus.passageiros_count || 0;
        const percentualOcupacao = Math.round((passageirosCount / onibus.capacidade_onibus) * 100);
        const isSelected = selectedOnibusId === onibus.id;
        
        return (
          <Card 
            key={onibus.id} 
            className={`relative cursor-pointer hover:border-primary transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => onSelectOnibus(onibus.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`}
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {onibus.tipo_onibus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bus className="h-4 w-4" />
                  <span>{onibus.empresa}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Ocupação</span>
                        <span>{passageirosCount} de {onibus.capacidade_onibus}</span>
                      </div>
                      <Progress 
                        value={percentualOcupacao} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <Card 
        className={`relative cursor-pointer hover:border-gray-300 transition-colors border-dashed ${selectedOnibusId === null ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
        onClick={() => onSelectOnibus(null)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">
              Não Alocados
            </CardTitle>
            <Badge variant="outline">
              Sem ônibus
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-16 text-muted-foreground">
            <p>Passageiros sem alocação de ônibus</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
