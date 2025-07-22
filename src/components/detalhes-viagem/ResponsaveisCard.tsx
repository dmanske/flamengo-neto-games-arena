import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bus, Users } from "lucide-react";

interface ResponsaveisCardProps {
  passageiros: any[];
  onibusList?: any[];
}

export function ResponsaveisCard({ passageiros, onibusList = [] }: ResponsaveisCardProps) {
  // Filtrar apenas os passageiros que são responsáveis de ônibus
  const responsaveis = passageiros.filter(p => p.is_responsavel_onibus === true);

  if (responsaveis.length === 0) {
    return null;
  }
  
  // Sempre mostrar todos os responsáveis, independentemente do ônibus selecionado

  // Agrupar responsáveis por ônibus
  const responsaveisPorOnibus: Record<string, any[]> = {};
  
  responsaveis.forEach(responsavel => {
    const onibusId = responsavel.onibus_id || 'sem_onibus';
    if (!responsaveisPorOnibus[onibusId]) {
      responsaveisPorOnibus[onibusId] = [];
    }
    
    // Encontrar informações do ônibus
    const onibusInfo = onibusList.find(o => o.id === onibusId);
    
    // Adicionar informações do ônibus ao responsável
    const responsavelComOnibus = {
      ...responsavel,
      onibus_info: onibusInfo
    };
    
    responsaveisPorOnibus[onibusId].push(responsavelComOnibus);
  });

  return (
    <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 bg-blue-100 rounded-full">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          Responsáveis dos Ônibus
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(responsaveisPorOnibus).map(([onibusId, responsaveisOnibus]) => {
            // Encontrar informações do ônibus (se disponível)
            const onibusInfo = responsaveisOnibus[0]?.onibus_info || { 
              numero_identificacao: onibusId === 'sem_onibus' ? 'Sem ônibus' : `Ônibus ${onibusId.substring(0, 4)}...`,
              tipo_onibus: "Não especificado"
            };
            
            return (
              <div key={onibusId} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <Bus className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    {onibusInfo.numero_identificacao || `Ônibus ${onibusInfo.tipo_onibus}`}
                  </span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
                    {responsaveisOnibus.length} responsável{responsaveisOnibus.length !== 1 ? 'es' : ''}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  {responsaveisOnibus.map(responsavel => {
                    const nome = responsavel.nome || (responsavel.clientes ? responsavel.clientes.nome : 'Responsável');
                    const foto = responsavel.foto || (responsavel.clientes ? responsavel.clientes.foto : null);
                    const iniciais = nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                      <div 
                        key={responsavel.id || responsavel.viagem_passageiro_id} 
                        className="flex items-center gap-2 bg-blue-50 rounded-full pl-1 pr-4 py-1 border border-blue-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Avatar className="h-10 w-10 border-2 border-blue-200">
                          {foto ? (
                            <AvatarImage src={foto} alt={nome} className="object-cover" />
                          ) : null}
                          <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-semibold">
                            {iniciais}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-blue-900 text-sm">{nome}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}