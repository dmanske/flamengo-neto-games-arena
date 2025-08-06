// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  AlertTriangle,
  Plus,
  Eye,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Users
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { useViagemFinanceiro } from '@/hooks/financeiro/useViagemFinanceiro';
import DashboardPendencias from './DashboardPendencias';
import SistemaCobranca from './SistemaCobranca';
import DespesaForm from './DespesaForm';
import ReceitaForm from './ReceitaForm';
import { RelatorioFinanceiro } from './RelatorioFinanceiro';

interface FinanceiroViagemProps {
  viagemId: string;
}

export function FinanceiroViagem({ viagemId }: FinanceiroViagemProps) {
  // Verificação de segurança
  if (!viagemId) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-700">❌ Erro: ID da viagem não fornecido</p>
      </div>
    );
  }

  // Hook próprio - SIMPLES E DIRETO
  const {
    viagem,
    resumoFinanceiro,
    receitas,
    despesas,
    passageirosPendentes,
    todosPassageiros,
    isLoading,
    sistema,
    valorPasseios,
    temPasseios,
    shouldUseNewSystem,
    adicionarReceita,
    editarReceita,
    excluirReceita,
    adicionarDespesa,
    editarDespesa,
    excluirDespesa,
    registrarCobranca,
    fetchAllData
  } = useViagemFinanceiro(viagemId);

  const [showReceitaForm, setShowReceitaForm] = useState(false);
  const [showDespesaForm, setShowDespesaForm] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [editingReceita, setEditingReceita] = useState<any>(null);
  const [editingDespesa, setEditingDespesa] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {}
  });

  const gerarRelatorio = (tipo: 'completo' | 'pendencias') => {
    // TODO: Implementar geração de relatórios
    console.log('Gerando relatório:', tipo);
  };

  const handleEditReceita = (receita: any) => {
    setEditingReceita(receita);
    setShowReceitaForm(true);
  };

  const handleEditDespesa = (despesa: any) => {
    setEditingDespesa(despesa);
    setShowDespesaForm(true);
  };

  const handleDeleteReceita = (receita: any) => {
    setConfirmDialog({
      open: true,
      title: 'Excluir Receita',
      description: `Tem certeza que deseja excluir a receita "${receita.descricao}" no valor de ${formatCurrency(receita.valor)}? Esta ação não pode ser desfeita.`,
      onConfirm: () => excluirReceita(receita.id)
    });
  };

  const handleDeleteDespesa = (despesa: any) => {
    setConfirmDialog({
      open: true,
      title: 'Excluir Despesa',
      description: `Tem certeza que deseja excluir a despesa "${despesa.fornecedor}" no valor de ${formatCurrency(despesa.valor)}? Esta ação não pode ser desfeita.`,
      onConfirm: () => excluirDespesa(despesa.id)
    });
  };

  const handleCloseReceitaForm = () => {
    setShowReceitaForm(false);
    setEditingReceita(null);
  };

  const handleCloseDespesaForm = () => {
    setShowDespesaForm(false);
    setEditingDespesa(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
                </p>
                {shouldUseNewSystem && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Viagem:</span>
                      <span>{formatCurrency(resumoFinanceiro?.receitas_viagem || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Passeios:</span>
                      <span>{formatCurrency(resumoFinanceiro?.receitas_passeios || 0)}</span>
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
                <p className="text-sm font-medium text-gray-600">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(resumoFinanceiro?.total_despesas || 0)}
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
                  (resumoFinanceiro?.lucro_bruto || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(resumoFinanceiro?.lucro_bruto || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pendências</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(resumoFinanceiro?.total_pendencias || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {passageirosPendentes?.length || 0} passageiros
                </p>
                {shouldUseNewSystem && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Viagem:</span>
                      <span>{formatCurrency(resumoFinanceiro?.pendencias_viagem || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Passeios:</span>
                      <span>{formatCurrency(resumoFinanceiro?.pendencias_passeios || 0)}</span>
                    </div>
                  </div>
                )}
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        {/* Novo Card - Taxa de Conversão de Passeios */}
        {shouldUseNewSystem && temPasseios && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {resumoFinanceiro?.receitas_passeios > 0 
                      ? Math.round((resumoFinanceiro.receitas_passeios / (resumoFinanceiro.receitas_viagem + resumoFinanceiro.receitas_passeios)) * 100)
                      : 0
                    }%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Passageiros com passeios
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Novo Card - Receita Média por Passageiro */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Média</p>
                <p className="text-2xl font-bold text-purple-600">
                  {passageirosPendentes?.length > 0 
                    ? formatCurrency((resumoFinanceiro?.receitas_viagem + resumoFinanceiro?.receitas_passeios) / passageirosPendentes.length)
                    : formatCurrency(0)
                  }
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Por passageiro
                </p>
                {shouldUseNewSystem && temPasseios && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Viagem:</span>
                      <span>
                        {passageirosPendentes?.length > 0 
                          ? formatCurrency((resumoFinanceiro?.receitas_viagem || 0) / passageirosPendentes.length)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Passeios:</span>
                      <span>
                        {passageirosPendentes?.length > 0 
                          ? formatCurrency((resumoFinanceiro?.receitas_passeios || 0) / passageirosPendentes.length)
                          : formatCurrency(0)
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setShowReceitaForm(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Receita
        </Button>
        
        <Button 
          onClick={() => setShowDespesaForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => gerarRelatorio('completo')}
        >
          <Download className="h-4 w-4 mr-2" />
          Relatório Completo
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => gerarRelatorio('pendencias')}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Pendências
        </Button>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="pendencias">Pendências</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Receitas vs Despesas */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Receitas</span>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ((resumoFinanceiro?.total_receitas || 0) / Math.max(resumoFinanceiro?.total_receitas || 1, resumoFinanceiro?.total_despesas || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Despesas</span>
                    <span className="text-red-600 font-bold">
                      {formatCurrency(resumoFinanceiro?.total_despesas || 0)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(100, ((resumoFinanceiro?.total_despesas || 0) / Math.max(resumoFinanceiro?.total_receitas || 1, resumoFinanceiro?.total_despesas || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status dos Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Pagos</Badge>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(resumoFinanceiro?.total_receitas - resumoFinanceiro?.total_pendencias || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Pendentes</Badge>
                    </div>
                    <span className="font-medium">
                      {resumoFinanceiro?.count_pendencias || 0} passageiros
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Inadimplência</Badge>
                    </div>
                    <span className="font-medium">
                      {resumoFinanceiro?.taxa_inadimplencia?.toFixed(1) || 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Últimas Despesas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Últimas Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {despesas && despesas.length > 0 ? (
                <div className="space-y-3">
                  {despesas.slice(0, 5).map((despesa) => (
                    <div key={despesa.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{despesa.fornecedor}</p>
                        <p className="text-sm text-gray-600">
                          {despesa.categoria} • {new Date(despesa.data_despesa).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {formatCurrency(despesa.valor)}
                        </p>
                        <Badge 
                          className={
                            despesa.status === 'pago' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {despesa.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma despesa registrada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receitas" className="space-y-6">
          {/* Seção de Receitas Automáticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Receitas Automáticas (Passageiros)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800">Receita de Viagem</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(resumoFinanceiro?.receitas_viagem || 0)}
                  </p>
                </div>
                {shouldUseNewSystem && temPasseios && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-medium text-green-800">Receita de Passeios</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(resumoFinanceiro?.receitas_passeios || 0)}
                    </p>
                  </div>
                )}
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-medium text-purple-800">Total Passageiros</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency((resumoFinanceiro?.receitas_viagem || 0) + (resumoFinanceiro?.receitas_passeios || 0))}
                  </p>
                </div>
              </div>
              
              {passageirosPendentes && passageirosPendentes.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700 mb-3">Detalhamento por Passageiro:</h4>
                  {passageirosPendentes.slice(0, 5).map((passageiro) => (
                    <div key={passageiro.viagem_passageiro_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{passageiro.nome}</p>
                        <p className="text-sm text-gray-600">{formatPhone(passageiro.telefone)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {formatCurrency(passageiro.valor_total)}
                        </p>
                        {shouldUseNewSystem && temPasseios && (
                          <p className="text-xs text-gray-500">
                            V: {formatCurrency(passageiro.valor_viagem)} | P: {formatCurrency(passageiro.valor_passeios)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {passageirosPendentes.length > 5 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      +{passageirosPendentes.length - 5} outros passageiros
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum passageiro cadastrado ainda
                </p>
              )}
            </CardContent>
          </Card>

          {/* Seção de Receitas Manuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Receitas Manuais (Extras)
                </span>
                <Button 
                  onClick={() => setShowReceitaForm(true)}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receitas && receitas.length > 0 ? (
                <div className="space-y-3">
                  {receitas.map((receita) => (
                    <div key={receita.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{receita.descricao}</p>
                            <p className="text-sm text-gray-600">
                              {receita.categoria}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(receita.data_recebimento).toLocaleDateString()} • {receita.forma_pagamento}
                            </p>
                          </div>
                        </div>
                        {receita.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{receita.observacoes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(receita.valor)}
                          </p>
                          <Badge 
                            className={
                              receita.status === 'recebido' 
                                ? 'bg-green-100 text-green-800' 
                                : receita.status === 'pendente'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }
                          >
                            {receita.status}
                          </Badge>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditReceita(receita)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteReceita(receita)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma receita registrada</p>
                  <Button 
                    onClick={() => setShowReceitaForm(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Receita
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parcelas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Controle Detalhado de Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {passageirosPendentes && passageirosPendentes.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h3 className="font-medium text-blue-800">Total de Passageiros</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {passageirosPendentes.length}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-medium text-green-800">Valor Recebido</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(passageirosPendentes.reduce((sum, p) => sum + p.valor_pago, 0))}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h3 className="font-medium text-red-800">Valor Pendente</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(passageirosPendentes.reduce((sum, p) => sum + p.valor_pendente, 0))}
                      </p>
                    </div>
                  </div>

                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg font-medium">Controle Detalhado de Parcelas</p>
                    <p className="text-sm">
                      Selecione um passageiro na aba "Cobrança" para ver o histórico detalhado de suas parcelas
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">🎉 Todos os pagamentos em dia!</p>
                  <p>Não há parcelas pendentes no momento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cobranca">
          <SistemaCobranca 
            passageirosPendentes={passageirosPendentes}
            onRegistrarCobranca={registrarCobranca}
          />
        </TabsContent>

        <TabsContent value="despesas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Todas as Despesas
                </span>
                <Button 
                  onClick={() => setShowDespesaForm(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>

              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando despesas...</span>
                </div>
              ) : despesas && despesas.length > 0 ? (
                <div className="space-y-3">
                  {despesas.map((despesa) => (
                    <div key={despesa.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{despesa.fornecedor}</p>
                            <p className="text-sm text-gray-600">
                              {despesa.categoria}
                              {despesa.subcategoria && ` - ${despesa.subcategoria}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(despesa.data_despesa).toLocaleDateString()} • {despesa.forma_pagamento}
                            </p>
                          </div>
                        </div>
                        {despesa.observacoes && (
                          <p className="text-sm text-gray-600 mt-2">{despesa.observacoes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold text-lg text-red-600">
                            {formatCurrency(despesa.valor)}
                          </p>
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
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDespesa(despesa)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteDespesa(despesa)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Nenhuma despesa registrada</p>
                  <Button onClick={() => setShowDespesaForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Despesa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pendencias">
          <DashboardPendencias 
            passageirosPendentes={passageirosPendentes}
            onRegistrarCobranca={registrarCobranca}
          />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatorioFinanceiro
            viagemId={viagemId}
            resumo={resumoFinanceiro}
            despesas={despesas}
            passageiros={passageirosPendentes}
            adversario={viagem?.adversario || 'Adversário'}
            dataJogo={viagem?.data_jogo || new Date().toISOString()}
            sistema={sistema}
            valorPasseios={valorPasseios}
            temPasseios={temPasseios}
            todosPassageiros={todosPassageiros}
            capacidadeTotal={viagem?.capacidade_onibus || 50}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Nova/Editar Receita */}
      <ReceitaForm
        open={showReceitaForm}
        onOpenChange={handleCloseReceitaForm}
        viagemId={viagemId}
        onSalvar={editingReceita ? (receita: any) => editarReceita(editingReceita.id, receita) : adicionarReceita}
        receita={editingReceita}
        isEditing={!!editingReceita}
      />

      {/* Modal de Nova/Editar Despesa */}
      <DespesaForm
        open={showDespesaForm}
        onOpenChange={handleCloseDespesaForm}
        viagemId={viagemId}
        onSalvar={editingDespesa ? (despesa: any) => editarDespesa(editingDespesa.id, despesa) : adicionarDespesa}
        despesa={editingDespesa}
        isEditing={!!editingDespesa}
      />

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}