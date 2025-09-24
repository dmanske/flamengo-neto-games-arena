import React from 'react';
import { Users, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PassageiroRow } from './PassageiroRow';
import type { GrupoPassageiros } from '@/types/grupos-passageiros';
import type { PassageiroDisplay } from '@/hooks/useViagemDetails';

interface GrupoPassageirosProps {
  grupo: GrupoPassageiros;
  index: number; // Para numeração sequencial
  onViewDetails?: (passageiro: PassageiroDisplay) => void;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
  onDesvincularCredito?: (passageiro: PassageiroDisplay) => void;
  onTrocarOnibus: (passageiro: PassageiroDisplay) => void;
  handlePagamento: (passageiroId: string, categoria: string, valor: number, formaPagamento?: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
}

export function GrupoPassageiros({
  grupo,
  index: startIndex,
  onViewDetails,
  onEditPassageiro,
  onDeletePassageiro,
  onDesvincularCredito,
  onTrocarOnibus,
  handlePagamento
}: GrupoPassageirosProps) {
  // Função para converter hex para rgba com transparência
  const hexToRgba = (hex: string, alpha: number = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Função para determinar se a cor é clara ou escura (para contraste do texto)
  const isLightColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  const backgroundColor = hexToRgba(grupo.cor, 0.05);
  const borderColor = hexToRgba(grupo.cor, 0.3);
  const textColor = isLightColor(grupo.cor) ? '#374151' : grupo.cor;

  return (
    <div 
      className="mb-6 rounded-lg border-2 overflow-hidden"
      style={{ 
        backgroundColor,
        borderColor,
        borderStyle: 'solid'
      }}
    >
      {/* Cabeçalho do Grupo */}
      <div 
        className="px-4 py-3 border-b"
        style={{ 
          backgroundColor: hexToRgba(grupo.cor, 0.1),
          borderBottomColor: borderColor
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full border-2"
              style={{ 
                backgroundColor: grupo.cor,
                borderColor: grupo.cor
              }}
            />
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: textColor }} />
              <h3 
                className="text-lg font-semibold"
                style={{ color: textColor }}
              >
                {grupo.nome}
              </h3>
            </div>
            <Badge 
              variant="secondary" 
              className="text-xs"
              style={{ 
                backgroundColor: hexToRgba(grupo.cor, 0.2),
                color: textColor,
                borderColor: grupo.cor
              }}
            >
              {grupo.total_membros} {grupo.total_membros === 1 ? 'membro' : 'membros'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm" style={{ color: textColor }}>
              <Palette className="h-4 w-4" />
              <span className="font-mono text-xs">{grupo.cor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Membros do Grupo */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {grupo.passageiros.map((passageiro, idx) => (
              <tr 
                key={passageiro.viagem_passageiro_id || passageiro.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-white/50 transition-colors"
              >
                <PassageiroRow
                  passageiro={passageiro}
                  index={startIndex + idx}
                  onViewDetails={onViewDetails}
                  onEditPassageiro={onEditPassageiro}
                  onDeletePassageiro={onDeletePassageiro}
                  onDesvincularCredito={onDesvincularCredito}
                  handlePagamento={handlePagamento}
                />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Rodapé do Grupo (opcional - para estatísticas) */}
      <div 
        className="px-4 py-2 text-xs border-t"
        style={{ 
          backgroundColor: hexToRgba(grupo.cor, 0.05),
          borderTopColor: borderColor,
          color: textColor
        }}
      >
        <div className="flex items-center justify-between">
          <span>
            Grupo: <strong>{grupo.nome}</strong>
          </span>
          <span>
            {grupo.total_membros} passageiro{grupo.total_membros !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}