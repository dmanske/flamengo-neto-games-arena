import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin } from "lucide-react";

interface PasseioInfo {
  passeio_nome: string;
  status: string;
}

interface PasseiosCompactosProps {
  passeios?: PasseioInfo[];
}

export function PasseiosCompactos({ passeios = [] }: PasseiosCompactosProps) {
  if (!passeios || passeios.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Filtrar apenas passeios confirmados/pagos
  const passeiosAtivos = passeios.filter(p => p.status === 'confirmado' || p.status === 'pago');
  
  if (passeiosAtivos.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Se tem 1 ou 2 passeios, mostrar os nomes
  if (passeiosAtivos.length <= 2) {
    const nomes = passeiosAtivos.map(p => p.passeio_nome).join(", ");
    return (
      <div className="flex items-center gap-1">
        <MapPin className="h-3 w-3 text-blue-600" />
        <span className="text-sm">{nomes}</span>
      </div>
    );
  }

  // Se tem mais de 2, mostrar formato compacto com tooltip
  const primeiros = passeiosAtivos.slice(0, 2);
  const restantes = passeiosAtivos.length - 2;
  const nomesCompactos = primeiros.map(p => p.passeio_nome).join(", ");
  const todosNomes = passeiosAtivos.map(p => p.passeio_nome);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1 cursor-help">
            <MapPin className="h-3 w-3 text-blue-600" />
            <span className="text-sm">
              {nomesCompactos} 
              <Badge variant="secondary" className="ml-1 text-xs">
                +{restantes}
              </Badge>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs">
            <p className="font-semibold mb-1">Passeios selecionados:</p>
            <ul className="text-sm space-y-1">
              {todosNomes.map((nome, index) => (
                <li key={index} className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  {nome}
                </li>
              ))}
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}