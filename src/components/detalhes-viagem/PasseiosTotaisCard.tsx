import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PassageiroDisplay {
  passeios?: Array<{ 
    passeio_nome: string; 
    status: string;
    valor_cobrado?: number;
    passeio?: {
      nome: string;
      valor: number;
    };
  }>;
}

interface PasseiosTotaisCardProps {
  passageiros: PassageiroDisplay[];
  className?: string;
}

export function PasseiosTotaisCard({ passageiros, className }: PasseiosTotaisCardProps) {
  // Calcular totais de passeios
  const passeioTotais = passageiros.reduce((acc, passageiro) => {
    if (passageiro.passeios && passageiro.passeios.length > 0) {
      passageiro.passeios.forEach(passeio => {
        const nomePasseio = passeio.passeio?.nome || passeio.passeio_nome || 'Passeio não identificado';
        
        if (!acc[nomePasseio]) {
          acc[nomePasseio] = {
            quantidade: 0
          };
        }
        
        acc[nomePasseio].quantidade += 1;
      });
    }
    return acc;
  }, {} as Record<string, { quantidade: number }>);

  const totalPasseios = Object.values(passeioTotais).reduce((sum, item) => sum + item.quantidade, 0);
  const passageirosComPasseios = passageiros.filter(p => p.passeios && p.passeios.length > 0).length;

  return (
    <div className={className}>
      <h3 className="text-lg font-medium mb-4">Totais de Passeios</h3>
      
      {Object.keys(passeioTotais).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(passeioTotais)
            .sort(([, a], [, b]) => b.quantidade - a.quantidade)
            .map(([nomePasseio, dados]) => (
              <Card key={nomePasseio} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium truncate" title={nomePasseio}>
                    {nomePasseio}
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      <Users className="h-4 w-4 mr-2" />
                      {dados.quantidade}
                    </Badge>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xs text-gray-500">
                      {dados.quantidade === 1 ? 'passageiro' : 'passageiros'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          }
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <MapPin className="h-12 w-12 text-gray-300 mb-4" />
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500 mb-1">
                Nenhum passeio selecionado
              </div>
              <div className="text-xs text-gray-400">
                Os passageiros ainda não escolheram passeios
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Card de resumo geral */}
      {Object.keys(passeioTotais).length > 0 && (
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-blue-800">
                Resumo Geral
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-blue-600">
                  <span className="font-bold">{Object.keys(passeioTotais).length}</span> tipos de passeios
                </div>
                <div className="text-blue-600">
                  <span className="font-bold">{totalPasseios}</span> passeios totais
                </div>
                <div className="text-blue-600">
                  <span className="font-bold">{passageirosComPasseios}</span> passageiros
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}