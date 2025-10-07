import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { DespesaJogo, ResumoFinanceiroJogo } from '@/hooks/financeiro/useJogoFinanceiro';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Edit, Trash2, Receipt, TrendingDown, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DespesaJogoForm } from '../forms/DespesaJogoForm';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface DespesasJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  despesas: DespesaJogo[];
  resumoFinanceiro: ResumoFinanceiroJogo | null;
  onAdicionarDespesa: (despesa: Omit<DespesaJogo, 'id' | 'jogo_key' | 'created_at' | 'updated_at'>) => Promise<DespesaJogo>;
  onEditarDespesa: (id: string, despesa: Partial<DespesaJogo>) => Promise<DespesaJogo>;
  onExcluirDespesa: (id: string) => Promise<void>;
}

export function DespesasJogo({
  jogo,
  ingressos,
  despesas,
  resumoFinanceiro,
  onAdicionarDespesa,
  onEditarDespesa,
  onExcluirDespesa
}: DespesasJogoProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<DespesaJogo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [despesaToDelete, setDespesaToDelete] = useState<DespesaJogo | null>(null);

  // Calcular custos dos ingressos
  const custosIngressos = {
    total: ingressos.reduce((sum, ing) => sum + (ing.preco_custo || 0), 0),
    porSetor: ingressos.reduce((acc, ing) => {
      const setor = ing.setor_estadio;
      acc[setor] = (acc[setor] || 0) + (ing.preco_custo || 0);
      return acc;
    }, {} as Record<string, number>)
  };

  // Calcular despesas operacionais
  const despesasOperacionais = {
    total: despesas.reduce((sum, desp) => sum + desp.valor, 0),
    porTipo: despesas.reduce((acc, desp) => {
      acc[desp.tipo] = (acc[desp.tipo] || 0) + desp.valor;
      return acc;
    }, {} as Record<string, number>),
    porCategoria: despesas.reduce((acc, desp) => {
      acc[desp.categoria] = (acc[desp.categoria] || 0) + desp.valor;
      return acc;
    }, {} as Record<string, number>)
  };



  const handleNovaDespesa = () => {
    setEditingDespesa(null);
    setShowFormModal(true);
  };

  const handleEditarDespesa = (despesa: DespesaJogo) => {
    setEditingDespesa(despesa);
    setShowFormModal(true);
  };

  const handleExcluirDespesa = (despesa: DespesaJogo) => {
    setDespesaToDelete(despesa);
    setShowDeleteDialog(true);
  };

  const confirmDeleteDespesa = async () => {
    if (despesaToDelete) {
      await onExcluirDespesa(despesaToDelete.id);
      setDespesaToDelete(null);
    }
  };

  const handleSubmitDespesa = async (despesaData: Omit<DespesaJogo, 'id' | 'jogo_key' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      if (editingDespesa) {
        await onEditarDespesa(editingDespesa.id, despesaData);
      } else {
        await onAdicionarDespesa(despesaData);
      }
      setShowFormModal(false);
      setEditingDespesa(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo de Despesas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Custos dos Ingressos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(custosIngressos.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Preço de compra dos ingressos
                </p>
              </div>
              <Receipt className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Despesas Operacionais</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(despesasOperacionais.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {despesas.length} despesa{despesas.length !== 1 ? 's' : ''} registrada{despesas.length !== 1 ? 's' : ''}
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
                <p className="text-sm font-medium text-gray-600">Custo Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(custosIngressos.total + despesasOperacionais.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ingressos + Operacionais
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>



      {/* Custos por Setor */}
      {Object.keys(custosIngressos.porSetor).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Custos por Setor do Estádio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(custosIngressos.porSetor)
                .sort(([,a], [,b]) => b - a)
                .map(([setor, custo]) => (
                  <div key={setor} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h3 className="font-medium text-orange-800">{setor}</h3>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(custo)}
                    </p>
                    <p className="text-sm text-orange-700">
                      {ingressos.filter(ing => ing.setor_estadio === setor).length} ingresso{ingressos.filter(ing => ing.setor_estadio === setor).length !== 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Despesas Operacionais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Despesas Operacionais
            </CardTitle>
            <Button onClick={handleNovaDespesa} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {despesas.length > 0 ? (
            <div className="space-y-4">
              {/* Resumo por categoria */}
              {Object.keys(despesasOperacionais.porCategoria).length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(despesasOperacionais.porCategoria).map(([categoria, valor]) => (
                    <div key={categoria} className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-medium capitalize text-red-800">
                        Despesas {categoria === 'fixa' ? 'Fixas' : 'Variáveis'}
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(valor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumo por tipo */}
              {Object.keys(despesasOperacionais.porTipo).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                  {Object.entries(despesasOperacionais.porTipo).map(([tipo, valor]) => (
                    <div key={tipo} className="text-center p-3 bg-gray-50 rounded-lg border">
                      <div className="font-medium capitalize text-gray-800">
                        {tipo.replace('_', ' ')}
                      </div>
                      <div className="text-lg font-bold text-gray-600">
                        {formatCurrency(valor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabela de despesas */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesas.map((despesa) => (
                      <TableRow key={despesa.id}>
                        <TableCell>
                          {format(new Date(despesa.data_despesa), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {despesa.tipo.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={despesa.descricao}>
                            {despesa.descricao}
                          </div>
                          {despesa.observacoes && (
                            <div className="text-xs text-gray-500 truncate" title={despesa.observacoes}>
                              {despesa.observacoes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{despesa.fornecedor || '-'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={despesa.categoria === 'fixa' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {despesa.categoria}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(despesa.valor)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarDespesa(despesa)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirDespesa(despesa)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">💸</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma despesa operacional</h3>
              <p className="text-muted-foreground mb-4">
                Registre despesas como transporte, alimentação, comissões ou outros custos do jogo.
              </p>
              <Button onClick={handleNovaDespesa} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Despesa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulário de Despesa */}
      <DespesaJogoForm
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingDespesa(null);
        }}
        onSubmit={handleSubmitDespesa}
        editingDespesa={editingDespesa}
        jogoData={jogo.jogo_data}
        receitaTotal={resumoFinanceiro?.receita_total || jogo.receita_total}
        isLoading={isSubmitting}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDespesaToDelete(null);
        }}
        onConfirm={confirmDeleteDespesa}
        title="Excluir Despesa"
        description={despesaToDelete ? `Tem certeza que deseja excluir a despesa "${despesaToDelete.descricao}"?

💰 Valor: ${formatCurrency(despesaToDelete.valor)}
📅 Data: ${format(new Date(despesaToDelete.data_despesa), 'dd/MM/yyyy', { locale: ptBR })}
🏷️ Tipo: ${despesaToDelete.tipo.replace('_', ' ')}
📊 Categoria: ${despesaToDelete.categoria === 'fixa' ? 'Fixa' : 'Variável'}${despesaToDelete.fornecedor ? `
🏢 Fornecedor: ${despesaToDelete.fornecedor}` : ''}

⚠️ Esta ação não pode ser desfeita!` : ''}
        confirmText="Excluir Despesa"
        cancelText="Cancelar"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5 text-red-600" />}
      />
    </div>
  );
}