// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingDown, 
  Users, 
  Calendar, 
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePagamentosViagem } from '@/hooks/financeiro/usePagamentosViagem';
import { useOrcamentoViagem } from '@/hooks/financeiro/useOrcamentoViagem';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PagamentoViagemForm } from './PagamentoViagemForm';
import { OrcamentoViagemForm } from './OrcamentoViagemForm';
import { ParcelaForm } from './ParcelaForm';

interface ControleFinanceiroViagemProps {
  viagemId: string;
  viagemNome: string;
  dataViagem: string;
  precoPassagem: number;
}

export const ControleFinanceiroViagem: React.FC<ControleFinanceiroViagemProps> = ({
  viagemId,
  viagemNome,
  dataViagem,
  precoPassagem
}) => {
  const [activeTab, setActiveTab] = useState('resumo');
  const [showPagamentoForm, setShowPagamentoForm] = useState(false);
  const [showOrcamentoForm, setShowOrcamentoForm] = useState(false);
  const [showParcelaForm, setShowParcelaForm] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<string | null>(null);

  const {
    pagamentos,
    resumos,
    loading: loadingPagamentos,
    fetchPagamentosByViagem,
    createPagamentoViagem,
    addParcela
  } = usePagamentosViagem();

  const {
    orcamentos,
    resumo: resumoOrcamento,
    loading: loadingOrcamento,
    fetchOrcamentoByViagem,
    createItemOrcamento,
    marcarComoExecutado
  } = useOrcamentoViagem();

  useEffect(() => {
    if (viagemId) {
      fetchPagamentosByViagem(viagemId);
      fetchOrcamentoByViagem(viagemId);
    }
  }, [viagemId]);

  const resumoViagem = resumos.find(r => r.viagem_id === viagemId);

  const handleAddPagamento = async (data: any) => {
    const success = await createPagamentoViagem({
      ...data,
      viagem_id: viagemId
    });
    if (success) {
      setShowPagamentoForm(false);
      fetchPagamentosByViagem(viagemId);
    }
  };

  const handleAddOrcamento = async (data: any) => {
    const success = await createItemOrcamento({
      ...data,
      viagem_id: viagemId
    });
    if (success) {
      setShowOrcamentoForm(false);
    }
  };

  const handleAddParcela = async (data: any) => {
    if (!selectedPagamento) return;
    
    const success = await addParcela(selectedPagamento, data);
    if (success) {
      setShowParcelaForm(false);
      setSelectedPagamento(null);
      fetchPagamentosByViagem(viagemId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'parcial': return 'bg-yellow-100 text-yellow-800';
      case 'pendente': return 'bg-blue-100 text-blue-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pago': return <CheckCircle className="h-4 w-4" />;
      case 'vencido': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loadingPagamentos || loadingOrcamento) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">{viagemNome}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(dataViagem)} • Preço: {formatCurrency(precoPassagem)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowPagamentoForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Pagamento
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowOrcamentoForm(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Orçamento
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="pagamentos">
                Pagamentos ({pagamentos.length})
              </TabsTrigger>
              <TabsTrigger value="orcamento">
                Orçamento ({orcamentos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resumo">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Receita Prevista</p>
                        <p className="text-2xl font-bold text-green-800">
                          {formatCurrency(resumoViagem?.receita_prevista || 0)}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Receita Recebida</p>
                        <p className="text-2xl font-bold text-blue-800">
                          {formatCurrency(resumoViagem?.receita_recebida || 0)}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Despesa Real</p>
                        <p className="text-2xl font-bold text-red-800">
                          {formatCurrency(resumoOrcamento?.total_real || 0)}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Lucro Real</p>
                        <p className="text-2xl font-bold text-purple-800">
                          {formatCurrency((resumoViagem?.receita_recebida || 0) - (resumoOrcamento?.total_real || 0))}
                        </p>
                      </div>
                      <Target className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress de Pagamentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progresso de Pagamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Recebido</span>
                          <span>
                            {resumoViagem?.receita_recebida || 0} / {resumoViagem?.receita_prevista || 0}
                          </span>
                        </div>
                        <Progress 
                          value={resumoViagem?.receita_prevista ? 
                            (resumoViagem.receita_recebida / resumoViagem.receita_prevista) * 100 : 0
                          } 
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {resumoViagem?.passageiros_pagos || 0}
                          </p>
                          <p className="text-xs text-gray-600">Pagos</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-yellow-600">
                            {resumoViagem?.passageiros_pendentes || 0}
                          </p>
                          <p className="text-xs text-gray-600">Pendentes</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {resumoViagem?.total_passageiros || 0}
                          </p>
                          <p className="text-xs text-gray-600">Total</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Execução do Orçamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Executado</span>
                          <span>
                            {formatCurrency(resumoOrcamento?.total_real || 0)} / {formatCurrency(resumoOrcamento?.total_planejado || 0)}
                          </span>
                        </div>
                        <Progress 
                          value={resumoOrcamento?.percentual_execucao || 0} 
                          className="h-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {resumoOrcamento?.itens_executados || 0}
                          </p>
                          <p className="text-xs text-gray-600">Executados</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-600">
                            {resumoOrcamento?.itens_planejados || 0}
                          </p>
                          <p className="text-xs text-gray-600">Planejados</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pagamentos">
              <div className="space-y-4">
                {pagamentos.map((pagamento) => (
                  <Card key={pagamento.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{pagamento.cliente?.nome}</h4>
                            <Badge className={getStatusColor(pagamento.status)}>
                              {getStatusIcon(pagamento.status)}
                              <span className="ml-1 capitalize">{pagamento.status}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{pagamento.cliente?.email}</p>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Total:</span>
                              <p className="font-semibold">{formatCurrency(pagamento.valor_total)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Pago:</span>
                              <p className="font-semibold text-green-600">{formatCurrency(pagamento.valor_pago)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Pendente:</span>
                              <p className="font-semibold text-red-600">{formatCurrency(pagamento.valor_pendente)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {pagamento.valor_pendente > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedPagamento(pagamento.id);
                                setShowParcelaForm(true);
                              }}
                            >
                              Receber
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {pagamentos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum pagamento cadastrado para esta viagem</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setShowPagamentoForm(true)}
                    >
                      Adicionar Primeiro Pagamento
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="orcamento">
              <div className="space-y-4">
                {orcamentos.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{item.descricao}</h4>
                            <Badge variant="outline">{item.categoria}</Badge>
                            <Badge className={item.status === 'executado' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {item.status === 'executado' ? 'Executado' : 'Planejado'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Planejado:</span>
                              <p className="font-semibold">{formatCurrency(item.valor_planejado)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Real:</span>
                              <p className="font-semibold text-blue-600">{formatCurrency(item.valor_real)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Diferença:</span>
                              <p className={`font-semibold ${item.valor_real - item.valor_planejado > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(item.valor_real - item.valor_planejado)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {item.status !== 'executado' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                const valorReal = prompt('Valor real gasto:', item.valor_planejado.toString());
                                if (valorReal) {
                                  marcarComoExecutado(item.id, parseFloat(valorReal));
                                }
                              }}
                            >
                              Executar
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {orcamentos.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhum item de orçamento cadastrado</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setShowOrcamentoForm(true)}
                    >
                      Adicionar Primeiro Item
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showPagamentoForm} onOpenChange={setShowPagamentoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Pagamento - {viagemNome}</DialogTitle>
          </DialogHeader>
          <PagamentoViagemForm
            onSubmit={handleAddPagamento}
            onCancel={() => setShowPagamentoForm(false)}
            precoSugerido={precoPassagem}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showOrcamentoForm} onOpenChange={setShowOrcamentoForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Item de Orçamento - {viagemNome}</DialogTitle>
          </DialogHeader>
          <OrcamentoViagemForm
            onSubmit={handleAddOrcamento}
            onCancel={() => setShowOrcamentoForm(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showParcelaForm} onOpenChange={setShowParcelaForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
          </DialogHeader>
          <ParcelaForm
            onSubmit={handleAddParcela}
            onCancel={() => {
              setShowParcelaForm(false);
              setSelectedPagamento(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};