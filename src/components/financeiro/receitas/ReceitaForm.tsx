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
import { CalendarIcon, Upload, X } from 'lucide-react';
import { Receita, MetodoPagamento, StatusPagamento } from '@/types/financeiro';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const receitaSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  data_recebimento: z.string().min(1, 'Data de recebimento é obrigatória'),
  viagem_id: z.string().optional(),
  cliente_id: z.string().optional(),
  metodo_pagamento: z.string().optional(),
  status: z.enum(['recebido', 'pendente', 'cancelado']),
  observacoes: z.string().optional(),
});

type ReceitaFormData = z.infer<typeof receitaSchema>;

interface ReceitaFormProps {
  receita?: Receita;
  onSubmit: (data: ReceitaFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
}

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
}

interface Cliente {
  id: string;
  nome: string;
  email: string;
}

interface Categoria {
  nome: string;
  cor: string;
}

const metodosPagemento: MetodoPagamento[] = [
  'dinheiro',
  'pix',
  'cartao_credito',
  'cartao_debito',
  'transferencia',
  'boleto',
  'outros'
];

const statusOptions: StatusPagamento[] = ['recebido', 'pendente', 'cancelado'];

export const ReceitaForm: React.FC<ReceitaFormProps> = ({
  receita,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [comprovanteUrl, setComprovanteUrl] = useState<string | null>(receita?.comprovante_url || null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues: receita ? {
      descricao: receita.descricao,
      valor: Number(receita.valor),
      categoria: receita.categoria,
      data_recebimento: receita.data_recebimento,
      viagem_id: receita.viagem_id || '',
      cliente_id: receita.cliente_id || '',
      metodo_pagamento: receita.metodo_pagamento || '',
      status: receita.status,
      observacoes: receita.observacoes || '',
    } : {
      status: 'recebido',
      data_recebimento: new Date().toISOString().split('T')[0]
    }
  });

  // Carregar dados para os selects
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar viagens
        const { data: viagensData } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo')
          .order('data_jogo', { ascending: false });

        if (viagensData) setViagens(viagensData);

        // Carregar clientes
        const { data: clientesData } = await supabase
          .from('clientes')
          .select('id, nome, email')
          .order('nome');

        if (clientesData) setClientes(clientesData);

        // Carregar categorias de receita
        const { data: categoriasData } = await supabase
          .from('categorias_financeiras')
          .select('nome, cor')
          .eq('tipo', 'receita')
          .eq('ativa', true)
          .order('nome');

        if (categoriasData) setCategorias(categoriasData);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  // Upload de comprovante
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    try {
      setUploadingFile(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `comprovantes/receitas/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);

      setComprovanteUrl(publicUrl);
      toast.success('Comprovante enviado com sucesso!');

    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao enviar comprovante');
    } finally {
      setUploadingFile(false);
    }
  };

  // Remover comprovante
  const handleRemoveFile = () => {
    setComprovanteUrl(null);
  };

  const onFormSubmit = async (data: ReceitaFormData) => {
    const formData = {
      ...data,
      comprovante_url: comprovanteUrl || undefined,
      viagem_id: data.viagem_id || undefined,
      cliente_id: data.cliente_id || undefined,
      metodo_pagamento: data.metodo_pagamento || undefined,
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
          {receita ? 'Editar Receita' : 'Nova Receita'}
        </CardTitle>
        <CardDescription>
          {receita ? 'Atualize as informações da receita' : 'Cadastre uma nova receita no sistema'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input
              id="descricao"
              placeholder="Ex: Pagamento viagem São Paulo"
              {...register('descricao')}
            />
            {errors.descricao && (
              <p className="text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Valor e Data */}
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
              <Label htmlFor="data_recebimento">Data de Recebimento *</Label>
              <Input
                id="data_recebimento"
                type="date"
                {...register('data_recebimento')}
              />
              {errors.data_recebimento && (
                <p className="text-sm text-red-600">{errors.data_recebimento.message}</p>
              )}
            </div>
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
                      {status === 'recebido' ? 'Recebido' : 
                       status === 'pendente' ? 'Pendente' : 'Cancelado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Viagem e Cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="viagem_id">Viagem (opcional)</Label>
              <Select onValueChange={(value) => setValue('viagem_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma viagem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma viagem</SelectItem>
                  {viagens.map((viagem) => (
                    <SelectItem key={viagem.id} value={viagem.id}>
                      {viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente (opcional)</Label>
              <Select onValueChange={(value) => setValue('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum cliente</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-2">
            <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
            <Select onValueChange={(value) => setValue('metodo_pagamento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao_informado">Não informado</SelectItem>
                {metodosPagemento.map((metodo) => (
                  <SelectItem key={metodo} value={metodo}>
                    {metodo === 'dinheiro' ? 'Dinheiro' :
                     metodo === 'pix' ? 'PIX' :
                     metodo === 'cartao_credito' ? 'Cartão de Crédito' :
                     metodo === 'cartao_debito' ? 'Cartão de Débito' :
                     metodo === 'transferencia' ? 'Transferência' :
                     metodo === 'boleto' ? 'Boleto' : 'Outros'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Upload de Comprovante */}
          <div className="space-y-2">
            <Label>Comprovante (opcional)</Label>
            {comprovanteUrl ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm text-green-700">Comprovante anexado</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                  id="comprovante"
                />
                <Label
                  htmlFor="comprovante"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingFile ? 'Enviando...' : 'Anexar Comprovante'}
                </Label>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Informações adicionais sobre a receita..."
              rows={3}
              {...register('observacoes')}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || uploadingFile}
              className="flex-1"
            >
              {loading ? 'Salvando...' : receita ? 'Atualizar' : 'Salvar'}
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