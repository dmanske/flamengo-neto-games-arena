import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CreditCard, FileText, DollarSign, Edit3, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Credito } from '@/types/creditos';
import { formatCurrency } from '@/utils/formatters';

interface HistoricoPagamentoCredito {
  id: string;
  credito_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
  created_at: string;
}

interface HistoricoPagamentosCreditoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito: Credito;
  historicoPagamentos: HistoricoPagamentoCredito[];
  onDeletarPagamento?: (pagamentoId: string) => Promise<boolean>;
  onEditarPagamento?: (pagamento: HistoricoPagamentoCredito) => void;
  onNovoPagamento?: () => void;
}

export const HistoricoPagamentosCreditoModal: React.FC<HistoricoPagamentosCreditoModalProps> = ({
  open,
  onOpenChange,
  credito,
  historicoPagamentos,
  onDeletarPagamento,
  onEditarPagamento,
  onNovoPagamento
}) => {
  const [pagamentoParaDeletar, setPagamentoParaDeletar] = useState<string | null>(null);

  // Calcular totais
  const totalPago = historicoPagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
  const saldoRestante = credito.valor_credito - totalPago;
  const percentualPago = credito.valor_credito > 0 ? (totalPago / credito.valor_credito) * 100 : 0;

  const getFormaPagamentoLabel = (forma: string) => {
    const formas: Record<string, string> = {
      'dinheiro': 'Dinheiro',
      'pix': 'PIX',
      'cartao_credito': 'Cartão de Crédito',
      'cartao_debito': 'Cartão de Débito',
      'transferencia_bancaria': 'Transferência Bancária',
      'boleto': 'Boleto',
      'outros': 'Outros'
    };
    return formas[forma] || forma.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Pagamentos do Crédito
          </DialogTitle>
          <DialogDescription>
            Histórico completo de pagamentos do crédito de <strong>{credito.cliente?.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor do Crédito
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(credito.valor_credito)}
                </div>
                <div className="text-sm text-gray-500">
                  Tipo: {credito.tipo_credito}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPago)}
                </div>
                <div className="text-sm text-gray-500">
                  {historicoPagamentos.length} pagamento(s)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Saldo Restante
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-2xl font-bold ${
                  saldoRestante <= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(saldoRestante)}
                </div>
                <div className="text-sm text-gray-500">
                  {saldoRestante <= 0 ? 'Quitado' : 'Pendente'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-purple-600">
                  {percentualPago.toFixed(1)}%
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(percentualPago, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botão para Novo Pagamento */}
          {saldoRestante > 0 && onNovoPagamento && (
            <div className="flex justify-end">
              <Button onClick={onNovoPagamento} className="gap-2">
                <DollarSign className="h-4 w-4" />
                Registrar Novo Pagamento
              </Button>
            </div>
          )}

          {/* Lista de Pagamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Histórico de Pagamentos ({historicoPagamentos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historicoPagamentos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum pagamento registrado ainda</p>
                  {onNovoPagamento && (
                    <Button 
                      onClick={onNovoPagamento} 
                      className="mt-4 gap-2"
                      variant="outline"
                    >
                      <DollarSign className="h-4 w-4" />
                      Registrar Primeiro Pagamento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {historicoPagamentos
                    .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                    .map((pagamento, index) => (
                      <div
                        key={pagamento.id || index}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg font-semibold text-green-600">
                                {formatCurrency(pagamento.valor_pago)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(pagamento.data_pagamento), "dd/MM/yyyy", {
                                  locale: ptBR
                                })}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-4 w-4" />
                                {getFormaPagamentoLabel(pagamento.forma_pagamento)}
                              </div>
                            </div>
                            
                            {pagamento.observacoes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <strong>Observações:</strong> {pagamento.observacoes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {pagamentoParaDeletar === pagamento.id ? (
                            // Mostrar confirmação inline
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                              <span className="text-sm text-red-700 font-medium">Deletar?</span>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (onDeletarPagamento) {
                                    await onDeletarPagamento(pagamento.id);
                                    setPagamentoParaDeletar(null);
                                  }
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                Sim
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPagamentoParaDeletar(null);
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                Não
                              </Button>
                            </div>
                          ) : (
                            // Botões normais
                            <>
                              {/* Botão Editar */}
                              {onEditarPagamento && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEditarPagamento(pagamento);
                                  }}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Editar pagamento"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}

                              {/* Botão Deletar */}
                              {onDeletarPagamento && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setPagamentoParaDeletar(pagamento.id);
                                  }}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  title="Deletar pagamento"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};