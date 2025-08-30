
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
  valorPadraoViagem?: number;
  quantidadeBrindes?: number;
  
  // Breakdown por categoria
  receitaViagem?: number;
  receitaPasseios?: number;
  pagoViagem?: number;
  pagoPasseios?: number;
  pendenteViagem?: number;
  pendentePasseios?: number;
  
  // Novo campo para total de descontos
  totalDescontosPassageiros?: number;
  // Novo campo para quantidade de passageiros com desconto
  quantidadeComDesconto?: number;
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
  valorPadraoViagem = 0,
  quantidadeBrindes = 0,
  
  // Breakdown por categoria
  receitaViagem = 0,
  receitaPasseios = 0,
  pagoViagem = 0,
  pagoPasseios = 0,
  pendenteViagem = 0,
  pendentePasseios = 0,
  
  // Novo campo para total de descontos
  totalDescontosPassageiros = 0,
  // Novo campo para quantidade de passageiros com desconto
  quantidadeComDesconto = 0,
}: FinancialSummaryProps) {
  // DEBUG: Verificar valores recebidos
  console.log('🎯 FinancialSummary recebeu:', {
    totalPendente,
    pendenteViagem,
    pendentePasseios,
    totalPago,
    pagoViagem,
    pagoPasseios
  });

  // Calculate percentage of bus occupation
  const percentualOcupacao = Math.round((totalPassageiros / capacidadeTotalOnibus) * 100);
  
  // Calculate passengers paying (excluding brindes)
  const passageirosPagantes = totalPassageiros - quantidadeBrindes;
  
  // Use the adjusted potential value that already considers discounts
  const valorTotalViagem = valorPotencialTotal;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
            {(quantidadeBrindes > 0 || quantidadeComDesconto > 0) && (
              <div>
                {quantidadeBrindes > 0 && (
                  <div className="flex justify-between text-xs text-gray-600 ml-2">
                    <span>• Brindes:</span>
                    <span>{quantidadeBrindes}</span>
                  </div>
                )}
                {quantidadeComDesconto > 0 && (
                  <div className="flex justify-between text-xs text-gray-600 ml-2">
                    <span>• Com Desconto:</span>
                    <span>{quantidadeComDesconto}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600 ml-2">
                  <span>• Pagantes:</span>
                  <span>{passageirosPagantes}</span>
                </div>
              </div>
            )}
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
          <h3 className="text-lg font-medium mb-2">Potencial da Viagem</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Potencial Ajustado:</span>
                <span className="font-medium text-blue-600">{formatCurrency(valorTotalViagem)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 ml-2">
                <span>• (Capacidade - brindes - descontos)</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor a Receber:</span>
                <span className="font-medium text-amber-600">{formatCurrency(Math.max(0, valorTotalViagem - totalArrecadado))}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 ml-2">
                <span>• (Valor total - valor já arrecadado)</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Percentual Arrecadado:</span>
                <span className="font-medium">
                  {valorTotalViagem > 0 ? Math.round((totalArrecadado / valorTotalViagem) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={valorTotalViagem > 0 ? Math.round((totalArrecadado / valorTotalViagem) * 100) : 0} 
                className="h-1" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
