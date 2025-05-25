import React, { useState, useEffect } from 'react';
import { Bus, Users, CheckCircle2, XCircle } from 'lucide-react';
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
  passageiros?: any[];
}

export function OnibusCards({ 
  onibusList, 
  selectedOnibusId, 
  onSelectOnibus, 
  passageirosCount = {},
  passageirosNaoAlocados = 0,
  passageiros = []
}: OnibusCardsProps) {
  const [busImages, setBusImages] = useState<Record<string, string>>({});
  
  // Calcular totais para o ônibus selecionado
  let totalOnibus = 0;
  let totalSim = 0;
  let totalNao = 0;
  if (selectedOnibusId) {
    const passageirosOnibus = passageiros.filter(p => p.onibus_id === selectedOnibusId);
    totalOnibus = passageirosOnibus.length;
    totalSim = passageirosOnibus.filter(p => p.passeio_cristo === 'sim').length;
    totalNao = passageirosOnibus.filter(p => p.passeio_cristo === 'nao').length;
  }

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
    <>
      {/* Cards de resumo */}
      {selectedOnibusId && (
        <div className="flex flex-wrap gap-4 mb-4">
          <Card className="min-w-[180px] flex-1 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <Users className="h-5 w-5" />
                Total no Ônibus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalOnibus}</div>
            </CardContent>
          </Card>
          <Card className="min-w-[180px] flex-1 border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                Vão ao Cristo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{totalSim}</div>
            </CardContent>
          </Card>
          <Card className="min-w-[180px] flex-1 border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                Não vão ao Cristo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{totalNao}</div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Cards dos ônibus */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 mb-6">
        {onibusList.map((onibus) => {
          const passageirosNoOnibus = passageirosCount[onibus.id] || onibus.passageiros_count || 0;
          // Calculate total capacity including extra seats
          const totalCapacity = onibus.capacidade_onibus + (onibus.lugares_extras || 0);
          const percentualOcupacao = Math.round((passageirosNoOnibus / totalCapacity) * 100);
          const isSelected = selectedOnibusId === onibus.id;
          const busImage = busImages[onibus.tipo_onibus];
          // Resumo por setor
          const setores: Record<string, number> = {};
          if (isSelected) {
            passageiros.filter(p => p.onibus_id === onibus.id).forEach(p => {
              if (p.setor_maracana) {
                setores[p.setor_maracana] = (setores[p.setor_maracana] || 0) + 1;
              }
            });
          }
          // Resumo de status
          const passageirosOnibus = passageiros.filter(p => p.onibus_id === onibus.id);
          const pagos = passageirosOnibus.filter(p => p.status_pagamento === 'Pago').length;
          const pendentes = passageirosOnibus.filter(p => p.status_pagamento === 'Pendente').length;
          const cancelados = passageirosOnibus.filter(p => p.status_pagamento === 'Cancelado').length;
          return (
            <React.Fragment key={onibus.id}>
              <Card 
                className={`relative cursor-pointer hover:border-primary transition-colors shadow-sm rounded-xl p-2 ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => onSelectOnibus(onibus.id)}
              >
                <div className="flex flex-row gap-4 items-stretch h-full">
                  {/* Coluna da foto */}
                  {busImage && (
                    <div className="flex-shrink-0 w-48 h-full flex items-stretch justify-center">
                      <div className="w-full h-full flex items-stretch">
                        <img 
                          src={busImage}
                          alt={`Ônibus ${onibus.tipo_onibus}`}
                          className="w-full h-full object-cover object-center bg-gray-50 rounded-lg shadow"
                          style={{ minHeight: '120px', maxHeight: '180px' }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Coluna das informações */}
                  <div className="flex flex-col justify-start flex-1 py-1 pr-2 h-full">
                    <CardHeader className="pb-1 pt-1">
                      <CardTitle className="text-base font-semibold leading-tight mb-1">
                        {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Bus className="h-4 w-4" />
                          <span>{onibus.empresa}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Capacidade Base</p>
                            <p className="text-base font-semibold">{onibus.capacidade_onibus} lugares</p>
                          </div>
                          {onibus.lugares_extras > 0 && (
                            <div>
                              <p className="text-xs text-gray-500">Lugares Extras</p>
                              <p className="text-base font-semibold text-emerald-600">+{onibus.lugares_extras}</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs text-gray-500">Ocupação</span>
                            <span className="ml-auto text-xs text-gray-700">{passageirosNoOnibus} de {totalCapacity}</span>
                          </div>
                          <Progress 
                            value={percentualOcupacao} 
                            className={`h-2 ${percentualOcupacao > 90 ? 'bg-red-200' : percentualOcupacao > 70 ? 'bg-yellow-200' : ''}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
              {/* Card de resumo ao lado */}
              <Card className="shadow-md rounded-2xl p-5 flex flex-col justify-start min-h-[180px] border border-blue-100 bg-white/80 h-full">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch w-full">
                  {/* Coluna Resumo */}
                  <div className="flex-1 rounded-xl bg-blue-50/80 p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xl font-bold mb-3 text-blue-700">Resumo da Viagem</div>
                      <div className="text-base mb-3"><span className="font-semibold text-gray-800">Passageiros:</span> {passageirosOnibus.length} de {totalCapacity}</div>
                      <div className="mb-3 flex gap-6">
                        <span className="font-bold text-green-700 text-lg">Pagos: {pagos}</span>
                        <span className="font-bold text-orange-700 text-lg">Pendentes: {pendentes}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">% Ocupação: {percentualOcupacao}%</div>
                  </div>
                  {/* Coluna Setores */}
                  {isSelected && Object.keys(setores).length > 0 && (
                    <div className="min-w-[180px] rounded-xl bg-blue-100/60 p-4 flex flex-col justify-start">
                      <span className="font-semibold text-blue-600 text-lg mb-2">Setores:</span>
                      <ul className="ml-1 mt-1">
                        {Object.entries(setores).map(([setor, qtd]) => (
                          <li key={setor} className="text-lg text-gray-800 font-semibold leading-tight">{setor}: <span className="font-bold">{qtd}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </React.Fragment>
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
    </>
  );
}
