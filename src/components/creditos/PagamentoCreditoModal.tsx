import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, CreditCard, DollarSign } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Credito, FORMAS_PAGAMENTO_CREDITO } from '@/types/creditos';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { z } from 'zod';

// Schema para validação do formulário de pagamento
const pagamentoCreditoSchema = z.object({
  credito_id: z.string().min(1, 'ID do crédito é obrigatório'),
  valor_pago: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_pagamento: z.string().min(1, 'Data do pagamento é obrigatória'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  observacoes: z.string().optional(),
});

type PagamentoCreditoFormData = z.infer<typeof pagamentoCreditoSchema>;

interface HistoricoPagamentoCredito {
  id: string;
  credito_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
  created_at: string;
}

interface PagamentoCreditoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito: Credito;
  pagamento?: HistoricoPagamentoCredito | null;
  historicoPagamentos?: HistoricoPagamentoCredito[];
  onSuccess: () => void;
  onRegistrarPagamento?: (dados: PagamentoCreditoFormData) => Promise<boolean>;
  onEditarPagamento?: (pagamentoId: string, dados: PagamentoCreditoFormData) => Promise<boolean>;
}

export function PagamentoCreditoModal({ 
  open, 
  onOpenChange, 
  credito, 
  pagamento,
  historicoPagamentos = [],
  onSuccess,
  onRegistrarPagamento,
  onEditarPagamento
}: PagamentoCreditoModalProps) {
  const form = useForm<PagamentoCreditoFormData>({
    resolver: zodResolver(pagamentoCreditoSchema),
    defaultValues: {
      credito_id: credito.id,
      valor_pago: 0,
      data_pagamento: format(new Date(), 'yyyy-MM-dd'),
      forma_pagamento: 'dinheiro',
      observacoes: ''
    }
  });

  // Calcular resumo dos pagamentos
  const totalPago = historicoPagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
  const saldoRestante = credito.valor_credito - totalPago;
  const percentualPago = credito.valor_credito > 0 ? (totalPago / credito.valor_credito) * 100 : 0;

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (open) {
      if (pagamento) {
        // Modo edição
        form.reset({
          credito_id: pagamento.credito_id,
          valor_pago: pagamento.valor_pago,
          data_pagamento: format(new Date(pagamento.data_pagamento), 'yyyy-MM-dd'),
          forma_pagamento: pagamento.forma_pagamento,
          observacoes: pagamento.observacoes || ''
        });
      } else {
        // Modo criação - sugerir valor restante
        form.reset({
          credito_id: credito.id,
          valor_pago: saldoRestante > 0 ? saldoRestante : credito.valor_credito,
          data_pagamento: format(new Date(), 'yyyy-MM-dd'),
          forma_pagamento: 'dinheiro',
          observacoes: ''
        });
      }
    }
  }, [open, pagamento, credito, form, saldoRestante]);

  // Submeter formulário
  const onSubmit = async (data: PagamentoCreditoFormData) => {
    try {
      let sucesso = false;
      
      if (pagamento && onEditarPagamento) {
        // Editar pagamento existente
        sucesso = await onEditarPagamento(pagamento.id, data);
      } else if (onRegistrarPagamento) {
        // Registrar novo pagamento
        sucesso = await onRegistrarPagamento(data);
      }

      if (sucesso) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    }
  };

  // Função para preencher valor total restante
  const preencherValorRestante = () => {
    form.setValue('valor_pago', saldoRestante);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {pagamento ? 'Editar Pagamento' : 'Registrar Pagamento do Crédito'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Valor do Pagamento */}
                <FormField
                  control={form.control}
                  name="valor_pago"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Pagamento *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        {!pagamento && saldoRestante > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={preencherValorRestante}
                            className="whitespace-nowrap"
                          >
                            Valor Restante
                          </Button>
                        )}
                      </div>
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
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
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
                      <FormLabel>Forma de Pagamento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a forma de pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FORMAS_PAGAMENTO_CREDITO.map((forma) => (
                            <SelectItem key={forma} value={forma.toLowerCase().replace(' ', '_')}>
                              {forma}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o pagamento..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {pagamento ? 'Atualizar' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Resumo do Crédito */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Crédito</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{credito.cliente?.nome || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span>{credito.tipo_credito}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data Criação:</span>
                    <span>
                      {format(new Date(credito.data_pagamento), 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>

                <hr />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(credito.valor_credito)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pago:</span>
                    <span className="text-green-600">
                      {formatCurrency(totalPago)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo Restante:</span>
                    <span className={saldoRestante > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(saldoRestante)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(percentualPago, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {percentualPago.toFixed(1)}% pago
                  </p>
                </div>

                {/* Histórico Resumido */}
                {historicoPagamentos.length > 0 && (
                  <>
                    <hr />
                    <div>
                      <h4 className="font-medium mb-2">Últimos Pagamentos</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {historicoPagamentos
                          .sort((a, b) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                          .slice(0, 3)
                          .map((pag, index) => (
                            <div key={pag.id || index} className="flex justify-between text-xs">
                              <span>{format(new Date(pag.data_pagamento), 'dd/MM')}</span>
                              <span className="text-green-600">{formatCurrency(pag.valor_pago)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}