import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { converterStatusParaInteligente } from '@/lib/status-utils';
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
}

export function RelatorioFinanceiro({ 
  viagemId, 
  resumo, 
  despesas, 
  passageiros, 
  adversario, 
  dataJogo 
}: RelatorioFinanceiroProps) {
  
  const gerarRelatorioPDF = () => {
    // TODO: Implementar geração de PDF
    console.log('Gerando relatório PDF...');
  };

  const gerarRelatorioExcel = () => {
    // TODO: Implementar geração de Excel
    console.log('Gerando relatório Excel...');
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
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumo.receita_total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {passageiros.length} passageiros
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
              <div>
                <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                <p className={`text-2xl font-bold ${
                  resumo.lucro_liquido >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(resumo.lucro_liquido)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margem: {((resumo.lucro_liquido / resumo.receita_total) * 100).toFixed(1)}%
                </p>
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
                  <th className="text-right p-2">Valor</th>
                  <th className="text-right p-2">Desconto</th>
                  <th className="text-center p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {passageiros.map((passageiro) => (
                  <tr key={passageiro.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{passageiro.nome}</td>
                    <td className="p-2">{passageiro.telefone}</td>
                    <td className="p-2">{passageiro.setor_maracana || '-'}</td>
                    <td className="p-2 text-right font-bold">
                      {formatCurrency(passageiro.valor)}
                    </td>
                    <td className="p-2 text-right text-red-600">
                      {passageiro.desconto > 0 ? `-${formatCurrency(passageiro.desconto)}` : '-'}
                    </td>
                    <td className="p-2 text-center">
                      {(() => {
                        const statusInteligente = converterStatusParaInteligente({
                          valor: passageiro.valor || 0,
                          desconto: passageiro.desconto || 0,
                          parcelas: passageiro.parcelas,
                          status_pagamento: passageiro.status_pagamento
                        });
                        
                        return (
                          <Badge className={statusInteligente.cor} title={statusInteligente.descricao}>
                            {statusInteligente.status}
                          </Badge>
                        );
                      })()}
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