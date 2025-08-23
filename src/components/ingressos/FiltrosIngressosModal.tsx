import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Filter, X } from 'lucide-react';
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
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

import { filtrosIngressosSchema, FiltrosIngressosFormData } from '@/lib/validations/ingressos';
import { FiltrosIngressos } from '@/types/ingressos';
import { cn } from '@/lib/utils';
import { ClienteSearchSelect } from './ClienteSearchSelect';
import { getSetorOptions } from '@/data/estadios';

interface FiltrosIngressosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filtros: FiltrosIngressos;
  onFiltrosChange: (filtros: FiltrosIngressos) => void;
}

export function FiltrosIngressosModal({ 
  open, 
  onOpenChange, 
  filtros, 
  onFiltrosChange 
}: FiltrosIngressosModalProps) {
  // Usar setores do Maracanã já definidos no sistema
  const setoresMaracana = getSetorOptions("Rio de Janeiro");

  const form = useForm<FiltrosIngressosFormData>({
    resolver: zodResolver(filtrosIngressosSchema),
    defaultValues: {
      cliente_id: filtros.cliente_id || '',
      situacao_financeira: filtros.situacao_financeira || 'todos',
      local_jogo: filtros.local_jogo || 'todos',
      data_inicio: filtros.data_inicio || '',
      data_fim: filtros.data_fim || '',
      adversario: filtros.adversario || '',
      setor_estadio: filtros.setor_estadio || 'todos'
    }
  });

  // Não precisa mais do useEffect para clientes - o componente ClienteSearchSelect gerencia isso

  // Aplicar filtros
  const onSubmit = (data: FiltrosIngressosFormData) => {
    // Remover campos vazios e valores "todos"
    const filtrosLimpos: FiltrosIngressos = {};
    
    if (data.cliente_id && data.cliente_id !== '') filtrosLimpos.cliente_id = data.cliente_id;
    if (data.situacao_financeira && data.situacao_financeira !== 'todos') filtrosLimpos.situacao_financeira = data.situacao_financeira;
    if (data.local_jogo && data.local_jogo !== 'todos') filtrosLimpos.local_jogo = data.local_jogo;
    if (data.data_inicio) filtrosLimpos.data_inicio = data.data_inicio;
    if (data.data_fim) filtrosLimpos.data_fim = data.data_fim;
    if (data.adversario) filtrosLimpos.adversario = data.adversario;
    if (data.setor_estadio && data.setor_estadio !== 'todos') filtrosLimpos.setor_estadio = data.setor_estadio;

    onFiltrosChange(filtrosLimpos);
    onOpenChange(false);
  };

  // Limpar todos os filtros
  const limparFiltros = () => {
    form.reset({
      cliente_id: '',
      situacao_financeira: 'todos',
      local_jogo: 'todos',
      data_inicio: '',
      data_fim: '',
      adversario: '',
      setor_estadio: 'todos'
    });
    onFiltrosChange({});
    onOpenChange(false);
  };

  // Contar filtros ativos
  const filtrosAtivos = Object.keys(filtros).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
              {filtrosAtivos > 0 && (
                <Badge variant="secondary">
                  {filtrosAtivos} ativo{filtrosAtivos > 1 ? 's' : ''}
                </Badge>
              )}
            </DialogTitle>
            {filtrosAtivos > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limparFiltros}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Tudo
              </Button>
            )}
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
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <ClienteSearchSelect
                        value={field.value || ""}
                        onValueChange={field.onChange}
                        placeholder="Todos os clientes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Financeiro */}
              <FormField
                control={form.control}
                name="situacao_financeira"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todos">Todos os status</SelectItem>
                        <SelectItem value="pago">✅ Pago</SelectItem>
                        <SelectItem value="pendente">⏳ Pendente</SelectItem>
                        <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Local do Jogo */}
              <FormField
                control={form.control}
                name="local_jogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local do Jogo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os locais" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todos">Todos os locais</SelectItem>
                        <SelectItem value="casa">🏠 Casa (Maracanã)</SelectItem>
                        <SelectItem value="fora">✈️ Fora</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Setor */}
              <FormField
                control={form.control}
                name="setor_estadio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Setor</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os setores" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todos">Todos os setores</SelectItem>
                        {setoresMaracana.map((setor) => (
                          <SelectItem key={setor} value={setor}>
                            {setor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Adversário */}
            <FormField
              control={form.control}
              name="adversario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adversário</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome do adversário..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Período */}
            <div className="space-y-2">
              <FormLabel>Período do Jogo</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data Início */}
                <FormField
                  control={form.control}
                  name="data_inicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm text-muted-foreground">
                        Data Inicial
                      </FormLabel>
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
                                <span>Selecione...</span>
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

                {/* Data Fim */}
                <FormField
                  control={form.control}
                  name="data_fim"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm text-muted-foreground">
                        Data Final
                      </FormLabel>
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
                                <span>Selecione...</span>
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
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Aplicar Filtros
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}