import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Bus, DollarSign, Users, Eye, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Viagem {
  id: string;
  data_jogo: string;
  data_saida?: string;
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

interface UltraModernViagemCardProps {
  viagem: Viagem;
  onDeleteClick: (viagem: Viagem) => void;
  passageirosCount?: number;
}

export function UltraModernViagemCard({
  viagem,
  onDeleteClick,
  passageirosCount = 0
}: UltraModernViagemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM 'às' HH:mm", { locale: ptBR });
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

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return {
          color: 'bg-emerald-500',
          textColor: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'fechada':
        return {
          color: 'bg-slate-500',
          textColor: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200'
        };
      case 'concluída':
        return {
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'em andamento':
        return {
          color: 'bg-amber-500',
          textColor: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      default:
        return {
          color: 'bg-gray-500',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const statusConfig = getStatusConfig(viagem.status_viagem);
  const percentualOcupacao = Math.round((passageirosCount / viagem.capacidade_onibus) * 100);
  
  return (
    <TooltipProvider>
      <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-slate-100 max-w-sm mx-auto">
        {/* Status indicator */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`w-3 h-3 rounded-full ${statusConfig.color} shadow-lg`}></div>
        </div>
        
        {/* Header minimalista */}
        <div className="relative bg-gradient-to-br from-slate-50 to-white p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {formatDate(viagem.data_jogo)}
            </div>
            <Badge className={`${statusConfig.textColor} ${statusConfig.bgColor} ${statusConfig.borderColor} border px-2 py-1 text-xs font-medium rounded-full`}>
              {viagem.status_viagem}
            </Badge>
          </div>
          
          {/* Team matchup */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                      alt={viagem.adversario} 
                      className="w-8 h-8 object-contain" 
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-1 text-center">Casa</span>
                </div>
                <div className="text-slate-400 font-light text-lg">vs</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                      alt="Flamengo" 
                      className="w-8 h-8 object-contain" 
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-1">Fora</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                      alt="Flamengo" 
                      className="w-8 h-8 object-contain" 
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-1">Casa</span>
                </div>
                <div className="text-slate-400 font-light text-lg">vs</div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                      alt={viagem.adversario} 
                      className="w-8 h-8 object-contain" 
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 mt-1">Fora</span>
                </div>
              </>
            )}
          </div>
          
          <h4 className="font-bold text-lg text-slate-900 text-center leading-tight">
            {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
              `${viagem.adversario} × Flamengo` : 
              `Flamengo × ${viagem.adversario}`
            }
          </h4>
        </div>
        
        {/* Content section */}
        <div className="p-6 pt-2 space-y-4">
          {/* Key info grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="h-4 w-4 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-500 font-medium">Destino</div>
                <div className="text-sm font-semibold text-slate-900 truncate">{viagem.rota}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <DollarSign className="h-4 w-4 text-slate-500" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-500 font-medium">Valor</div>
                <div className="text-sm font-bold text-slate-900">{formatValue(viagem.valor_padrao)}</div>
              </div>
            </div>
          </div>
          
          {/* Additional info */}
          {viagem.data_saida && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-100">
              <Clock className="h-4 w-4 text-blue-500" />
              <div className="min-w-0 flex-1">
                <div className="text-xs text-blue-600 font-medium">Saída</div>
                <div className="text-sm font-semibold text-blue-900">{formatDateTime(viagem.data_saida)}</div>
              </div>
            </div>
          )}
          
          {/* Occupancy */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Ocupação</span>
              <span className="text-sm font-bold text-slate-900">{passageirosCount}/{viagem.capacidade_onibus}</span>
            </div>
            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}
              />
            </div>
            <div className="text-xs text-center text-slate-500 font-medium">
              {percentualOcupacao}% ocupado
            </div>
          </div>
        </div>
        
        {/* Actions footer */}
        <div className={`grid ${viagem.status_viagem === 'Em andamento' ? 'grid-cols-4' : 'grid-cols-3'} border-t border-slate-100`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-slate-100 h-12 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalhes</TooltipContent>
          </Tooltip>
          
          {viagem.status_viagem === 'Em andamento' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-none border-r border-slate-100 h-12 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                  asChild
                >
                  <Link to={`/dashboard/presenca/${viagem.id}`}>
                    <Users className="h-4 w-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Lista de Presença</TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-slate-100 h-12 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar viagem</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none h-12 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => onDeleteClick(viagem)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir viagem</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}