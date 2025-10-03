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
import { ReceitaJogo } from '@/hooks/financeiro/useJogoFinanceiro';
import { formatCurrency, parseCurrency } from '@/utils/formatters';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// SCHEMA DE VALIDAÇÃO
// =====================================================

const receitaJogoSchema = z.object({
  tipo: z.enum(['patrocinio', 'comissao', 'venda_extra', 'outros'], {
    required_error: 'Selecione o tipo de receita'
  }),
  descricao: z.string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(999999.99, 'Valor muito alto'),
  data_receita: z.string()
    .min(1, 'Data é obrigatória'),
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
});

type ReceitaJogoFormData = z.infer<typeof receitaJogoSchema>;

// =====================================================
// TIPOS DE RECEITA
// =====================================================

const TIPOS_RECEITA = [
  { value: 'patrocinio', label: 'Patrocínio', description: 'Receitas de patrocinadores' },
  { value: 'comissao', label: 'Comissão', description: 'Comissões de vendas' },
  { value: 'venda_extra', label: 'Venda Extra', description: 'Vendas adicionais (produtos, serviços)' },
  { value: 'outros', label: 'Outros', description: 'Outras receitas não categorizadas' }
] as const;

// =====================================================
// PROPS DO COMPONENTE
// =====================================================

interface ReceitaJogoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (receita: Omit<ReceitaJogo, 'id' | 'jogo_key' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingReceita?: ReceitaJogo | null;
  jogoData: string; // Data do jogo para sugerir como data padrão
  isLoading?: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function ReceitaJogoForm({
  isOpen,
  onClose,
  onSubmit,
  editingReceita,
  jogoData,
  isLoading = false
}: ReceitaJogoFormProps) {
  
  // =====================================================
  // CONFIGURAÇÃO DO FORMULÁRIO
  // =====================================================
  
  const form = useForm<ReceitaJogoFormData>({
    resolver: zodResolver(receitaJogoSchema),
    defaultValues: {
      tipo: 'patrocinio',
      descricao: '',
      valor: 0,
      data_receita: jogoData,
      observacoes: ''
    }
  });

  // =====================================================
  // EFFECT PARA CARREGAR DADOS NA EDIÇÃO
  // =====================================================

  useEffect(() => {
    if (editingReceita) {
      // Carregando dados para edição
      form.reset({
        tipo: editingReceita.tipo,
        descricao: editingReceita.descricao,
        valor: editingReceita.valor,
        data_receita: editingReceita.data_receita,
        observacoes: editingReceita.observacoes || ''
      });
    } else {
      // Resetando para nova receita
      form.reset({
        tipo: 'patrocinio',
        descricao: '',
        valor: 0,
        data_receita: jogoData,
        observacoes: ''
      });
    }
  }, [editingReceita, jogoData, form]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSubmit = async (data: ReceitaJogoFormData) => {
    try {
      // Garantir que todos os campos obrigatórios estão presentes
      const receitaData = {
        tipo: data.tipo,
        descricao: data.descricao,
        valor: data.valor,
        data_receita: data.data_receita,
        observacoes: data.observacoes || undefined
      };
      
      await onSubmit(receitaData);
      form.reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            {editingReceita ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Tipo de Receita */}
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Receita *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de receita" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIPOS_RECEITA.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{tipo.label}</span>
                            <span className="text-xs text-gray-500">{tipo.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Patrocínio Empresa X, Comissão vendas..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

              {/* Data da Receita */}
              <FormField
                control={form.control}
                name="data_receita"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da Receita *</FormLabel>
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
                      placeholder="Informações adicionais sobre a receita..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview do Valor */}
            {form.watch('valor') > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">
                    Valor da Receita:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(form.watch('valor'))}
                  </span>
                </div>
                {form.watch('data_receita') && (
                  <div className="text-xs text-green-700 mt-1">
                    Data: {format(new Date(form.watch('data_receita')), 'dd/MM/yyyy', { locale: ptBR })}
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
              >
                <DollarSign className="h-4 w-4" />
                {isLoading ? 'Salvando...' : editingReceita ? 'Atualizar' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}