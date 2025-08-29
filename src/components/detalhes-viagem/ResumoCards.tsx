import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Ticket } from "lucide-react";
import { PasseiosEtariosCard } from "./PasseiosEtariosCard";

interface PassageiroDisplay {
  cidade_embarque?: string;
  setor_maracana?: string;
  passeios?: Array<{ passeio_nome: string; status: string }>;
  clientes?: {
    data_nascimento?: string;
  };
  data_nascimento?: string;
}

interface ResumoCardsProps {
  passageiros: PassageiroDisplay[];
}

export function ResumoCards({ passageiros }: ResumoCardsProps) {
  // Resumo por cidade de embarque - mostrar todas as cidades selecionadas
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
    <div className="space-y-6 mb-6">
      {/* Cards de Cidades e Setores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                .map(([cidade, count]) => (
                  <div key={cidade} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate" title={cidade}>{cidade}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {Object.keys(cidadeResumo).length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Nenhuma cidade informada
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
                .map(([setor, count]) => (
                  <div key={setor} className="flex justify-between text-sm">
                    <span className="text-gray-600 truncate" title={setor}>{setor}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              {Object.keys(setorResumo).length === 0 && (
                <div className="text-xs text-gray-500 text-center py-2">
                  Nenhum setor informado
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card Passeios e Faixas Etárias - Novo componente melhorado */}
      <PasseiosEtariosCard passageiros={passageiros} />
    </div>
  );
}