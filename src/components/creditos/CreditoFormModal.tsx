import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Dialog,
  DialogContent,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';

import { creditoSchema, CreditoFormData } from '@/lib/validations/creditos';
import { Credito, FORMAS_PAGAMENTO_CREDITO } from '@/types/creditos';
import { cn } from '@/lib/utils';
import { ClienteSearchSelect } from '@/components/ingressos/ClienteSearchSelect';
import { useCreditos } from '@/hooks/useCreditos';

interface CreditoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito?: Credito | null;
  onSuccess: () => void;
}

export function CreditoFormModal({ 
  open, 
  onOpenChange, 
  credito, 
  onSuccess 
}: CreditoFormModalProps) {
  const { criarCredito, editarCredito, estados } = useCreditos();
  const isEditing = !!credito;

  const form = useForm<CreditoFormData>({
    resolver: zodResolver(creditoSchema),
    defaultValues: {
      cliente_id: credito?.cliente_id || '',
      valor_credito: credito?.valor_credito || 0,
      data_pagamento: credito?.data_pagamento || format(new Date(), 'yyyy-MM-dd'),
      forma_pagamento: credito?.forma_pagamento || 'nao_informado',
      observacoes: credito?.observacoes || '',
    }
  });

  // Reset form when credito changes
  React.useEffect(() => {
    if (credito) {
      form.reset({
        cliente_id: credito.cliente_id,
        valor_credito: credito.valor_credito,
        data_pagamento: credito.data_pagamento,
        forma_pagamento: credito.forma_pagamento || 'nao_informado',
        observacoes: credito.observacoes || '',
      });
    } else {
      form.reset({
        cliente_id: '',
        valor_credito: 0,
        data_pagamento: format(new Date(), 'yyyy-MM-dd'),
        forma_pagamento: 'nao_informado',
        observacoes: '',
      });
    }
  }, [credito, form]);

  const onSubmit = async (data: CreditoFormData) => {
    try {
      let success = false;
      
      // Converter "nao_informado" para undefined
      const dadosProcessados = {
        ...data,
        forma_pagamento: data.forma_pagamento === 'nao_informado' ? undefined : data.forma_pagamento,
      };
      
      if (isEditing && credito) {
        success = await editarCredito(credito.id, dadosProcessados);
      } else {
        success = await criarCredito(dadosProcessados);
      }

      if (success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar crédito:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? 'Editar Crédito' : 'Novo Crédito de Viagem'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente *</FormLabel>
                    <FormControl>
                      <ClienteSearchSelect
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Selecione o cliente"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valor do Crédito */}
              <FormField
                control={form.control}
                name="valor_credito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Crédito *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data do Pagamento */}
              <FormField
                control={form.control}
                name="data_pagamento"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data do Pagamento *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                            ) : (
                              <span>Selecione a data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => 
                            field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forma de Pagamento */}
              <FormField
                control={form.control}
                name="forma_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="nao_informado">Não informado</SelectItem>
                        {FORMAS_PAGAMENTO_CREDITO.map((forma) => (
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
            </div>

            {/* Observações */}
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o crédito..." 
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={estados.salvando}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={estados.salvando}
              >
                {estados.salvando ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Crédito')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}