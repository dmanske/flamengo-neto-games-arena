import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { FluxoCaixaItem } from '@/hooks/useFinanceiroGeral';

interface FluxoCaixaTabProps {
  fluxoCaixa: FluxoCaixaItem[];
}

export function FluxoCaixaTab({ fluxoCaixa }: FluxoCaixaTabProps) {
  // Calcular totais
  const totalEntradas = fluxoCaixa
    .filter(item => item.tipo === 'entrada')
    .reduce((sum, item) => sum + item.valor, 0);
    
  const totalSaidas = fluxoCaixa
    .filter(item => item.tipo === 'saida')
    .reduce((sum, item) => sum + item.valor, 0);
    
  const saldoLiquido = totalEntradas - totalSaidas;

  // Agrupar por data
  const fluxoPorData = fluxoCaixa.reduce((acc, item) => {
    const data = item.data;
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(item);
    return acc;
  }, {} as Record<string, FluxoCaixaItem[]>);

  const getCategoriaColor = (categoria: string, tipo: 'entrada' | 'saida') => {
    if (tipo === 'entrada') {
      switch (categoria) {
        case 'passageiro': return 'bg-green-100 text-green-800';
        case 'ingressos': return 'bg-red-100 text-red-800'; // ✨ NOVO: Receitas de ingressos
        case 'patrocinio': return 'bg-blue-100 text-blue-800';
        case 'vendas': return 'bg-purple-100 text-purple-800';
        case 'extras': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (categoria) {
        case 'transporte': return 'bg-red-100 text-red-800';
        case 'hospedagem': return 'bg-pink-100 text-pink-800';
        case 'alimentacao': return 'bg-yellow-100 text-yellow-800';
        case 'ingressos': return 'bg-red-200 text-red-900'; // ✨ MELHORADO: Custos de ingressos mais escuros
        case 'passeios': return 'bg-purple-100 text-purple-800'; // ✨ NOVO: Custos de passeios
        case 'pessoal': return 'bg-cyan-100 text-cyan-800';
        case 'administrativo': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo do Fluxo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                <p className={`text-2xl font-bold ${
                  saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(saldoLiquido)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Movimentações</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Lista de Movimentações */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {Object.entries(fluxoPorData)
              .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
              .map(([data, items]) => (
                <div key={data} className="border-b border-gray-100 last:border-0">
                  {/* Header da Data */}
                  <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {new Date(data).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">
                          +{formatCurrency(items.filter(i => i.tipo === 'entrada').reduce((s, i) => s + i.valor, 0))}
                        </span>
                        <span className="text-red-600">
                          -{formatCurrency(items.filter(i => i.tipo === 'saida').reduce((s, i) => s + i.valor, 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Movimentações do Dia */}
                  <div className="divide-y divide-gray-100">
                    {items.map((item, index) => (
                      <div key={index} className="px-6 py-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              item.tipo === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {item.tipo === 'entrada' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-900">{item.descricao}</h5>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={getCategoriaColor(item.categoria, item.tipo)}>
                                  {item.categoria}
                                </Badge>
                                {item.viagem_nome && (
                                  <span className="text-sm text-gray-500">
                                    {item.viagem_nome}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-semibold ${
                              item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.tipo === 'entrada' ? '+' : '-'}{formatCurrency(item.valor)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {fluxoCaixa.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma movimentação encontrada
            </h3>
            <p className="text-gray-600">
              Não há movimentações financeiras no período selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}