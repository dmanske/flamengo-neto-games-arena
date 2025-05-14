import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Pencil, Trash2, Users, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AspectRatio } from "@/components/ui/aspect-ratio";
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
export function ViagemCard({
  viagem,
  onDeleteClick,
  passageirosCount = 0
}: ViagemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', {
        locale: ptBR
      });
    } catch (error) {
      return 'Data inválida';
    }
  };
  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Status badge color - usando cores mais próximas do Flamengo
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'bg-gradient-to-r from-green-600 to-green-500 text-white';
      case 'fechada':
        return 'bg-gradient-to-r from-black to-gray-700 text-white';
      case 'concluída':
        return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white';
      case 'em andamento':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-500 text-white';
    }
  };

  // Calcular ocupação
  const percentualOcupacao = Math.round(passageirosCount / viagem.capacidade_onibus * 100);

  // Determine card background color based on status
  const getCardBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'from-red-100 to-red-50 border-red-300';
      case 'fechada':
        return 'from-gray-100 to-gray-50 border-gray-300';
      case 'concluída':
        return 'from-black/10 to-black/5 border-gray-300';
      case 'em andamento':
        return 'from-red-50 to-amber-50 border-amber-200';
      default:
        return 'from-white to-gray-50 border-gray-200';
    }
  };
  const cardBgColor = getCardBgColor(viagem.status_viagem);
  const isOcupacaoCritica = percentualOcupacao > 90;

  // Cores do Flamengo para a barra de progresso
  const getProgressBarColor = (percentual: number) => {
    if (percentual > 90) {
      return 'bg-gradient-to-r from-red-600 to-red-500'; // Vermelho forte
    } else if (percentual > 70) {
      return 'bg-gradient-to-r from-red-500 to-red-400'; // Vermelho médio
    } else {
      return 'bg-gradient-to-r from-red-400 to-red-300'; // Vermelho claro
    }
  };
  return <TooltipProvider>
      <Card className={`h-full flex flex-col shadow-md hover:shadow-lg transition-all bg-gradient-to-br ${cardBgColor} overflow-hidden`}>
        {/* Card Header com destaque em cores do Flamengo */}
        <CardHeader className="pb-2 relative bg-gradient-to-r from-red-700 to-red-600 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white p-2 rounded-lg shadow-sm">
                {viagem.logo_flamengo ? <img src={viagem.logo_flamengo} alt="Flamengo" className="h-14 w-14 object-contain" /> : <div className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">FLA</div>}
                <span className="mx-2 text-xl font-bold text-black">x</span>
                {viagem.logo_adversario ? <img src={viagem.logo_adversario} alt={viagem.adversario} className="h-14 w-14 object-contain" /> : <div className="h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center font-semibold text-black">
                    {viagem.adversario.substring(0, 3).toUpperCase()}
                  </div>}
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{viagem.adversario}</CardTitle>
                <div className="flex items-center gap-1 mt-1 text-sm text-red-100">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(viagem.data_jogo)}</span>
                </div>
              </div>
            </div>
            <Badge className={`${getStatusColor(viagem.status_viagem)} px-3 py-1.5 text-sm font-medium shadow`}>
              {viagem.status_viagem}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 pt-4">
          {/* Localização */}
          <div className="flex items-center gap-2 bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <MapPin className="h-5 w-5 text-red-600" />
            <span className="font-medium">{viagem.rota}</span>
          </div>
          
          {/* Ocupação com cores do Flamengo */}
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">Ocupação</span>
                  <span className={`font-bold ${isOcupacaoCritica ? 'text-red-600' : ''}`}>
                    {passageirosCount} de {viagem.capacidade_onibus}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getProgressBarColor(percentualOcupacao)}`} style={{
                  width: `${percentualOcupacao}%`
                }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do ônibus e valor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Valor Padrão:</div>
              <div className="font-bold text-lg text-red-600">{formatValue(viagem.valor_padrao)}</div>
            </div>
            
            <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100">
              <div className="text-sm font-medium text-gray-500">Ônibus:</div>
              <div className="font-medium truncate">{viagem.tipo_onibus}</div>
              <div className="text-sm text-gray-500 truncate">{viagem.empresa}</div>
            </div>
          </div>
        </CardContent>
        
        {/* Footer com botões de ação */}
        <CardFooter className="pb-2 relative bg-gradient-to-r from-red-700 to-red-600 text-white">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" asChild className="rounded-full h-9 w-9 p-0 bg-white hover:bg-red-50 hover:text-red-600 transition-colors">
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
              <Button size="sm" variant="outline" asChild className="rounded-full h-9 w-9 p-0 bg-white hover:bg-red-50 hover:text-red-600 transition-colors">
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
              <Button size="sm" variant="outline" onClick={() => onDeleteClick(viagem)} className="rounded-full h-9 w-9 p-0 bg-white hover:bg-red-50 hover:text-red-600 transition-colors">
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
    </TooltipProvider>;
}