import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Onibus {
  id: string;
  numero_identificacao?: string;
  tipo_onibus?: string;
  empresa?: string;
}

interface FiltroPassageirosProps {
  onibusList: Onibus[];
  filtroAtual: string;
  onFiltroChange: (filtro: string) => void;
  passageirosCount: Record<string, number>;
  totalPassageiros: number;
}

export const FiltroPassageiros: React.FC<FiltroPassageirosProps> = ({
  onibusList,
  filtroAtual,
  onFiltroChange,
  passageirosCount,
  totalPassageiros
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Destinatários:</Label>
      <Select value={filtroAtual} onValueChange={onFiltroChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Selecionar passageiros" />
        </SelectTrigger>
        <SelectContent className="bg-white border-gray-200 z-50">
          <SelectItem value="todos">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>Todos os passageiros</span>
              <span className="text-gray-500 text-sm">({totalPassageiros})</span>
            </div>
          </SelectItem>
          {onibusList.map(onibus => {
            const count = passageirosCount[onibus.id] || 0;
            const identificacao = onibus.numero_identificacao || 
              `${onibus.tipo_onibus || 'Ônibus'} - ${onibus.empresa || 'Empresa'}`;
            
            return (
              <SelectItem key={onibus.id} value={onibus.id}>
                <div className="flex items-center gap-2">
                  <span>🚌</span>
                  <span>{identificacao}</span>
                  <span className="text-gray-500 text-sm">({count})</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};