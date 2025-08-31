import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Plus,
  Download,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ContaPagar } from '@/hooks/useFinanceiroGeral';

interface ContasPagarTabProps {
  contasPagar: ContaPagar[];
}

export function ContasPagarTab({ contasPagar }: ContasPagarTabProps) {
  // Calcular totais por status
  const totalPago = contasPagar
    .filter(c => c.status === 'pago')
    .reduce((sum, conta) => sum + conta.valor, 0);
    
  const totalPendente = contasPagar
    .filter(c => c.status === 'pendente')
    .reduce((sum, conta) => sum + conta.valor, 0);
    
  const totalCancelado = contasPagar
    .filter(c => c.status === 'cancelado')
    .reduce((sum, conta) => sum + conta.valor, 0);

  const totalGeral = contasPagar.reduce((sum, conta) => sum + conta.valor, 0);

  // Agrupar por categoria
  const contasPorCategoria = contasPagar.reduce((acc, conta) => {
    if (!acc[conta.categoria]) {
      acc[conta.categoria] = [];
    }
    acc[conta.categoria].push(conta);
    return acc;
  }, {} as Record<string, ContaPagar[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200';
      case 'calculado': return 'bg-blue-100 text-blue-800 border-blue-200'; // ✨ NOVO: status para custos calculados
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="h-4 w-4" />;
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'cancelado': return <AlertTriangle className="h-4 w-4" />;
      case 'calculado': return <CheckCircle className="h-4 w-4" />; // ✨ NOVO: ícone para custos calculados
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'transporte': return 'bg-blue-100 text-blue-800';
      case 'hospedagem': return 'bg-purple-100 text-purple-800';
      case 'alimentacao': return 'bg-orange-100 text-orange-800';
      case 'ingressos': return 'bg-green-100 text-green-800';
      case 'pessoal': return 'bg-cyan-100 text-cyan-800';
      case 'administrativo': return 'bg-gray-100 text-gray-800';
      case 'passeios': return 'bg-pink-100 text-pink-800'; // ✨ NOVO: categoria para custos dos passeios
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Contas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Geral</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalGeral)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {contasPagar.length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPago)}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                {contasPagar.filter(c => c.status === 'pago').length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {contasPagar.filter(c => c.status === 'pendente').length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Pagamento</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalGeral > 0 ? ((totalPago / totalGeral) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                Eficiência
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(contasPorCategoria).map(([categoria, contas]) => {
              const totalCategoria = contas.reduce((sum, c) => sum + c.valor, 0);
              const percentual = totalGeral > 0 ? (totalCategoria / totalGeral) * 100 : 0;
              
              return (
                <div key={categoria} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoriaColor(categoria)}>
                      {categoria}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {contas.length} contas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(totalCategoria)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {percentual.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contas a Pagar</h3>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
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

      {/* Lista de Contas */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fornecedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Viagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contasPagar.map((conta) => (
                  <tr key={conta.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {conta.fornecedor}
                        {/* ✨ NOVO: Indicador visual para custos calculados */}
                        {conta.status === 'calculado' && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Automático
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {conta.descricao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getCategoriaColor(conta.categoria)}>
                        {conta.categoria}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {conta.viagem_nome || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(conta.valor)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(conta.data_vencimento).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(conta.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(conta.status)}
                          {conta.status}
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* ✨ NOVO: Não mostrar ações para custos calculados */}
                        {conta.status !== 'calculado' ? (
                          <>
                            <Button size="sm" variant="outline">
                              Editar
                            </Button>
                            {conta.status === 'pendente' && (
                              <Button size="sm">
                                Pagar
                              </Button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500 italic">
                            Custo automático
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {contasPagar.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta a pagar
            </h3>
            <p className="text-gray-600">
              Não há contas registradas no período selecionado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}