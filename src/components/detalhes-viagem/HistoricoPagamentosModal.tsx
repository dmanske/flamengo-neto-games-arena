// Modal para visualizar histórico de pagamentos de um passageiro
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
// Removido ConfirmDialog - usando confirmação inline
import { Calendar, CreditCard, FileText, DollarSign, Edit3 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { HistoricoPagamentoCategorizado } from "@/types/pagamentos-separados";
import { EditarPagamentoModal } from './financeiro/EditarPagamentoModal';

interface HistoricoPagamentosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiroNome: string;
  historicoPagamentos: HistoricoPagamentoCategorizado[];
  valorViagem: number;
  valorPasseios: number;
  onDeletarPagamento?: (pagamentoId: string) => Promise<boolean>;
  onEditarPagamento?: (pagamentoId: string, dadosAtualizados: Partial<HistoricoPagamentoCategorizado>) => Promise<boolean>;
}

export const HistoricoPagamentosModal: React.FC<HistoricoPagamentosModalProps> = ({
  open,
  onOpenChange,
  passageiroNome,
  historicoPagamentos,
  valorViagem,
  valorPasseios,
  onDeletarPagamento,
  onEditarPagamento
}) => {
  const [pagamentoParaDeletar, setPagamentoParaDeletar] = useState<any>(null);
  const [pagamentoParaEditar, setPagamentoParaEditar] = useState<HistoricoPagamentoCategorizado | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  console.log('🔍 [MODAL] HistoricoPagamentosModal renderizado:', {
    open,
    passageiroNome,
    historicoPagamentos: historicoPagamentos.length,
    valorViagem,
    valorPasseios
  });
  // Calcular totais pagos por categoria
  const totalPagoViagem = historicoPagamentos
    .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
    .reduce((sum, h) => sum + h.valor_pago, 0);
    
  const totalPagoPasseios = historicoPagamentos
    .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
    .reduce((sum, h) => sum + h.valor_pago, 0);

  const totalPago = totalPagoViagem + totalPagoPasseios;
  const totalDevido = valorViagem + valorPasseios;
  const saldoRestante = totalDevido - totalPago;

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'viagem':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'passeios':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ambos':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoriaLabel = (categoria: string) => {
    switch (categoria) {
      case 'viagem':
        return 'Viagem';
      case 'passeios':
        return 'Passeios';
      case 'ambos':
        return 'Viagem + Passeios';
      default:
        return categoria;
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto z-[60]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Pagamentos
          </DialogTitle>
          <DialogDescription>
            Histórico completo de pagamentos de <strong>{passageiroNome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-blue-600">
                  R$ {valorViagem.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Pago: R$ {totalPagoViagem.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Valor Passeios
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold text-green-600">
                  R$ {valorPasseios.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Pago: R$ {totalPagoPasseios.toFixed(2)}
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
                <div className="text-2xl font-bold text-purple-600">
                  R$ {totalPago.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  de R$ {totalDevido.toFixed(2)}
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
                  R$ {saldoRestante.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  {saldoRestante <= 0 ? 'Quitado' : 'Pendente'}
                </div>
              </CardContent>
            </Card>
          </div>

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
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getCategoriaColor(pagamento.categoria)}>
                                {getCategoriaLabel(pagamento.categoria)}
                              </Badge>
                              <span className="text-lg font-semibold text-green-600">
                                R$ {pagamento.valor_pago.toFixed(2)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(pagamento.data_pagamento), "dd/MM/yyyy", {
                                  locale: ptBR
                                })}
                              </div>
                              
                              {pagamento.forma_pagamento && (
                                <div className="flex items-center gap-1">
                                  <CreditCard className="h-4 w-4" />
                                  {pagamento.forma_pagamento.toUpperCase()}
                                </div>
                              )}
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
                          {pagamentoParaDeletar?.id === pagamento.id ? (
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
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (!pagamento.id) {
                                    console.error('❌ ID do pagamento não encontrado');
                                    return;
                                  }

                                  setPagamentoParaEditar(pagamento);
                                  setModalEditarAberto(true);
                                }}
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Editar pagamento"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>

                              {/* Botão Deletar */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  
                                  if (!pagamento.id) {
                                    console.error('❌ ID do pagamento não encontrado');
                                    return;
                                  }

                                  setPagamentoParaDeletar(pagamento);
                                }}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Deletar pagamento"
                              >
                                🗑️
                              </Button>
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

        {/* Modal de Edição */}
        <EditarPagamentoModal
          isOpen={modalEditarAberto}
          onClose={() => {
            setModalEditarAberto(false);
            setPagamentoParaEditar(null);
          }}
          pagamento={pagamentoParaEditar}
          onSalvar={async (pagamentoId, dadosAtualizados) => {
            if (onEditarPagamento) {
              const sucesso = await onEditarPagamento(pagamentoId, dadosAtualizados);
              if (sucesso) {
                setModalEditarAberto(false);
                setPagamentoParaEditar(null);
                // Forçar re-render do componente pai pode ser necessário
                // mas com a atualização do estado no hook, deve funcionar automaticamente
              }
              return sucesso;
            }
            return false;
          }}
        />
      </DialogContent>
    </Dialog>
  );
};