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

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'bg-gradient-to-r from-green-600 to-green-400 text-white';
      case 'fechada':
        return 'bg-gradient-to-r from-red-600 to-red-400 text-white';
      case 'concluída':
        return 'bg-gradient-to-r from-blue-600 to-blue-400 text-white';
      case 'em andamento':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-white';
      default:
        return 'bg-gradient-to-r from-gray-600 to-gray-400 text-white';
    }
  };

  // Calcular ocupação
  const percentualOcupacao = Math.round(passageirosCount / viagem.capacidade_onibus * 100);

  // Determine card background color based on status
  const getCardBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'from-green-50 to-blue-50 border-green-200';
      case 'fechada':
        return 'from-gray-50 to-slate-100 border-gray-200';
      case 'concluída':
        return 'from-blue-50 to-indigo-50 border-blue-200';
      case 'em andamento':
        return 'from-amber-50 to-yellow-50 border-amber-200';
      default:
        return '';
    }
  };
  const cardBgColor = getCardBgColor(viagem.status_viagem);
  const isOcupacaoCritica = percentualOcupacao > 90;
  return <TooltipProvider>
      <Card className={`h-full flex flex-col shadow-md hover:shadow-lg transition-all bg-gradient-to-br ${cardBgColor}`}>
        <CardHeader className="pb-3 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white p-2 rounded-lg shadow-sm">
                {viagem.logo_flamengo ? <img src={viagem.logo_flamengo} alt="Flamengo" className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">FLA</div>}
                <span className="mx-2 text-xl font-bold">x</span>
                {viagem.logo_adversario ? <img src={viagem.logo_adversario} alt={viagem.adversario} className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center font-semibold">
                    {viagem.adversario.substring(0, 3).toUpperCase()}
                  </div>}
              </div>
              <CardTitle className="text-lg font-bold">{viagem.adversario}</CardTitle>
            </div>
            <Badge className={`${getStatusColor(viagem.status_viagem)} px-3 py-1 text-sm font-medium shadow`}>
              {viagem.status_viagem}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">{formatDate(viagem.data_jogo)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="font-medium">{viagem.rota}</span>
            </div>
          </div>
          
          <div className="bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">Ocupação</span>
                  <span className={`font-bold ${isOcupacaoCritica ? 'text-red-600' : ''}`}>
                    {passageirosCount} de {viagem.capacidade_onibus}
                  </span>
                </div>
                <Progress value={percentualOcupacao} className={`h-2.5 ${percentualOcupacao > 90 ? 'bg-red-100' : percentualOcupacao > 70 ? 'bg-yellow-100' : 'bg-gray-100'}`} />
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div className={`h-2.5 rounded-full ${percentualOcupacao > 90 ? 'bg-gradient-to-r from-red-500 to-red-600' : percentualOcupacao > 70 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-green-500 to-green-600'}`} style={{
                  width: `${percentualOcupacao}%`
                }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm font-medium text-gray-500">Valor Padrão:</div>
              <div className="font-bold text-lg text-primary">{formatValue(viagem.valor_padrao)}</div>
            </div>
            
            <div className="bg-white p-3 rounded-md shadow-sm">
              <div className="text-sm font-medium text-gray-500">Ônibus:</div>
              <div className="font-medium truncate">{viagem.tipo_onibus}</div>
              <div className="text-sm text-gray-500 truncate">{viagem.empresa}</div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-between bg-white bg-opacity-70">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline" asChild className="rounded-full h-9 w-9 p-0 bg-white hover:bg-gray-50 hover:text-primary transition-colors">
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
              <Button size="sm" variant="outline" asChild className="rounded-full h-9 w-9 p-0 bg-white hover:bg-gray-50 hover:text-primary transition-colors">
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
              <Button size="sm" variant="outline" onClick={() => onDeleteClick(viagem)} className="rounded-full h-9 w-9 p-0 bg-white hover:bg-red-50 hover:text-red-500 transition-colors">
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