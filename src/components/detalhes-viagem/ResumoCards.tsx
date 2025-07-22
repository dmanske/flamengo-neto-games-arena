import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Ticket, Calendar } from "lucide-react";

interface PassageiroDisplay {
  cidade_embarque?: string;
  setor_maracana?: string;
  passeios?: Array<{ passeio_nome: string; status: string }>;
}

interface ResumoCardsProps {
  passageiros: PassageiroDisplay[];
}

export function ResumoCards({ passageiros }: ResumoCardsProps) {
  // Resumo por cidade de embarque
  const cidadeResumo = passageiros.reduce((acc, p) => {
    const cidade = p.cidade_embarque || "Não informado";
    acc[cidade] = (acc[cidade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Resumo por setor do Maracanã
  const setorResumo = passageiros.reduce((acc, p) => {
    const setor = p.setor_maracana || "Não informado";
    acc[setor] = (acc[setor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Resumo de passeios
  const passeioResumo = passageiros.reduce((acc, p) => {
    if (p.passeios && p.passeios.length > 0) {
      p.passeios.forEach(passeio => {
        acc[passeio.passeio_nome] = (acc[passeio.passeio_nome] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const totalComPasseios = Object.values(passeioResumo).reduce((sum, count) => sum + count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Card Cidades de Embarque */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cidades de Embarque</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(cidadeResumo)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([cidade, count]) => (
                <div key={cidade} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cidade}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(cidadeResumo).length > 3 && (
              <div className="text-xs text-gray-500 pt-1">
                +{Object.keys(cidadeResumo).length - 3} outras cidades
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Setores do Maracanã */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Setores do Maracanã</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(setorResumo)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([setor, count]) => (
                <div key={setor} className="flex justify-between text-sm">
                  <span className="text-gray-600">{setor}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(setorResumo).length > 3 && (
              <div className="text-xs text-gray-500 pt-1">
                +{Object.keys(setorResumo).length - 3} outros setores
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card Passeios */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passeios</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600">Total participantes</span>
              <span className="text-blue-600">{totalComPasseios}</span>
            </div>
            {Object.entries(passeioResumo)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 2)
              .map(([passeio, count]) => (
                <div key={passeio} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">{passeio}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            {Object.keys(passeioResumo).length > 2 && (
              <div className="text-xs text-gray-500 pt-1">
                +{Object.keys(passeioResumo).length - 2} outros passeios
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}