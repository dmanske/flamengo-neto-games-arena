import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Percent } from 'lucide-react';
import { IndicadorFinanceiro } from '@/types/financeiro';
import { formatCurrency } from '@/utils/formatters';

interface IndicadoresFinanceirosProps {
  indicadores: IndicadorFinanceiro;
  loading?: boolean;
}

export const IndicadoresFinanceiros: React.FC<IndicadoresFinanceirosProps> = ({
  indicadores,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getLucroColor = (lucro: number) => {
    if (lucro > 0) return 'text-green-600';
    if (lucro < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMargemColor = (margem: number) => {
    if (margem >= 20) return 'text-green-600';
    if (margem >= 10) return 'text-yellow-600';
    if (margem >= 0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Receita Total */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Receita Total
          </CardTitle>
          <div className="p-2 bg-green-100 rounded-full">
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(indicadores.receita_total)}
          </div>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>Entradas do período</span>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Total */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Despesas Total
          </CardTitle>
          <div className="p-2 bg-red-100 rounded-full">
            <TrendingDown className="h-4 w-4 text-red-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(indicadores.despesa_total)}
          </div>
          <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
            <TrendingDown className="h-3 w-3" />
            <span>Saídas do período</span>
          </div>
        </CardContent>
      </Card>

      {/* Lucro Líquido */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Lucro Líquido
          </CardTitle>
          <div className={`p-2 rounded-full ${
            indicadores.lucro_liquido >= 0 ? 'bg-blue-100' : 'bg-red-100'
          }`}>
            <TrendingUp className={`h-4 w-4 ${
              indicadores.lucro_liquido >= 0 ? 'text-blue-600' : 'text-red-600'
            }`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getLucroColor(indicadores.lucro_liquido)}`}>
            {formatCurrency(indicadores.lucro_liquido)}
          </div>
          <div className="flex items-center gap-1 text-xs mt-1">
            <Percent className="h-3 w-3" />
            <span className={getMargemColor(indicadores.margem_lucro)}>
              Margem: {indicadores.margem_lucro.toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Contas a Vencer */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">
            Alertas Financeiros
          </CardTitle>
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Contas vencidas:</span>
              <span className={`font-bold ${
                indicadores.contas_vencidas > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {indicadores.contas_vencidas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Vencem em 30 dias:</span>
              <span className={`font-bold ${
                indicadores.contas_a_vencer_30_dias > 0 ? 'text-amber-600' : 'text-green-600'
              }`}>
                {indicadores.contas_a_vencer_30_dias}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};