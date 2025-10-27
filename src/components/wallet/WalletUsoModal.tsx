import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClienteSearchSelect } from '@/components/ingressos/ClienteSearchSelect';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletUso, useWalletSaldo } from '@/hooks/useWallet';
import { 
  UsoFormData, 
  usoSchema, 
  WalletUsoModalProps 
} from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { 
  ShoppingCart, 
  DollarSign, 
  User, 
  FileText, 
  Loader2, 
  AlertTriangle,
  Wallet,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

export const WalletUsoModal: React.FC<WalletUsoModalProps> = ({
  open,
  onOpenChange,
  clienteId,
  onSuccess,
}) => {
  const [clienteSelecionado, setClienteSelecionado] = useState<string>(clienteId || '');
  
  // Hooks
  const { data: saldoAtual } = useWalletSaldo(clienteSelecionado);
  const usoMutation = useWalletUso();

  // Form
  const form = useForm<UsoFormData>({
    resolver: zodResolver(usoSchema),
    defaultValues: {
      cliente_id: clienteId || '',
      valor: 0,
      descricao: '',
      referencia_externa: '',
    },
  });

  // Atualizar cliente_id quando prop mudar
  useEffect(() => {
    if (clienteId) {
      setClienteSelecionado(clienteId);
      form.setValue('cliente_id', clienteId);
    }
  }, [clienteId, form]);

  // Reset form quando modal abrir/fechar
  useEffect(() => {
    if (!open) {
      form.reset();
      if (!clienteId) {
        setClienteSelecionado('');
      }
    }
  }, [open, form, clienteId]);

  const onSubmit = async (data: UsoFormData) => {
    try {
      await usoMutation.mutateAsync(data);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Cliente será gerenciado pelo ClienteSearchSelect
  const valorUso = form.watch('valor');
  const saldoDisponivel = saldoAtual?.saldo_atual || 0;
  const novoSaldo = saldoDisponivel - (valorUso || 0);
  const saldoInsuficiente = valorUso > saldoDisponivel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-red-600" />
            Registrar Uso de Créditos
          </DialogTitle>
          <DialogDescription>
            Registre manualmente o uso de créditos da carteira do cliente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção de Cliente */}
            {!clienteId && (
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente
                    </FormLabel>
                    <FormControl>
                      <ClienteSearchSelect
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setClienteSelecionado(value);
                        }}
                        placeholder="Buscar cliente por nome, telefone ou email..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Saldo Disponível do Cliente */}
            {clienteSelecionado && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Saldo Disponível:</span>
                  <span className={`font-semibold ${saldoDisponivel > 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(saldoDisponivel)}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Valor do Uso */}
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor a Usar
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={saldoDisponivel}
                        placeholder="0,00"
                        className={`pl-10 ${saldoInsuficiente ? 'border-red-300 focus:border-red-500' : ''}`}
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Validação de Saldo */}
                  {clienteSelecionado && valorUso > 0 && (
                    <div className={`mt-2 p-3 rounded-md border ${
                      saldoInsuficiente 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-green-50 border-green-200'
                    }`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={saldoInsuficiente ? 'text-red-700' : 'text-green-700'}>
                          {saldoInsuficiente ? 'Saldo insuficiente!' : 'Saldo após uso:'}
                        </span>
                        <span className={`font-bold ${
                          saldoInsuficiente ? 'text-red-800' : 'text-green-800'
                        }`}>
                          {saldoInsuficiente 
                            ? `Falta: ${formatCurrency(Math.abs(novoSaldo))}`
                            : formatCurrency(novoSaldo)
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Alerta de Saldo Insuficiente */}
            {saldoInsuficiente && valorUso > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Saldo insuficiente!</strong> O cliente possui apenas {formatCurrency(saldoDisponivel)} disponível.
                  É necessário fazer um depósito antes de usar este valor.
                </AlertDescription>
              </Alert>
            )}

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição do Uso *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Viagem Flamengo x Vasco, Passeio Cristo Redentor, etc."
                      className="resize-none"
                      rows={3}
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 text-right">
                    {field.value?.length || 0}/200 caracteres
                  </div>
                </FormItem>
              )}
            />

            {/* Referência Externa */}
            <FormField
              control={form.control}
              name="referencia_externa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Referência Externa (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: ID da viagem, número do pedido, etc."
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500">
                    Use para vincular este uso a uma viagem ou compra específica
                  </div>
                </FormItem>
              )}
            />

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={usoMutation.isPending}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={usoMutation.isPending || !clienteSelecionado || saldoInsuficiente}
                className="min-w-[120px] bg-red-600 hover:bg-red-700"
              >
                {usoMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Confirmar Uso
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// =====================================================
// COMPONENTE DE BOTÃO RÁPIDO PARA USO
// =====================================================

interface WalletUsoButtonProps {
  clienteId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

export const WalletUsoButton: React.FC<WalletUsoButtonProps> = ({
  clienteId,
  variant = 'outline',
  size = 'default',
  className,
  onSuccess,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setModalOpen(true)}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Registrar Uso
      </Button>

      <WalletUsoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clienteId={clienteId}
        onSuccess={() => {
          onSuccess?.();
          setModalOpen(false);
        }}
      />
    </>
  );
};

export default WalletUsoModal;