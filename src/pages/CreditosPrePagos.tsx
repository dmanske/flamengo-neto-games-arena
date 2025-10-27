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
import { WalletSaldoCompacto } from '@/components/wallet/WalletSaldoCard';
import { formatCurrency } from '@/utils/formatters';
import { 
  Wallet, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Eye,
  Plus,
  AlertTriangle,
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw
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

  // Dados
  const { data: resumo, isLoading: loadingResumo, refetch: refetchResumo } = useWalletResumo();
  const { data: clientes, isLoading: loadingClientes, refetch: refetchClientes } = useWalletClientes({
    busca: buscaCliente,
    saldo_minimo: filtroSaldo === 'com_saldo' ? 0.01 : undefined,
  });

  // Filtrar clientes por saldo baixo
  const clientesFiltrados = React.useMemo(() => {
    if (!clientes) return [];
    
    if (filtroSaldo === 'saldo_baixo') {
      return clientes.filter(c => c.saldo_atual < 100);
    }
    
    return clientes;
  }, [clientes, filtroSaldo]);

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-blue-600" />
            Créditos Pré-pagos
          </h1>
          <p className="text-gray-600 mt-1">
            Sistema de carteira digital para clientes
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <WalletDepositoButton
            onSuccess={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes com Saldo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loadingResumo ? '...' : resumo?.total_clientes_com_saldo || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total em Carteiras</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingResumo ? '...' : formatCurrency(resumo?.valor_total_carteiras || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Depósitos Este Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {loadingResumo ? '...' : formatCurrency(resumo?.depositos_mes_atual || 0)}
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
                <p className="text-sm text-gray-600">Usos Este Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {loadingResumo ? '...' : formatCurrency(resumo?.usos_mes_atual || 0)}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
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
                {clientesFiltrados.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {cliente.cliente?.nome || 'Nome não encontrado'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        {cliente.cliente?.telefone && (
                          <div>📱 {cliente.cliente.telefone}</div>
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
  );
}