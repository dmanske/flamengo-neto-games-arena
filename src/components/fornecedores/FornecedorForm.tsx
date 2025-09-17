import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building2, Mail, Phone, MapPin, User, FileText, MessageSquare } from 'lucide-react';
import { fornecedorSchema, FornecedorFormValues } from '@/lib/validations/fornecedores';
import { TIPOS_FORNECEDOR, getCorTipoFornecedor } from '@/data/fornecedores';
import { Fornecedor, FornecedorFormData } from '@/types/fornecedores';
import { formatarCNPJ } from '@/lib/validations/fornecedores';

interface FornecedorFormProps {
  fornecedor?: Fornecedor;
  onSubmit: (data: FornecedorFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const FornecedorForm = ({
  fornecedor,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Salvar Fornecedor'
}: FornecedorFormProps) => {
  const form = useForm<FornecedorFormValues>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      nome: fornecedor?.nome || '',
      tipo_fornecedor: fornecedor?.tipo_fornecedor || 'ingressos',
      email: fornecedor?.email || '',
      telefone: fornecedor?.telefone || '',
      whatsapp: fornecedor?.whatsapp || '',
      endereco: fornecedor?.endereco || '',
      cnpj: fornecedor?.cnpj || '',
      contato_principal: fornecedor?.contato_principal || '',
      observacoes: fornecedor?.observacoes || '',
      mensagem_padrao: fornecedor?.mensagem_padrao || ''
    }
  });

  const handleSubmit = async (data: FornecedorFormValues) => {
    try {
      await onSubmit(data);
      if (!fornecedor) {
        form.reset();
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const tipoSelecionado = form.watch('tipo_fornecedor');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nome e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Fornecedor *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Ingressos Maracanã"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipo_fornecedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Fornecedor *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_FORNECEDOR.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${tipo.color}`} />
                              {tipo.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Badge do tipo selecionado */}
            {tipoSelecionado && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tipo selecionado:</span>
                <Badge 
                  variant="secondary" 
                  className={`${getCorTipoFornecedor(tipoSelecionado)} text-white`}
                >
                  {TIPOS_FORNECEDOR.find(t => t.value === tipoSelecionado)?.label}
                </Badge>
              </div>
            )}

            {/* CNPJ e Contato Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00.000.000/0000-00"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatarCNPJ(e.target.value);
                          field.onChange(formatted);
                        }}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato_principal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato Principal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do responsável"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Informações de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contato@fornecedor.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone e WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      WhatsApp
                      <Badge variant="outline" className="text-xs">
                        Recomendado
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Endereço */}
            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Endereço completo do fornecedor"
                      className="min-h-[80px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações e Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Adicionais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informações adicionais sobre o fornecedor, condições especiais, etc."
                      className="min-h-[100px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mensagem_padrao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Mensagem Padrão
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma mensagem padrão para este fornecedor (ex: Olá, preciso de um orçamento para ingressos...)"
                      className="min-h-[120px]"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Botões de ação */}
        <div className="flex items-center justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting}
          >
            Limpar
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};