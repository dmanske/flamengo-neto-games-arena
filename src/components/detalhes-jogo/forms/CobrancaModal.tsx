import React, { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IngressoPendente, TemplateCobranca, HistoricoCobranca } from '@/hooks/financeiro/useCobrancaJogo';
import { formatCurrency } from '@/utils/formatters';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  MapPin, 
  DollarSign,
  Send,
  History,
  Copy,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// =====================================================
// SCHEMA DE VALIDAÇÃO
// =====================================================

const cobrancaSchema = z.object({
  tipo_cobranca: z.enum(['whatsapp_manual', 'whatsapp_api'], {
    required_error: 'Selecione o tipo de cobrança'
  }),
  template_id: z.string().optional(),
  mensagem_personalizada: z.string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres'),
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
});

type CobrancaFormData = z.infer<typeof cobrancaSchema>;

// =====================================================
// TIPOS DE COBRANÇA
// =====================================================

const TIPOS_COBRANCA = [
  {
    value: 'whatsapp_manual',
    label: 'WhatsApp Manual',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Abrir WhatsApp no celular (manual)'
  },
  {
    value: 'whatsapp_api',
    label: 'WhatsApp API',
    icon: MessageSquare,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Enviar direto pelo sistema (automático)'
  }
] as const;

// =====================================================
// PROPS DO COMPONENTE
// =====================================================

