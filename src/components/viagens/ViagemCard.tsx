
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Bus, DollarSign, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", {
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
        return 'bg-green-500 text-white';
      case 'fechada':
        return 'bg-gray-700 text-white';
      case 'concluída':
        return 'bg-blue-600 text-white';
      case 'em andamento':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Calcular ocupação
  const percentualOcupacao = Math.round(passageirosCount / viagem.capacidade_onibus * 100);
  const getProgressBarColor = (percentual: number) => {
    if (percentual > 90) {
      return 'bg-red-600';
    } else if (percentual > 70) {
      return 'bg-red-500';
    } else {
      return 'bg-red-500';
    }
  };
  
  return (
    <TooltipProvider>
      <Card className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all max-w-xs">
        {/* Header with Flamengo gradient */}
        <div className="bg-gradient-to-r from-red-600 to-black text-white p-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold m-0">Caravana Rubro-Negra</h3>
          <Badge className={`${getStatusColor(viagem.status_viagem)} px-2 py-1 text-xs font-medium rounded-full`}>
            {viagem.status_viagem}
          </Badge>
        </div>
        
        {/* Team logos section */}
        <div className="flex items-center justify-center gap-4 py-3 bg-white">
          <div className="h-10 w-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} alt="Flamengo" className="h-8 w-8 object-contain" />
          </div>
          <div className="text-base font-bold text-gray-800">×</div>
          <div className="h-10 w-10 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} alt={viagem.adversario} onError={e => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
          }} className="h-8 w-8 object-contain" />
          </div>
        </div>
        
        {/* Details section - more compact */}
        <div className="p-3 bg-white">
          <div className="mb-2">
            <h4 className="font-bold text-sm mb-2">Flamengo x {viagem.adversario}</h4>
            
            {/* Details with icons */}
            <div className="space-y-1 text-sm">
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center text-red-600">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">{formatDate(viagem.data_jogo)}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center text-red-600">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">{viagem.rota}</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center text-red-600">
                  <Bus className="h-3.5 w-3.5" />
                </div>
                <div className="text-xs">{viagem.tipo_onibus} ({viagem.empresa})</div>
              </div>
              
              <div className="flex items-center">
                <div className="w-6 h-6 flex items-center justify-center text-red-600">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
                <div className="font-bold text-xs">{formatValue(viagem.valor_padrao)}</div>
              </div>
            </div>
            
            {/* Occupation progress bar */}
            <div className="mt-3">
              <div className="flex justify-between mb-1 text-xs">
                <span>Ocupação</span>
                <span className="font-bold">
                  {passageirosCount} de {viagem.capacidade_onibus}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${getProgressBarColor(percentualOcupacao)}`} style={{
                width: `${percentualOcupacao}%`
              }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions footer */}
        <div className="grid grid-cols-3 border-t border-gray-200 bg-white">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={`/dashboard/viagem/${viagem.id}`} className="py-2 text-center text-gray-600 hover:bg-gray-50 border-r border-gray-200 transition-colors text-xs">
                👁️ Ver
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver detalhes da viagem</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to={`/dashboard/viagem/${viagem.id}/editar`} className="py-2 text-center text-gray-600 hover:bg-gray-50 border-r border-gray-200 transition-colors text-xs">
                ✏️ Editar
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Editar viagem</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onDeleteClick(viagem)} 
                className="py-2 text-center text-gray-600 hover:bg-gray-50 transition-colors text-xs"
              >
                🗑️ Excluir
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Excluir viagem</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </Card>
    </TooltipProvider>
  );
}
