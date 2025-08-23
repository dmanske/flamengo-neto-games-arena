import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, Calendar, ChevronDown, CreditCard, DollarSign, Receipt, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreditos } from '@/hooks/useCreditos';
import { Credito, FiltrosCreditos, StatusCredito } from '@/types/creditos';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  getStatusCreditoBadgeColor, 
  getStatusCreditoText, 
  getTipoCreditoIcon,
  getTipoCreditoText,
  formatarDataCredito 
} from '@/utils/creditoUtils';

// Componentes
import { CreditoFormModal } from '@/components/creditos/CreditoFormModal';
import { PagamentoCreditoModal } from '@/components/creditos/PagamentoCreditoModal';
import { HistoricoPagamentosCreditoModal } from '@/components/creditos/HistoricoPagamentosCreditoModal';
import { StatusPagamentoCredito } from '@/components/creditos/StatusPagamentoCredito';
import { usePagamentosCreditos } from '@/hooks/usePagamentosCreditos';
// import { CreditoDetailsModal } from '@/components/creditos/CreditoDetailsModal';
// import { VincularCreditoModal } from '@/components/creditos/VincularCreditoModal';
// import { FiltrosCreditosModal } from '@/components/creditos/FiltrosCreditosModal';

export default function Creditos() {
  const { 
    creditos, 
    creditosAgrupados,
    resumo, 
    estados, 
    buscarCreditos,
    buscarResumo,
    deletarCredito 
  } = useCreditos();

  const {
    historicoPagamentos,
    buscarHistoricoPagamentos,
    registrarPagamento,
    editarPagamento,
    deletarPagamento: deletarPagamentoCredito,
    calcularResumo
  } = usePagamentosCreditos();

  const [filtros, setFiltros] = useState<FiltrosCreditos>({});
  const [busca, setBusca] = useState('');
  const [creditoSelecionado, setCreditoSelecionado] = useState<Credito | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  
  // Estados para sistema de pagamentos
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [pagamentoParaEditar, setPagamentoParaEditar] = useState<any>(null);

  // Filtrar créditos baseado na busca
  const creditosFiltrados = creditos.filter(credito => {
    if (!busca) return true;
    
    const termoBusca = busca.toLowerCase();
    return (
      credito.cliente?.nome.toLowerCase().includes(termoBusca) ||
      credito.tipo_credito.toLowerCase().includes(termoBusca) ||
      credito.forma_pagamento?.toLowerCase().includes(termoBusca) ||
      credito.observacoes?.toLowerCase().includes(termoBusca)
    );
  });

  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: StatusCredito) => {
    switch (status) {
      case 'disponivel':
        return 'default'; // Verde
      case 'parcial':
        return 'secondary'; // Amarelo
      case 'utilizado':
        return 'outline'; // Cinza
      case 'reembolsado':
        return 'destructive'; // Vermelho
      default:
        return 'outline';
    }
  };

  // Função para deletar crédito com confirmação
  const handleDeletar = async (credito: Credito) => {
    if (window.confirm(`Tem certeza que deseja deletar o crédito de ${credito.cliente?.nome} no valor de ${formatCurrency(credito.valor_credito)}?`)) {
      await deletarCredito(credito.id);
    }
  };

  // Função para abrir modal de detalhes
  const handleVerDetalhes = (credito: Credito) => {
    setCreditoSelecionado(credito);
    setModalDetalhesAberto(true);
  };

  // Função para abrir modal de edição
  const handleEditar = (credito: Credito) => {
    setCreditoSelecionado(credito);
    setModalFormAberto(true);
  };

  // Função para abrir modal de vinculação
  const handleVincular = (credito: Credito) => {
    setCreditoSelecionado(credito);
    setModalVincularAberto(true);
  };

  // Funções para sistema de pagamentos
  const handleRegistrarPagamento = async (credito: Credito) => {
    setCreditoSelecionado(credito);
    await buscarHistoricoPagamentos(credito.id);
    setModalPagamentoAberto(true);
  };

  const handleVerHistorico = async (credito: Credito) => {
    setCreditoSelecionado(credito);
    await buscarHistoricoPagamentos(credito.id);
    setModalHistoricoAberto(true);
  };

  const handleEditarPagamento = (pagamento: any) => {
    setPagamentoParaEditar(pagamento);
    setModalHistoricoAberto(false);
    setModalPagamentoAberto(true);
  };

  const handleNovoPagamentoDoHistorico = () => {
    setPagamentoParaEditar(null);
    setModalHistoricoAberto(false);
    setModalPagamentoAberto(true);
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    buscarCreditos(filtros);
    buscarResumo(filtros);
  }, [filtros, buscarCreditos, buscarResumo]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Créditos de Viagem</h1>
          <p className="text-muted-foreground">
            Controle de pagamentos antecipados e vinculação com viagens
          </p>
        </div>
        <Button onClick={() => setModalFormAberto(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Crédito
        </Button>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumo.total_creditos}</div>
              <p className="text-xs text-muted-foreground">
                {resumo.creditos_por_status.disponivel} disponíveis • {resumo.creditos_por_status.utilizado} utilizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo.valor_total)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(resumo.valor_disponivel)} disponível
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Utilizado</CardTitle>
              <span className="text-2xl">✅</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo.valor_utilizado)}</div>
              <p className="text-xs text-muted-foreground">
                Em {resumo.creditos_por_status.utilizado + resumo.creditos_por_status.parcial} créditos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Disponível</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumo.valor_disponivel)}</div>
              <p className="text-xs text-muted-foreground">
                Para {resumo.creditos_por_status.disponivel + resumo.creditos_por_status.parcial} créditos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por cliente, tipo ou observações..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filtros.status || 'todos'}
            onValueChange={(value) => 
              setFiltros(prev => ({ 
                ...prev, 
                status: value === 'todos' ? undefined : value as StatusCredito
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponivel">✅ Disponível</SelectItem>
              <SelectItem value="parcial">🟡 Parcial</SelectItem>
              <SelectItem value="utilizado">🔴 Utilizado</SelectItem>
              <SelectItem value="reembolsado">💸 Reembolsado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setModalFiltrosAberto(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Créditos Organizados por Mês */}
      <Card>
        <CardHeader>
          <CardTitle>
            Créditos Cadastrados ({creditosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estados.carregando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : creditosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-4 block">💳</span>
              <p>Nenhum crédito encontrado</p>
              <p className="text-sm">Cadastre o primeiro crédito clicando em "Novo Crédito"</p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={[creditosAgrupados[0]?.chave]} className="w-full">
              {creditosAgrupados.map((grupo) => (
                <AccordionItem key={grupo.chave} value={grupo.chave}>
                  <AccordionTrigger className="hover:no-underline [&>svg]:hidden">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-lg">{grupo.nome}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <span>{grupo.resumo.total} créditos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{formatCurrency(grupo.resumo.valorTotal)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-medium">
                            {formatCurrency(grupo.resumo.valorDisponivel)} disponível
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {grupo.resumo.disponivel > 0 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                              {grupo.resumo.disponivel} disponível
                            </Badge>
                          )}
                          {grupo.resumo.parcial > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              {grupo.resumo.parcial} parcial
                            </Badge>
                          )}
                          {grupo.resumo.utilizado > 0 && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs">
                              {grupo.resumo.utilizado} utilizado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Valor Original</TableHead>
                            <TableHead>Saldo Disponível</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Status Pagamento</TableHead>
                            <TableHead>Forma Pagamento</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grupo.creditos.map((credito) => (
                            <TableRow key={credito.id}>
                              <TableCell>
                                {formatarDataCredito(credito.data_pagamento)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {credito.cliente?.nome || 'Cliente não encontrado'}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>{getTipoCreditoIcon(credito.tipo_credito)}</span>
                                  <span>{getTipoCreditoText(credito.tipo_credito)}</span>
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(credito.valor_credito)}</TableCell>
                              <TableCell>
                                <span className={credito.saldo_disponivel > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                  {formatCurrency(credito.saldo_disponivel)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={getStatusBadgeVariant(credito.status)}
                                  className={getStatusCreditoBadgeColor(credito.status)}
                                >
                                  {getStatusCreditoText(credito.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <StatusPagamentoCredito
                                  valorTotal={credito.valor_credito}
                                  saldoDisponivel={credito.saldo_disponivel}
                                />
                              </TableCell>
                              <TableCell>{credito.forma_pagamento || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerDetalhes(credito)}
                                    title="Ver detalhes"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRegistrarPagamento(credito)}
                                    className="text-green-600 hover:text-green-700"
                                    title="Registrar pagamento"
                                  >
                                    <Receipt className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleVerHistorico(credito)}
                                    className="text-purple-600 hover:text-purple-700"
                                    title="Ver histórico de pagamentos"
                                  >
                                    <History className="h-4 w-4" />
                                  </Button>
                                  {credito.saldo_disponivel > 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleVincular(credito)}
                                      className="text-blue-600 hover:text-blue-700"
                                      title="Vincular a viagem"
                                    >
                                      <CreditCard className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditar(credito)}
                                    title="Editar crédito"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletar(credito)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Deletar crédito"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <CreditoFormModal
        open={modalFormAberto}
        onOpenChange={setModalFormAberto}
        credito={creditoSelecionado}
        onSuccess={() => {
          setModalFormAberto(false);
          setCreditoSelecionado(null);
        }}
      />

      {/* Modal de Pagamento */}
      {creditoSelecionado && (
        <PagamentoCreditoModal
          open={modalPagamentoAberto}
          onOpenChange={(open) => {
            setModalPagamentoAberto(open);
            if (!open) {
              setPagamentoParaEditar(null);
            }
          }}
          credito={creditoSelecionado}
          pagamento={pagamentoParaEditar}
          historicoPagamentos={historicoPagamentos}
          onSuccess={() => {
            setModalPagamentoAberto(false);
            setPagamentoParaEditar(null);
            // Recarregar créditos para atualizar saldos
            buscarCreditos(filtros);
            buscarResumo(filtros);
          }}
          onRegistrarPagamento={registrarPagamento}
          onEditarPagamento={editarPagamento}
        />
      )}

      {/* Modal de Histórico de Pagamentos */}
      {creditoSelecionado && (
        <HistoricoPagamentosCreditoModal
          open={modalHistoricoAberto}
          onOpenChange={setModalHistoricoAberto}
          credito={creditoSelecionado}
          historicoPagamentos={historicoPagamentos}
          onDeletarPagamento={deletarPagamentoCredito}
          onEditarPagamento={handleEditarPagamento}
          onNovoPagamento={handleNovoPagamentoDoHistorico}
        />
      )}

      {/* Modais que serão implementados depois */}
      {/* 
      <CreditoDetailsModal
        open={modalDetalhesAberto}
        onOpenChange={setModalDetalhesAberto}
        credito={creditoSelecionado}
      />

      <VincularCreditoModal
        open={modalVincularAberto}
        onOpenChange={setModalVincularAberto}
        credito={creditoSelecionado}
        onSuccess={() => {
          setModalVincularAberto(false);
          setCreditoSelecionado(null);
        }}
      />

      <FiltrosCreditosModal
        open={modalFiltrosAberto}
        onOpenChange={setModalFiltrosAberto}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />
      */}
    </div>
  );
}