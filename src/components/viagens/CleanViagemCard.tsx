
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Bus, DollarSign, Users, Eye, Pencil, Trash2 } from "lucide-react";
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
  // Novos campos do sistema avançado de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
  // Passeios relacionados
  viagem_passeios?: Array<{
    passeio_id: string;
    passeios: {
      nome: string;
      valor: number;
      categoria: string;
    };
  }>;
}

interface CleanViagemCardProps {
  viagem: Viagem;
  onDeleteClick: (viagem: Viagem) => void;
  passageirosCount?: number;
}

export function CleanViagemCard({
  viagem,
  onDeleteClick,
  passageirosCount = 0
}: CleanViagemCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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
        return 'bg-green-100 text-green-700 border-green-300';
      case 'fechada':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'concluída':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'em andamento':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const percentualOcupacao = Math.round((passageirosCount / viagem.capacidade_onibus) * 100);
  
  return (
    <TooltipProvider>
      <div className="group bg-white rounded-xl overflow-hidden shadow-professional hover:shadow-professional-lg transition-all duration-300 hover:-translate-y-1 max-w-sm mx-auto border border-gray-100">
        {/* Header sólido e limpo */}
        <div className="bg-professional-blue p-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold text-lg">
              Caravana Rubro-Negra
            </h3>
            <Badge className={`${getStatusColor(viagem.status_viagem)} px-3 py-1 text-xs font-semibold rounded-full border`}>
              {viagem.status_viagem}
            </Badge>
          </div>
        </div>
        
        {/* Team logos section */}
        <div className="flex items-center justify-center gap-6 py-6 bg-professional-light">
          {/* Mostrar adversário primeiro quando jogo for fora do Rio */}
          {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
            <>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                  alt={viagem.adversario} 
                  className="h-12 w-12 object-contain" 
                />
              </div>
              <div className="text-2xl font-bold text-professional-navy">×</div>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                  alt="Flamengo" 
                  className="h-12 w-12 object-contain" 
                />
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                  alt="Flamengo" 
                  className="h-12 w-12 object-contain" 
                />
              </div>
              <div className="text-2xl font-bold text-professional-navy">×</div>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                  alt={viagem.adversario} 
                  className="h-12 w-12 object-contain" 
                />
              </div>
            </>
          )}
        </div>
        
        {/* Content section */}
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-xl text-professional-navy text-center mb-4">
            {viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? 
              `${viagem.adversario} × Flamengo` : 
              `Flamengo × ${viagem.adversario}`
            }
          </h4>
          
          {/* Details list */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Data do Jogo</span>
                <span className="text-professional-slate text-xs">{formatDateTime(viagem.data_jogo)}</span>
              </div>
            </div>
            
            {viagem.data_saida && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                  <Bus className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-professional-navy font-medium text-sm">Saída da Viagem</span>
                  <span className="text-professional-slate text-xs">{formatDateTime(viagem.data_saida)}</span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Local do Jogo</span>
                <span className="text-professional-slate text-xs">{viagem.local_jogo || viagem.rota || 'Rio de Janeiro'}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Valor</span>
                <span className="font-bold text-professional-navy text-lg">{formatValue(viagem.valor_padrao)}</span>
              </div>
            </div>
          </div>

          {/* Seção de Passeios e Tipo de Pagamento */}
          {(viagem.viagem_passeios && viagem.viagem_passeios.length > 0) || viagem.tipo_pagamento ? (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {/* Tipo de Pagamento */}
              {viagem.tipo_pagamento && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-professional-navy">Tipo de Pagamento</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      viagem.tipo_pagamento === 'livre' 
                        ? 'border-blue-300 text-blue-700 bg-blue-50'
                        : viagem.tipo_pagamento === 'parcelado_flexivel'
                        ? 'border-green-300 text-green-700 bg-green-50'
                        : 'border-orange-300 text-orange-700 bg-orange-50'
                    }`}
                  >
                    {viagem.tipo_pagamento === 'livre' && 'Livre'}
                    {viagem.tipo_pagamento === 'parcelado_flexivel' && 'Flexível'}
                    {viagem.tipo_pagamento === 'parcelado_obrigatorio' && 'Obrigatório'}
                  </Badge>
                </div>
              )}

              {/* Passeios Disponíveis */}
              {viagem.viagem_passeios && viagem.viagem_passeios.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-professional-navy">Passeios</span>
                    <span className="text-xs text-professional-slate">
                      {viagem.viagem_passeios.length} disponível{viagem.viagem_passeios.length > 1 ? 'is' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {viagem.viagem_passeios.slice(0, 3).map((vp, index) => (
                      <Badge 
                        key={vp.passeio_id}
                        variant="secondary"
                        className={`text-xs ${
                          vp.passeios.categoria === 'pago' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {vp.passeios.nome}
                        {vp.passeios.valor > 0 && (
                          <span className="ml-1 font-medium">
                            R$ {vp.passeios.valor.toFixed(0)}
                          </span>
                        )}
                      </Badge>
                    ))}
                    {viagem.viagem_passeios.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{viagem.viagem_passeios.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
          
          {/* Occupancy info */}
          <div className="bg-professional-light rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-professional-navy">Ocupação</span>
              <span className="text-sm font-bold text-professional-blue">{passageirosCount}/{viagem.capacidade_onibus}</span>
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-professional-blue rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}
              />
            </div>
            <div className="text-xs text-center text-professional-slate mt-1">
              {percentualOcupacao}% ocupado
            </div>
          </div>
        </div>
        
        {/* Actions footer */}
        <div className={`grid ${viagem.status_viagem === 'Em andamento' ? 'grid-cols-4' : 'grid-cols-3'} border-t border-gray-100`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-gray-100 h-12 hover:bg-professional-blue hover:text-white transition-colors"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="text-xs">Ver</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver detalhes</TooltipContent>
          </Tooltip>
          
          {/* Botão de Lista de Presença - só aparece quando a viagem está em andamento */}
          {viagem.status_viagem === 'Em andamento' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-none border-r border-gray-100 h-12 hover:bg-amber-500 hover:text-white transition-colors"
                  asChild
                >
                  <Link to={`/dashboard/presenca/${viagem.id}`}>
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-xs">Presença</span>
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
                className="rounded-none border-r border-gray-100 h-12 hover:bg-professional-indigo hover:text-white transition-colors"
                asChild
              >
                <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                  <Pencil className="h-4 w-4 mr-1" />
                  <span className="text-xs">Editar</span>
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
                className="rounded-none h-12 text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => onDeleteClick(viagem)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Excluir</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir viagem</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
