import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import { WalletTransacao } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletTransacaoCancelModalProps {
  transacao: WalletTransacao | null;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletTransacaoCancelModal: React.FC<WalletTransacaoCancelModalProps> = ({
  transacao,
  saldoAtual,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { cancelarTransacao } = useWalletAdmin();
  
  const [motivo, setMotivo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Resetar form quando abrir modal
  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setMotivo('');
    setError(null);
    onClose();
  };

  const calcularImpactoSaldo = (): { novoSaldo: number; valido: boolean } => {
    if (!transacao) return { novoSaldo: 0, valido: false };
    
    let novoSaldo = saldoAtual;
    
    // Cancelar depósito: subtrai do saldo
    if (transacao.tipo === 'deposito') {
      novoSaldo = saldoAtual - transacao.valor;
    }
    // Cancelar uso: adiciona ao saldo
    else if (transacao.tipo === 'uso') {
      novoSaldo = saldoAtual + transacao.valor;
    }
    // Cancelar ajuste: reverte o ajuste
    else if (transacao.tipo === 'ajuste') {
      novoSaldo = saldoAtual - transacao.valor;
    }
    
    return {
      novoSaldo,
      valido: novoSaldo >= 0
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transacao) return;

    // Validações
    if (!motivo.trim()) {
      setError('O motivo do cancelamento é obrigatório');
      return;
    }

    if (motivo.trim().length < 3) {
      setError('O motivo deve ter pelo menos 3 caracteres');
      return;
    }

    const { valido, novoSaldo } = calcularImpactoSaldo();
    
    if (!valido) {
      setError(`Não é possível cancelar: o saldo ficaria negativo (${formatCurrency(novoSaldo)})`);
      return;
    }

    try {
      await cancelarTransacao.mutateAsync({
        transacao_id: transacao.id,
        motivo: motivo.trim(),
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar transação');
    }
  };

  if (!transacao) return null;

  const { novoSaldo, valido } = calcularImpactoSaldo();
  const isLoading = cancelarTransacao.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <XCircle className="h-5 w-5" />
            Cancelar Transação
          </DialogTitle>
          <DialogDescription>
            Esta ação irá reverter o valor da transação no saldo da carteira.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Transação */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">
                {transacao.tipo === 'deposito' ? '💰 Depósito' : 
                 transacao.tipo === 'uso' ? '🛒 Uso' : '🔧 Ajuste'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium">{formatCurrency(transacao.valor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Descrição:</span>
              <span className="font-medium text-right max-w-[250px] truncate">
                {transacao.descricao || 'Sem descrição'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className="font-medium">{formatCurrency(saldoAtual)}</span>
            </div>
          </div>

          {/* Preview do Impacto */}
          <Alert className={valido ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-start gap-2">
              {transacao.tipo === 'deposito' ? (
                <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
              ) : (
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className={valido ? 'text-blue-800' : 'text-red-800'}>
                  <div className="font-medium mb-1">Impacto do Cancelamento:</div>
                  <div className="text-sm space-y-1">
                    {transacao.tipo === 'deposito' && (
                      <div>O valor será <strong>subtraído</strong> do saldo</div>
                    )}
                    {transacao.tipo === 'uso' && (
                      <div>O valor será <strong>devolvido</strong> ao saldo</div>
                    )}
                    {transacao.tipo === 'ajuste' && (
                      <div>O ajuste será <strong>revertido</strong></div>
                    )}
                    <div className="font-medium">
                      Novo saldo: {formatCurrency(novoSaldo)}
                    </div>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>

          {/* Validação de Saldo Negativo */}
          {!valido && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Atenção!</strong> O cancelamento não pode ser realizado pois o saldo ficaria negativo.
              </AlertDescription>
            </Alert>
          )}

          {/* Campo Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo do Cancelamento *
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique o motivo do cancelamento..."
              rows={4}
              disabled={isLoading || !valido}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {motivo.length}/500 caracteres (mínimo 3)
            </p>
          </div>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Aviso Final */}
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 text-sm">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. A transação será marcada como cancelada e o saldo será ajustado.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !valido || motivo.trim().length < 3}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmar Cancelamento
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
