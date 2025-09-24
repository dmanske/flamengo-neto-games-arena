// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Bus, Users, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TransferDataDialog } from './TransferDataDialog';



interface Onibus {
  id: string;
  viagem_id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  passageiros_count?: number;
  lugares_extras?: number;
  rota_transfer?: string;
  placa_transfer?: string;
  motorista_transfer?: string;
}

interface OnibusCardsProps {
  onibusList: Onibus[];
  selectedOnibusId: string | null;
  onSelectOnibus: (id: string | null) => void;
  passageirosCount?: Record<string, number>;
  passageirosNaoAlocados?: number;
  passageiros?: any[];
  viagemId: string;
  setPassageiros: (p: any[]) => void;
  setIsLoading: (b: boolean) => void;
  toast: any;
  onUpdatePassageiros?: () => void;
}

export function OnibusCards({ 
  onibusList, 
  selectedOnibusId, 
  onSelectOnibus, 
  passageirosCount = {},
  passageirosNaoAlocados = 0,
  passageiros = [],
  viagemId,
  setPassageiros,
  setIsLoading,
  toast,
  onUpdatePassageiros
}: OnibusCardsProps) {
  const [busImages, setBusImages] = useState<Record<string, string>>({});
  const [transferData, setTransferData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Variáveis removidas - não utilizadas

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

  const passageirosOnibus = selectedOnibusId
    ? passageiros.filter(p => p.onibus_id === selectedOnibusId)
    : [];
    
  // Configurar Realtime para atualizações em tempo real
  useEffect(() => {
    if (!viagemId) return;

    console.log('🔄 Configurando Realtime para viagem:', viagemId);
    
    // Criar canal do Supabase Realtime
    const channel = supabase
      .channel(`viagem-passageiros-${viagemId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'viagem_passageiros',
          filter: `viagem_id=eq.${viagemId}` // Apenas mudanças desta viagem
        },
        (payload) => {
          console.log('🔔 Mudança detectada na tabela viagem_passageiros:', payload);
          
          // Atualizar timestamp da última mudança
          setLastUpdate(new Date());
          
          // Recarregar dados quando houver mudanças
          // A função fetchPassageiros será chamada pelo componente pai
          
          // Notificação de atualização em tempo real
          if (payload.eventType === 'UPDATE') {
            toast.info('✅ Passageiro atualizado em tempo real');
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Status do Realtime:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Cleanup: remover subscription quando componente desmontar
    return () => {
      console.log('🔌 Desconectando Realtime');
      supabase.removeChannel(channel);
    };
  }, [viagemId, setPassageiros, setIsLoading, toast]);

  // Debug para verificar os passageiros
  console.log('Passageiros do ônibus:', passageirosOnibus);

  // Função simples para agrupar passageiros sem usar o hook
  const agruparPassageirosSimples = React.useCallback((passageirosDoOnibus: any[]) => {
    const gruposMap = new Map<string, any[]>();
    
    passageirosDoOnibus.forEach(passageiro => {
      if (passageiro.grupo_nome && passageiro.grupo_cor) {
        const key = `${passageiro.grupo_nome}|${passageiro.grupo_cor}`;
        if (!gruposMap.has(key)) {
          gruposMap.set(key, []);
        }
        gruposMap.get(key)!.push(passageiro);
      }
    });

    return Array.from(gruposMap.entries()).map(([key, passageiros]) => {
      const [nome, cor] = key.split('|');
      return {
        nome,
        cor,
        passageiros,
        total_membros: passageiros.length
      };
    });
  }, []);

  // Pré-calcular grupos para todos os ônibus para evitar re-renders
  const gruposPorOnibus = React.useMemo(() => {
    const grupos: Record<string, any[]> = {};
    onibusList.forEach(onibus => {
      const passageirosDoOnibus = passageiros.filter(p => p.onibus_id === onibus.id);
      grupos[onibus.id] = agruparPassageirosSimples(passageirosDoOnibus);
    });
    return grupos;
  }, [passageiros, onibusList, agruparPassageirosSimples]);

  return (
    <>
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
          // Resumo de status (removido variáveis não utilizadas)
          // Responsáveis deste ônibus específico
          const responsaveisDesteOnibus = passageiros.filter(p => p.is_responsavel_onibus === true && p.onibus_id === onibus.id);
          const passageirosDesteOnibus = passageiros.filter(p => p.onibus_id === onibus.id);
          
          // Usar grupos pré-calculados
          const gruposDesteOnibus = gruposPorOnibus[onibus.id] || [];
          const temGrupos = gruposDesteOnibus.length > 0;
          
          return (
            <div key={onibus.id} className="flex gap-4 items-stretch">
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
                          {/* Indicador de grupos */}
                          {temGrupos && (
                            <div className="flex items-center gap-1 ml-auto">
                              <Palette className="h-3 w-3 text-blue-500" />
                              <span className="text-xs text-blue-600 font-medium">
                                {gruposDesteOnibus.length} grupo{gruposDesteOnibus.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
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
                        
                        {/* Indicadores de grupos com cores */}
                        {temGrupos && (
                          <div className="pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 mb-1">
                              <Palette className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Grupos:</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {gruposDesteOnibus.map(grupo => (
                                <div
                                  key={`${grupo.nome}-${grupo.cor}`}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full text-xs border"
                                  style={{
                                    backgroundColor: `${grupo.cor}15`,
                                    borderColor: `${grupo.cor}40`,
                                    color: grupo.cor
                                  }}
                                  title={`Grupo ${grupo.nome}: ${grupo.total_membros} membro${grupo.total_membros !== 1 ? 's' : ''}`}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: grupo.cor }}
                                  />
                                  <span className="font-medium">{grupo.nome}</span>
                                  <span className="text-xs opacity-75">({grupo.total_membros})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Botão Editar Transfer - Discreto */}
                        <div className="pt-2 border-t border-gray-100 flex justify-end">
                          <TransferDataDialog
                            onibusId={onibus.id}
                            onibusNome={onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`}
                            currentData={{
                              nome_tour_transfer: onibus.nome_tour_transfer,
                              rota_transfer: onibus.rota_transfer,
                              placa_transfer: onibus.placa_transfer,
                              motorista_transfer: onibus.motorista_transfer
                            }}
                            onUpdate={(data) => {
                              setTransferData(prev => ({
                                ...prev,
                                [onibus.id]: data
                              }));
                              // Atualizar a lista de ônibus se necessário
                              if (onUpdatePassageiros) {
                                onUpdatePassageiros();
                              }
                            }}
                          />
                        </div>

                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
              {/* Card dos responsáveis - sempre visível para cada ônibus */}
              <Card className={`min-w-[280px] flex flex-col ${isSelected ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' : 'bg-gray-50 border-gray-200'} shadow-lg`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-lg font-bold flex items-center gap-2 ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                      <Users className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      Responsáveis
                      {isSelected && (
                        <div className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-gray-400'}`} 
                             title={isRealtimeConnected ? 'Conectado - Atualizações em tempo real' : 'Desconectado'} />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={isSelected ? "text-blue-700 border-blue-300" : "text-gray-600 border-gray-300"}>
                        {responsaveisDesteOnibus.length}
                      </Badge>

                      {isSelected && lastUpdate && (
                        <span className="text-xs text-slate-500" title={`Última atualização: ${lastUpdate.toLocaleTimeString()}`}>
                          {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {/* Lista dos responsáveis atuais */}
                  <div className="space-y-3">
                    {responsaveisDesteOnibus.length === 0 && (
                      <div className="text-center py-6 text-slate-500">
                        <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum responsável definido</p>
                      </div>
                    )}
                    
                    {responsaveisDesteOnibus.map(responsavel => {
                      const nome = responsavel.nome || (responsavel.clientes ? responsavel.clientes.nome : 'Responsável');
                      const foto = responsavel.foto || (responsavel.clientes ? responsavel.clientes.foto : null);
                      const iniciais = nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                      const responsavelId = responsavel.viagem_passageiro_id || responsavel.id;
                      
                      return (
                        <div key={responsavelId} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                          <Avatar className="h-10 w-10 border-2 border-blue-300">
                            {foto ? (
                              <AvatarImage src={foto} alt={nome} className="object-cover" />
                            ) : null}
                            <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-semibold">
                              {iniciais}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-blue-900 truncate">{nome}</h4>
                            <Badge className="bg-green-600 text-white text-xs mt-1">Responsável</Badge>
                          </div>
                          
                          {/* Botão para remover responsável - só aparece quando ônibus está selecionado */}
                          {isSelected && (
                            <button
                              onClick={async () => {
                                if (isSaving) return;
                                
                                try {
                                  setIsSaving(true);
                                  const { error } = await supabase
                                    .from('viagem_passageiros')
                                    .update({ is_responsavel_onibus: false })
                                    .eq('id', responsavelId);
                                    
                                  if (error) throw error;
                                  
                                  if (onUpdatePassageiros) {
                                    onUpdatePassageiros();
                                  }
                                  toast.success('Responsável removido!');
                                } catch (e) {
                                  console.error('Erro ao remover responsável:', e);
                                  toast.error('Erro ao remover responsável!');
                                } finally {
                                  setIsSaving(false);
                                }
                              }}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              title="Remover responsável"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Dropdown para adicionar novos responsáveis - só aparece quando ônibus está selecionado */}
                  {isSelected && (
                    <div className="border-t border-blue-200 pt-4">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Adicionar responsável:
                      </label>
                      <select
                        className="w-full p-2 border border-blue-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value=""
                        onChange={async (e) => {
                          const passageiroId = e.target.value;
                          if (!passageiroId || isSaving) return;
                          
                          try {
                            setIsSaving(true);
                            const { error } = await supabase
                              .from('viagem_passageiros')
                              .update({ is_responsavel_onibus: true })
                              .eq('id', passageiroId);
                              
                            if (error) throw error;
                            
                            if (onUpdatePassageiros) {
                              onUpdatePassageiros();
                            }
                            toast.success('Responsável adicionado!');
                          } catch (e) {
                            console.error('Erro ao adicionar responsável:', e);
                            toast.error('Erro ao adicionar responsável!');
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        disabled={isSaving}
                      >
                        <option value="">Selecione um passageiro...</option>
                        {passageirosDesteOnibus
                          .filter(p => !p.is_responsavel_onibus)
                          .map(p => {
                            const passageiroId = p.viagem_passageiro_id || p.id;
                            const nome = p.nome || (p.clientes ? p.clientes.nome : 'Passageiro');
                            return (
                              <option key={passageiroId} value={passageiroId}>
                                {nome}
                              </option>
                            );
                          })}
                      </select>
                      
                      {passageirosDesteOnibus.filter(p => !p.is_responsavel_onibus).length === 0 && (
                        <p className="text-xs text-slate-500 mt-2">
                          Todos os passageiros já são responsáveis
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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
