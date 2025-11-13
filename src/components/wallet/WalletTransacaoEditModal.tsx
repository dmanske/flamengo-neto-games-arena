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
import { WalletTransacao } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, Edit } from 'lucide-react';

interface WalletTransacaoEditModalProps {
  transacao: WalletTransacao | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const WalletTransacaoEditModal: React.FC<WalletTransacaoEditModalProps> = ({
  transacao,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { editarTransacao } = useWalletAdmin();
  
  const [valor, setValor] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Resetar form quando abrir modal
  useEffect(() => {
    if (isOpen && transacao) {
      setValor(transacao.valor.toString());
      setDescricao(transacao.descricao || '');
      setError(null);
    }
  }, [isOpen, transacao]);

  const handleClose = () => {
    setValor('');
    setDescricao('');
    setError(null);
    onClose();
  };

  const calcularDiferenca = (): number => {
    if (!transacao) return 0;
    const novoValor = parseFloat(valor) || 0;
    return novoValor - transacao.valor;
  };

  const calcularImpactoSaldo = (): { novoSaldo: number; diferenca: number } => {
    if (!transacao) return { novoSaldo: 0, diferenca: 0 };
    
    const diferenca = calcularDiferenca();
    let impacto = diferenca;
    
    // Se é uso, o impacto no saldo é inverso
    if (transacao.tipo === 'uso') {
      impacto = -diferenca;
    }
    
    return {
      diferenca,
      novoSaldo: transacao.saldo_posterior + impacto
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!transacao) return;

    // Validações
    const novoValor = parseFloat(valor);
    
    if (isNaN(novoValor) || novoValor <= 0) {
      setError('O valor deve ser maior que zero');
      return;
    }

    if (!descricao.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    if (novoValor === transacao.valor && descricao === transacao.descricao) {
      setError('Nenhuma alteração foi feita');
      return;
    }

    try {
      await editarTransacao.mutateAsync({
        transacao_id: transacao.id,
        novo_valor: novoValor,
        nova_descricao: descricao.trim(),
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao editar transação');
    }
  };

  if (!transacao) return null;

  const { diferenca, novoSaldo } = calcularImpactoSaldo();
  const isLoading = editarTransacao.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-blue-600" />
            Editar Transação
          </DialogTitle>
          <DialogDescription>
            Altere o valor ou descrição da transação. O saldo será recalculado automaticamente.
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
              <span className="text-gray-600">Valor Original:</span>
              <span className="font-medium">{formatCurrency(transacao.valor)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className="font-medium">{formatCurrency(transacao.saldo_posterior)}</span>
            </div>
          </div>

          {/* Campo Valor */}
          <div className="space-y-2">
            <Label htmlFor="valor">Novo Valor *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="pl-10"
                placeholder="0,00"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Campo Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva a transação..."
              rows={3}
              disabled={isLoading}
              required
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {descricao.length}/500 caracteres
            </p>
          </div>

          {/* Preview do Impacto */}
          {diferenca !== 0 && (
            <Alert className={diferenca > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-start gap-2">
                {diferenca > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <AlertDescription className={diferenca > 0 ? 'text-green-800' : 'text-red-800'}>
                    <div className="font-medium mb-1">Impacto no Saldo:</div>
                    <div className="text-sm space-y-1">
                      <div>
                        Diferença: {diferenca > 0 ? '+' : ''}{formatCurrency(Math.abs(diferenca))}
                      </div>
                      <div>
                        Novo saldo: {formatCurrency(novoSaldo)}
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Aviso */}
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-sm">
              Esta ação irá alterar o saldo da carteira. O valor original será preservado para histórico.
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
              disabled={isLoading || diferenca === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
