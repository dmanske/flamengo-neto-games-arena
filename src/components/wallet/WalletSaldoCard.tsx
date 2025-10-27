import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/utils/formatters';
import { useWalletStatus } from '@/hooks/useWallet';
import { WalletSaldoCardProps, WalletTendencia } from '@/types/wallet';
import { TrendingUp, TrendingDown, Minus, Wallet, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WalletSaldoCard: React.FC<WalletSaldoCardProps> = ({
  saldo,
  totalDepositado,
  totalUsado,
  ultimaMovimentacao,
  size = 'large',
  showAlerts = true,
}) => {
  const { cor, alerta } = useWalletStatus(saldo);

  // Calcular tendência baseada nos totais
  const getTendencia = (): WalletTendencia => {
    if (totalDepositado === 0 && totalUsado === 0) return 'estavel';
    
    const percentualUso = totalUsado / totalDepositado;
    if (percentualUso < 0.3) return 'crescendo';
    if (percentualUso > 0.7) return 'diminuindo';
    return 'estavel';
  };

  const tendencia = getTendencia();

  const getTendenciaIcon = () => {
    switch (tendencia) {
      case 'crescendo':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'diminuindo':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTendenciaText = () => {
    switch (tendencia) {
      case 'crescendo':
        return 'Crescendo';
      case 'diminuindo':
        return 'Diminuindo';
      default:
        return 'Estável';
    }
  };

  const getSaldoColorClass = () => {
    switch (cor) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCardBorderClass = () => {
    if (cor === 'red' && showAlerts) {
      return 'border-red-300 bg-red-50/50';
    }
    return '';
  };

  const isSmall = size === 'small';

  return (
    <div className="space-y-3">
      {/* Card Principal do Saldo */}
      <Card className={cn('transition-all duration-300', getCardBorderClass())}>
        <CardContent className={cn('p-6', isSmall && 'p-4')}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className={cn('text-blue-600', isSmall ? 'h-5 w-5' : 'h-6 w-6')} />
              <h3 className={cn('font-medium text-gray-700', isSmall ? 'text-sm' : 'text-base')}>
                Saldo Atual
              </h3>
            </div>
            
            {/* Alerta de Saldo Baixo */}
            {alerta && showAlerts && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive" className="text-xs">
                  Saldo Baixo
                </Badge>
              </div>
            )}
          </div>

          {/* Saldo Principal */}
          <div className="text-center mb-4">
            <div className={cn(
              'font-bold transition-colors duration-300',
              getSaldoColorClass(),
              isSmall ? 'text-2xl' : 'text-4xl'
            )}>
              {formatCurrency(saldo)}
            </div>
            
            {/* Indicador de Tendência */}
            <div className="flex items-center justify-center gap-2 mt-2">
              {getTendenciaIcon()}
              <span className={cn('text-gray-600', isSmall ? 'text-xs' : 'text-sm')}>
                Tendência: {getTendenciaText()}
              </span>
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className={cn(
            'grid gap-4 pt-4 border-t border-gray-200',
            isSmall ? 'grid-cols-1 gap-2' : 'grid-cols-2'
          )}>
            <div className="text-center">
              <div className={cn('text-green-600 font-semibold', isSmall ? 'text-sm' : 'text-base')}>
                {formatCurrency(totalDepositado)}
              </div>
              <div className={cn('text-gray-500', isSmall ? 'text-xs' : 'text-sm')}>
                Total Depositado
              </div>
            </div>
            
            <div className="text-center">
              <div className={cn('text-red-600 font-semibold', isSmall ? 'text-sm' : 'text-base')}>
                {formatCurrency(totalUsado)}
              </div>
              <div className={cn('text-gray-500', isSmall ? 'text-xs' : 'text-sm')}>
                Total Usado
              </div>
            </div>
          </div>

          {/* Última Movimentação */}
          {ultimaMovimentacao && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className={cn('text-gray-500 text-center', isSmall ? 'text-xs' : 'text-sm')}>
                🕒 Última movimentação: {' '}
                <span className="font-medium">
                  {formatDistanceToNow(ultimaMovimentacao, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta Detalhado (apenas se showAlerts estiver ativo) */}
      {alerta && showAlerts && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{alerta.icone} {alerta.mensagem}</strong>
            <br />
            <span className="text-sm">
              Recomendamos fazer um depósito para manter o saldo adequado.
            </span>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE COMPACTO PARA LISTAS
// =====================================================

interface WalletSaldoCompactoProps {
  saldo: number;
  showIcon?: boolean;
  showAlert?: boolean;
}

export const WalletSaldoCompacto: React.FC<WalletSaldoCompactoProps> = ({
  saldo,
  showIcon = true,
  showAlert = true,
}) => {
  const { cor, alerta } = useWalletStatus(saldo);

  const getSaldoColorClass = () => {
    switch (cor) {
      case 'green':
        return 'text-green-600';
      case 'yellow':
        return 'text-yellow-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && <Wallet className="h-4 w-4 text-blue-600" />}
      
      <span className={cn('font-semibold', getSaldoColorClass())}>
        {formatCurrency(saldo)}
      </span>
      
      {alerta && showAlert && (
        <AlertTriangle className="h-4 w-4 text-red-500" title={alerta.mensagem} />
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE DE MÉTRICAS RÁPIDAS
// =====================================================

interface WalletMetricasProps {
  totalDepositado: number;
  totalUsado: number;
  saldoAtual: number;
  className?: string;
}

export const WalletMetricas: React.FC<WalletMetricasProps> = ({
  totalDepositado,
  totalUsado,
  saldoAtual,
  className,
}) => {
  const percentualUso = totalDepositado > 0 ? (totalUsado / totalDepositado) * 100 : 0;
  const percentualDisponivel = 100 - percentualUso;

  return (
    <div className={cn('grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg', className)}>
      <div className="text-center">
        <div className="text-lg font-bold text-green-600">
          {formatCurrency(totalDepositado)}
        </div>
        <div className="text-xs text-gray-600">Depositado</div>
        <div className="text-xs text-green-600 font-medium">100%</div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-red-600">
          {formatCurrency(totalUsado)}
        </div>
        <div className="text-xs text-gray-600">Usado</div>
        <div className="text-xs text-red-600 font-medium">
          {percentualUso.toFixed(1)}%
        </div>
      </div>
      
      <div className="text-center">
        <div className="text-lg font-bold text-blue-600">
          {formatCurrency(saldoAtual)}
        </div>
        <div className="text-xs text-gray-600">Disponível</div>
        <div className="text-xs text-blue-600 font-medium">
          {percentualDisponivel.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default WalletSaldoCard;