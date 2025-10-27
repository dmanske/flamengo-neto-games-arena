import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletSaldoCard } from '@/components/wallet/WalletSaldoCard';
import { WalletHistoricoAgrupado } from '@/components/wallet/WalletHistoricoAgrupado';
import { WalletDepositoButton } from '@/components/wallet/WalletDepositoModal';
import { WalletUsoButton } from '@/components/wallet/WalletUsoModal';
import { useWalletSaldo } from '@/hooks/useWallet';
import { formatCurrency } from '@/utils/formatters';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CarteiraClienteProps {
  clienteId: string;
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
}

export default function CarteiraCliente({ clienteId, cliente }: CarteiraClienteProps) {
  const [filtroHistorico, setFiltroHistorico] = useState<'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo'>('ultimos_3_meses');
  
  // Dados da carteira
  const { data: wallet, isLoading, error, refetch } = useWalletSaldo(clienteId);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-red-600 mb-2">❌ Erro ao carregar carteira</div>
          <div className="text-sm text-gray-600 mb-4">{error.message}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Se não tem carteira, mostrar estado vazio
  if (!wallet) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-600" />
              Carteira Digital
            </h2>
            <p className="text-gray-600">
              {cliente?.nome || 'Cliente'} ainda não possui carteira
            </p>
          </div>
          
          <WalletDepositoButton
            clienteId={clienteId}
            onSuccess={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          />
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
              clienteId={clienteId}
              onSuccess={handleRefresh}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const ultimaMovimentacao = wallet.updated_at ? new Date(wallet.updated_at) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-600" />
            Carteira Digital
          </h2>
          <p className="text-gray-600">
            {cliente?.nome || 'Cliente'}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          {wallet && wallet.saldo_atual > 0 && (
            <WalletUsoButton
              clienteId={clienteId}
              onSuccess={handleRefresh}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            />
          )}
          
          <WalletDepositoButton
            clienteId={clienteId}
            onSuccess={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          />
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

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Filtros Rápidos para Histórico */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período do Histórico
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
        clienteId={clienteId}
        filtroRapido={filtroHistorico}
        showFilters={true}
        showExport={true}
      />

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
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
  );
}