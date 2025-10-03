import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { DespesaJogo } from '@/hooks/financeiro/useJogoFinanceiro';
import { formatCurrency, parseCurrency } from '@/utils/formatters';
import { CalendarIcon, Receipt, TrendingDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// SCHEMA DE VALIDAÇÃO
// =====================================================

const despesaJogoSchema = z.object({
  tipo: z.enum(['custo_ingresso', 'transporte', 'alimentacao', 'comissao', 'marketing', 'outros'], {
    required_error: 'Selecione o tipo de despesa'
  }),
  categoria: z.enum(['fixa', 'variavel'], {
    required_error: 'Selecione a categoria da despesa'
  }),
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  fornecedor: z.string()
    .max(100, 'Nome do fornecedor deve ter no máximo 100 caracteres')
    .optional(),
  valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  data_despesa: z.string()
    .min(1, 'Data é obrigatória'),
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
});

type DespesaJogoFormData = z.infer<typeof despesaJogoSchema>;

// =====================================================
// TIPOS DE DESPESA
// =====================================================

const TIPOS_DESPESA = [
  { 
    value: 'custo_ingresso', 
    label: 'Custo de Ingresso', 
    description: 'Preço de compra dos ingressos',
    categoria: 'variavel',
    icon: '🎫'
  },
  { 
    value: 'transporte', 
    label: 'Transporte', 
    description: 'Custos de deslocamento e logística',
    categoria: 'variavel',
    icon: '🚌'
  },
  { 
    value: 'alimentacao', 
    label: 'Alimentação', 
    description: 'Custos com alimentação e bebidas',
    categoria: 'variavel',
    icon: '🍽️'
  },
  { 
    value: 'comissao', 
    label: 'Comissão', 
    description: 'Comissões de vendas e parcerias',
    categoria: 'variavel',
    icon: '💼'
  },
  { 
    value: 'marketing', 
    label: 'Marketing', 
    description: 'Publicidade e promoção do jogo',
    categoria: 'fixa',
    icon: '📢'
  },
  { 
    value: 'outros', 
    label: 'Outros', 
    description: 'Outras despesas não categorizadas',
    categoria: 'variavel',
    icon: '📋'
  }
] as const;

const CATEGORIAS_DESPESA = [
  { 
    value: 'fixa', 
    label: 'Despesa Fixa', 
    description: 'Custos que não variam com o volume de vendas',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    value: 'variavel', 
    label: 'Despesa Variável', 
    description: 'Custos que variam conforme as vendas',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  }
] as const;

// =====================================================
// PROPS DO COMPONENTE
// =====================================================

interface DespesaJogoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (despesa: Omit<DespesaJogo, 'id' | 'jogo_key' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingDespesa?: DespesaJogo | null;
  jogoData: string; // Data do jogo para sugerir como data padrão
  receitaTotal?: number; // Para calcular impacto na margem
  isLoading?: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function DespesaJogoForm({
  isOpen,
  onClose,
  onSubmit,
  editingDespesa,
  jogoData,
  receitaTotal = 0,
  isLoading = false
}: DespesaJogoFormProps) {
  
  // =====================================================
  // CONFIGURAÇÃO DO FORMULÁRIO
  // =====================================================
  
  const form = useForm<DespesaJogoFormData>({
    resolver: zodResolver(despesaJogoSchema),
    defaultValues: {
      tipo: 'outros',
      categoria: 'variavel',
      descricao: '',
      fornecedor: '',
      valor: 0,
      data_despesa: jogoData,
      observacoes: ''
    }
  });

  // =====================================================
  // EFFECT PARA CARREGAR DADOS NA EDIÇÃO
  // =====================================================

  useEffect(() => {
    if (editingDespesa) {
      // Carregando dados para edição
      form.reset({
        tipo: editingDespesa.tipo,
        categoria: editingDespesa.categoria,
        descricao: editingDespesa.descricao,
        fornecedor: editingDespesa.fornecedor || '',
        valor: editingDespesa.valor,
        data_despesa: editingDespesa.data_despesa,
        observacoes: editingDespesa.observacoes || ''
      });
    } else {
      // Resetando para nova despesa
      form.reset({
        tipo: 'outros',
        categoria: 'variavel',
        descricao: '',
        fornecedor: '',
        valor: 0,
        data_despesa: jogoData,
        observacoes: ''
      });
    }
  }, [editingDespesa, jogoData, form]);

  // =====================================================
  // WATCHERS E CÁLCULOS
  // =====================================================

  const tipoSelecionado = form.watch('tipo');
  const valorAtual = form.watch('valor');
  const categoriaSelecionada = form.watch('categoria');

  // Sugerir categoria automaticamente baseada no tipo
  useEffect(() => {
    const tipoInfo = TIPOS_DESPESA.find(t => t.value === tipoSelecionado);
    if (tipoInfo && !editingDespesa) {
      form.setValue('categoria', tipoInfo.categoria);
    }
  }, [tipoSelecionado, form, editingDespesa]);

  // Calcular impacto na margem
  const impactoMargem = receitaTotal > 0 ? (valorAtual / receitaTotal) * 100 : 0;
  const margemRestante = receitaTotal > 0 ? receitaTotal - valorAtual : 0;

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSubmit = async (data: DespesaJogoFormData) => {
    try {
      // Garantir que todos os campos obrigatórios estão presentes
      const despesaData = {
        tipo: data.tipo,
        categoria: data.categoria,
        descricao: data.descricao,
        fornecedor: data.fornecedor || undefined,
        valor: data.valor,
        data_despesa: data.data_despesa,
        observacoes: data.observacoes || undefined
      };
      
      await onSubmit(despesaData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleValorChange = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) {
      form.setValue('valor', 0);
      return;
    }
    
    // Converte para número (centavos)
    const numericValue = parseInt(numbers, 10);
    
    // Converte centavos para reais
    const realValue = numericValue / 100;
    
    form.setValue('valor', realValue);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-600" />
            {editingDespesa ? 'Editar Despesa' : 'Nova Despesa'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Tipo de Despesa */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Despesa *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de despesa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_DESPESA.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <span>{tipo.icon}</span>
                            <div className="flex flex-col">
                              <span className="font-medium">{tipo.label}</span>
                              <span className="text-xs text-gray-500">{tipo.description}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Categoria */}
            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIAS_DESPESA.map((categoria) => (
                        <SelectItem key={categoria.value} value={categoria.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={categoria.color}>
                              {categoria.label}
                            </Badge>
                            <span className="text-xs text-gray-500">{categoria.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição e Fornecedor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Descrição */}
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Compra de ingressos setor X..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fornecedor */}
              <FormField
                control={form.control}
                name="fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do fornecedor..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Valor */}
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          R$
                        </span>
                        <Input
                          type="text"
                          placeholder="0,00"
                          className="pl-10"
                          value={field.value > 0 ? new Intl.NumberFormat('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(field.value) : ''}
                          onChange={(e) => handleValorChange(e.target.value)}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data da Despesa */}
              <FormField
                control={form.control}
                name="data_despesa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Despesa *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="date"
                          {...field}
                          className="pr-10"
                        />
                        <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
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
                      placeholder="Informações adicionais sobre a despesa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview do Valor e Impacto na Margem */}
            {valorAtual > 0 && (
              <div className="space-y-3">
                {/* Preview do Valor */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-800">
                      Valor da Despesa:
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(valorAtual)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-red-700">
                      Categoria: {CATEGORIAS_DESPESA.find(c => c.value === categoriaSelecionada)?.label}
                    </span>
                    {form.watch('data_despesa') && (
                      <span className="text-xs text-red-700">
                        Data: {format(new Date(form.watch('data_despesa')), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Impacto na Margem */}
                {receitaTotal > 0 && (
                  <div className={`p-4 rounded-lg border ${
                    impactoMargem > 50 
                      ? 'bg-red-50 border-red-200' 
                      : impactoMargem > 25 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {impactoMargem > 50 && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      <span className={`text-sm font-medium ${
                        impactoMargem > 50 
                          ? 'text-red-800' 
                          : impactoMargem > 25 
                            ? 'text-yellow-800' 
                            : 'text-green-800'
                      }`}>
                        Impacto na Margem:
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Percentual:</span>
                        <span className={`ml-2 font-bold ${
                          impactoMargem > 50 
                            ? 'text-red-600' 
                            : impactoMargem > 25 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                        }`}>
                          {impactoMargem.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Margem Restante:</span>
                        <span className={`ml-2 font-bold ${
                          margemRestante < 0 
                            ? 'text-red-600' 
                            : margemRestante < receitaTotal * 0.2 
                              ? 'text-yellow-600' 
                              : 'text-green-600'
                        }`}>
                          {formatCurrency(margemRestante)}
                        </span>
                      </div>
                    </div>

                    {impactoMargem > 50 && (
                      <div className="mt-2 text-xs text-red-700 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Atenção: Esta despesa representa mais de 50% da receita total
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
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
                disabled={isLoading}
                className="gap-2"
                variant="destructive"
              >
                <TrendingDown className="h-4 w-4" />
                {isLoading ? 'Salvando...' : editingDespesa ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}