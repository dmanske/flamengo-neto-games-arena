
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, Pencil, Trash2, MapPin, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

interface Viagem {
  id: string;
  data_jogo: string;
  local_jogo?: string;
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
  passageirosCount: number;
  onDeleteClick: (viagem: Viagem) => void;
}

export function ViagemCard({ viagem, passageirosCount, onDeleteClick }: ViagemCardProps) {
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'bg-green-100 text-green-700';
      case 'fechada':
        return 'bg-red-100 text-red-700';
      case 'concluída':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <TooltipProvider>
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
              {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
                <>
                  {viagem.logo_adversario && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img 
                        src={viagem.logo_adversario} 
                        alt={viagem.adversario} 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">vs</span>
                  {viagem.logo_flamengo && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img 
                        src={viagem.logo_flamengo} 
                        alt="Flamengo" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                </>
              ) : (
                <>
                  {viagem.logo_flamengo && (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <img 
                        src={viagem.logo_flamengo} 
                        alt="Flamengo" 
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  )}
                  <span className="text-sm font-medium">vs</span>
                   {viagem.logo_adversario && (
                     <div className="w-8 h-8 flex items-center justify-center">
                       <img 
                         src={viagem.logo_adversario} 
                         alt={viagem.adversario} 
                         className="w-full h-full object-contain" 
                       />
                     </div>
                   )}
                 </>
               )}
             </div>
          </div>
          <Badge className={getStatusColor(viagem.status_viagem)}>
            {viagem.status_viagem}
          </Badge>
        </div>
        <CardTitle className="text-lg">
          {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
            `${viagem.adversario} vs Flamengo` : 
            `Flamengo vs ${viagem.adversario}`
          }
        </CardTitle>
        <p className="text-sm text-gray-600">{formatDate(viagem.data_jogo)}</p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{viagem.rota}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>{passageirosCount}/{viagem.capacidade_onibus}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span>{formatValue(viagem.valor_padrao)}</span>
        </div>
        
        <div className="text-xs text-gray-500">
          {viagem.empresa} • {viagem.tipo_onibus}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link to={`/dashboard/viagem/${viagem.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" asChild className="flex-1">
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => onDeleteClick(viagem)}
                className="flex-1 text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}