interface CobrancaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingresso: IngressoPendente;
  templates: TemplateCobranca[];
  historico: HistoricoCobranca[];
  onEnviarCobranca: (
    ingressoId: string,
    tipo: 'whatsapp_manual' | 'whatsapp_api',
    mensagem?: string,
    observacoes?: string
  ) => Promise<void>;

  onGerarMensagem: (template: TemplateCobranca, ingresso: IngressoPendente) => string;
  isLoading?: boolean;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function CobrancaModal({
  isOpen,
  onClose,
  ingresso,
  templates,
  historico,
  onEnviarCobranca,
  onGerarMensagem,
  isLoading = false
}: CobrancaModalProps) {
  
  // =====================================================
  // ESTADOS
  // =====================================================
  
  const [activeTab, setActiveTab] = useState<'cobranca' | 'historico'>('cobranca');
  const [templateSelecionado, setTemplateSelecionado] = useState<TemplateCobranca | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =====================================================
  // CONFIGURAÇÃO DO FORMULÁRIO
  // =====================================================
  
  const form = useForm<CobrancaFormData>({
    resolver: zodResolver(cobrancaSchema),
    defaultValues: {
      tipo_cobranca: 'whatsapp_manual',
      template_id: '',
      mensagem_personalizada: '',
      observacoes: ''
    }
  });

  // =====================================================
  // WATCHERS
  // =====================================================

  const tipoSelecionado = form.watch('tipo_cobranca');
  const templateId = form.watch('template_id');

  // =====================================================
  // EFFECTS
  // =====================================================

  // Filtrar templates por tipo selecionado
  useEffect(() => {
    // Para WhatsApp manual e API, usar templates do tipo 'whatsapp'
    const tipoTemplate = (tipoSelecionado === 'whatsapp_manual' || tipoSelecionado === 'whatsapp_api') 
      ? 'whatsapp' 
      : tipoSelecionado;
    
    const templatesDisponiveis = templates.filter(t => t.tipo === tipoTemplate);
    if (templatesDisponiveis.length > 0 && !templateId) {
      form.setValue('template_id', '0'); // Primeiro template
      setTemplateSelecionado(templatesDisponiveis[0]);
    }
  }, [tipoSelecionado, templates, templateId, form]);

  // Gerar mensagem quando template muda
  useEffect(() => {
    if (templateSelecionado) {
      const mensagemGerada = onGerarMensagem(templateSelecionado, ingresso);
      form.setValue('mensagem_personalizada', mensagemGerada);
    }
  }, [templateSelecionado, onGerarMensagem, ingresso, form]);

  // =====================================================
  // HANDLERS
  // =====================================================

  const handleSubmit = async (data: CobrancaFormData) => {
    setIsSubmitting(true);
    try {
      // Se for WhatsApp manual, abrir WhatsApp ANTES de registrar e limpar o form
      if (data.tipo_cobranca === 'whatsapp_manual' && ingresso.cliente?.telefone) {
        // Abrir WhatsApp imediatamente com a mensagem atual
        const telefone = ingresso.cliente.telefone.replace(/\D/g, '');
        const telefoneFormatado = telefone.startsWith('55') ? telefone : '55' + telefone;
        const mensagem = encodeURIComponent(data.mensagem_personalizada);
        const url = `https://wa.me/${telefoneFormatado}?text=${mensagem}`;
        
        console.log('🔗 Abrindo WhatsApp Manual:', { telefone: telefoneFormatado, mensagem: data.mensagem_personalizada });
        window.open(url, '_blank');
        
        toast.success('Cobrança registrada! WhatsApp aberto com mensagem.');
      }
      
      await onEnviarCobranca(
        ingresso.id,
        data.tipo_cobranca,
        data.mensagem_personalizada,
        data.observacoes
      );
      
      form.reset();
      onClose();
      
      // Para WhatsApp API, a mensagem já é mostrada pelo hook
    } catch (error) {
      console.error('Erro ao enviar cobrança:', error);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleTemplateChange = (templateIndex: string) => {
    const tipoTemplate = (tipoSelecionado === 'whatsapp_manual' || tipoSelecionado === 'whatsapp_api') 
      ? 'whatsapp' 
      : tipoSelecionado;
    
    const templatesDisponiveis = templates.filter(t => t.tipo === tipoTemplate);
    const index = parseInt(templateIndex);
    if (templatesDisponiveis[index]) {
      setTemplateSelecionado(templatesDisponiveis[index]);
      form.setValue('template_id', templateIndex);
    }
  };

  const handleCopyMessage = () => {
    const mensagem = form.getValues('mensagem_personalizada');
    navigator.clipboard.writeText(mensagem);
    toast.success('Mensagem copiada para a área de transferência!');
  };

  const handleOpenWhatsApp = () => {
    if (!ingresso.cliente?.telefone) {
      toast.error('Cliente não possui telefone cadastrado');
      return;
    }

    let telefone = ingresso.cliente.telefone.replace(/\D/g, '');
    
    // Garantir que tenha o código do país (55)
    if (!telefone.startsWith('55')) {
      telefone = '55' + telefone;
    }
    
    const mensagem = encodeURIComponent(form.getValues('mensagem_personalizada'));
    const url = `https://wa.me/${telefone}?text=${mensagem}`;
    
    console.log('🔗 Abrindo WhatsApp:', { telefone, url });
    window.open(url, '_blank');
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
        aria-describedby="cobranca-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Cobrança - {ingresso.cliente?.nome}
          </DialogTitle>
          <div id="cobranca-modal-description" className="sr-only">
            Modal para registrar cobrança de ingresso pendente
          </div>
        </DialogHeader>

        {/* Informações do Ingresso */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{ingresso.cliente?.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{ingresso.cliente?.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{ingresso.cliente?.email || 'Não informado'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{ingresso.setor_estadio}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-bold text-red-600">
                    {formatCurrency(ingresso.valor_final)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status e Prioridade */}
            <div className="flex gap-2 mt-4">
              <Badge 
                variant="destructive"
                className="flex items-center gap-1"
              >
                <AlertTriangle className="h-3 w-3" />
                {ingresso.dias_em_atraso} dias em atraso
              </Badge>
              
              <Badge 
                variant={ingresso.prioridade === 'alta' ? 'destructive' : 
                        ingresso.prioridade === 'media' ? 'default' : 'secondary'}
              >
                Prioridade {ingresso.prioridade}
              </Badge>
              
              <Badge variant="outline">
                {ingresso.total_tentativas_cobranca} tentativa{ingresso.total_tentativas_cobranca !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'cobranca' | 'historico')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cobranca" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Nova Cobrança
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico ({historico.length})
            </TabsTrigger>
          </TabsList>

          {/* Aba Nova Cobrança */}
          <TabsContent value="cobranca" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                
                {/* Tipo de Cobrança */}
                <FormField
                  control={form.control}
                  name="tipo_cobranca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Cobrança *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de cobrança" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIPOS_COBRANCA.map((tipo) => {
                            const Icon = tipo.icon;
                            return (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{tipo.label}</span>
                                    <span className="text-xs text-gray-500">{tipo.description}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Template */}
                {templates.filter(t => {
                  const tipoTemplate = (tipoSelecionado === 'whatsapp_manual' || tipoSelecionado === 'whatsapp_api') 
                    ? 'whatsapp' 
                    : tipoSelecionado;
                  return t.tipo === tipoTemplate;
                }).length > 0 && (
                  <FormField
                    control={form.control}
                    name="template_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template de Mensagem</FormLabel>
                        <Select onValueChange={handleTemplateChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um template" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates
                              .filter(t => {
                                const tipoTemplate = (tipoSelecionado === 'whatsapp_manual' || tipoSelecionado === 'whatsapp_api') 
                                  ? 'whatsapp' 
                                  : tipoSelecionado;
                                return t.tipo === tipoTemplate;
                              })
                              .map((template, index) => (
                                <SelectItem key={index} value={index.toString()}>
                                  {template.titulo}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Mensagem Personalizada */}
                <FormField
                  control={form.control}
                  name="mensagem_personalizada"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Mensagem *</FormLabel>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCopyMessage}
                            className="gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                          {(tipoSelecionado === 'whatsapp_manual' || tipoSelecionado === 'whatsapp_api') && ingresso.cliente?.telefone && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleOpenWhatsApp}
                              className="gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {tipoSelecionado === 'whatsapp_manual' ? 'Abrir WhatsApp' : 'Testar Mensagem'}
                            </Button>
                          )}
                        </div>
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Digite sua mensagem personalizada..."
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="text-xs text-gray-500">
                        {field.value?.length || 0}/1000 caracteres
                      </div>
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
                      <FormLabel>Observações Internas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Anotações sobre esta cobrança (não será enviado ao cliente)..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Botão de Ação */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Enviando...' : 
                     tipoSelecionado === 'whatsapp_manual' ? 'Registrar e Abrir WhatsApp' :
                     tipoSelecionado === 'whatsapp_api' ? 'Enviar via WhatsApp API' :
                     'Registrar Cobrança'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {/* Aba Histórico */}
          <TabsContent value="historico" className="space-y-4">
            {historico.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {historico.map((item) => {
                  const tipoInfo = TIPOS_COBRANCA.find(t => t.value === item.tipo_cobranca);
                  const Icon = tipoInfo?.icon || MessageSquare;
                  
                  return (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-gray-500" />
                            <span className="font-medium capitalize">
                              {item.tipo_cobranca.replace('_', ' ')}
                            </span>
                            <Badge 
                              variant={
                                item.status === 'pago' ? 'default' :
                                item.status === 'respondido' ? 'secondary' :
                                item.status === 'visualizado' ? 'outline' : 'destructive'
                              }
                              className="text-xs"
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-500">
                            {format(new Date(item.data_envio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                        
                        {item.mensagem_enviada && (
                          <div className="bg-gray-50 p-3 rounded text-sm mb-2">
                            {item.mensagem_enviada}
                          </div>
                        )}
                        
                        {item.resposta_cliente && (
                          <div className="bg-blue-50 p-3 rounded text-sm mb-2">
                            <strong>Resposta:</strong> {item.resposta_cliente}
                          </div>
                        )}
                        
                        {item.observacoes && (
                          <div className="text-xs text-gray-600">
                            <strong>Obs:</strong> {item.observacoes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhuma cobrança registrada</h3>
                <p className="text-muted-foreground">
                  Este cliente ainda não recebeu nenhuma cobrança.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}