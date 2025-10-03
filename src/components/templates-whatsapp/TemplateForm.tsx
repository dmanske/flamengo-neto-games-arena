/**
 * =====================================================
 * COMPONENTE - FORMULÁRIO DE TEMPLATE WHATSAPP
 * =====================================================
 * 
 * Formulário para criar e editar templates de WhatsApp
 * com validação, preview em tempo real e detector
 * automático de variáveis.
 */

import React, { useState, useEffect, useMemo } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  WhatsAppTemplate, 
  CreateTemplateData,
  TemplateCategory,
  TemplateVariable,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  VARIABLE_DESCRIPTIONS
} from '@/types/whatsapp-templates';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import {
  MessageSquare,
  Eye,
  Code,
  Wand2,
  AlertTriangle,
  CheckCircle,
  Hash,
  Save,
  X
} from 'lucide-react';

// =====================================================
// SCHEMA DE VALIDAÇÃO
// =====================================================

const templateSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  categoria: z.enum(['confirmacao', 'grupo', 'lembrete', 'cobranca', 'informativo', 'promocional', 'outros'], {
    required_error: 'Selecione uma categoria'
  }),
  mensagem: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(4096, 'Mensagem deve ter no máximo 4096 caracteres'),
  ativo: z.boolean().default(true)
});

type TemplateFormData = z.infer<typeof templateSchema>;

// =====================================================
// PROPS DO COMPONENTE
// =====================================================

