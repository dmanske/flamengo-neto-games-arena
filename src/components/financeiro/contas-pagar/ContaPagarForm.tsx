// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ContaPagar, StatusPagamento, FrequenciaRecorrencia } from '@/types/financeiro';
import { supabase } from '@/lib/supabase';

const contaPagarSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  data_vencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  data_pagamento: z.string().optional(),
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  status: z.enum(['pendente', 'pago', 'vencido', 'cancelado']),
  recorrente: z.boolean(),
  frequencia_recorrencia: z.enum(['mensal', 'trimestral', 'semestral', 'anual']).optional(),
  observacoes: z.string().optional(),
});

type ContaPagarFormData = z.infer<typeof contaPagarSchema>;

interface ContaPagarFormProps {
  conta?: ContaPagar;
  onSubmit: (data: ContaPagarFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface Categoria {
  nome: string;
  cor: string;
}

const statusOptions: StatusPagamento[] = ['pendente', 'pago', 'vencido', 'cancelado'];
const frequenciaOptions: FrequenciaRecorrencia[] = ['mensal', 'trimestral', 'semestral', 'anual'];

export const ContaPagarForm: React.FC<ContaPagarFormProps> = ({
  conta,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ContaPagarFormData>({
    resolver: zodResolver(contaPagarSchema),
    defaultValues: conta ? {
      descricao: conta.descricao,
      valor: Number(conta.valor),
      data_vencimento: conta.data_vencimento,
      data_pagamento: conta.data_pagamento || '',
      fornecedor: conta.fornecedor,
      categoria: conta.categoria,
      status: conta.status,
      recorrente: conta.recorrente,
      frequencia_recorrencia: conta.frequencia_recorrencia || 'mensal',
      observacoes: conta.observacoes || '',
    } : {
      status: 'pendente',
      recorrente: false,
      frequencia_recorrencia: 'mensal',
      data_vencimento: new Date().toISOString().split('T')[0]
    }
  });

  const statusValue = watch('status');
  const recorrenteValue = watch('recorrente');

  // Carregar categorias de despesa
  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const { data: categoriasData } = await supabase
          .from('categorias_financeiras')
          .select('nome, cor')
          .eq('tipo', 'despesa')
          .eq('ativa', true)
          .order('nome');

        if (categoriasData) setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    carregarCategorias();
  }, []);

  const onFormSubmit = async (data: ContaPagarFormData) => {
    const formData = {
      ...data,
      data_pagamento: data.data_pagamento || undefined,
      frequencia_recorrencia: data.recorrente ? data.frequencia_recorrencia : undefined,
    };

    const success = await onSubmit(formData);
    if (success) {
      onCancel(); // Fechar formulário após sucesso
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {conta ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
        </CardTitle>
        <CardDescription>
          {conta ? 'Atualize as informações da conta' : 'Cadastre uma nova conta a pagar no sistema'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Aluguel do escritório"
              {...register('descricao')}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Valor e Fornecedor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$) *</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register('valor', { valueAsNumber: true })}
              />
              {errors.valor && (
                <p className="text-sm text-red-600">{errors.valor.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input
                id="fornecedor"
                placeholder="Nome do fornecedor"
                {...register('fornecedor')}
              />
              {errors.fornecedor && (
                <p className="text-sm text-red-600">{errors.fornecedor.message}</p>
              )}
            </div>
          </div>

          {/* Data de Vencimento e Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
              <Input
                id="data_vencimento"
                type="date"
                {...register('data_vencimento')}
              />
              {errors.data_vencimento && (
                <p className="text-sm text-red-600">{errors.data_vencimento.message}</p>
              )}
            </div>

            {statusValue === 'pago' && (
              <div className="space-y-2">
                <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  {...register('data_pagamento')}
                />
              </div>
            )}
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria *</Label>
              <Select onValueChange={(value) => setValue('categoria', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.nome} value={categoria.nome}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: categoria.cor }}
                        />
                        {categoria.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoria && (
                <p className="text-sm text-red-600">{errors.categoria.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue('status', value as StatusPagamento)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status === 'pendente' ? 'Pendente' : 
                       status === 'pago' ? 'Pago' : 
                       status === 'vencido' ? 'Vencido' : 'Cancelado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Recorrência */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recorrente"
                checked={recorrenteValue}
                onCheckedChange={(checked) => setValue('recorrente', !!checked)}
              />
              <Label htmlFor="recorrente" className="text-sm font-medium">
                Esta conta se repete periodicamente
              </Label>
            </div>

            {recorrenteValue && (
              <div className="space-y-2 ml-6">
                <Label htmlFor="frequencia_recorrencia">Frequência de Repetição</Label>
                <Select onValueChange={(value) => setValue('frequencia_recorrencia', value as FrequenciaRecorrencia)}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequenciaOptions.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq === 'mensal' ? 'Mensal' :
                         freq === 'trimestral' ? 'Trimestral' :
                         freq === 'semestral' ? 'Semestral' : 'Anual'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Uma nova conta será criada automaticamente quando esta for marcada como paga
                </p>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a conta..."
              rows={3}
              {...register('observacoes')}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : conta ? 'Atualizar' : 'Salvar'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};