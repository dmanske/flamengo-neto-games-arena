import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Trash2
} from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatCurrency } from '@/lib/utils';
import { useViagemFinanceiro } from '@/hooks/financeiro/useViagemFinanceiro';
import DashboardPendencias from './DashboardPendencias';
import SistemaCobranca from './SistemaCobranca';
import DespesaForm from './DespesaForm';
import ReceitaForm from './ReceitaForm';

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

  const {
    resumoFinanceiro,
    receitas,
    despesas,
    passageirosPendentes,
    isLoading,
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resumoFinanceiro?.total_receitas || 0)}
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
              <div>
                <p className="text-sm font-medium text-gray-600">Pendências</p>
                <p className="text-2xl font-bold text-orange-600">
                  {passageirosPendentes?.length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="cobranca">Cobrança</TabsTrigger>
          <TabsTrigger value="pendencias">Pendências</TabsTrigger>
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

        <TabsContent value="receitas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Todas as Receitas
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
              {despesas && despesas.length > 0 ? (
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
      </Tabs>

      {/* Modal de Nova/Editar Receita */}
      <ReceitaForm
        open={showReceitaForm}
        onOpenChange={handleCloseReceitaForm}
        viagemId={viagemId}
        onSalvar={editingReceita ? editarReceita : adicionarReceita}
        receita={editingReceita}
        isEditing={!!editingReceita}
      />

      {/* Modal de Nova/Editar Despesa */}
      <DespesaForm
        open={showDespesaForm}
        onOpenChange={handleCloseDespesaForm}
        viagemId={viagemId}
        onSalvar={editingDespesa ? editarDespesa : adicionarDespesa}
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