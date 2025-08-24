import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, Calculator } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

import { useIngressos } from '@/hooks/useIngressos';
import { useViagens } from '@/hooks/useViagens';

import { ingressoSchema, IngressoFormData } from '@/lib/validations/ingressos';
import { Ingresso, LocalJogo, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { ClienteSearchSelect } from './ClienteSearchSelect';
import { AdversarioSearchInput } from './AdversarioSearchInput';
import { getSetorOptions } from '@/data/estadios';

interface IngressoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingresso?: Ingresso | null;
  onSuccess: () => void;
}

export function IngressoFormModal({ 
  open, 
  onOpenChange, 
  ingresso, 
  onSuccess 
}: IngressoFormModalProps) {
  const { criarIngresso, atualizarIngresso, calcularValores, estados } = useIngressos();
  const { viagens, buscarViagensAtivas } = useViagens();
  const { buscarLogosAdversarios } = useIngressos();
  
  // Usar setores do Maracanã já definidos no sistema
  const setoresMaracana = getSetorOptions("Rio de Janeiro");

  const [localJogo, setLocalJogo] = useState<LocalJogo>('casa');
  const [logosAdversarios, setLogosAdversarios] = useState<Record<string, string>>({});
  const [valoresCalculados, setValoresCalculados] = useState({
    valorFinal: 0,
    lucro: 0,
    margemPercentual: 0
  });

  const form = useForm<IngressoFormData>({
    resolver: zodResolver(ingressoSchema),
    defaultValues: {
      cliente_id: '',
      viagem_id: null,
      jogo_data: new Date().toISOString().split('T')[0], // YYYY-MM-DD simples
      adversario: '',
      logo_adversario: '',
      local_jogo: 'casa',
      setor_estadio: '',
      preco_custo: 0,
      preco_venda: 0,
      desconto: 0,
      situacao_financeira: 'pendente',
      observacoes: ''
    }
  });

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (open) {
      buscarViagensAtivas();
      
      // Carregar logos dos adversários
      const carregarLogos = async () => {
        const logos = await buscarLogosAdversarios();
        setLogosAdversarios(logos);
      };
      carregarLogos();
      
      if (ingresso) {
        // Modo edição
        form.reset({
          cliente_id: ingresso.cliente_id,
          viagem_id: ingresso.viagem_id,
          jogo_data: ingresso.jogo_data.split('T')[0], // Pegar apenas YYYY-MM-DD
          adversario: ingresso.adversario,
          logo_adversario: ingresso.logo_adversario || '',
          local_jogo: ingresso.local_jogo,
          setor_estadio: ingresso.setor_estadio,
          preco_custo: ingresso.preco_custo,
          preco_venda: ingresso.preco_venda,
          desconto: ingresso.desconto,
          situacao_financeira: ingresso.situacao_financeira,
          observacoes: ingresso.observacoes || ''
        });
        setLocalJogo(ingresso.local_jogo);
      } else {
        // Modo criação
        form.reset({
          cliente_id: '',
          viagem_id: null,
          jogo_data: new Date().toISOString().split('T')[0], // YYYY-MM-DD simples
          adversario: '',
          logo_adversario: '',
          local_jogo: 'casa',
          setor_estadio: '',
          preco_custo: 0,
          preco_venda: 0,
          desconto: 0,
          situacao_financeira: 'pendente',
          observacoes: ''
        });
        setLocalJogo('casa');
      }
    }
  }, [open, ingresso, form, buscarViagensAtivas]);

  // Calcular valores em tempo real
  useEffect(() => {
    const subscription = form.watch((values) => {
      const precoVenda = Number(values.preco_venda) || 0;
      const desconto = Number(values.desconto) || 0;
      const precoCusto = Number(values.preco_custo) || 0;
      
      const calculados = calcularValores(precoVenda, desconto, precoCusto);
      setValoresCalculados(calculados);
    });

    return () => subscription.unsubscribe();
  }, [form, calcularValores]);

  // Atualizar local do jogo
  const handleLocalJogoChange = (novoLocal: LocalJogo) => {
    setLocalJogo(novoLocal);
    form.setValue('local_jogo', novoLocal);
    
    // Limpar setor quando mudar o local
    form.setValue('setor_estadio', '');
  };

  // Submeter formulário
  const onSubmit = async (data: IngressoFormData) => {
    
    try {
      // Não incluir campos calculados (valor_final, lucro, margem_percentual são colunas geradas)
      const dadosParaSalvar = data;
      

      
      let sucesso = false;
      
      if (ingresso) {
        // Editar ingresso existente
        sucesso = await atualizarIngresso(ingresso.id, dadosParaSalvar);
      } else {
        // Criar novo ingresso - passar valor calculado como backup
        sucesso = await criarIngresso({
          ...dadosParaSalvar,
          valorFinalCalculado: valoresCalculados.valorFinal
        });
      }

      if (sucesso) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao salvar ingresso:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ingresso ? 'Editar Ingresso' : 'Novo Ingresso'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna 1: Dados do Cliente e Jogo */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dados do Jogo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Cliente */}
                    <FormField
                      control={form.control}
                      name="cliente_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cliente *</FormLabel>
                          <FormControl>
                            <ClienteSearchSelect
                              value={field.value || ""}
                              onValueChange={field.onChange}
                              placeholder="Selecione o cliente"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Viagem (Opcional) */}
                    <FormField
                      control={form.control}
                      name="viagem_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Viagem (Opcional)</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              field.onChange(value === 'nenhuma' ? null : value);
                              
                              // Preencher automaticamente data e adversário se viagem selecionada
                              if (value !== 'nenhuma') {
                                const viagemSelecionada = viagens.find(v => v.id === value);
                                if (viagemSelecionada) {
                                  form.setValue('jogo_data', viagemSelecionada.data_jogo.split('T')[0]);
                                  form.setValue('adversario', viagemSelecionada.adversario);
                                }
                              }
                            }} 
                            value={field.value || 'nenhuma'}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Vincular a uma viagem existente" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="nenhuma">Nenhuma viagem</SelectItem>
                              {viagens.map((viagem) => (
                                <SelectItem key={viagem.id} value={viagem.id}>
                                  {viagem.adversario} - {format(new Date(viagem.data_jogo), 'dd/MM/yyyy')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Data do Jogo */}
                      <FormField
                        control={form.control}
                        name="jogo_data"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data do Jogo *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                className="w-full"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Adversário */}
                      <FormField
                        control={form.control}
                        name="adversario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adversário *</FormLabel>
                            <FormControl>
                              <AdversarioSearchInput
                                value={field.value}
                                onValueChange={field.onChange}
                                onLogoChange={(logoUrl) => form.setValue('logo_adversario', logoUrl)}
                                placeholder="Digite o nome do adversário..."
                                disabled={estados.salvando}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Logo do Adversário */}
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="logo_adversario"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo do Adversário (opcional)</FormLabel>
                            <div className="flex gap-3 items-start">
                              {/* Preview do logo */}
                              <div className="w-12 h-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                                {field.value ? (
                                  <img 
                                    src={field.value} 
                                    alt="Logo do adversário" 
                                    className="w-8 h-8 object-contain" 
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = `https://via.placeholder.com/32x32/cccccc/666666?text=${form.watch('adversario')?.substring(0, 2).toUpperCase() || '?'}`;
                                    }}
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium">
                                    {form.watch('adversario')?.substring(0, 2).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                              
                              {/* Campo de input */}
                              <div className="flex-1">
                                <FormControl>
                                  <Input 
                                    placeholder="https://logodetimes.com/..." 
                                    {...field} 
                                    value={field.value || ''}
                                    disabled={estados.salvando}
                                  />
                                </FormControl>
                                <p className="text-xs text-gray-500 mt-1">
                                  {field.value ? 
                                    'URL personalizada do logo (editável)' : 
                                    'Será preenchido automaticamente ao selecionar adversário'
                                  }
                                </p>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Local do Jogo */}
                    <div className="space-y-2">
                      <FormLabel>Local do Jogo *</FormLabel>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={localJogo === 'casa' ? 'default' : 'outline'}
                          onClick={() => handleLocalJogoChange('casa')}
                          className="flex-1"
                        >
                          🏠 Casa (Maracanã)
                        </Button>
                        <Button
                          type="button"
                          variant={localJogo === 'fora' ? 'default' : 'outline'}
                          onClick={() => handleLocalJogoChange('fora')}
                          className="flex-1"
                        >
                          ✈️ Fora
                        </Button>
                      </div>
                    </div>

                    {/* Setor */}
                    <FormField
                      control={form.control}
                      name="setor_estadio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor *</FormLabel>
                          {localJogo === 'casa' ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o setor do Maracanã" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {setoresMaracana.map((setor) => (
                                  <SelectItem key={setor} value={setor}>
                                    {setor}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <FormControl>
                              <Input 
                                placeholder="Digite o setor do estádio visitante" 
                                {...field} 
                              />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Observações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Informações adicionais sobre o ingresso..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Coluna 2: Controle Financeiro */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Controle Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Preço de Custo */}
                    <FormField
                      control={form.control}
                      name="preco_custo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Custo *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Preço de Venda */}
                    <FormField
                      control={form.control}
                      name="preco_venda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Venda *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Desconto */}
                    <FormField
                      control={form.control}
                      name="desconto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name="situacao_financeira"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status de Pagamento</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pendente">⏳ Pendente</SelectItem>
                              <SelectItem value="pago">✅ Pago</SelectItem>
                              <SelectItem value="cancelado">❌ Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Resumo Calculado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Valor Final:</span>
                      <span className="font-semibold">
                        {formatCurrency(valoresCalculados.valorFinal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lucro:</span>
                      <span className={`font-semibold ${
                        valoresCalculados.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(valoresCalculados.lucro)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margem:</span>
                      <Badge variant={valoresCalculados.margemPercentual >= 0 ? 'default' : 'destructive'}>
                        {valoresCalculados.margemPercentual.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
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
              <Button
                type="submit"
                disabled={estados.salvando}
              >
                {estados.salvando ? 'Salvando...' : (ingresso ? 'Atualizar' : 'Cadastrar')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}