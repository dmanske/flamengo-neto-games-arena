import React, { useState } from "react";
import { formatDateTimeSafe } from '@/lib/date-utils';

import { Calendar, MapPin, Ticket, DollarSign, Eye, Trash2, Edit3, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/formatters";
import { EditarLogoModal } from "./EditarLogoModal";

interface JogoIngresso {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  logo_flamengo?: string;
  // Dados agregados dos ingressos
  total_ingressos: number;
  receita_total: number;
  lucro_total: number;
  ingressos_pendentes: number;
  ingressos_pagos: number;
}

interface CleanJogoCardProps {
  jogo: JogoIngresso;
  onVerIngressos: (jogo: JogoIngresso) => void;
  onDeletarJogo: (jogo: JogoIngresso) => void;
  onExportarPDF?: (jogo: JogoIngresso) => void;
  onNovoIngresso?: (jogo: JogoIngresso) => void;
  isSelected?: boolean;
}

export function CleanJogoCard({
  jogo,
  onVerIngressos,
  onDeletarJogo,
  onExportarPDF,
  onNovoIngresso,
  isSelected = false
}: CleanJogoCardProps) {
  const [editarLogoOpen, setEditarLogoOpen] = useState(false);
  
  // Validação das propriedades obrigatórias
  if (!jogo) {
    console.error('Jogo é null ou undefined');
    return <div>Erro: Jogo não encontrado</div>;
  }
  
  if (!jogo.adversario) {
    console.error('Adversário não encontrado no jogo:', jogo);
    return <div>Erro: Adversário não encontrado</div>;
  }
  
  if (!jogo.jogo_data) {
    console.error('Data do jogo não encontrada:', jogo);
    return <div>Erro: Data do jogo não encontrada</div>;
  }
  const formatDateTime = formatDateTimeSafe;

  // Debug da data do jogo
  console.log('🎯 CleanJogoCard - Data do jogo:', {
    adversario: jogo.adversario,
    jogo_data: jogo.jogo_data,
    formatado: formatDateTime(jogo.jogo_data),
    total_ingressos: jogo.total_ingressos
  });

  const getLocalBadge = (local: 'casa' | 'fora') => {
    if (local === 'casa') {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-300 px-3 py-1 text-xs font-semibold rounded-full border">
          🏠 Casa
        </Badge>
      );
    }
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-300 px-3 py-1 text-xs font-semibold rounded-full border">
        ✈️ Fora
      </Badge>
    );
  };

  const percentualPagos = jogo.total_ingressos > 0 
    ? Math.round((jogo.ingressos_pagos / jogo.total_ingressos) * 100) 
    : 0;
  
  return (
    <TooltipProvider>
      <div className={`group bg-white rounded-xl overflow-hidden shadow-professional hover:shadow-professional-lg transition-all duration-300 hover:-translate-y-1 max-w-sm mx-auto border ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' 
          : 'border-gray-100'
      }`}>
        {/* Header sólido e limpo */}
        <div className="bg-professional-blue p-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-semibold text-lg">
              Sistema de Ingressos
            </h3>
            {getLocalBadge(jogo.local_jogo)}
          </div>
        </div>
        
        {/* Team logos section */}
        <div className="flex items-center justify-center gap-6 py-6 bg-professional-light">
          {/* Mostrar adversário primeiro quando jogo for fora */}
          {jogo.local_jogo === 'fora' ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="relative h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => setEditarLogoOpen(true)}
                  >
                    <img 
                      src={jogo.logo_adversario || `https://via.placeholder.com/64x64/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`} 
                      alt={jogo.adversario} 
                      className="h-12 w-12 object-contain" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://via.placeholder.com/64x64/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full flex items-center justify-center">
                      <Edit3 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Clique para editar o logo do {jogo.adversario}</TooltipContent>
              </Tooltip>
              <div className="text-2xl font-bold text-professional-navy">×</div>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={jogo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                  alt="Flamengo" 
                  className="h-12 w-12 object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200">
                <img 
                  src={jogo.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"} 
                  alt="Flamengo" 
                  className="h-12 w-12 object-contain" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";
                  }}
                />
              </div>
              <div className="text-2xl font-bold text-professional-navy">×</div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="relative h-16 w-16 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-200 cursor-pointer hover:border-blue-300"
                    onClick={() => setEditarLogoOpen(true)}
                  >
                    <img 
                      src={jogo.logo_adversario || `https://via.placeholder.com/64x64/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`} 
                      alt={jogo.adversario} 
                      className="h-12 w-12 object-contain" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://via.placeholder.com/64x64/cccccc/666666?text=${jogo.adversario.substring(0, 3).toUpperCase()}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full flex items-center justify-center">
                      <Edit3 className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Clique para editar o logo do {jogo.adversario}</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
        
        {/* Content section */}
        <div className="p-6 space-y-4">
          <h4 className="font-bold text-xl text-professional-navy text-center mb-4">
            {jogo.local_jogo === 'fora' ? 
              `${jogo.adversario} × Flamengo` : 
              `Flamengo × ${jogo.adversario}`
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
                <span className="text-professional-slate text-xs">{formatDateTime(jogo.jogo_data)}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Local do Jogo</span>
                <span className="text-professional-slate text-xs">
                  {jogo.local_jogo === 'casa' ? 'Maracanã - Rio de Janeiro' : `Estádio do ${jogo.adversario}`}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <Ticket className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Ingressos Vendidos</span>
                <span className="font-bold text-professional-navy text-lg">{jogo.total_ingressos}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center text-professional-blue">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-professional-navy font-medium text-sm">Receita Total</span>
                <span className="font-bold text-professional-navy text-lg">{formatCurrency(jogo.receita_total)}</span>
              </div>
            </div>
          </div>

          {/* Resumo financeiro */}
          {jogo.total_ingressos > 0 && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-professional-navy">Lucro Total</span>
                <span className={`text-sm font-bold ${jogo.lucro_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(jogo.lucro_total)}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {jogo.ingressos_pagos > 0 && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                    {jogo.ingressos_pagos} pagos
                  </Badge>
                )}
                {jogo.ingressos_pendentes > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs">
                    {jogo.ingressos_pendentes} pendentes
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          {/* Status de pagamentos */}
          {jogo.total_ingressos > 0 && (
            <div className="bg-professional-light rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-professional-navy">Status dos Pagamentos</span>
                <span className="text-sm font-bold text-professional-blue">{jogo.ingressos_pagos}/{jogo.total_ingressos}</span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(percentualPagos, 100)}%` }}
                />
              </div>
              <div className="text-xs text-center text-professional-slate mt-1">
                {percentualPagos}% pagos
              </div>
            </div>
          )}

          {/* Empty state quando não há ingressos */}
          {jogo.total_ingressos === 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Ticket className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Nenhum ingresso vendido ainda</p>
            </div>
          )}
        </div>
        
        {/* Actions footer */}
        <div className="grid grid-cols-4 border-t border-gray-100">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none border-r border-gray-100 h-12 hover:bg-professional-blue hover:text-white transition-colors"
                onClick={() => onVerIngressos(jogo)}
              >
                <Eye className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {jogo.total_ingressos > 0 ? `Ver (${jogo.total_ingressos})` : 'Ver'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ver lista de ingressos vendidos para este jogo</TooltipContent>
          </Tooltip>
          
          {onNovoIngresso && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-none border-r border-gray-100 h-12 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => onNovoIngresso(jogo)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="text-xs">Novo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Criar novo ingresso para este jogo</TooltipContent>
            </Tooltip>
          )}
          
          {onExportarPDF && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="rounded-none border-r border-gray-100 h-12 hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => onExportarPDF(jogo)}
                  disabled={jogo.total_ingressos === 0}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  <span className="text-xs">PDF</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Exportar lista de clientes em PDF</TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="rounded-none h-12 text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => onDeletarJogo(jogo)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-xs">Deletar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deletar todos os ingressos deste jogo</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Modal de edição de logo */}
      <EditarLogoModal
        open={editarLogoOpen}
        onOpenChange={setEditarLogoOpen}
        jogo={jogo}
        onSuccess={() => {
          // Recarregar será feito automaticamente pelo hook
          // Aqui podemos adicionar feedback adicional se necessário
        }}
      />
    </TooltipProvider>
  );
}