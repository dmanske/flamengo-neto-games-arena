import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletSaldoCard } from '@/components/wallet/WalletSaldoCard';
import { WalletHistoricoAgrupado } from '@/components/wallet/WalletHistoricoAgrupado';
import { WalletDepositoButton } from '@/components/wallet/WalletDepositoModal';
import { WalletUsoButton } from '@/components/wallet/WalletUsoModal';
import { useWalletSaldo } from '@/hooks/useWallet';
import { useClientesParaWallet } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';
import { 
  ArrowLeft,
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function WalletClienteDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [filtroHistorico, setFiltroHistorico] = useState<'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo'>('ultimos_3_meses');
  
  // Dados da carteira e cliente
  const { data: wallet, isLoading, error, refetch } = useWalletSaldo(id || '');
  const { data: clientes } = useClientesParaWallet();
  
  const cliente = clientes?.find(c => c.id === id);

  const handleRefresh = () => {
    refetch();
  };

  const handleVoltar = () => {
    navigate('/dashboard/creditos-prepagos');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar carteira</h2>
          <p className="text-gray-600 mb-6">
            {error?.message || 'Não foi possível carregar os dados da carteira.'}
          </p>
          <Button onClick={handleVoltar}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  // Se não tem carteira, mostrar estado vazio
  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleVoltar}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-blue-600" />
                  Carteira - {cliente?.nome || 'Cliente'}
                </h1>
                <p className="text-gray-600">Detalhes da carteira digital</p>
              </div>
            </div>
          </div>

          {/* Estado Vazio */}
          <Card>
            <CardContent className="p-12 text-center">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Carteira não encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Este cliente ainda não possui uma carteira digital. 
                Faça o primeiro depósito para criar a carteira.
              </p>
              
              <WalletDepositoButton
                clienteId={id}
                onSuccess={handleRefresh}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const ultimaMovimentacao = wallet.updated_at ? new Date(wallet.updated_at) : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleVoltar}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Wallet className="h-6 w-6 text-blue-600" />
                Carteira - {cliente?.nome || 'Cliente'}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                {cliente?.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {cliente.telefone}
                  </div>
                )}
                {cliente?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {cliente.email}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Card de Saldo Principal */}
        <WalletSaldoCard
          saldo={wallet.saldo_atual}
          totalDepositado={wallet.total_depositado}
          totalUsado={wallet.total_usado}
          ultimaMovimentacao={ultimaMovimentacao}
          size="large"
          showAlerts={true}
        />

        {/* Resumo Rápido e Ações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Depositado</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(wallet.total_depositado)}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usado</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(wallet.total_usado)}
                  </p>
                </div>
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Última Movimentação</p>
                  <p className="text-lg font-medium text-gray-900">
                    {ultimaMovimentacao ? (
                      format(ultimaMovimentacao, 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      'Nunca'
                    )}
                  </p>
                </div>
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <WalletDepositoButton
                clienteId={id}
                onSuccess={handleRefresh}
                className="bg-green-600 hover:bg-green-700"
              />
              
              {wallet.saldo_atual > 0 && (
                <WalletUsoButton
                  clienteId={id}
                  onSuccess={handleRefresh}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                />
              )}
              
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Extrato
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de Período */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Transações
              </CardTitle>
              
              <div className="flex gap-2">
                <Button
                  variant={filtroHistorico === 'mes_atual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroHistorico('mes_atual')}
                >
                  Este Mês
                </Button>
                <Button
                  variant={filtroHistorico === 'ultimos_3_meses' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroHistorico('ultimos_3_meses')}
                >
                  Últimos 3 Meses
                </Button>
                <Button
                  variant={filtroHistorico === 'ano_atual' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroHistorico('ano_atual')}
                >
                  Este Ano
                </Button>
                <Button
                  variant={filtroHistorico === 'tudo' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroHistorico('tudo')}
                >
                  Tudo
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Histórico Agrupado por Mês */}
        <WalletHistoricoAgrupado
          clienteId={id}
          filtroRapido={filtroHistorico}
          showFilters={true}
          showExport={true}
        />

        {/* Informações Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações da Carteira
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estatísticas</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Carteira criada em:</span>
                    <span className="font-medium">
                      {format(new Date(wallet.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Percentual usado:</span>
                    <span className="font-medium">
                      {wallet.total_depositado > 0 
                        ? `${((wallet.total_usado / wallet.total_depositado) * 100).toFixed(1)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo disponível:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(wallet.saldo_atual)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Status da Carteira</h4>
                <div className="space-y-3">
                  {wallet.saldo_atual < 100 && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Saldo baixo!</strong> Considere fazer um novo depósito.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {wallet.saldo_atual >= 500 && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">
                        <strong>✅ Saldo saudável!</strong> Cliente com boa reserva de créditos.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {wallet.saldo_atual >= 100 && wallet.saldo_atual < 500 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertDescription className="text-yellow-800">
                        <strong>⚠️ Saldo médio.</strong> Acompanhe o consumo do cliente.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}