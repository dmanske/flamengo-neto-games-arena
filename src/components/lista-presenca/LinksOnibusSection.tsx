import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bus, Copy, Check, Users, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface OnibusViagem {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
}

interface LinksOnibusSectionProps {
  viagemId: string;
  onibus: OnibusViagem[];
}

interface PassageiroCount {
  [onibusId: string]: number;
}

export const LinksOnibusSection: React.FC<LinksOnibusSectionProps> = ({
  viagemId,
  onibus
}) => {
  const [copiedLinks, setCopiedLinks] = useState<Set<string>>(new Set());
  const [passageirosCount, setPassageirosCount] = useState<PassageiroCount>({});
  const [loading, setLoading] = useState(true);

  // Buscar contagem de passageiros por ônibus
  useEffect(() => {
    const fetchPassageirosCount = async () => {
      if (!onibus.length) return;

      try {
        setLoading(true);
        
        // Buscar contagem de passageiros para cada ônibus
        const counts: PassageiroCount = {};
        
        for (const bus of onibus) {
          const { count, error } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', viagemId)
            .eq('onibus_id', bus.id);

          if (error) {
            console.error(`Erro ao contar passageiros do ônibus ${bus.id}:`, error);
            counts[bus.id] = 0;
          } else {
            counts[bus.id] = count || 0;
          }
        }

        setPassageirosCount(counts);
      } catch (error) {
        console.error('Erro ao buscar contagem de passageiros:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPassageirosCount();
  }, [viagemId, onibus]);

  const generateLink = (onibusId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/lista-presenca/${viagemId}/onibus/${onibusId}`;
  };

  const copyToClipboard = async (onibusId: string, onibusNumero: string) => {
    const link = generateLink(onibusId);
    
    try {
      await navigator.clipboard.writeText(link);
      
      // Adicionar ao set de links copiados
      setCopiedLinks(prev => new Set(prev).add(onibusId));
      
      toast.success(`Link do ônibus ${onibusNumero} copiado!`, {
        description: "O link foi copiado para a área de transferência"
      });

      // Remover do set após 3 segundos
      setTimeout(() => {
        setCopiedLinks(prev => {
          const newSet = new Set(prev);
          newSet.delete(onibusId);
          return newSet;
        });
      }, 3000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error("Erro ao copiar link", {
        description: "Não foi possível copiar o link para a área de transferência"
      });
    }
  };

  const openLink = (onibusId: string) => {
    const link = generateLink(onibusId);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (onibus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Links por Ônibus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum ônibus cadastrado para esta viagem.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Adicione ônibus na seção "Ônibus" para gerar links específicos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="h-5 w-5" />
          Links por Ônibus
          <Badge variant="outline" className="ml-2">
            {onibus.length} ônibus
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Gere links específicos para cada responsável/guia de ônibus acessar apenas a lista de presença do seu ônibus.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {onibus
            .sort((a, b) => (a.numero_identificacao || '').localeCompare(b.numero_identificacao || ''))
            .map((bus, index) => {
              const isCopiado = copiedLinks.has(bus.id);
              const numPassageiros = passageirosCount[bus.id] || 0;
              const onibusNumero = bus.numero_identificacao || `Ônibus ${index + 1}`;

              return (
                <div
                  key={bus.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {/* Informações do Ônibus */}
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bus className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg">
                        {onibusNumero}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {bus.tipo_onibus}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {bus.empresa}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Capacidade: {bus.capacidade_onibus}
                        </Badge>
                      </div>
                      
                      {/* Contagem de Passageiros */}
                      <div className="flex items-center gap-2 mt-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {loading ? (
                            <span className="animate-pulse">Carregando...</span>
                          ) : (
                            <>
                              {numPassageiros} passageiro{numPassageiros !== 1 ? 's' : ''} alocado{numPassageiros !== 1 ? 's' : ''}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openLink(bus.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir
                    </Button>
                    
                    <Button
                      onClick={() => copyToClipboard(bus.id, onibusNumero)}
                      disabled={isCopiado}
                      className={`flex-1 sm:flex-none ${
                        isCopiado 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      size="sm"
                    >
                      {isCopiado ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Instruções de Uso */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">📋 Como usar:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Clique em "Copiar Link" para o ônibus desejado</li>
            <li>Compartilhe o link com o responsável/guia do ônibus</li>
            <li>O guia poderá acessar apenas a lista de passageiros do seu ônibus</li>
            <li>O guia poderá marcar presença diretamente na interface</li>
          </ol>
          
          <div className="mt-3 p-3 bg-white rounded border border-blue-300">
            <p className="text-xs text-blue-700 font-medium mb-1">💡 Exemplo de link:</p>
            <code className="text-xs text-blue-600 break-all">
              {window.location.origin}/lista-presenca/{viagemId}/onibus/[ID_DO_ONIBUS]
            </code>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        {!loading && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {onibus.length}
              </div>
              <div className="text-xs text-muted-foreground">Ônibus</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(passageirosCount).reduce((sum, count) => sum + count, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Passageiros</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(passageirosCount).filter(count => count > 0).length}
              </div>
              <div className="text-xs text-muted-foreground">Com Passageiros</div>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(
                  Object.values(passageirosCount).reduce((sum, count) => sum + count, 0) / 
                  onibus.reduce((sum, bus) => sum + bus.capacidade_onibus, 0) * 100
                ) || 0}%
              </div>
              <div className="text-xs text-muted-foreground">Ocupação</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};