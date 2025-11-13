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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletAdmin } from '@/hooks/useWalletAdmin';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, AlertTriangle, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WalletDeleteModalProps {
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
  totalTransacoes?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WalletDeleteModal: React.FC<WalletDeleteModalProps> = ({
  clienteId,
  clienteNome,
  saldoAtual,
  totalTransacoes = 0,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { deletarCarteira } = useWalletAdmin();
  const navigate = useNavigate();
  
  const [confirmacaoNome, setConfirmacaoNome] = useState<string>('');
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Resetar form quando abrir modal
  useEffect(() => {
    if (isOpen) {
      setConfirmacaoNome('');
      setConfirmacaoExcluir('');
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    setConfirmacaoNome('');
    setConfirmacaoExcluir('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação de confirmação do nome
    if (confirmacaoNome.trim().toLowerCase() !== clienteNome.toLowerCase()) {
      setError('O nome digitado não corresponde ao nome do cliente');
      return;
    }

    // Validação de confirmação "EXCLUIR"
    if (confirmacaoExcluir.trim().toUpperCase() !== 'EXCLUIR') {
      setError('Digite EXCLUIR (em maiúsculas) para confirmar');
      return;
    }

    try {
      await deletarCarteira.mutateAsync(clienteId);

      // Redirecionar para lista de carteiras
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/creditos-prepagos');
      }
      
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir carteira');
    }
  };

  const isLoading = deletarCarteira.isPending;
  const nomeCorreto = confirmacaoNome.trim().toLowerCase() === clienteNome.toLowerCase();
  const excluirCorreto = confirmacaoExcluir.trim().toUpperCase() === 'EXCLUIR';
  const confirmacaoCompleta = nomeCorreto && excluirCorreto;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Carteira
          </DialogTitle>
          <DialogDescription>
            Esta ação é <strong className="text-red-600">irreversível</strong> e irá deletar permanentemente a carteira e todo o histórico de transações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Informações da Carteira */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Cliente:</span>
              <span className="font-medium">{clienteNome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Atual:</span>
              <span className={`font-bold ${saldoAtual > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(saldoAtual)}
              </span>
            </div>
            {totalTransacoes > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Transações:</span>
                <span className="font-medium">{totalTransacoes}</span>
              </div>
            )}
          </div>

          {/* Aviso sobre saldo */}
          {saldoAtual > 0 && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>⚠️ Atenção:</strong> Esta carteira possui saldo de <strong>{formatCurrency(saldoAtual)}</strong>. 
                Ao excluir, este valor será perdido permanentemente.
              </AlertDescription>
            </Alert>
          )}

          {/* Campo de Confirmação - Nome */}
              <div className="space-y-2">
                <Label htmlFor="confirmacaoNome">
                  1. Digite o nome do cliente para confirmar *
                </Label>
                <Input
                  id="confirmacaoNome"
                  type="text"
                  value={confirmacaoNome}
                  onChange={(e) => setConfirmacaoNome(e.target.value)}
                  placeholder={clienteNome}
                  disabled={isLoading}
                  required
                  className={nomeCorreto ? 'border-green-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Digite exatamente: <strong>{clienteNome}</strong>
                </p>
              </div>

              {/* Campo de Confirmação - EXCLUIR */}
              <div className="space-y-2">
                <Label htmlFor="confirmacaoExcluir">
                  2. Digite EXCLUIR para confirmar *
                </Label>
                <Input
                  id="confirmacaoExcluir"
                  type="text"
                  value={confirmacaoExcluir}
                  onChange={(e) => setConfirmacaoExcluir(e.target.value)}
                  placeholder="EXCLUIR"
                  disabled={isLoading}
                  required
                  className={excluirCorreto ? 'border-green-500' : ''}
                />
                <p className="text-xs text-gray-500">
                  Digite exatamente: <strong className="text-red-600">EXCLUIR</strong> (em maiúsculas)
                </p>
              </div>

              {/* Lista do que será deletado */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="font-medium mb-2">⚠️ O que será deletado:</div>
                  <ul className="text-sm space-y-1 list-disc list-inside">
                    <li>Registro da carteira</li>
                    {totalTransacoes > 0 && (
                      <li><strong>{totalTransacoes}</strong> transação(ões) no histórico</li>
                    )}
                    <li>Todos os dados relacionados</li>
                  </ul>
                  <div className="mt-3 font-medium">
                    Esta ação NÃO pode ser desfeita!
                  </div>
                </AlertDescription>
              </Alert>

          {/* Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
              disabled={isLoading || !confirmacaoCompleta}
              variant="destructive"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Permanentemente
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
