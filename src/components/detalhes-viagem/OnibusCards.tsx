
import React, { useState, useEffect } from 'react';
import { Bus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface Onibus {
  id: string;
  viagem_id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  passageiros_count?: number;
  lugares_extras?: number;
}

interface OnibusCardsProps {
  onibusList: Onibus[];
  selectedOnibusId: string | null;
  onSelectOnibus: (id: string | null) => void;
  passageirosCount?: Record<string, number>;
  passageirosNaoAlocados?: number;
}

export function OnibusCards({ 
  onibusList, 
  selectedOnibusId, 
  onSelectOnibus, 
  passageirosCount = {},
  passageirosNaoAlocados = 0
}: OnibusCardsProps) {
  const [busImages, setBusImages] = useState<Record<string, string>>({});
  
  // Buscar imagens dos ônibus
  useEffect(() => {
    const fetchBusImages = async () => {
      try {
        const { data, error } = await supabase
          .from("onibus_images")
          .select("tipo_onibus, image_url");
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const images: Record<string, string> = {};
          data.forEach(item => {
            if (item.image_url) {
              images[item.tipo_onibus] = item.image_url;
            }
          });
          
          setBusImages(images);
        }
      } catch (error) {
        console.error("Erro ao carregar imagens dos ônibus:", error);
      }
    };
    
    fetchBusImages();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {onibusList.map((onibus) => {
        const passageirosNoOnibus = passageirosCount[onibus.id] || onibus.passageiros_count || 0;
        // Calculate total capacity including extra seats
        const totalCapacity = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
        const percentualOcupacao = Math.round((passageirosNoOnibus / totalCapacity) * 100);
        const isSelected = selectedOnibusId === onibus.id;
        const busImage = busImages[onibus.tipo_onibus];
        
        return (
          <Card 
            key={onibus.id} 
            className={`relative cursor-pointer hover:border-primary transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => onSelectOnibus(onibus.id)}
          >
            {busImage && (
              <div className="overflow-hidden">
                <AspectRatio ratio={16/9}>
                  <img 
                    src={busImage}
                    alt={`Ônibus ${onibus.tipo_onibus}`}
                    className="w-full h-full object-cover"
                  />
                </AspectRatio>
              </div>
            )}
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg flex items-center gap-2">
                  {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`}
                  {isSelected && (
                    <Badge variant="secondary" className="ml-2">
                      Selecionado
                    </Badge>
                  )}
                </CardTitle>
                <Badge variant="outline" className=" bg-blue-50 text-blue-600 border-blue-200">
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
                        <span>{passageirosNoOnibus} de {totalCapacity}</span>
                      </div>
                      <Progress 
                        value={percentualOcupacao} 
                        className={`h-2 ${percentualOcupacao > 90 ? 'bg-red-200' : percentualOcupacao > 70 ? 'bg-yellow-200' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Só exibe o card de "Não Alocados" se houver passageiros sem alocação */}
      {passageirosNaoAlocados > 0 && (
        <Card 
          className={`relative cursor-pointer hover:border-gray-300 transition-colors border-dashed ${selectedOnibusId === null ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
          onClick={() => onSelectOnibus(null)}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg flex items-center gap-2">
                Não Alocados
                {selectedOnibusId === null && (
                  <Badge variant="secondary" className="ml-2">
                    Selecionado
                  </Badge>
                )}
              </CardTitle>
              <Badge variant="outline">
                Sem ônibus
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Passageiros não alocados: {passageirosNaoAlocados}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center h-8">
                  <span className="text-muted-foreground">Passageiros sem alocação de ônibus</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
