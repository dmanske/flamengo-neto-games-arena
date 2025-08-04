// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { converterStatusParaInteligente } from '@/lib/status-utils';
import { formatPhone } from '@/utils/formatters';
import { 
  Download, 
  FileText, 
  TrendingUp, 
  TrendingDown,
  Users,
  Receipt,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ViagemDespesa, ViagemPassageiro, ResumoFinanceiro } from '@/hooks/financeiro/useViagemFinanceiro';

interface RelatorioFinanceiroProps {
  viagemId: string;
  resumo: ResumoFinanceiro;
  despesas: ViagemDespesa[];
  passageiros: ViagemPassageiro[];
  adversario: string;
  dataJogo: string;
  // Novos props para sistema de passeios
  sistema?: 'novo' | 'antigo' | 'sem_dados';
  valorPasseios?: number;
  temPasseios?: boolean;
  // Todos os passageiros (não só pendentes)
  todosPassageiros?: any[];
}

export function RelatorioFinanceiro({ 
  viagemId, 
  resumo, 
  despesas, 
  passageiros, 
  adversario, 
  dataJogo,
  sistema = 'sem_dados',
  valorPasseios = 0,
  temPasseios = false,
  todosPassageiros = []
}: RelatorioFinanceiroProps) {
  
  const gerarRelatorioPDF = () => {
    // Implementar geração de PDF
    const printContent = document.getElementById('relatorio-financeiro');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório Financeiro - ${adversario}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; }
                .grid { display: grid; gap: 15px; }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-green-600 { color: #059669; }
                .text-red-600 { color: #dc2626; }
                .text-blue-600 { color: #2563eb; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const gerarRelatorioExcel = () => {
    // Implementar geração de Excel (CSV)
    const csvData = [
      ['Relatório Financeiro', adversario],
      ['Data do Jogo', new Date(dataJogo).toLocaleDateString()],
      [''],
      ['Resumo Financeiro'],
      ['Receita Total', resumo.total_receitas || 0],
      ['Despesas Totais', resumo.total_despesas || 0],
      ['Lucro Líquido', resumo.lucro_bruto || 0],
      [''],
      ['Despesas por Categoria'],
      ['Categoria', 'Valor', 'Quantidade'],
      ...Object.entries(despesasPorCategoria).map(([categoria, dados]) => [
        categoria.replace('_', ' '),
        dados.total,
        dados.quantidade
      ]),
      [''],
      ['Passageiros'],
      ['Nome', 'Telefone', 'Valor', 'Status'],
      ...passageiros.map(p => [
        p.nome,
        p.telefone,
        p.valor_total || 0,
        p.status_pagamento
      ])
    ];

    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio-financeiro-${adversario}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const despesasPorCategoria = despesas.reduce((acc, despesa) => {
    if (!acc[despesa.categoria]) {
      acc[despesa.categoria] = { total: 0, quantidade: 0 };
    }
    acc[despesa.categoria].total += despesa.valor;
    acc[despesa.categoria].quantidade += 1;
    return acc;
  }, {} as Record<string, { total: number; quantidade: number }>);

  const passageirosPorStatus = passageiros.reduce((acc, passageiro) => {
    if (!acc[passageiro.status_pagamento]) {
      acc[passageiro.status_pagamento] = { quantidade: 0, valor: 0 };
    }
    acc[passageiro.status_pagamento].quantidade += 1;
    acc[passageiro.status_pagamento].valor += passageiro.valor;
    return acc;
  }, {} as Record<string, { quantidade: number; valor: number }>);

  return (
    <div id="relatorio-financeiro" className="space-y-6">
      {/* Header do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Relatório Financeiro - {adversario}
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Data do Jogo: {new Date(dataJogo).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={gerarRelatorioPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button onClick={gerarRelatorioExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo Executivo */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
        sistema === 'novo' && temPasseios ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
      }`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.total_receitas || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {passageiros.length} passageiros
                </p>
                {sistema === 'novo' && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Viagem:</span>
                      <span>{formatCurrency(resumo.receitas_viagem || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Passeios:</span>
                      <span>{formatCurrency(resumo.receitas_passeios || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumo.despesas_total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {despesas.length} lançamentos
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${
                  (resumo.lucro_bruto || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(resumo.lucro_bruto || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margem: {resumo.total_receitas > 0 ? ((resumo.lucro_bruto || 0) / resumo.total_receitas * 100).toFixed(1) : 0}%
                </p>
                {sistema === 'novo' && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Margem Viagem:</span>
                      <span>
                        {resumo.receitas_viagem > 0 
                          ? (((resumo.receitas_viagem || 0) - (resumo.total_despesas || 0) * 0.7) / resumo.receitas_viagem * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Margem Passeios:</span>
                      <span>
                        {resumo.receitas_passeios > 0 
                          ? (((resumo.receitas_passeios || 0) - (resumo.total_despesas || 0) * 0.3) / resumo.receitas_passeios * 100).toFixed(1)
                          : 0
                        }%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Ocupação</p>
                <p className="text-2xl font-bold text-blue-600">
                  {((passageiros.length / 50) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {passageiros.length}/50 lugares
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Card específico para Passeios */}
        {sistema === 'novo' && temPasseios && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Performance Passeios</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {resumo.receitas_passeios > 0 
                      ? Math.round((resumo.receitas_passeios / (resumo.receitas_viagem + resumo.receitas_passeios)) * 100)
                      : 0
                    }%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Taxa de conversão
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Receita:</span>
                      <span>{formatCurrency(resumo.receitas_passeios || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Média/passageiro:</span>
                      <span>
                        {passageiros.length > 0 
                          ? formatCurrency((resumo.receitas_passeios || 0) / passageiros.length)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <Receipt className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(despesasPorCategoria).map(([categoria, dados]) => (
                <div key={categoria} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{categoria.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600">{dados.quantidade} lançamentos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(dados.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((dados.total / resumo.despesas_total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status dos Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(passageirosPorStatus).map(([status, dados]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={
                        status === 'Pago' 
                          ? 'bg-green-100 text-green-800' 
                          : status === 'Pendente'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }
                    >
                      {status}
                    </Badge>
                    <span className="text-sm">{dados.quantidade} passageiros</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatCurrency(dados.valor)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {((dados.valor / resumo.receita_total) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Análise de Passeios */}
        {sistema === 'novo' && temPasseios && (
          <Card>
            <CardHeader>
              <CardTitle>Análise de Passeios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-800">Receita Total</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(resumo.receitas_passeios || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-800">Taxa de Conversão</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {resumo.receitas_passeios > 0 
                        ? Math.round((resumo.receitas_passeios / (resumo.receitas_viagem + resumo.receitas_passeios)) * 100)
                        : 0
                      }%
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800">Receita Média</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {passageiros.length > 0 
                        ? formatCurrency((resumo.receitas_passeios || 0) / passageiros.length)
                        : formatCurrency(0)
                      }
                    </p>
                    <p className="text-xs text-green-700">por passageiro</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-3">Comparativo Viagem vs Passeios:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Receita Viagem</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((resumo.receitas_viagem || 0) / Math.max(resumo.receitas_viagem || 1, resumo.receitas_passeios || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(resumo.receitas_viagem || 0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Receita Passeios</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, ((resumo.receitas_passeios || 0) / Math.max(resumo.receitas_viagem || 1, resumo.receitas_passeios || 1)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{formatCurrency(resumo.receitas_passeios || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Seção de Análise de Performance e Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Análise de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800">ROI da Viagem</h4>
                  <p className="text-xl font-bold text-blue-600">
                    {resumo.total_receitas > 0 
                      ? (((resumo.lucro_bruto || 0) / resumo.total_receitas) * 100).toFixed(1)
                      : 0
                    }%
                  </p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium text-green-800">Eficiência</h4>
                  <p className="text-xl font-bold text-green-600">
                    {resumo.total_despesas > 0 
                      ? (resumo.total_receitas / resumo.total_despesas).toFixed(1)
                      : 0
                    }x
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Métricas por Passageiro:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Receita média:</span>
                    <span className="font-medium">
                      {passageiros.length > 0 
                        ? formatCurrency(resumo.total_receitas / passageiros.length)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo médio:</span>
                    <span className="font-medium">
                      {passageiros.length > 0 
                        ? formatCurrency(resumo.total_despesas / passageiros.length)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lucro médio:</span>
                    <span className="font-medium text-green-600">
                      {passageiros.length > 0 
                        ? formatCurrency((resumo.lucro_bruto || 0) / passageiros.length)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projeções e Metas */}
        <Card>
          <CardHeader>
            <CardTitle>Projeções e Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Potencial de Crescimento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Capacidade máxima:</span>
                    <span className="font-medium">50 passageiros</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ocupação atual:</span>
                    <span className="font-medium">{passageiros.length} ({((passageiros.length / 50) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Receita potencial:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((resumo.total_receitas / Math.max(passageiros.length, 1)) * 50)}
                    </span>
                  </div>
                </div>
              </div>
              
              {sistema === 'novo' && temPasseios && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Oportunidades de Passeios</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Taxa atual:</span>
                      <span className="font-medium">
                        {resumo.receitas_passeios > 0 
                          ? Math.round((resumo.receitas_passeios / (resumo.receitas_viagem + resumo.receitas_passeios)) * 100)
                          : 0
                        }%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meta sugerida:</span>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Receita adicional:</span>
                      <span className="font-medium text-purple-600">
                        {formatCurrency(Math.max(0, (resumo.receitas_viagem * 0.6) - (resumo.receitas_passeios || 0)))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Fornecedor</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Forma Pagamento</th>
                  <th className="text-right p-2">Valor</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      {new Date(despesa.data_despesa).toLocaleDateString()}
                    </td>
                    <td className="p-2 font-medium">{despesa.fornecedor}</td>
                    <td className="p-2 capitalize">
                      {despesa.categoria.replace('_', ' ')}
                      {despesa.subcategoria && (
                        <span className="text-gray-500 text-xs block">
                          {despesa.subcategoria.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-2">{despesa.forma_pagamento}</td>
                    <td className="p-2 text-right font-bold text-red-600">
                      {formatCurrency(despesa.valor)}
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        className={
                          despesa.status === 'pago' 
                            ? 'bg-green-100 text-green-800' 
                            : despesa.status === 'pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {despesa.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detalhamento de Passageiros */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Passageiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Nome</th>
                  <th className="text-left p-2">Telefone</th>
                  <th className="text-left p-2">Setor</th>
                  <th className="text-left p-2">Passeios</th>
                  <th className="text-right p-2">Valor</th>
                  <th className="text-right p-2">Desconto</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(todosPassageiros.length > 0 ? todosPassageiros : passageiros).map((passageiro) => (
                  <tr key={passageiro.viagem_passageiro_id || passageiro.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{passageiro.nome}</td>
                    <td className="p-2">{formatPhone(passageiro.telefone)}</td>
                    <td className="p-2">{passageiro.setor_maracana || '-'}</td>
                    <td className="p-2">
                      {sistema === 'novo' && passageiro.passeios && passageiro.passeios.length > 0 ? (
                        <div className="text-xs">
                          {passageiro.passeios.map((passeio: any, index: number) => (
                            <span key={index} className="inline-block mr-1 mb-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              {passeio.passeio_nome}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-2 text-right font-bold">
                      {formatCurrency(passageiro.valor_total || passageiro.valor || 0)}
                      {sistema === 'novo' && (passageiro.valor_viagem || passageiro.valor_passeios) && (
                        <div className="text-xs text-gray-500 mt-1">
                          V: {formatCurrency(passageiro.valor_viagem || 0)} | P: {formatCurrency(passageiro.valor_passeios || 0)}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-right text-red-600">
                      {(passageiro.desconto || 0) > 0 ? `-${formatCurrency(passageiro.desconto)}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      <Badge 
                        className={
                          passageiro.status_pagamento === 'Pago' || passageiro.status_pagamento === '🎁 Brinde'
                            ? 'bg-green-100 text-green-800' 
                            : passageiro.status_pagamento === 'Pendente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {passageiro.status_pagamento || 'Pendente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Rodapé do Relatório */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center text-sm text-gray-600">
            <p>Relatório gerado em {new Date().toLocaleString()}</p>
            <p className="mt-1">Sistema de Gestão de Viagens - Flamengo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}