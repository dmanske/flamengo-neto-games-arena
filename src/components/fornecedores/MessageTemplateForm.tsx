import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  FormDescription,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, MessageSquare, Type, FileText, Info, Copy } from 'lucide-react';
import { messageTemplateSchema, MessageTemplateFormValues } from '@/lib/validations/fornecedores';
import { TIPOS_FORNECEDOR, VARIAVEIS_SISTEMA, getCorTipoFornecedor } from '@/data/fornecedores';
import { MessageTemplate, MessageTemplateFormData } from '@/types/fornecedores';
import { toast } from 'sonner';
import { useState } from 'react';

interface MessageTemplateFormProps {
  template?: MessageTemplate;
  onSubmit: (data: MessageTemplateFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export const MessageTemplateForm = ({
  template,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Salvar Template'
}: MessageTemplateFormProps) => {
  const [showVariables, setShowVariables] = useState(false);

  const form = useForm<MessageTemplateFormValues>({
    resolver: zodResolver(messageTemplateSchema),
    defaultValues: {
      nome: template?.nome || '',
      tipo_fornecedor: template?.tipo_fornecedor || 'ingressos',
      assunto: template?.assunto || '',
      corpo_mensagem: template?.corpo_mensagem || ''
    }
  });

  const handleSubmit = async (data: MessageTemplateFormValues) => {
    try {
      await onSubmit(data);
      if (!template) {
        form.reset();
      }
    } catch (error) {
      console.error('Erro no formulário:', error);
    }
  };

  const tipoSelecionado = form.watch('tipo_fornecedor');
  const corpoMensagem = form.watch('corpo_mensagem');

  // Função para inserir variável no cursor
  const inserirVariavel = (variavel: string) => {
    const textarea = document.querySelector('textarea[name="corpo_mensagem"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = form.getValues('corpo_mensagem');
      const newValue = currentValue.substring(0, start) + variavel + currentValue.substring(end);
      
      form.setValue('corpo_mensagem', newValue);
      
      // Reposicionar cursor após a variável inserida
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variavel.length, start + variavel.length);
      }, 0);
    }
  };

  // Copiar variável para clipboard
  const copiarVariavel = async (variavel: string) => {
    try {
      await navigator.clipboard.writeText(variavel);
      toast.success(`Variável ${variavel} copiada!`);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      toast.error('Erro ao copiar variável');
    }
  };

  // Extrair variáveis usadas no texto
  const variaveisUsadas = corpoMensagem.match(/\{[^}]+\}/g) || [];

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Informações do Template
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
                      <FormLabel>Nome do Template *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Solicitação de Ingressos"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Conteúdo da Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assunto */}
              <FormField
                control={form.control}
                name="assunto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Solicitação de Ingressos - {viagem_nome}"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Use variáveis como {'{viagem_nome}'} para personalizar automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Corpo da mensagem */}
              <FormField
                control={form.control}
                name="corpo_mensagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corpo da Mensagem *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Digite o conteúdo da mensagem aqui..."
                        className="min-h-[200px] font-mono text-sm"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Use as variáveis disponíveis para personalizar a mensagem automaticamente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botão para mostrar/ocultar variáveis */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowVariables(!showVariables)}
                  className="flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  {showVariables ? 'Ocultar' : 'Mostrar'} Variáveis Disponíveis
                </Button>

                {variaveisUsadas.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Variáveis usadas:</span>
                    <Badge variant="outline">{variaveisUsadas.length}</Badge>
                  </div>
                )}
              </div>
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

      {/* Painel de variáveis */}
      {showVariables && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Variáveis Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(VARIAVEIS_SISTEMA).map(([variavel, descricao]) => (
                <div
                  key={variavel}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {variavel}
                    </code>
                    <p className="text-xs text-gray-600 mt-1">{descricao}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => inserirVariavel(variavel)}
                      className="h-8 w-8 p-0"
                      title="Inserir no texto"
                    >
                      <Type className="h-3 w-3" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copiarVariavel(variavel)}
                      className="h-8 w-8 p-0"
                      title="Copiar variável"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Dica:</strong> Clique no ícone <Type className="h-3 w-3 inline mx-1" /> para inserir a variável 
                na posição do cursor, ou no ícone <Copy className="h-3 w-3 inline mx-1" /> para copiar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};