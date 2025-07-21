
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Bus, DollarSign, Users, Eye, Pencil, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ModernButton } from "@/components/ui/modern-button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface ModernViagemCardProps {
  viagem: Viagem;
  onDeleteClick: (viagem: Viagem) => void;
  passageirosCount?: number;
}

export function ModernViagemCard({
  viagem,
  onDeleteClick,
  passageirosCount = 0
}: ModernViagemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'bg-green-500/90 text-white border-green-300';
      case 'fechada':
        return 'bg-gray-600/90 text-white border-gray-400';
      case 'concluída':
        return 'bg-blue-600/90 text-white border-blue-400';
      case 'em andamento':
        return 'bg-amber-500/90 text-white border-amber-400';
      default:
        return 'bg-gray-500/90 text-white border-gray-400';
    }
  };

  const percentualOcupacao = Math.round((passageirosCount / viagem.capacidade_onibus) * 100);
  
  return (
    <TooltipProvider>
      <GlassCard 
        variant="interactive" 
        className="group overflow-hidden max-w-sm mx-auto bg-gradient-to-br from-white/20 to-white/5 border-white/30"
      >
        {/* Header com gradiente moderno */}
        <div className="relative bg-gradient-to-r from-rome-terracotta via-rome-red to-black p-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative flex justify-between items-center">
            <h3 className="text-white font-cinzel text-lg font-bold tracking-wide drop-shadow-lg">
              Caravana Rubro-Negra
            </h3>
            <Badge className={`${getStatusColor(viagem.status_viagem)} backdrop-blur-sm px-3 py-1 text-xs font-semibold rounded-full shadow-lg border`}>
              {viagem.status_viagem}
            </Badge>
          </div>
        </div>
        
        {/* Team logos com efeito glass */}
        <div className="flex items-center justify-center gap-6 py-4 bg-white/10 backdrop-blur-sm">
          {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
          {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
            <>
              <div className="relative group">
                <div className="h-12 w-12 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <img 
                    src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                    alt={viagem.adversario} 
                    className="h-10 w-10 object-contain" 
                  />
                </div>
              </div>
              <div className="text-xl font-bold text-white/80 drop-shadow-lg">×</div>
              <div className="relative group">
                <div className="h-12 w-12 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <img 
                    src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                    alt="Flamengo" 
                    className="h-10 w-10 object-contain" 
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative group">
                <div className="h-12 w-12 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <img 
                    src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                    alt="Flamengo" 
                    className="h-10 w-10 object-contain" 
                  />
                </div>
              </div>
              <div className="text-xl font-bold text-white/80 drop-shadow-lg">×</div>
              <div className="relative group">
                <div className="h-12 w-12 rounded-full border-2 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-200">
                  <img 
                    src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                    alt={viagem.adversario} 
                    className="h-10 w-10 object-contain" 
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Details section com design moderno */}
        <div className="p-4 space-y-4">
          <h4 className="font-bold text-lg text-rome-navy mb-3 text-center">
            {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
              `${viagem.adversario} × Flamengo` : 
              `Flamengo × ${viagem.adversario}`
            }
          </h4>
          
          {/* Info grid com ícones modernos */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-8 h-8 flex items-center justify-center text-rome-terracotta bg-white/20 rounded-lg">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="text-sm font-medium text-rome-navy">{formatDate(viagem.data_jogo)}</div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-8 h-8 flex items-center justify-center text-rome-terracotta bg-white/20 rounded-lg">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="text-sm text-rome-navy truncate">{viagem.rota}</div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-8 h-8 flex items-center justify-center text-rome-terracotta bg-white/20 rounded-lg">
                <Bus className="h-4 w-4" />
              </div>
              <div className="text-sm text-rome-navy">{viagem.tipo_onibus}</div>
            </div>
            
            <div className="flex items-center gap-3 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="w-8 h-8 flex items-center justify-center text-rome-terracotta bg-white/20 rounded-lg">
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="font-bold text-sm text-rome-navy">{formatValue(viagem.valor_padrao)}</div>
            </div>
          </div>
          
          {/* Progress bar moderno para ocupação */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-rome-navy">
              <span>Ocupação</span>
              <span>{passageirosCount}/{viagem.capacidade_onibus}</span>
            </div>
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rome-terracotta to-rome-red rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}
              />
            </div>
            <div className="text-xs text-center text-rome-navy font-medium">
              {percentualOcupacao}% ocupado
            </div>
          </div>
        </div>
        
        {/* Actions footer com botões modernos */}
        <div className="grid grid-cols-3 border-t border-white/20 bg-white/5">
          <Tooltip>
            <TooltipTrigger asChild>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-white/20 h-12"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}`}>
                  <Eye className="h-4 w-4" />
                  <span className="text-xs">Ver</span>
                </Link>
              </ModernButton>
            </TooltipTrigger>
            <TooltipContent>Ver detalhes</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-white/20 h-12"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4" />
                  <span className="text-xs">Editar</span>
                </Link>
              </ModernButton>
            </TooltipTrigger>
            <TooltipContent>Editar viagem</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="rounded-none h-12 text-red-600 hover:bg-red-50/10"
                onClick={() => onDeleteClick(viagem)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-xs">Excluir</span>
              </ModernButton>
            </TooltipTrigger>
            <TooltipContent>Excluir viagem</TooltipContent>
          </Tooltip>
        </div>
      </GlassCard>
    </TooltipProvider>
  );
}
