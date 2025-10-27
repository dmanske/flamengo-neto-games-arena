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
import { useWalletDeposito, useWalletSaldo } from '@/hooks/useWallet';
import { 
  DepositoFormData, 
  depositoSchema, 
  FORMAS_PAGAMENTO_WALLET,
  WalletDepositoModalProps 
} from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { Wallet, DollarSign, User, CreditCard, FileText, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const WalletDepositoModal: React.FC<WalletDepositoModalProps> = ({
  open,
  onOpenChange,
  clienteId,
  onSuccess,
}) => {
  const [clienteSelecionado, setClienteSelecionado] = useState<string>(clienteId || '');
  
  // Hooks
  const { data: saldoAtual } = useWalletSaldo(clienteSelecionado);
  const depositoMutation = useWalletDeposito();

  // Form
  const form = useForm<DepositoFormData>({
    resolver: zodResolver(depositoSchema),
    defaultValues: {
      cliente_id: clienteId || '',
      valor: 0,
      data_deposito: format(new Date(), 'yyyy-MM-dd'),
      forma_pagamento: '',
      descricao: '',
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

  const onSubmit = async (data: DepositoFormData) => {
    try {
      await depositoMutation.mutateAsync(data);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Buscar dados do cliente selecionado (será feito pelo ClienteSearchSelect)
  const valorAtual = form.watch('valor');
  const novoSaldo = (saldoAtual?.saldo_atual || 0) + (valorAtual || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Novo Depósito na Carteira
          </DialogTitle>
          <DialogDescription>
            Registre um depósito para adicionar créditos à carteira do cliente.
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

            {/* Saldo Atual do Cliente */}
            {clienteSelecionado && saldoAtual && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Saldo Atual:</span>
                  <span className="font-semibold text-blue-900">
                    {formatCurrency(saldoAtual.saldo_atual || 0)}
                  </span>
                </div>
              </div>
            )}

            <Separator />

            {/* Data do Depósito */}
            <FormField
              control={form.control}
              name="data_deposito"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data do Depósito
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500">
                    Data em que o depósito foi realizado
                  </div>
                </FormItem>
              )}
            />

            {/* Valor do Depósito */}
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valor do Depósito
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
                        max="50000"
                        placeholder="0,00"
                        className="pl-10"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  
                  {/* Preview do Novo Saldo */}
                  {valorAtual > 0 && clienteSelecionado && (
                    <div className="mt-2 p-3 bg-green-50 rounded-md border border-green-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-700">Novo saldo após depósito:</span>
                        <span className="font-bold text-green-800">
                          {formatCurrency(novoSaldo)}
                        </span>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            {/* Forma de Pagamento */}
            <FormField
              control={form.control}
              name="forma_pagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Forma de Pagamento
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FORMAS_PAGAMENTO_WALLET.map((forma) => (
                        <SelectItem key={forma} value={forma}>
                          {forma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição/Observações */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Depósito mensal, Recarga de créditos, etc."
                      className="resize-none"
                      rows={3}
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="text-xs text-gray-500 text-right">
                    {field.value?.length || 0}/500 caracteres
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
                disabled={depositoMutation.isPending}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={depositoMutation.isPending || !clienteSelecionado}
                className="min-w-[120px]"
              >
                {depositoMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Confirmar Depósito
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
// COMPONENTE DE BOTÃO RÁPIDO PARA DEPÓSITO
// =====================================================

interface WalletDepositoButtonProps {
  clienteId?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

export const WalletDepositoButton: React.FC<WalletDepositoButtonProps> = ({
  clienteId,
  variant = 'default',
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
        <Wallet className="h-4 w-4 mr-2" />
        Novo Depósito
      </Button>

      <WalletDepositoModal
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

export default WalletDepositoModal;