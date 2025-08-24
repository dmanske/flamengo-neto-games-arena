import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';
import { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone } from '@/utils/formatters';

// Componentes que serão criados
import { PagamentoIngressoModal } from './PagamentoIngressoModal';

interface IngressoDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso: Ingresso | null;
}

export function IngressoDetailsModal({ 
  open, 
  onOpenChange, 
  ingresso 
}: IngressoDetailsModalProps) {
  const { 
    pagamentos, 
    estados, 
    buscarPagamentos, 
    deletarPagamento,
    calcularResumo 
  } = usePagamentosIngressos();

  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [pagamentoEditando, setPagamentoEditando] = useState<any>(null);

  // Carregar pagamentos quando ingresso mudar
  useEffect(() => {
    if (ingresso && open) {
      // Carregando pagamentos do ingresso
      buscarPagamentos(ingresso.id);
    }
  }, [ingresso?.id, open, buscarPagamentos]);

  if (!ingresso) return null;

  const resumoPagamentos = calcularResumo(ingresso.valor_final);

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return '✅ Pago';
      case 'pendente':
        return '⏳ Pendente';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return status;
    }
  };

  // Função para deletar pagamento com confirmação
  const handleDeletarPagamento = async (pagamentoId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este pagamento?')) {
      await deletarPagamento(pagamentoId, ingresso.id);
    }
  };

  // Função para editar pagamento
  const handleEditarPagamento = (pagamento: any) => {
    setPagamentoEditando(pagamento);
    setModalPagamentoAberto(true);
  };

  // Função para novo pagamento
  const handleNovoPagamento = () => {
    setPagamentoEditando(null);
    setModalPagamentoAberto(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Detalhes do Ingresso</span>
              <Badge variant={getStatusBadgeVariant(ingresso.situacao_financeira)}>
                {getStatusText(ingresso.situacao_financeira)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna 1: Informações do Jogo e Cliente */}
            <div className="lg:col-span-2 space-y-4">
              {/* Dados do Jogo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informações do Jogo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-semibold">
                        {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adversário</p>
                      <p className="font-semibold">{ingresso.adversario}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <Badge variant={ingresso.local_jogo === 'casa' ? 'default' : 'secondary'}>
                        {ingresso.local_jogo === 'casa' ? '🏠 Casa' : '✈️ Fora'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Setor</p>
                      <p className="font-semibold flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {ingresso.setor_estadio}
                      </p>
                    </div>
                  </div>

                  {ingresso.viagem && (
                    <div>
                      <p className="text-sm text-muted-foreground">Viagem Vinculada</p>
                      <p className="font-semibold">
                        {ingresso.viagem.adversario} - {format(new Date(ingresso.viagem.data_jogo), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  )}

                  {ingresso.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="text-sm bg-muted p-3 rounded-md">
                        {ingresso.observacoes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dados do Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ingresso.cliente ? (
                    <div className="space-y-3">
                      <p className="font-semibold text-lg">{ingresso.cliente.nome}</p>
                      
                      {ingresso.cliente.cpf && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground min-w-[40px]">CPF:</span>
                          <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                            {formatCPF(ingresso.cliente.cpf)}
                          </span>
                        </div>
                      )}
                      
                      {ingresso.cliente.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <span className="text-sm">
                            {formatPhone(ingresso.cliente.telefone)}
                          </span>
                        </div>
                      )}
                      
                      {ingresso.cliente.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">
                            {ingresso.cliente.email}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Cliente não encontrado</p>
                  )}
                </CardContent>
              </Card>

              {/* Histórico de Pagamentos */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Histórico de Pagamentos
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={handleNovoPagamento}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Novo Pagamento
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {estados.carregando ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : pagamentos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum pagamento registrado</p>
                      <p className="text-sm">Clique em "Novo Pagamento" para registrar</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Forma</TableHead>
                          <TableHead>Observações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pagamentos.map((pagamento) => (
                          <TableRow key={pagamento.id}>
                            <TableCell>
                              {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {formatCurrency(pagamento.valor_pago)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {pagamento.forma_pagamento}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {pagamento.observacoes || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditarPagamento(pagamento)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletarPagamento(pagamento.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Coluna 2: Resumo Financeiro */}
            <div className="space-y-4">
              {/* Valores do Ingresso */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço de Custo:</span>
                      <span>{formatCurrency(ingresso.preco_custo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço de Venda:</span>
                      <span>{formatCurrency(ingresso.preco_venda)}</span>
                    </div>
                    {ingresso.desconto > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconto:</span>
                        <span className="text-red-600">
                          -{formatCurrency(ingresso.desconto)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Valor Final:</span>
                      <span>{formatCurrency(ingresso.valor_final)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lucro:</span>
                      <span className={ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(ingresso.lucro)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Margem:</span>
                      <Badge variant={ingresso.margem_percentual >= 0 ? 'default' : 'destructive'}>
                        {ingresso.margem_percentual.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Status de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Pago:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(resumoPagamentos.totalPago)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saldo Devedor:</span>
                      <span className={`font-semibold ${
                        resumoPagamentos.saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(resumoPagamentos.saldoDevedor)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentual Pago:</span>
                      <Badge variant={resumoPagamentos.quitado ? 'default' : 'secondary'}>
                        {resumoPagamentos.percentualPago.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(resumoPagamentos.percentualPago, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {resumoPagamentos.quitado ? 'Quitado' : 'Em aberto'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cadastrado em:</span>
                    <span>
                      {format(new Date(ingresso.created_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última atualização:</span>
                    <span>
                      {format(new Date(ingresso.updated_at), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Pagamento */}
      <PagamentoIngressoModal
        open={modalPagamentoAberto}
        onOpenChange={setModalPagamentoAberto}
        ingresso={ingresso}
        pagamento={pagamentoEditando}
        onSuccess={() => {
          setModalPagamentoAberto(false);
          setPagamentoEditando(null);
          buscarPagamentos(ingresso.id);
        }}
      />
    </>
  );
}