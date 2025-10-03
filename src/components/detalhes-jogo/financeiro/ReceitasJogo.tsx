import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { ReceitaJogo, ResumoFinanceiroJogo } from '@/hooks/financeiro/useJogoFinanceiro';
import { formatCurrency } from '@/utils/formatters';
import { Plus, Edit, Trash2, Users, DollarSign, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReceitasJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  receitas: ReceitaJogo[];
  resumoFinanceiro: ResumoFinanceiroJogo | null;
  onAdicionarReceita: (receita: Omit<ReceitaJogo, 'id' | 'created_at' | 'updated_at'>) => Promise<ReceitaJogo>;
  onEditarReceita: (id: string, receita: Partial<ReceitaJogo>) => Promise<ReceitaJogo>;
  onExcluirReceita: (id: string) => Promise<void>;
}

export function ReceitasJogo({
  jogo,
  ingressos,
  receitas,
  resumoFinanceiro,
  onAdicionarReceita,
  onEditarReceita,
  onExcluirReceita
}: ReceitasJogoProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReceita, setEditingReceita] = useState<ReceitaJogo | null>(null);

  // Calcular receitas automáticas dos ingressos
  const receitasIngressos = {
    total: resumoFinanceiro?.receita_ingressos_total || jogo.receita_total,
    paga: ingressos.filter(ing => ing.situacao_financeira === 'pago').reduce((sum, ing) => sum + ing.valor_final, 0),
    pendente: ingressos.filter(ing => ing.situacao_financeira === 'pendente').reduce((sum, ing) => sum + ing.valor_final, 0)
  };

  // Calcular totais das receitas manuais
  const receitasManuais = {
    total: receitas.reduce((sum, rec) => sum + rec.valor, 0),
    porTipo: receitas.reduce((acc, rec) => {
      acc[rec.tipo] = (acc[rec.tipo] || 0) + rec.valor;
      return acc;
    }, {} as Record<string, number>)
  };

  const handleNovaReceita = () => {
    setEditingReceita(null);
    setShowFormModal(true);
  };

  const handleEditarReceita = (receita: ReceitaJogo) => {
    setEditingReceita(receita);
    setShowFormModal(true);
  };

  const handleExcluirReceita = async (receita: ReceitaJogo) => {
    if (confirm(`Tem certeza que deseja excluir a receita "${receita.descricao}"?`)) {
      await onExcluirReceita(receita.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo de Receitas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receitas de Ingressos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(receitasIngressos.total)}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>• Pago:</span>
                    <span className="text-green-600">{formatCurrency(receitasIngressos.paga)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>• Pendente:</span>
                    <span className="text-yellow-600">{formatCurrency(receitasIngressos.pendente)}</span>
                  </div>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receitas Extras</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(receitasManuais.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {receitas.length} receita{receitas.length !== 1 ? 's' : ''} manual{receitas.length !== 1 ? 's' : ''}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(receitasIngressos.total + receitasManuais.total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ingressos + Extras
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Receitas Automáticas (Ingressos) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Receitas Automáticas (Ingressos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Resumo por status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800">Ingressos Pagos</h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(receitasIngressos.paga)}
                </p>
                <p className="text-sm text-green-700">
                  {jogo.ingressos_pagos} de {jogo.total_ingressos} ingressos
                </p>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-medium text-yellow-800">Ingressos Pendentes</h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(receitasIngressos.pendente)}
                </p>
                <p className="text-sm text-yellow-700">
                  {jogo.ingressos_pendentes} ingressos pendentes
                </p>
              </div>
            </div>

            {/* Lista resumida de clientes (top 5) */}
            {ingressos.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Principais Clientes:</h4>
                <div className="space-y-2">
                  {ingressos
                    .sort((a, b) => b.valor_final - a.valor_final)
                    .slice(0, 5)
                    .map((ingresso) => (
                      <div key={ingresso.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{ingresso.cliente?.nome}</p>
                          <p className="text-sm text-gray-600">
                            {ingresso.setor_estadio} • {ingresso.situacao_financeira}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {formatCurrency(ingresso.valor_final)}
                          </p>
                          <Badge 
                            variant={ingresso.situacao_financeira === 'pago' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {ingresso.situacao_financeira}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {ingressos.length > 5 && (
                    <p className="text-sm text-gray-500 text-center py-2">
                      +{ingressos.length - 5} outros ingressos
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seção de Receitas Manuais */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receitas Extras
            </CardTitle>
            <Button onClick={handleNovaReceita} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Receita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {receitas.length > 0 ? (
            <div className="space-y-4">
              {/* Resumo por tipo */}
              {Object.keys(receitasManuais.porTipo).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(receitasManuais.porTipo).map(([tipo, valor]) => (
                    <div key={tipo} className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="font-medium capitalize text-blue-800">
                        {tipo.replace('_', ' ')}
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(valor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tabela de receitas */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitas.map((receita) => (
                      <TableRow key={receita.id}>
                        <TableCell>
                          {format(new Date(receita.data_receita), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {receita.tipo.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={receita.descricao}>
                            {receita.descricao}
                          </div>
                          {receita.observacoes && (
                            <div className="text-xs text-gray-500 truncate" title={receita.observacoes}>
                              {receita.observacoes}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(receita.valor)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditarReceita(receita)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExcluirReceita(receita)}
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
              <div className="text-4xl mb-2">💰</div>
              <h3 className="text-lg font-medium mb-2">Nenhuma receita extra</h3>
              <p className="text-muted-foreground mb-4">
                Adicione receitas extras como patrocínios, comissões ou vendas adicionais.
              </p>
              <Button onClick={handleNovaReceita} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Receita
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Implementar modais de formulário */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">
              {editingReceita ? 'Editar Receita' : 'Nova Receita'}
            </h3>
            <p className="text-gray-600 mb-4">
              Formulário de receita será implementado aqui.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFormModal(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowFormModal(false)}>
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}