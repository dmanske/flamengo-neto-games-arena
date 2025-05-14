
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Eye, 
  Pencil, 
  Trash2,
  Users,
  Calendar,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface Viagem {
  id: string;
  data_jogo: string;
  adversario: string;
  rota: string;
  valor_padrao: number | null;
  empresa: string;
  tipo_onibus: string;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
  capacidade_onibus: number;
}

interface ViagemCardProps {
  viagem: Viagem;
  onDeleteClick: (viagem: Viagem) => void;
  passageirosCount?: number;
}

export function ViagemCard({ viagem, onDeleteClick, passageirosCount = 0 }: ViagemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'text-green-700 bg-green-100';
      case 'fechada':
        return 'text-red-700 bg-red-100';
      case 'concluída':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Calcular ocupação
  const percentualOcupacao = Math.round((passageirosCount / viagem.capacidade_onibus) * 100);

  return (
    <TooltipProvider>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {viagem.logo_flamengo && (
                  <img 
                    src={viagem.logo_flamengo} 
                    alt="Flamengo" 
                    className="h-8 w-8 object-contain" 
                  />
                )}
                <span>x</span>
                {viagem.logo_adversario ? (
                  <img 
                    src={viagem.logo_adversario} 
                    alt={viagem.adversario} 
                    className="h-8 w-8 object-contain" 
                  />
                ) : (
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    ?
                  </div>
                )}
              </div>
              <CardTitle className="text-lg">{viagem.adversario}</CardTitle>
            </div>
            <Badge className={getStatusColor(viagem.status_viagem)}>
              {viagem.status_viagem}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{formatDate(viagem.data_jogo)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{viagem.rota}</span>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Ocupação</span>
                  <span>{passageirosCount} de {viagem.capacidade_onibus}</span>
                </div>
                <Progress 
                  value={percentualOcupacao} 
                  className={`h-2 ${
                    percentualOcupacao > 90 
                      ? 'bg-red-200' 
                      : percentualOcupacao > 70 
                        ? 'bg-yellow-200' 
                        : ''
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">Valor Padrão:</div>
            <div className="font-semibold">{formatValue(viagem.valor_padrao)}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Ônibus:</div>
            <div className="text-sm">{viagem.tipo_onibus} - {viagem.empresa}</div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Ver detalhes</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes da viagem</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar viagem</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDeleteClick(viagem)}
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Excluir</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir viagem</p>
            </TooltipContent>
          </Tooltip>
        </CardFooter>
      </Card>
    </TooltipProvider>
  );
}