interface TemplateFormProps {
  isOpen: boolean;
  template?: WhatsAppTemplate | null;
  onClose: () => void;
  onSave: (data: CreateTemplateData) => Promise<void>;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function TemplateForm({
  isOpen,
  template,
  onClose,
  onSave
}: TemplateFormProps) {
  
  // =====================================================
  // HOOKS E ESTADOS
  // =====================================================
  
  const { extractVariables, previewTemplate } = useWhatsAppTemplates();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'variaveis'>('editor');
  
  // Configuração do formulário
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nome: '',
      categoria: 'outros',
      mensagem: '',
      ativo: true
    }
  });
  
  // =====================================================
  // EFEITOS
  // =====================================================
  
  // Carregar dados do template para edição
  useEffect(() => {
    if (template) {
      form.reset({
        nome: template.nome,
        categoria: template.categoria,
        mensagem: template.mensagem,
        ativo: template.ativo
      });
    } else {
      form.reset({
        nome: '',
        categoria: 'outros',
        mensagem: '',
        ativo: true
      });
    }
  }, [template, form]);
  
  // =====================================================
  // DADOS COMPUTADOS
  // =====================================================
  
  // Variáveis detectadas na mensagem
  const variaveisDetectadas = useMemo(() => {
    const mensagem = form.watch('mensagem');
    if (!mensagem) return [];
    return extractVariables(mensagem);
  }, [form.watch('mensagem'), extractVariables]);
  
  // Preview da mensagem
  const previewData = useMemo(() => {
    const mensagem = form.watch('mensagem');
    if (!mensagem) return null;
    
    const mockTemplate: WhatsAppTemplate = {
      id: 'preview',
      nome: form.watch('nome') || 'Preview',
      categoria: form.watch('categoria'),
      mensagem,
      variaveis: variaveisDetectadas,
      ativo: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return previewTemplate(mockTemplate);
  }, [form.watch('mensagem'), form.watch('nome'), form.watch('categoria'), variaveisDetectadas, previewTemplate]);
  
  // Estatísticas da mensagem
  const messageStats = useMemo(() => {
    const mensagem = form.watch('mensagem');
    return {
      caracteres: mensagem?.length || 0,
      linhas: mensagem?.split('\n').length || 0,
      variaveis: variaveisDetectadas.length,
      palavras: mensagem?.split(/\s+/).filter(word => word.length > 0).length || 0
    };
  }, [form.watch('mensagem'), variaveisDetectadas]);
  
  // =====================================================
  // HANDLERS
  // =====================================================
  
  const handleSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true);
    try {
      const templateData: CreateTemplateData = {
        ...data,
        variaveis: variaveisDetectadas
      };
      
      await onSave(templateData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    form.reset();
    onClose();
  };
  
  const insertVariable = (variable: TemplateVariable) => {
    const currentMessage = form.getValues('mensagem');
    const newMessage = currentMessage + `{${variable}}`;
    form.setValue('mensagem', newMessage);
  };
  
  const insertTemplate = (templateText: string) => {
    form.setValue('mensagem', templateText);
  };
  
  // =====================================================
  // TEMPLATES SUGERIDOS POR CATEGORIA
  // =====================================================
  
  const getTemplatesSugeridos = (categoria: TemplateCategory) => {
    const templates = {
      confirmacao: [
        'Olá {NOME}! Sua viagem para {DESTINO} está confirmada para {DATA} às {HORARIO}.',
        'Confirmamos sua reserva para {DESTINO}. Embarque: {LOCAL_SAIDA} às {HORARIO}.',
        'Viagem confirmada! {NOME}, nos vemos em {LOCAL_SAIDA} no dia {DATA}.'
      ],
      grupo: [
        'Oi {NOME}! Entre no grupo da viagem {DESTINO}: {LINK_GRUPO}',
        'Link do grupo WhatsApp da viagem {DESTINO}: {LINK_GRUPO}',
        'Bem-vindo ao grupo! {LINK_GRUPO} - Viagem {DESTINO}'
      ],
      lembrete: [
        'Lembrete: Sua viagem para {DESTINO} sai amanhã às {HORARIO}!',
        '{NOME}, não esqueça! Viagem {DESTINO} hoje às {HORARIO}.',
        'Atenção: Embarque em {LOCAL_SAIDA} às {HORARIO_CHEGADA}.'
      ],
      cobranca: [
        'Oi {NOME}! Temos R$ {VALOR} pendente da viagem {DESTINO}.',
        'Lembrete de pagamento: {VALOR} da viagem {DESTINO} em {DATA}.',
        'Regularize o pagamento de {VALOR} para garantir sua vaga.'
      ],
      informativo: [
        'Informações importantes sobre sua viagem {DESTINO} em {DATA}.',
        'Atenção passageiros da viagem {DESTINO}: chegada às {HORARIO_CHEGADA}.',
        'Contato para dúvidas: {TELEFONE}. Viagem {DESTINO}.'
      ],
      promocional: [
        'Oferta especial! Viagem {DESTINO} por apenas {VALOR}!',
        'Promoção relâmpago para {DESTINO}! Entre em contato: {TELEFONE}',
        'Últimas vagas para {DESTINO}! Garante já a sua!'
      ],
      outros: [
        'Olá {NOME}! Informações sobre {DESTINO}.',
        'Contato: {TELEFONE}. Viagem {DESTINO} em {DATA}.',
        'Dúvidas sobre a viagem? Chame no {TELEFONE}!'
      ]
    };
    
    return templates[categoria] || [];
  };
  
  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            {template ? 'Editar Template' : 'Novo Template'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nome do Template */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Template *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Confirmação de Viagem"
                        {...field}
                      />
                    </FormControl>
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
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex flex-col">
                              <span className="font-medium">{label}</span>
                              <span className="text-xs text-gray-500">
                                {CATEGORY_DESCRIPTIONS[key as TemplateCategory]}
                              </span>
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

            {/* Status Ativo */}
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Template Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Templates inativos não aparecem na seleção de envio
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Abas do Editor */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor" className="gap-2">
                  <Code className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="variaveis" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Variáveis
                </TabsTrigger>
              </TabsList>

              {/* Aba Editor */}
              <TabsContent value="editor" className="space-y-4">
                
                {/* Templates Sugeridos */}
                {form.watch('categoria') && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wand2 className="h-4 w-4" />
                        Templates Sugeridos para {CATEGORY_LABELS[form.watch('categoria')]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getTemplatesSugeridos(form.watch('categoria')).map((template, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertTemplate(template)}
                            className="text-left h-auto p-3 justify-start"
                          >
                            <div className="text-xs text-gray-600 truncate">
                              {template}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Editor de Mensagem */}
                <FormField
                  control={form.control}
                  name="mensagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem do Template *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Digite sua mensagem aqui... Use {NOME}, {DESTINO}, {DATA} etc. para variáveis dinâmicas."
                          className="min-h-[200px] font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{messageStats.caracteres}/4096 caracteres</span>
                        <span>{messageStats.palavras} palavras • {messageStats.linhas} linhas</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botões de Variáveis Rápidas */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Inserir Variáveis Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(VARIABLE_DESCRIPTIONS).map(([variable, description]) => (
                        <Button
                          key={variable}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertVariable(variable as TemplateVariable)}
                          title={description}
                          className="text-xs"
                        >
                          {variable}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Preview */}
              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Preview da Mensagem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {previewData ? (
                      <div className="space-y-4">
                        {/* Mensagem Final */}
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-sm font-medium text-green-800 mb-2">
                            Mensagem Final:
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {previewData.mensagem_final}
                          </div>
                        </div>

                        {/* Estatísticas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-lg font-bold text-blue-600">
                              {previewData.total_caracteres}
                            </div>
                            <div className="text-xs text-blue-700">Caracteres</div>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-lg font-bold text-purple-600">
                              {Object.keys(previewData.variaveis_substituidas).length}
                            </div>
                            <div className="text-xs text-purple-700">Variáveis</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-lg font-bold text-green-600">
                              {previewData.valida ? 'Válida' : 'Inválida'}
                            </div>
                            <div className="text-xs text-green-700">Status</div>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-lg font-bold text-orange-600">
                              {previewData.avisos?.length || 0}
                            </div>
                            <div className="text-xs text-orange-700">Avisos</div>
                          </div>
                        </div>

                        {/* Avisos */}
                        {previewData.avisos && previewData.avisos.length > 0 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800 mb-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-medium">Avisos:</span>
                            </div>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {previewData.avisos.map((aviso, index) => (
                                <li key={index}>• {aviso}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Digite uma mensagem para ver o preview</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Variáveis */}
              <TabsContent value="variaveis" className="space-y-4">
                
                {/* Variáveis Detectadas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Variáveis Detectadas ({variaveisDetectadas.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {variaveisDetectadas.length > 0 ? (
                      <div className="space-y-3">
                        {variaveisDetectadas.map((variable) => (
                          <div key={variable} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <div className="font-medium text-green-800">
                                {variable}
                              </div>
                              <div className="text-sm text-green-600">
                                {VARIABLE_DESCRIPTIONS[variable]}
                              </div>
                            </div>
                            <Badge variant="default" className="bg-green-600">
                              Detectada
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <Hash className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>Nenhuma variável detectada na mensagem</p>
                        <p className="text-sm">Use {'{NOME}'}, {'{DESTINO}'}, etc.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Todas as Variáveis Disponíveis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Todas as Variáveis Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(VARIABLE_DESCRIPTIONS).map(([variable, description]) => (
                        <div key={variable} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{variable}</div>
                            <div className="text-xs text-gray-600">{description}</div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => insertVariable(variable as TemplateVariable)}
                          >
                            Inserir
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Botões de Ação */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Salvando...' : template ? 'Atualizar' : 'Criar Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}