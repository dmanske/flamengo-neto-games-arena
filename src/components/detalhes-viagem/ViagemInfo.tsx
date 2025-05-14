
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, MapPin, CreditCard, Bus, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ViagemInfoProps {
  data_jogo: string;
  rota: string;
  setor_padrao: string | null;
  valor_padrao: number | null;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  onibusList: Array<any>;
}

export function ViagemInfo({
  data_jogo,
  rota,
  setor_padrao,
  valor_padrao,
  tipo_onibus,
  empresa,
  capacidade_onibus,
  onibusList
}: ViagemInfoProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Calculate total capacity including extra seats
  const totalCapacity = onibusList.reduce(
    (total, onibus) => total + onibus.capacidade_onibus + (onibus.lugares_extras || 0),
    0
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Informações da Caravana</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Informações da Viagem</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Data do Jogo:</span>
                <span>{formatDate(data_jogo)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Rota:</span>
                <span>{rota}</span>
              </div>
              {setor_padrao && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Setor Padrão:</span>
                  <span>{setor_padrao}</span>
                </div>
              )}
              {valor_padrao !== null && (
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Valor Padrão:</span>
                  <span>{formatCurrency(valor_padrao)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Informações do Ônibus</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Tipo:</span>
                <span>{tipo_onibus}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">Empresa:</span>
                <span>{empresa}</span>
              </div>
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Capacidade:</span>
                <span>{totalCapacity} passageiros</span>
              </div>
              {onibusList.length > 1 && (
                <div className="flex items-start gap-2">
                  <Bus className="h-4 w-4 text-blue-600" />
                  <div>
                    <span className="font-medium text-blue-600">Múltiplos ônibus configurados: {onibusList.length}</span>
                    <div className="mt-2 space-y-1 text-sm">
                      {onibusList.map((onibus, index) => (
                        <div key={onibus.id} className="flex items-center gap-1">
                          <Badge variant="outline" className="bg-blue-50 border-blue-200">
                            Ônibus {index + 1}
                          </Badge>
                          <span>{onibus.numero_identificacao || onibus.tipo_onibus}</span>
                          <span className="text-muted-foreground">
                            ({onibus.capacidade_onibus + (onibus.lugares_extras || 0)} lugares)
                          </span>
                          {onibus.lugares_extras > 0 && (
                            <span className="text-emerald-600 text-xs">
                              (+{onibus.lugares_extras} extras)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
