
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

export interface FinancialSummaryProps {
  totalArrecadado: number;
  totalPago: number;
  totalPendente: number;
  percentualPagamento: number;
  totalPassageiros: number;
  valorPotencialTotal: number;
  capacidadeTotalOnibus: number; // Renamed from capacidadeOnibus to align with DetalhesViagem.tsx
  totalReceitas?: number;
  totalDespesas?: number;
  totalDescontos?: number;
  valorBrutoTotal?: number;
  valorPasseios?: number;
  sistemaPasseios?: 'novo' | 'antigo' | 'sem_dados';
}

export function FinancialSummary({
  totalArrecadado,
  totalPago,
  totalPendente,
  percentualPagamento,
  totalPassageiros,
  valorPotencialTotal,
  capacidadeTotalOnibus,
  totalReceitas,
  totalDespesas,
  totalDescontos,
  valorBrutoTotal,
  valorPasseios = 0,
  sistemaPasseios = 'sem_dados',
}: FinancialSummaryProps) {
  // Calculate percentage of bus occupation
  const percentualOcupacao = Math.round((totalPassageiros / capacidadeTotalOnibus) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Financeiro</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Arrecadado:</span>
                <span className="font-medium">{formatCurrency(totalArrecadado)}</span>
              </div>
              {sistemaPasseios === 'novo' && valorPasseios > 0 && (
                <div className="flex justify-between text-xs text-gray-600 ml-2">
                  <span>• Receita Passeios:</span>
                  <span>{formatCurrency(valorPasseios)}</span>
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Pago:</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPago)}</span>
              </div>
              <Progress value={percentualPagamento} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Pendente:</span>
                <span className="font-medium text-amber-600">{formatCurrency(totalPendente)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Ocupação</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Passageiros Confirmados:</span>
                <span className="font-medium">{totalPassageiros} de {capacidadeTotalOnibus}</span>
              </div>
              <Progress value={percentualOcupacao} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxa de Ocupação:</span>
                <span className="font-medium">{percentualOcupacao}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Potencial</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Total Potencial:</span>
                <span className="font-medium">{formatCurrency(valorPotencialTotal)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Restante Potencial:</span>
                <span className="font-medium">{formatCurrency(valorPotencialTotal - totalArrecadado)}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Percentual Arrecadado:</span>
                <span className="font-medium">
                  {valorPotencialTotal > 0 ? Math.round((totalArrecadado / valorPotencialTotal) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={valorPotencialTotal > 0 ? Math.round((totalArrecadado / valorPotencialTotal) * 100) : 0} 
                className="h-1" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
