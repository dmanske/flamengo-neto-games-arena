
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
  totalReceitas?: number; // Total de receitas registradas no sistema financeiro
  totalDespesas?: number; // Total de despesas registradas no sistema financeiro
  totalDescontos?: number; // Total de descontos dados na viagem
  valorBrutoTotal?: number; // Valor total antes dos descontos
}

export function FinancialSummary({
  totalArrecadado,
  totalPago,
  totalPendente,
  percentualPagamento,
  totalPassageiros,
  valorPotencialTotal,
  capacidadeTotalOnibus,
  totalReceitas = 0,
  totalDespesas = 0,
  totalDescontos = 0,
  valorBrutoTotal = 0,
}: FinancialSummaryProps) {
  // Calculate percentage of bus occupation (safe division)
  const percentualOcupacao = capacidadeTotalOnibus > 0 
    ? Math.round((totalPassageiros / capacidadeTotalOnibus) * 100) 
    : 0;
  
  // Calculate financial metrics
  const lucroLiquido = totalReceitas - totalDespesas;
  const valorRestantePotencial = Math.max(0, valorPotencialTotal - totalArrecadado);
  const percentualArrecadado = valorPotencialTotal > 0 
    ? Math.round((totalArrecadado / valorPotencialTotal) * 100) 
    : 0;
  
  // Calculate average ticket price
  const ticketMedio = totalPassageiros > 0 
    ? totalArrecadado / totalPassageiros 
    : 0;
  
  // Calculate efficiency metrics
  const eficienciaPagamento = totalArrecadado > 0 
    ? Math.round((totalPago / totalArrecadado) * 100) 
    : 0;
  
  // Show warning if no passengers
  if (totalPassageiros === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-amber-800">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Nenhum passageiro cadastrado</span>
        </div>
        <p className="text-amber-700 text-sm mt-1">
          Adicione passageiros para visualizar o resumo financeiro da viagem.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Financeiro</h3>
          <div className="space-y-4">
            {valorBrutoTotal > 0 && totalDescontos > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Valor Bruto:</span>
                  <span className="font-medium text-gray-600">{formatCurrency(valorBrutoTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Descontos Dados:</span>
                  <span className="font-medium text-red-600">-{formatCurrency(totalDescontos)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Valor Líquido:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(totalArrecadado)}</span>
                  </div>
                </div>
              </div>
            )}
            {!(valorBrutoTotal > 0 && totalDescontos > 0) && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Valor Arrecadado:</span>
                  <span className="font-medium">{formatCurrency(totalArrecadado)}</span>
                </div>
              </div>
            )}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Pago:</span>
                <span className="font-medium text-green-600">{formatCurrency(totalPago)}</span>
              </div>
              <Progress value={totalArrecadado > 0 ? Math.round((totalPago / totalArrecadado) * 100) : 0} className="h-1" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Valor Pendente:</span>
                <span className="font-medium text-amber-600">{formatCurrency(totalPendente)}</span>
              </div>
            </div>
            {(totalReceitas > 0 || totalDespesas > 0) && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-1">
                  <span>Receitas Registradas:</span>
                  <span className="font-medium text-green-600">{formatCurrency(totalReceitas)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Despesas Registradas:</span>
                  <span className="font-medium text-red-600">{formatCurrency(totalDespesas)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Lucro Líquido:</span>
                  <span className={`font-medium ${lucroLiquido >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(lucroLiquido)}
                  </span>
                </div>
              </div>
            )}
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
                <span className={`font-medium ${
                  percentualOcupacao >= 100 ? 'text-red-600' : 
                  percentualOcupacao >= 80 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {percentualOcupacao}%
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Ticket Médio:</span>
                <span className="font-medium text-blue-600">{formatCurrency(ticketMedio)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-2">Potencial da Viagem</h3>
          <div className="space-y-4">
            {/* Valor Potencial Total */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-800 font-medium">Valor Potencial Total:</span>
                <span className="font-bold text-blue-600">{formatCurrency(valorPotencialTotal)}</span>
              </div>
              <div className="text-xs text-blue-600">
                {capacidadeTotalOnibus} lugares × valor médio
              </div>
            </div>
            
            {/* Valor Efetivo (Passageiros Cadastrados) */}
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-800 font-medium">Valor Efetivo Cadastrado:</span>
                <span className="font-bold text-green-600">{formatCurrency(totalArrecadado)}</span>
              </div>
              <div className="text-xs text-green-600">
                {totalPassageiros} passageiros cadastrados
              </div>
            </div>
            
            {/* Taxa de Ocupação */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taxa de Ocupação:</span>
                <span className={`font-medium ${
                  percentualOcupacao >= 90 ? 'text-green-600' : 
                  percentualOcupacao >= 70 ? 'text-blue-600' : 
                  percentualOcupacao >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {percentualOcupacao}%
                </span>
              </div>
              <Progress 
                value={percentualOcupacao} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {totalPassageiros} de {capacidadeTotalOnibus} lugares ocupados
              </div>
            </div>
            
            {/* Percentual Arrecadado (dos cadastrados) */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Arrecadação (dos cadastrados):</span>
                <span className={`font-medium ${
                  eficienciaPagamento >= 100 ? 'text-green-600' : 
                  eficienciaPagamento >= 80 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  {eficienciaPagamento}%
                </span>
              </div>
              <Progress 
                value={eficienciaPagamento} 
                className="h-2"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formatCurrency(totalPago)} pagos de {formatCurrency(totalArrecadado)} cadastrados
              </div>
            </div>
            
            {/* Potencial Restante */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Potencial Restante:</span>
                <span className="font-medium text-gray-600">
                  {formatCurrency(valorPotencialTotal - totalArrecadado)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {capacidadeTotalOnibus - totalPassageiros} lugares disponíveis
              </div>
            </div>
            
            {totalDescontos > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                💡 Economia total de {formatCurrency(totalDescontos)} em descontos aplicados
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
