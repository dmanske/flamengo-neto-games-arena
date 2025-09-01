import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDateTimeSafe } from '@/lib/date-utils';

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

import { usePagamentosIngressos } from '@/hooks/usePagamentosIngressos';
import { pagamentoIngressoSchema, PagamentoIngressoFormData } from '@/lib/validations/ingressos';
import { Ingresso, HistoricoPagamentoIngresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface PagamentoIngressoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso: Ingresso;
  pagamento?: HistoricoPagamentoIngresso | null;
  onSuccess: () => void;
}

export function PagamentoIngressoModal({ 
  open, 
  onOpenChange, 
  ingresso, 
  pagamento, 
  onSuccess 
}: PagamentoIngressoModalProps) {
  const { 
    registrarPagamento, 
    editarPagamento, 
    estados, 
    formasPagamento,
    calcularResumo,
    buscarPagamentos
  } = usePagamentosIngressos();

  const form = useForm<PagamentoIngressoFormData>({
    resolver: zodResolver(pagamentoIngressoSchema),
    defaultValues: {
      ingresso_id: ingresso.id,
      valor_pago: 0,
      data_pagamento: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      forma_pagamento: 'dinheiro',
      observacoes: ''
    }
  });

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (open && ingresso) {
      // Carregar pagamentos existentes para calcular resumo correto
      buscarPagamentos(ingresso.id);
      
      if (pagamento) {
        // Modo edição
        form.reset({
          ingresso_id: pagamento.ingresso_id,
          valor_pago: pagamento.valor_pago,
          data_pagamento: new Date(pagamento.data_pagamento).toISOString().slice(0, 10),
          forma_pagamento: pagamento.forma_pagamento,
          observacoes: pagamento.observacoes || ''
        });
      } else {
        // Modo criação - sugerir valor total inicialmente
        form.reset({
          ingresso_id: ingresso.id,
          valor_pago: ingresso.valor_final,
          data_pagamento: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
          forma_pagamento: 'dinheiro',
          observacoes: ''
        });
      }
    }
  }, [open, pagamento, ingresso, form, buscarPagamentos]);

  // Submeter formulário
  const onSubmit = async (data: PagamentoIngressoFormData) => {
    try {
      let sucesso = false;
      
      if (pagamento) {
        // Editar pagamento existente
        sucesso = await editarPagamento(pagamento.id, data);
      } else {
        // Registrar novo pagamento
        sucesso = await registrarPagamento(data);
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
    const resumo = calcularResumo(ingresso.valor_final);
    const valorRestante = resumo.saldoDevedor > 0 ? resumo.saldoDevedor : ingresso.valor_final;
    form.setValue('valor_pago', valorRestante);
  };

  const resumoAtual = calcularResumo(ingresso.valor_final);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {pagamento ? 'Editar Pagamento' : 'Registrar Pagamento'}
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
                            max={pagamento ? undefined : resumoAtual.saldoDevedor}
                            placeholder="0,00"
                            {...field}
                            onChange={(e) => {
                              const valor = Number(e.target.value);
                              // Se não for edição, limitar ao saldo devedor
                              if (!pagamento && valor > resumoAtual.saldoDevedor) {
                                field.onChange(resumoAtual.saldoDevedor);
                              } else {
                                field.onChange(valor);
                              }
                            }}
                          />
                        </FormControl>
                        {!pagamento && resumoAtual.saldoDevedor > 0 && (
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
                      {!pagamento && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Valor máximo: {formatCurrency(resumoAtual.saldoDevedor)}
                        </p>
                      )}
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
                                formatDateTimeSafe(field.value, "dd/MM/yyyy")
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
                          {formasPagamento.map((forma) => (
                            <SelectItem key={forma.value} value={forma.value}>
                              {forma.label}
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
                  <Button
                    type="submit"
                    disabled={estados.salvando}
                  >
                    {estados.salvando ? 'Salvando...' : (pagamento ? 'Atualizar' : 'Registrar')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Resumo do Ingresso */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Ingresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jogo:</span>
                    <span className="font-medium">{ingresso.adversario}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Data:</span>
                    <span>
                      {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente:</span>
                    <span className="font-medium">
                      {ingresso.cliente?.nome || 'N/A'}
                    </span>
                  </div>
                </div>

                <hr />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(ingresso.valor_final)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Pago:</span>
                    <span className="text-green-600">
                      {formatCurrency(resumoAtual.totalPago)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saldo Devedor:</span>
                    <span className={resumoAtual.saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'}>
                      {formatCurrency(resumoAtual.saldoDevedor)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="space-y-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(resumoAtual.percentualPago, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    {resumoAtual.percentualPago.toFixed(1)}% pago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}