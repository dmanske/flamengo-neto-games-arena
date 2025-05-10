
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface FinancialSummaryProps {
  totalArrecadado: number;
  totalPendente: number;
  totalPago: number;
  percentualPagamento: number;
  totalPassageiros: number;
}

export function FinancialSummary({ 
  totalArrecadado, 
  totalPendente, 
  totalPago, 
  percentualPagamento,
  totalPassageiros 
}: FinancialSummaryProps) {
  // Formatar valor para exibição em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-800 font-medium">Total Arrecadado</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalArrecadado)}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-800 font-medium">Valor Pago</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalPago)}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-amber-800 font-medium">Valor Pendente</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalPendente)}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Status de Pagamentos</span>
            <span className="text-sm font-bold">{percentualPagamento}%</span>
          </div>
          <Progress value={percentualPagamento} className="h-2" />
        </div>

        <div className="flex justify-between text-sm text-muted-foreground mt-4">
          <div>Total de passageiros: {totalPassageiros}</div>
          <div>Média por passageiro: {totalPassageiros > 0 ? formatCurrency(totalArrecadado / totalPassageiros) : formatCurrency(0)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
