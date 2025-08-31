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
  Users,
  Calculator
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { useViagemFinanceiro } from '@/hooks/financeiro/useViagemFinanceiro';
import { useListaPresenca } from '@/hooks/useListaPresenca';
import DashboardPendenciasNovo from './DashboardPendenciasNovo';
import ListaClientes from './ListaClientes';

import DespesaForm from './DespesaForm';
import ReceitaForm from './ReceitaForm';
import { RelatorioFinanceiro } from './RelatorioFinanceiro';

interface FinanceiroViagemProps {
  viagemId: string;
  onDataUpdate?: () => Promise<void>; // Função para atualizar dados da página principal
}

export function FinanceiroViagem({ viagemId, onDataUpdate }: FinanceiroViagemProps) {
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
    capacidadeTotal,
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
  } = useViagemFinanceiro(viagemId, onDataUpdate);

  // ✨ NOVO: Hook para dados de presença corretos
  const { dadosPresenca, loading: loadingPresenca } = useListaPresenca(viagemId);

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
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Despesas Totais</p>
                <p className="text-2xl font-bold text-red-600">
                  {(() => {
                    const totalDespesasResumo = resumoFinanceiro?.total_despesas || 0;
                    const totalDespesasArray = despesas?.reduce((sum, d) => sum + d.valor, 0) || 0;
                    const custos_passeios = resumoFinanceiro?.custos_passeios || 0;
                    
                    console.log('🔍 DEBUG Despesas:', {
                      totalDespesasResumo,
                      totalDespesasArray,
                      custos_passeios,
                      despesasCount: despesas?.length || 0,
                      resumoFinanceiro: resumoFinanceiro ? 'existe' : 'null'
                    });
                    
                    // Usar o valor do resumo se disponível, senão calcular
                    return formatCurrency(totalDespesasResumo || totalDespesasArray);
                  })()}
                </p>
                {resumoFinanceiro?.custos_passeios > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Operacionais:</span>
                      <span>{formatCurrency(resumoFinanceiro?.despesas_operacionais || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Custos Passeios:</span>
                      <span>{formatCurrency(resumoFinanceiro?.custos_passeios || 0)}</span>
                    </div>
                  </div>
                )}
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
                  (() => {
                    const receitas = resumoFinanceiro?.total_receitas || 0;
                    const totalDespesas = resumoFinanceiro?.total_despesas || 
                                         (despesas?.reduce((sum, d) => sum + d.valor, 0) || 0);
                    const lucro = receitas - totalDespesas;
                    return lucro >= 0 ? 'text-green-600' : 'text-red-600';
                  })()
                }`}>
                  {formatCurrency(
                    resumoFinanceiro?.lucro_bruto || 
                    ((resumoFinanceiro?.total_receitas || 0) - 
                     (resumoFinanceiro?.total_despesas || 
                      (despesas?.reduce((sum, d) => sum + d.valor, 0) || 0)))
                  )}
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

        {/* Novo Card - Lucro dos Passeios */}
        {shouldUseNewSystem && temPasseios && resumoFinanceiro?.receitas_passeios > 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">Lucro Passeios</p>
                  <p className={`text-2xl font-bold ${
                    (resumoFinanceiro?.lucro_passeios || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(resumoFinanceiro?.lucro_passeios || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Margem: {(resumoFinanceiro?.margem_passeios || 0).toFixed(1)}%
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Receita:</span>
                      <span>{formatCurrency(resumoFinanceiro?.receitas_passeios || 0)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>• Custos:</span>
                      <span>{formatCurrency(resumoFinanceiro?.custos_passeios || 0)}</span>
                    </div>
                  </div>
                </div>
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        )}


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
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="clientes">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="pendencias">Pendências</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="graficos" className="space-y-6">
          {/* Grid 3x2 com os 6 Gráficos Estratégicos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            
            {/* 1. 📈 Fluxo de Caixa Temporal - Timeline */}
            <Card className="col-span-1 lg:col-span-2 xl:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Fluxo de Caixa Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <div className="space-y-4">
                    {/* Timeline com marcos temporais */}
                    <div className="relative">
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Criação</span>
                        <span>Hoje</span>
                        <span>Jogo</span>
                      </div>
                      
                      {/* Linha temporal */}
                      <div className="relative h-4 bg-gray-200 rounded-full">
                        <div className="absolute h-4 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full" 
                             style={{ width: '70%' }}></div>
                        
                        {/* Marcos na timeline */}
                        <div className="absolute top-0 left-0 w-2 h-4 bg-green-600 rounded-full"></div>
                        <div className="absolute top-0 left-[70%] w-2 h-4 bg-blue-600 rounded-full"></div>
                        <div className="absolute top-0 right-0 w-2 h-4 bg-purple-600 rounded-full"></div>
                      </div>
                    </div>

                    {/* Métricas de fluxo acumulado */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <p className="text-xs text-green-700 font-medium">Entradas</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
                        </p>
                        <p className="text-xs text-green-600">↗ Acumulado</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <p className="text-xs text-red-700 font-medium">Saídas</p>
                        <p className="text-lg font-bold text-red-600">
                          {formatCurrency(resumoFinanceiro?.total_despesas || 0)}
                        </p>
                        <p className="text-xs text-red-600">↘ Acumulado</p>
                      </div>
                    </div>

                    {/* Saldo atual */}
                    <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <p className="text-xs text-gray-600 font-medium">Saldo Atual</p>
                      <p className={`text-2xl font-bold ${
                        (resumoFinanceiro?.lucro_bruto || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(resumoFinanceiro?.lucro_bruto || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(resumoFinanceiro?.lucro_bruto || 0) >= 0 ? '✅ Positivo' : '❌ Negativo'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. 🥧 Categorias de Despesas - Pizza Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-red-600" />
                  Categorias de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {despesas && despesas.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        const categorias = despesas.reduce((acc, despesa) => {
                          const cat = despesa.categoria || 'outros';
                          if (!acc[cat]) acc[cat] = 0;
                          acc[cat] += despesa.valor;
                          return acc;
                        }, {} as Record<string, number>);
                        
                        const total = Object.values(categorias).reduce((sum, val) => sum + val, 0);
                        const cores = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];
                        
                        return Object.entries(categorias)
                          .sort(([,a], [,b]) => b - a)
                          .slice(0, 6)
                          .map(([categoria, valor], index) => {
                            const percentual = ((valor / total) * 100);
                            return (
                              <div key={categoria} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full ${cores[index]}`}></div>
                                  <span className="text-sm capitalize font-medium">
                                    {categoria.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-gray-800">
                                    {formatCurrency(valor)}
                                  </span>
                                  <div className="text-xs text-gray-500">
                                    {percentual.toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                            );
                          });
                      })()}
                      
                      {/* Total das despesas */}
                      <div className="border-t pt-3 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-700">Total Despesas:</span>
                          <span className="font-bold text-red-600 text-lg">
                            {formatCurrency(resumoFinanceiro?.total_despesas || 0)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-1">
                          Inclui custos operacionais + custos de passeios
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nenhuma despesa registrada</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 3. 📊 Resumo da Viagem - Cidades, Ingressos, Presença */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Resumo da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {todosPassageiros && todosPassageiros.length > 0 ? (
                    <div className="space-y-4">
                      {/* Presença e Participação - Layout Limpo */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {loadingPresenca ? '...' : dadosPresenca.presentes}
                          </div>
                          <div className="text-sm font-medium text-green-700 mb-1">Embarcaram</div>
                          <div className="text-xs text-green-600">
                            {loadingPresenca ? '...' : `${dadosPresenca.taxa_presenca.toFixed(0)}% presença`}
                          </div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {loadingPresenca ? '...' : 
                              dadosPresenca.total_passageiros - dadosPresenca.presentes - dadosPresenca.ausentes
                            }
                          </div>
                          <div className="text-sm font-medium text-red-700 mb-1">Pendentes</div>
                          <div className="text-xs text-red-600">
                            {loadingPresenca ? '...' : `${(100 - dadosPresenca.taxa_presenca).toFixed(0)}% faltam`}
                          </div>
                        </div>
                      </div>



                      {/* Principais Cidades e Setores - Layout Compacto */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Cidades */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-700 text-center">🏙️ Cidades</h4>
                          {(() => {
                            const cidadeStats = (todosPassageiros || []).reduce((acc, p) => {
                              const cidade = p.cidade_embarque || 'Não informada';
                              if (!acc[cidade]) acc[cidade] = 0;
                              acc[cidade] += 1;
                              return acc;
                            }, {} as Record<string, number>);

                            const cidadesOrdenadas = Object.entries(cidadeStats)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 2);

                            if (cidadesOrdenadas.length === 0) {
                              return <p className="text-xs text-gray-500 text-center">Nenhuma cidade</p>;
                            }

                            return cidadesOrdenadas.map(([cidade, quantidade], index) => (
                              <div key={cidade} className="text-center p-2 bg-purple-50 rounded border border-purple-200">
                                <div className="text-sm font-medium text-purple-700 truncate" title={cidade}>
                                  {cidade}
                                </div>
                                <div className="text-xs text-purple-600">
                                  {quantidade} passageiro{quantidade !== 1 ? 's' : ''}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>

                        {/* Setores */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-gray-700 text-center">🎫 Setores</h4>
                          {(() => {
                            const setorStats = (todosPassageiros || []).reduce((acc, p) => {
                              const setor = p.setor_maracana || 'Não informado';
                              if (!acc[setor]) acc[setor] = 0;
                              acc[setor] += 1;
                              return acc;
                            }, {} as Record<string, number>);

                            const setoresOrdenados = Object.entries(setorStats)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 2);

                            if (setoresOrdenados.length === 0) {
                              return <p className="text-xs text-gray-500 text-center">Nenhum setor</p>;
                            }

                            return setoresOrdenados.map(([setor, quantidade], index) => (
                              <div key={setor} className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                                <div className="text-sm font-medium text-orange-700 truncate" title={setor}>
                                  {setor}
                                </div>
                                <div className="text-xs text-orange-600">
                                  {quantidade} ingresso{quantidade !== 1 ? 's' : ''}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>


                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Nenhum passageiro cadastrado</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 4. 🎯 Status de Pagamentos - Donut */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Status de Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <div className="space-y-4">
                    {/* Donut visual simples */}
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative">
                        {(() => {
                          const totalReceitas = resumoFinanceiro?.total_receitas || 0;
                          const totalPendencias = resumoFinanceiro?.total_pendencias || 0;
                          const percentualPago = totalReceitas > 0 ? ((totalReceitas - totalPendencias) / totalReceitas) * 100 : 0;
                          
                          return (
                            <>
                              <div 
                                className="absolute inset-0 rounded-full border-8 border-green-500"
                                style={{
                                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + (percentualPago / 100) * 50}% 0%, 100% 100%, 0% 100%)`
                                }}
                              ></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {percentualPago.toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-gray-500">Pago</div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Legenda */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Pagos</span>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency((resumoFinanceiro?.total_receitas || 0) - (resumoFinanceiro?.total_pendencias || 0))}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span className="text-sm font-medium">Pendentes</span>
                        </div>
                        <span className="font-bold text-yellow-600">
                          {formatCurrency(resumoFinanceiro?.total_pendencias || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Resumo */}
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <span className="text-sm text-blue-700">
                        {resumoFinanceiro?.count_pendencias || 0} passageiros pendentes
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. 💹 Breakdown da Margem - Waterfall */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Breakdown da Margem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <div className="space-y-4">
                    {/* Cascata visual */}
                    <div className="space-y-3">
                      {/* Receita Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">💰 Receita Total</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-3">
                        <div className="bg-green-600 h-3 rounded-full w-full"></div>
                      </div>
                      
                      {/* Despesas Operacionais */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">🚌 Despesas Operacionais</span>
                        <span className="font-bold text-red-600">
                          -{formatCurrency(resumoFinanceiro?.despesas_operacionais || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-3">
                        <div 
                          className="bg-red-600 h-3 rounded-full" 
                          style={{ 
                            width: `${resumoFinanceiro?.total_receitas > 0 
                              ? Math.min(100, ((resumoFinanceiro?.despesas_operacionais || 0) / resumoFinanceiro.total_receitas) * 100)
                              : 0}%` 
                          }}
                        ></div>
                      </div>

                      {/* Custos dos Passeios */}
                      {resumoFinanceiro?.custos_passeios > 0 && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">🎢 Custos dos Passeios</span>
                            <span className="font-bold text-orange-600">
                              -{formatCurrency(resumoFinanceiro?.custos_passeios || 0)}
                            </span>
                          </div>
                          <div className="w-full bg-orange-200 rounded-full h-3">
                            <div 
                              className="bg-orange-600 h-3 rounded-full" 
                              style={{ 
                                width: `${resumoFinanceiro?.total_receitas > 0 
                                  ? Math.min(100, ((resumoFinanceiro?.custos_passeios || 0) / resumoFinanceiro.total_receitas) * 100)
                                  : 0}%` 
                              }}
                            ></div>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* Resultado Final */}
                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">🎯 Lucro Líquido</span>
                        <span className={`font-bold text-xl ${
                          (resumoFinanceiro?.lucro_bruto || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(resumoFinanceiro?.lucro_bruto || 0)}
                        </span>
                      </div>
                      
                      <div className="text-center p-2 bg-blue-50 rounded mt-2">
                        <span className="text-xs text-gray-600">Margem de Lucro: </span>
                        <span className="font-bold text-blue-600">
                          {resumoFinanceiro?.total_receitas > 0 
                            ? (((resumoFinanceiro?.lucro_bruto || 0) / resumoFinanceiro.total_receitas) * 100).toFixed(1)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. 🌍 Receita por Origem - Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  Receita por Origem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {shouldUseNewSystem && temPasseios ? (
                    <div className="space-y-4">
                      {/* Heatmap visual */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            <span className="text-sm font-medium">Receita Viagem</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-blue-600">
                              {formatCurrency(resumoFinanceiro?.receitas_viagem || 0)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {resumoFinanceiro?.total_receitas > 0 
                                ? (((resumoFinanceiro?.receitas_viagem || 0) / resumoFinanceiro.total_receitas) * 100).toFixed(1)
                                : 0}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-4">
                          <div 
                            className="bg-blue-600 h-4 rounded-full flex items-center justify-center"
                            style={{ 
                              width: `${resumoFinanceiro?.total_receitas > 0 
                                ? ((resumoFinanceiro?.receitas_viagem || 0) / resumoFinanceiro.total_receitas) * 100
                                : 0}%` 
                            }}
                          >
                            <span className="text-xs text-white font-bold">Viagem</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-500"></div>
                            <span className="text-sm font-medium">Receita Passeios</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-purple-600">
                              {formatCurrency(resumoFinanceiro?.receitas_passeios || 0)}
                            </span>
                            <div className="text-xs text-gray-500">
                              {resumoFinanceiro?.total_receitas > 0 
                                ? (((resumoFinanceiro?.receitas_passeios || 0) / resumoFinanceiro.total_receitas) * 100).toFixed(1)
                                : 0}%
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-4">
                          <div 
                            className="bg-purple-600 h-4 rounded-full flex items-center justify-center"
                            style={{ 
                              width: `${resumoFinanceiro?.total_receitas > 0 
                                ? ((resumoFinanceiro?.receitas_passeios || 0) / resumoFinanceiro.total_receitas) * 100
                                : 0}%` 
                            }}
                          >
                            <span className="text-xs text-white font-bold">Passeios</span>
                          </div>
                        </div>
                      </div>

                      {/* Taxa de conversão */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">Taxa de Conversão Passeios</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {(() => {
                              // Calcular baseado nos passageiros que realmente compraram passeios
                              // Usar a mesma lógica da lista de passageiros
                              const totalPassageiros = todosPassageiros?.length || 0;
                              
                              const passageirosComPasseios = todosPassageiros?.filter(p => {
                                // Verificar se tem passeios válidos (mesmo critério do PasseiosSimples)
                                const passeios = p.passeios || [];
                                const passeiosValidos = passeios.filter(passeio => 
                                  passeio.passeio_nome && 
                                  passeio.passeio_nome.trim() !== '' &&
                                  (passeio.valor_cobrado || 0) > 0
                                );
                                return passeiosValidos.length > 0;
                              }).length || 0;
                              
                              console.log('🔍 DEBUG Taxa Conversão:', {
                                totalPassageiros,
                                passageirosComPasseios,
                                primeiroPassageiro: todosPassageiros?.[0],
                                passeiosPrimeiroPassageiro: todosPassageiros?.[0]?.passeios
                              });
                              
                              return totalPassageiros > 0 
                                ? Math.round((passageirosComPasseios / totalPassageiros) * 100)
                                : 0;
                            })()}%
                          </p>
                          <p className="text-xs text-gray-500">dos passageiros compraram passeios</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {(() => {
                              const totalPassageiros = todosPassageiros?.length || 0;
                              const passageirosComPasseios = todosPassageiros?.filter(p => {
                                const passeios = p.passeios || [];
                                const passeiosValidos = passeios.filter(passeio => 
                                  passeio.passeio_nome && 
                                  passeio.passeio_nome.trim() !== '' &&
                                  (passeio.valor_cobrado || 0) > 0
                                );
                                return passeiosValidos.length > 0;
                              }).length || 0;
                              
                              return `${passageirosComPasseios} de ${totalPassageiros} passageiros`;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Sistema Antigo</p>
                        <p className="text-xs text-gray-500">Apenas receita de viagem disponível</p>
                        <div className="mt-3 p-2 bg-blue-100 rounded">
                          <span className="text-sm font-bold text-blue-700">
                            {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
              {/* Mostrar resumo das despesas primeiro (carrega instantaneamente) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-medium text-red-800">Total de Despesas</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(
                      resumoFinanceiro?.total_despesas || 
                      (despesas?.reduce((sum, d) => sum + d.valor, 0) || 0)
                    )}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800">Quantidade</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {despesas?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">despesas registradas</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800">Média por Despesa</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {(() => {
                      const total = resumoFinanceiro?.total_despesas || 
                                   (despesas?.reduce((sum, d) => sum + d.valor, 0) || 0);
                      const quantidade = despesas?.length || 0;
                      return quantidade > 0 ? formatCurrency(total / quantidade) : formatCurrency(0);
                    })()}
                  </p>
                </div>
              </div>

              {/* Lista detalhada das despesas */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-3">Detalhamento das Despesas:</h4>
              </div>
              
              {isLoading && (!despesas || despesas.length === 0) ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Carregando despesas...</span>
                </div>
              ) : despesas && despesas.length > 0 ? (
                <div className="space-y-4">
                  {/* ✨ NOVO: Separar despesas manuais e automáticas */}
                  {(() => {
                    const despesasManuais = despesas.filter(d => !d.isVirtual);
                    const despesasPasseios = despesas.filter(d => d.isVirtual);
                    
                    return (
                      <>
                        {/* Despesas dos Passeios (Automáticas) */}
                        {despesasPasseios.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <Calculator className="h-4 w-4 text-blue-600" />
                              <h5 className="font-medium text-blue-800">Custos dos Passeios (Automático)</h5>
                              <Badge className="bg-blue-100 text-blue-800">
                                {despesasPasseios.length} passeio(s)
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {despesasPasseios.map((despesa) => (
                                <div key={despesa.id} className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                      <Calculator className="h-5 w-5 text-blue-600" />
                                      <div>
                                        <p className="font-medium text-blue-900">{despesa.fornecedor}</p>
                                        <p className="text-sm text-blue-700">
                                          {despesa.categoria}
                                          {despesa.subcategoria && ` - ${despesa.subcategoria}`}
                                        </p>
                                        <p className="text-xs text-blue-600">
                                          Calculado automaticamente • {despesa.forma_pagamento}
                                        </p>
                                      </div>
                                    </div>
                                    {despesa.observacoes && (
                                      <p className="text-sm text-blue-700 mt-2 ml-8">{despesa.observacoes}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <p className="font-bold text-lg text-blue-700">
                                        {formatCurrency(despesa.valor)}
                                      </p>
                                      <Badge className="bg-blue-200 text-blue-800">
                                        Automático
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Despesas Manuais */}
                        {despesasManuais.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Receipt className="h-4 w-4 text-gray-600" />
                              <h5 className="font-medium text-gray-800">Despesas Manuais</h5>
                              <Badge className="bg-gray-100 text-gray-800">
                                {despesasManuais.length} despesa(s)
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {despesasManuais.map((despesa) => (
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
                          </div>
                        )}
                      </>
                    );
                  })()}
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

        <TabsContent value="clientes">
          <ListaClientes 
            todosPassageiros={todosPassageiros}
            onRegistrarCobranca={registrarCobranca}
          />
        </TabsContent>

        <TabsContent value="pendencias">
          <DashboardPendenciasNovo 
            passageirosPendentes={passageirosPendentes}
            onRegistrarCobranca={registrarCobranca}
          />
        </TabsContent>

        <TabsContent value="resumo">
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
            capacidadeTotal={capacidadeTotal}
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