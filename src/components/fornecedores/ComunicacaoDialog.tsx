import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Eye, 
  Loader2,
  Ticket,
  Users
} from 'lucide-react';
import { Fornecedor, MessageTemplate } from '@/types/fornecedores';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';
import { processarMensagem, abrirWhatsApp, abrirEmail, validarDadosContato } from '@/utils/messageProcessor';
import { toast } from 'sonner';

interface ComunicacaoDialogProps {
  fornecedor: Fornecedor;
  isOpen: boolean;
  onClose: () => void;
}

interface IngressoData {
  tipo: string;
  quantidade: number;
  observacoes?: string;
}

export const ComunicacaoDialog = ({
  fornecedor,
  isOpen,
  onClose
}: ComunicacaoDialogProps) => {
  const { getTemplatesByTipo } = useMessageTemplates();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [templateSelecionado, setTemplateSelecionado] = useState<MessageTemplate | null>(null);
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [assuntoPersonalizado, setAssuntoPersonalizado] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados específicos para ingressos
  const [ingressoData, setIngressoData] = useState<IngressoData>({
    tipo: '',
    quantidade: 1,
    observacoes: ''
  });

  // Tipos de ingressos disponíveis
  const tiposIngressos = [
    { value: 'arquibancada', label: 'Arquibancada' },
    { value: 'cadeira-inferior', label: 'Cadeira Inferior' },
    { value: 'cadeira-superior', label: 'Cadeira Superior' },
    { value: 'camarote', label: 'Camarote' },
    { value: 'vip', label: 'VIP' },
    { value: 'premium', label: 'Premium' }
  ];

  // Carregar templates quando o dialog abrir
  useEffect(() => {
    if (isOpen && fornecedor) {
      const templatesDoTipo = getTemplatesByTipo(fornecedor.tipo_fornecedor);
      setTemplates(templatesDoTipo);
      
      // Resetar estados
      setTemplateSelecionado(null);
      setMensagemPersonalizada('');
      setAssuntoPersonalizado('');
      setShowPreview(false);
      setIngressoData({
        tipo: '',
        quantidade: 1,
        observacoes: ''
      });
    }
  }, [isOpen, fornecedor, getTemplatesByTipo]);

  // Atualizar mensagem quando template ou dados mudarem
  useEffect(() => {
    if (templateSelecionado) {
      // Criar dados simulados da viagem com informações de ingressos
      const viagemSimulada = {
        id: 'simulada',
        nome: `Solicitação de ${ingressoData.quantidade} ingresso(s) - ${ingressoData.tipo || 'Tipo não selecionado'}`,
        adversario: 'Adversário do jogo',
        estadio: 'Estádio do jogo',
        data_jogo: new Date().toISOString(),
        data_ida: new Date().toISOString(),
        data_volta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        quantidade_passageiros: ingressoData.quantidade
      };

      const mensagemProcessada = processarMensagem(
        templateSelecionado,
        fornecedor,
        viagemSimulada,
        'Flamengo Viagens'
      );

      // Adicionar informações específicas de ingressos
      let corpoComIngressos = mensagemProcessada.corpo;
      
      if (fornecedor.tipo_fornecedor === 'ingressos' && ingressoData.tipo) {
        const infoIngressos = `\n\n📋 DETALHES DO PEDIDO:
🎫 Tipo de ingresso: ${tiposIngressos.find(t => t.value === ingressoData.tipo)?.label || ingressoData.tipo}
👥 Quantidade: ${ingressoData.quantidade} ingresso(s)${ingressoData.observacoes ? `\n📝 Observações: ${ingressoData.observacoes}` : ''}`;
        
        corpoComIngressos = corpoComIngressos + infoIngressos;
      }

      setAssuntoPersonalizado(mensagemProcessada.assunto);
      setMensagemPersonalizada(corpoComIngressos);
    }
  }, [templateSelecionado, fornecedor, ingressoData]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setTemplateSelecionado(template || null);
  };

  const handleEnviarWhatsApp = async () => {
    if (!mensagemPersonalizada.trim()) {
      toast.error('Digite uma mensagem antes de enviar');
      return;
    }

    const { temWhatsApp, telefoneValido } = validarDadosContato(fornecedor);
    
    if (!temWhatsApp || !telefoneValido) {
      toast.error('Fornecedor não possui WhatsApp válido cadastrado');
      return;
    }

    setLoading(true);
    try {
      const sucesso = abrirWhatsApp(fornecedor, mensagemPersonalizada);
      if (sucesso) {
        toast.success('WhatsApp aberto com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao abrir WhatsApp');
      }
    } catch (error) {
      toast.error('Erro ao abrir WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!mensagemPersonalizada.trim() || !assuntoPersonalizado.trim()) {
      toast.error('Digite um assunto e mensagem antes de enviar');
      return;
    }

    const { temEmail, emailValido } = validarDadosContato(fornecedor);
    
    if (!temEmail || !emailValido) {
      toast.error('Fornecedor não possui email válido cadastrado');
      return;
    }

    setLoading(true);
    try {
      const sucesso = abrirEmail(fornecedor, assuntoPersonalizado, mensagemPersonalizada);
      if (sucesso) {
        toast.success('Email aberto com sucesso!');
        onClose();
      } else {
        toast.error('Erro ao abrir email');
      }
    } catch (error) {
      toast.error('Erro ao abrir email');
    } finally {
      setLoading(false);
    }
  };

  const { temWhatsApp, temEmail, telefoneValido, emailValido } = validarDadosContato(fornecedor);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Enviar Mensagem - {fornecedor.nome}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração da mensagem */}
          <div className="space-y-4">
            {/* Seleção de template */}
            <div>
              <Label>Template de Mensagem</Label>
              <Select onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Configuração específica para ingressos */}
            {fornecedor.tipo_fornecedor === 'ingressos' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Ticket className="h-4 w-4" />
                    Detalhes dos Ingressos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Tipo de Ingresso</Label>
                    <Select 
                      value={ingressoData.tipo} 
                      onValueChange={(value) => setIngressoData(prev => ({ ...prev, tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposIngressos.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Quantidade
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={ingressoData.quantidade}
                      onChange={(e) => setIngressoData(prev => ({ 
                        ...prev, 
                        quantidade: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>

                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Informações adicionais sobre os ingressos..."
                      value={ingressoData.observacoes}
                      onChange={(e) => setIngressoData(prev => ({ 
                        ...prev, 
                        observacoes: e.target.value 
                      }))}
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Assunto */}
            <div>
              <Label>Assunto</Label>
              <Input
                value={assuntoPersonalizado}
                onChange={(e) => setAssuntoPersonalizado(e.target.value)}
                placeholder="Assunto da mensagem"
              />
            </div>

            {/* Mensagem */}
            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={mensagemPersonalizada}
                onChange={(e) => setMensagemPersonalizada(e.target.value)}
                placeholder="Digite sua mensagem aqui..."
                className="min-h-[200px]"
              />
            </div>
          </div>

          {/* Prévia e informações */}
          <div className="space-y-4">
            {/* Informações do fornecedor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">WhatsApp:</span>
                  <Badge variant={temWhatsApp && telefoneValido ? "default" : "secondary"}>
                    {temWhatsApp && telefoneValido ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email:</span>
                  <Badge variant={temEmail && emailValido ? "default" : "secondary"}>
                    {temEmail && emailValido ? "Disponível" : "Indisponível"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Prévia da mensagem */}
            {mensagemPersonalizada && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Eye className="h-4 w-4" />
                    Prévia da Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      <strong>Assunto:</strong> {assuntoPersonalizado}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {mensagemPersonalizada}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          
          <div className="flex items-center gap-2">
            {temWhatsApp && telefoneValido && (
              <Button
                onClick={handleEnviarWhatsApp}
                disabled={loading || !mensagemPersonalizada.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                WhatsApp
              </Button>
            )}
            
            {temEmail && emailValido && (
              <Button
                onClick={handleEnviarEmail}
                disabled={loading || !mensagemPersonalizada.trim() || !assuntoPersonalizado.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Email
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};