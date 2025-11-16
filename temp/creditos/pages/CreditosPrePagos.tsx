import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useWalletResumo, 
  useWalletClientes 
} from '@/hooks/useWallet';
import { WalletDepositoButton } from '@/components/wallet/WalletDepositoModal';
import { WalletDeleteModal } from '@/components/wallet/WalletDeleteModal';
import { WalletSaldoCompacto } from '@/components/wallet/WalletSaldoCard';
import { formatCurrency, formatPhone } from '@/utils/formatters';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Eye,
  AlertTriangle,
  DollarSign,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function CreditosPrePagos() {
  const navigate = useNavigate();
  
  // Estados locais
  const [buscaCliente, setBuscaCliente] = useState('');
  const [filtroSaldo, setFiltroSaldo] = useState<'todos' | 'com_saldo' | 'saldo_baixo'>('todos');
  const [clienteParaExcluir, setClienteParaExcluir] = useState<{id: string, nome: string, saldo: number, transacoes: number} | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const ITENS_POR_PAGINA = 20;

  // Dados
  const { data: resumo, isLoading: loadingResumo, refetch: refetchResumo } = useWalletResumo();
  const { data: clientes, isLoading: loadingClientes, refetch: refetchClientes } = useWalletClientes({
    busca: buscaCliente,
    saldo_minimo: filtroSaldo === 'com_saldo' ? 0.01 : undefined,
  });

  // Filtrar clientes por saldo baixo e ordenar alfabeticamente
  const clientesFiltrados = React.useMemo(() => {
    if (!clientes) return [];
    
    let resultado = [...clientes];
    
    // Filtrar por saldo se necessário
    if (filtroSaldo === 'saldo_baixo') {
      resultado = resultado.filter(c => c.saldo_atual < 100);
    }
    
    // Ordenar alfabeticamente por nome
    resultado.sort((a, b) => {
      const nomeA = a.cliente?.nome || '';
      const nomeB = b.cliente?.nome || '';
      return nomeA.localeCompare(nomeB, 'pt-BR');
    });
    
    return resultado;
  }, [clientes, filtroSaldo]);

  // Paginação
  const totalPaginas = Math.ceil(clientesFiltrados.length / ITENS_POR_PAGINA);
  const indiceInicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const indiceFim = indiceInicio + ITENS_POR_PAGINA;
  const clientesPaginados = clientesFiltrados.slice(indiceInicio, indiceFim);

  // Resetar página quando filtros mudam
  React.useEffect(() => {
    setPaginaAtual(1);
  }, [buscaCliente, filtroSaldo]);

  const handleRefresh = () => {
    refetchResumo();
    refetchClientes();
  };

  const handleVerDetalhes = (clienteId: string) => {
    navigate(`/dashboard/creditos-prepagos/cliente/${clienteId}`);
  };

  const getStatusSaldoBadge = (saldo: number) => {
    if (saldo < 100) {
      return <Badge variant="destructive" className="text-xs">Baixo</Badge>;
    } else if (saldo < 500) {
      return <Badge variant="secondary" className="text-xs">Médio</Badge>;
    } else {
      return <Badge variant="default" className="text-xs">Alto</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Modernizado */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                  Créditos Pré-pagos
                </h1>
                <p className="text-slate-600 text-lg">Sistema de carteira digital para clientes</p>
              </div>
            </div>
          </div>
        
          <WalletDepositoButton
            onSuccess={handleRefresh}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-base font-medium"
          />
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Clientes com Saldo</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingResumo ? '...' : resumo?.total_clientes_com_saldo || 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total em Carteiras</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingResumo ? '...' : formatCurrency(resumo?.valor_total_carteiras || 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Depósitos Este Mês</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingResumo ? '...' : formatCurrency(resumo?.depositos_mes_atual || 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Usos Este Mês</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loadingResumo ? '...' : formatCurrency(resumo?.usos_mes_atual || 0)}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Alertas */}
      {resumo && resumo.clientes_saldo_baixo > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  ⚠️ {resumo.clientes_saldo_baixo} cliente(s) com saldo baixo
                </p>
                <p className="text-sm text-yellow-700">
                  Clientes com menos de R$ 100,00 na carteira
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltroSaldo('saldo_baixo')}
                className="ml-auto border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Ver Clientes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes ({clientesFiltrados.length})
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtros de Saldo */}
            <div className="flex gap-2">
              <Button
                variant={filtroSaldo === 'todos' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroSaldo('todos')}
              >
                Todos
              </Button>
              <Button
                variant={filtroSaldo === 'com_saldo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroSaldo('com_saldo')}
              >
                Com Saldo
              </Button>
              <Button
                variant={filtroSaldo === 'saldo_baixo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroSaldo('saldo_baixo')}
                className={cn(
                  filtroSaldo === 'saldo_baixo' && 'bg-yellow-600 hover:bg-yellow-700'
                )}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Saldo Baixo
              </Button>
            </div>
          </div>

          {/* Tabela de Clientes */}
          {loadingClientes ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Nenhum cliente encontrado</p>
              <p className="text-sm">
                {buscaCliente ? 'Tente ajustar os filtros de busca.' : 'Não há clientes com carteira no momento.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Saldo Atual</TableHead>
                  <TableHead>Total Depositado</TableHead>
                  <TableHead>Total Usado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última Movimentação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesPaginados.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {cliente.cliente?.nome || 'Nome não encontrado'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {cliente.cliente?.telefone && (
                          <div className="font-medium">📱 {formatPhone(cliente.cliente.telefone)}</div>
                        )}
                        {cliente.cliente?.email && (
                          <div className="text-xs text-gray-500">
                            ✉️ {cliente.cliente.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <WalletSaldoCompacto 
                        saldo={cliente.saldo_atual}
                        showIcon={false}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-green-600 font-medium">
                        {formatCurrency(cliente.total_depositado)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-red-600 font-medium">
                        {formatCurrency(cliente.total_usado)}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      {getStatusSaldoBadge(cliente.saldo_atual)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {format(new Date(cliente.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVerDetalhes(cliente.cliente_id)}
                          title="Ver detalhes da carteira"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <WalletDepositoButton
                          clienteId={cliente.cliente_id}
                          variant="ghost"
                          size="sm"
                          onSuccess={handleRefresh}
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setClienteParaExcluir({
                            id: cliente.cliente_id,
                            nome: cliente.cliente?.nome || 'Cliente',
                            saldo: cliente.saldo_atual,
                            transacoes: 0 // Não temos esse dado aqui
                          })}
                          title="Excluir carteira"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Mostrando {indiceInicio + 1} a {Math.min(indiceFim, clientesFiltrados.length)} de {clientesFiltrados.length} clientes
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    let numeroPagina: number;
                    if (totalPaginas <= 5) {
                      numeroPagina = i + 1;
                    } else if (paginaAtual <= 3) {
                      numeroPagina = i + 1;
                    } else if (paginaAtual >= totalPaginas - 2) {
                      numeroPagina = totalPaginas - 4 + i;
                    } else {
                      numeroPagina = paginaAtual - 2 + i;
                    }

                    return (
                      <Button
                        key={numeroPagina}
                        variant={paginaAtual === numeroPagina ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPaginaAtual(numeroPagina)}
                        className={paginaAtual === numeroPagina ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      >
                        {numeroPagina}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Modal de Exclusão */}
        {clienteParaExcluir && (
          <WalletDeleteModal
            clienteId={clienteParaExcluir.id}
            clienteNome={clienteParaExcluir.nome}
            saldoAtual={clienteParaExcluir.saldo}
            totalTransacoes={clienteParaExcluir.transacoes}
            isOpen={!!clienteParaExcluir}
            onClose={() => setClienteParaExcluir(null)}
            onSuccess={() => {
              setClienteParaExcluir(null);
              handleRefresh();
            }}
          />
        )}
      </div>
    </div>
  );
}