import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  MapPin, 
  Plane,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ResumoGeral } from '@/hooks/useFinanceiroGeral';

interface ReceitasBreakdownCardProps {
  resumoGeral: ResumoGeral | null;
  isLoading?: boolean;
}

export function ReceitasBreakdownCard({ resumoGeral, isLoading }: ReceitasBreakdownCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Breakdown de Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!resumoGeral) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Breakdown de Receitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum dado disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categorias = [
    {
      nome: 'Viagens',
      valor: resumoGeral.receitas_viagem || 0,
      percentual: resumoGeral.percentual_viagem || 0,
      icon: Plane,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800'
    },
    {
      nome: 'Passeios',
      valor: resumoGeral.receitas_passeios || 0,
      percentual: resumoGeral.percentual_passeios || 0,
      icon: MapPin,
      color: 'bg-green-500',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800'
    },
    {
      nome: 'Extras',
      valor: resumoGeral.receitas_extras || 0,
      percentual: resumoGeral.percentual_extras || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Breakdown de Receitas
        </CardTitle>
        <div className="text-sm text-gray-600">
          Total: {formatCurrency(resumoGeral.total_receitas)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {categorias.map((categoria) => {
            const Icon = categoria.icon;
            
            return (
              <div key={categoria.nome} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full ${categoria.bgColor}`}>
                      <Icon className={`h-4 w-4 ${categoria.textColor}`} />
                    </div>
                    <span className="font-medium text-gray-900">{categoria.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(categoria.valor)}
                    </span>
                    <Badge className={`${categoria.bgColor} ${categoria.textColor}`}>
                      {categoria.percentual.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                
                <Progress 
                  value={categoria.percentual} 
                  className="h-2"
                  style={{
                    '--progress-background': categoria.color
                  } as React.CSSProperties}
                />
                
                <div className="text-xs text-gray-500 text-right">
                  {categoria.percentual.toFixed(1)}% do total
                </div>
              </div>
            );
          })}
          
          {/* Resumo Visual */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Distribuição:</span>
              <div className="flex gap-1">
                {categorias.map((categoria) => (
                  <div
                    key={categoria.nome}
                    className={`h-2 rounded ${categoria.color}`}
                    style={{ width: `${Math.max(categoria.percentual * 2, 8)}px` }}
                    title={`${categoria.nome}: ${categoria.percentual.toFixed(1)}%`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}