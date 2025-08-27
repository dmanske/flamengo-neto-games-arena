import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, Calendar, ChevronDown, CreditCard, DollarSign } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCreditos } from '@/hooks/useCreditos';
import { Credito, FiltrosCreditos, StatusCredito } from '@/types/creditos';
import { formatCurrency } from '@/utils/formatters';
import { toast } from 'sonner';
import { 
  getStatusCreditoBadgeColor, 
  getStatusCreditoText, 
  formatarDataCredito 
} from '@/utils/creditoUtils';

// Componentes
import { CreditoFormModal } from '@/components/creditos/CreditoFormModal';
import { CreditoDetailsModal } from '@/components/creditos/CreditoDetailsModal';
import { VincularCreditoModal } from '@/components/creditos/VincularCreditoModal';
import { FiltrosCreditosModal } from '@/components/creditos/FiltrosCreditosModal';

export default function Creditos() {
  const { 
    creditos, 
    creditosAgrupados,
    creditosAgrupadosPorCliente,
    resumo, 
    estados, 
    buscarCreditos,
    buscarResumo,
    deletarCredito 
  } = useCreditos();



  const [filtros, setFiltros] = useState<FiltrosCreditos>({});
  const [busca, setBusca] = useState('');
  const [creditoSelecionado, setCreditoSelecionado] = useState<Credito | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [modalDetalhesClienteAberto, setModalDetalhesClienteAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);
  
  // Estado para controlar visualização
  const [visualizacao, setVisualizacao] = useState<'mes' | 'cliente'>('cliente');
  
  // Estado para modal de confirmação de delete
  const [modalConfirmacaoDelete, setModalConfirmacaoDelete] = useState<{
    aberto: boolean;
    credito: Credito | null;
  }>({
    aberto: false,
    credito: null
  });

  // Filtrar créditos baseado na busca (os filtros avançados já são aplicados no hook)
  const creditosFiltrados = creditos.filter(credito => {
    if (!busca) return true;
    
    const termoBusca = busca.toLowerCase();
    return (
      credito.cliente?.nome.toLowerCase().includes(termoBusca) ||
      credito.forma_pagamento?.toLowerCase().includes(termoBusca) ||
      credito.observacoes?.toLowerCase().includes(termoBusca)
    );
  });

  // Atualizar clienteSelecionado quando os dados mudam
  useEffect(() => {
    if (clienteSelecionado?.cliente?.id && creditosAgrupadosPorCliente.length > 0) {
      const clienteAtualizado = creditosAgrupadosPorCliente.find(
        grupo => grupo.cliente.id === clienteSelecionado.cliente.id
      );
      if (clienteAtualizado && JSON.stringify(clienteAtualizado) !== JSON.stringify(clienteSelecionado)) {
        setClienteSelecionado(clienteAtualizado);
      }
    }
  }, [creditosAgrupadosPorCliente]);

  // Aplicar filtro de busca também no agrupamento por cliente
  const creditosAgrupadosPorClienteFiltrados = creditosAgrupadosPorCliente.filter(grupoCliente => {
    if (!busca) return true;
    
    const termoBusca = busca.toLowerCase();
    return (
      grupoCliente.cliente?.nome.toLowerCase().includes(termoBusca) ||
      grupoCliente.creditos.some(credito => 
        credito.forma_pagamento?.toLowerCase().includes(termoBusca) ||
        credito.observacoes?.toLowerCase().includes(termoBusca)
      )
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

  // Função para abrir modal de confirmação de delete
  const handleDeletar = (credito: Credito) => {
    setModalConfirmacaoDelete({
      aberto: true,
      credito
    });
  };

  // Função para confirmar e executar o delete
  const confirmarDelete = async () => {
    if (modalConfirmacaoDelete.credito) {
      await deletarCredito(modalConfirmacaoDelete.credito.id);
      setModalConfirmacaoDelete({ aberto: false, credito: null });
    }
  };

  // Função para abrir modal de edição
  const handleEditar = (credito: Credito) => {
    setCreditoSelecionado(credito);
    setModalFormAberto(true);
  };

  // Função para abrir modal detalhado do cliente
  const handleVerDetalhesCliente = (grupoCliente: any) => {
    setClienteSelecionado(grupoCliente);
    setModalDetalhesClienteAberto(true);
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
        <div className="flex gap-2">
          {/* ✅ NOVO: Botão de Teste para Vinculação */}
          <Button 
            onClick={() => {
              // Usar o primeiro cliente real com crédito disponível
              const clienteComCredito = creditosAgrupadosPorCliente.find(
                grupo => grupo.resumo.valor_disponivel > 0
              );
              
              if (clienteComCredito) {
                setClienteSelecionado(clienteComCredito);
                setModalVincularAberto(true);
              } else {
                toast.error('Nenhum cliente com crédito disponível encontrado. Cadastre um crédito primeiro.');
              }
            }}
            variant="outline" 
            className="gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <CreditCard className="h-4 w-4" />
            🧪 Testar Vinculação
          </Button>
          
          <Button onClick={() => setModalFormAberto(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Crédito
          </Button>
        </div>
      </div>

      {/* ✅ NOVO: Card de Teste da Vinculação */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                🧪 Testar Nova Funcionalidade
              </h3>
              <p className="text-sm text-blue-700 mb-4">
                Teste a vinculação de crédito com pagamentos separados e registro automático de pagamento adicional
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Usar o primeiro cliente real com crédito disponível
                    const clienteComCredito = creditosAgrupadosPorCliente.find(
                      grupo => grupo.resumo.valor_disponivel > 0
                    );
                    
                    if (clienteComCredito) {
                      setClienteSelecionado(clienteComCredito);
                      setModalVincularAberto(true);
                    } else {
                      toast.error('Nenhum cliente com crédito disponível encontrado. Cadastre um crédito primeiro.');
                    }
                  }}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="h-4 w-4" />
                  Testar Vinculação
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Abrir documentação em nova aba
                    window.open('/teste-vinculacao-credito-completa.md', '_blank');
                  }}
                  className="gap-2"
                >
                  📖 Ver Documentação
                </Button>
              </div>
            </div>
            <div className="text-6xl opacity-20">
              🚀
            </div>
          </div>
        </CardContent>
      </Card>

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
              placeholder="Buscar por cliente, forma de pagamento ou observações..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={visualizacao}
            onValueChange={(value) => setVisualizacao(value as 'mes' | 'cliente')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cliente">👤 Por Cliente</SelectItem>
              <SelectItem value="mes">📅 Por Mês</SelectItem>
            </SelectContent>
          </Select>

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

      {/* Créditos Organizados */}
      <Card>
        <CardHeader>
          <CardTitle>
            {visualizacao === 'cliente' 
              ? `Créditos por Cliente (${creditosAgrupadosPorClienteFiltrados.length} clientes, ${creditosFiltrados.length} créditos)` 
              : `Créditos por Mês (${creditosFiltrados.length})`
            }
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
          ) : visualizacao === 'cliente' ? (
            // Visualização Minimalista por Cliente
            <div className="space-y-2">
              {/* ✅ NOVO: Opção de teste rápido no topo da lista */}
              <div className="flex items-center justify-between p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-semibold text-sm">🧪</span>
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-blue-800">Teste Rápido - Cliente Demo</span>
                    <p className="text-sm text-blue-600">Clique para testar a vinculação com dados simulados</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-right">
                    <div className="font-medium text-blue-600">
                      R$ 120,00 disponível
                    </div>
                    <div className="text-blue-500">
                      1 pagamento de teste
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Usar o primeiro cliente real com crédito disponível
                      const clienteComCredito = creditosAgrupadosPorCliente.find(
                        grupo => grupo.resumo.valor_disponivel > 0
                      );
                      
                      if (clienteComCredito) {
                        setClienteSelecionado(clienteComCredito);
                        setModalVincularAberto(true);
                      } else {
                        toast.error('Nenhum cliente com crédito disponível encontrado. Cadastre um crédito primeiro.');
                      }
                    }}
                    size="sm"
                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-3 w-3" />
                    Testar
                  </Button>
                </div>
              </div>
              
              {creditosAgrupadosPorClienteFiltrados.map((grupoCliente: any) => (
                <div
                  key={grupoCliente.cliente?.id || 'sem-cliente'}
                  onClick={() => handleVerDetalhesCliente(grupoCliente)}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {grupoCliente.cliente?.nome?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-lg">{grupoCliente.cliente?.nome || 'Cliente não encontrado'}</span>
                      {grupoCliente.cliente?.telefone && (
                        <p className="text-sm text-gray-500">{grupoCliente.cliente.telefone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(grupoCliente.resumo.valor_disponivel)} disponível
                      </div>
                      <div className="text-gray-500">
                        {grupoCliente.resumo.total_creditos} pagamentos
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Visualização por Mês (original)
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
                            <TableHead>Valor Original</TableHead>
                            <TableHead>Saldo Disponível</TableHead>
                            <TableHead>Status</TableHead>
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
                              <TableCell>{credito.forma_pagamento || '-'}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
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



      {/* Modal Detalhado do Cliente */}
      <CreditoDetailsModal
        open={modalDetalhesClienteAberto}
        onOpenChange={setModalDetalhesClienteAberto}
        grupoCliente={clienteSelecionado}
        onNovoCredito={() => {
          setModalDetalhesClienteAberto(false);
          setModalFormAberto(true);
        }}
        onUsarEmViagem={(grupoCliente) => {
          setClienteSelecionado(grupoCliente);
          setModalDetalhesClienteAberto(false);
          setModalVincularAberto(true);
        }}
        onEditar={handleEditar}
        onDeletar={handleDeletar}
        onRefresh={() => {
          buscarCreditos();
        }}
        onViagemUpdated={() => {
          console.log('🔄 [Creditos] onViagemUpdated chamado - forçando reload global');
          
          // Se estamos na página de detalhes da viagem, forçar reload da página
          if (window.location.pathname.includes('/viagem/')) {
            console.log('🔄 [Creditos] Detectada página de viagem, forçando reload da página em 1 segundo...');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
            return;
          }
          
          // Disparar evento global para todas as páginas de viagem
          const reloadEvent = new CustomEvent('viagemPassageiroRemovido', {
            detail: { 
              timestamp: Date.now(),
              source: 'CreditoDetailsModal'
            }
          });
          window.dispatchEvent(reloadEvent);
          
          // Também salvar flag no localStorage para páginas que usam polling
          localStorage.setItem('viagemNeedsReload', JSON.stringify({
            timestamp: Date.now(),
            action: 'creditoRemovido',
            source: 'CreditoDetailsModal'
          }));
          
          console.log('✅ [Creditos] Eventos de reload disparados');
        }}
      />

      {/* Modal de Vinculação com Viagem */}
      <VincularCreditoModal
        open={modalVincularAberto}
        onOpenChange={setModalVincularAberto}
        grupoCliente={clienteSelecionado}
        onSuccess={() => {
          setModalVincularAberto(false);
          setClienteSelecionado(null);
          // Recarregar dados
          buscarCreditos(filtros);
          buscarResumo(filtros);
        }}
      />

      {/* Modal de Filtros Avançados */}
      <FiltrosCreditosModal
        open={modalFiltrosAberto}
        onOpenChange={setModalFiltrosAberto}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {/* Modal de Confirmação para Deletar Crédito */}
      <AlertDialog 
        open={modalConfirmacaoDelete.aberto} 
        onOpenChange={(aberto) => 
          setModalConfirmacaoDelete(prev => ({ ...prev, aberto }))
        }
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Deletar Crédito
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {modalConfirmacaoDelete.credito && (
                <>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="font-medium text-red-800 mb-2">
                      ⚠️ Você está prestes a deletar:
                    </p>
                    <div className="text-sm text-red-700 space-y-1">
                      <div>👤 Cliente: <strong>{modalConfirmacaoDelete.credito.cliente?.nome}</strong></div>
                      <div>💰 Valor: <strong>{formatCurrency(modalConfirmacaoDelete.credito.valor_credito)}</strong></div>
                      <div>📅 Data: <strong>{formatarDataCredito(modalConfirmacaoDelete.credito.data_pagamento)}</strong></div>
                      {modalConfirmacaoDelete.credito.saldo_disponivel > 0 && (
                        <div className="text-orange-700">
                          💳 Saldo disponível: <strong>{formatCurrency(modalConfirmacaoDelete.credito.saldo_disponivel)}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {modalConfirmacaoDelete.credito.saldo_disponivel > 0 && (
                    <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>⚠️ Atenção:</strong> Este crédito ainda possui saldo disponível!
                      </p>
                    </div>
                  )}

                  <div className="p-2 bg-red-50 rounded border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>❌ Esta ação NÃO pode ser desfeita!</strong>
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmarDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sim, Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}