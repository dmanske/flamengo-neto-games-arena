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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, AlertTriangle, Settings, TrendingUp, TrendingDown } from 'lucide-react';

interface WalletAjusteSaldoModalProps {
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletAjusteSaldoModal: React.FC<WalletAjusteSaldoModalProps> = ({
  clienteId,
  clienteNome,
  saldoAtual,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { ajustarSaldo } = useWalletAdmin();
  
  const [novoSaldo, setNovoSaldo] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Resetar form quando abrir modal
  useEffect(() => {
    if (isOpen) {
      setNovoSaldo(saldoAtual.toFixed(2));
      setMotivo('');
      setError(null);
    }
  }, [isOpen, saldoAtual]);

  const handleClose = () => {
    setNovoSaldo('');
    setMotivo('');
    setError(null);
    onClose();
  };

  const calcularDiferenca = (): number => {
    const valor = parseFloat(novoSaldo) || 0;
    return valor - saldoAtual;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    const valor = parseFloat(novoSaldo);
    
    if (isNaN(valor)) {
      setError('Valor inválido');
      return;
    }

    if (valor < 0) {
      setError('O saldo não pode ser negativo');
      return;
    }

    if (valor === saldoAtual) {
      setError('O novo saldo é igual ao saldo atual');
      return;
    }

    if (!motivo.trim()) {
      setError('O motivo do ajuste é obrigatório');
      return;
    }

    if (motivo.trim().length < 3) {
      setError('O motivo deve ter pelo menos 3 caracteres');
      return;
    }

    try {
      await ajustarSaldo.mutateAsync({
        cliente_id: clienteId,
        novo_saldo: valor,
        motivo: motivo.trim(),
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao ajustar saldo');
    }
  };

  const diferenca = calcularDiferenca();
  const isLoading = ajustarSaldo.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <Settings className="h-5 w-5" />
            Ajustar Saldo Manualmente
          </DialogTitle>
          <DialogDescription>
            Faça correções administrativas no saldo da carteira de <strong>{clienteNome}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações Atuais */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{clienteNome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className="font-medium text-lg">{formatCurrency(saldoAtual)}</span>
            </div>
          </div>

          {/* Campo Novo Saldo */}
          <div className="space-y-2">
            <Label htmlFor="novoSaldo">Novo Saldo *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                id="novoSaldo"
                type="number"
                step="0.01"
                min="0"
                value={novoSaldo}
                onChange={(e) => setNovoSaldo(e.target.value)}
                className="pl-10 text-lg font-medium"
                placeholder="0,00"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Preview da Diferença */}
          {diferenca !== 0 && (
            <Alert className={diferenca > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-start gap-2">
                {diferenca > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className={diferenca > 0 ? 'text-green-800' : 'text-red-800'}>
                    <div className="font-medium mb-2">Ajuste a ser realizado:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Saldo Atual:</span>
                        <span className="font-medium">{formatCurrency(saldoAtual)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Diferença:</span>
                        <span className="font-bold">
                          {diferenca > 0 ? '+' : ''}{formatCurrency(Math.abs(diferenca))}
                        </span>
                      </div>
                      <div className="flex justify-between text-base border-t pt-1 mt-1">
                        <span className="font-medium">Novo Saldo:</span>
                        <span className="font-bold">{formatCurrency(parseFloat(novoSaldo) || 0)}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Campo Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">
              Motivo do Ajuste *
            </Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Explique o motivo do ajuste manual (ex: correção de erro, acerto administrativo, etc)..."
              rows={4}
              disabled={isLoading}
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

          {/* Aviso */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 text-sm">
              <strong>Atenção:</strong> Este ajuste criará uma transação do tipo "Ajuste Manual" no histórico. Use apenas para correções administrativas necessárias.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || diferenca === 0 || motivo.trim().length < 3}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ajustando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Confirmar Ajuste
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
