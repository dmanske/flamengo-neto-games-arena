import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPhone } from '@/utils/formatters';
import { 
  MessageCircle, 
  Copy, 
  Send, 
  Clock, 
  Phone,
  Mail,
  User,
  Search,
  Filter
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroPendente } from '@/hooks/financeiro/useViagemFinanceiro';
import { toast } from 'sonner';

interface SistemaCobrancaProps {
  passageirosPendentes: PassageiroPendente[];
  onRegistrarCobranca: (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => Promise<void>;
}

// Templates de mensagem pré-definidos
const TEMPLATES = {
  lembrete: {
    nome: 'Lembrete Amigável',
    template: `Oi [NOME]! 👋

Faltam apenas *[VALOR_PENDENTE]* para quitar sua viagem.

💳 PIX: (11) 99999-9999
🔗 Link de pagamento: https://pay.exemplo.com/123

Qualquer dúvida, estou aqui! 🔴⚫`
  },
  
  urgente: {
    nome: 'Cobrança Urgente',
    template: `[NOME], sua viagem está com *[DIAS_ATRASO] dias* de atraso! ⏰

Para não perder sua vaga, quite hoje: *[VALOR_PENDENTE]*

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

⚠️ Prazo final: [DATA_LIMITE]`
  },
  
  parcelamento: {
    nome: 'Oferta de Parcelamento',
    template: `Oi [NOME]! 

Que tal facilitar o pagamento da sua viagem? 💡

Valor restante: *[VALOR_PENDENTE]*
Posso parcelar em até 3x sem juros!

Entre em contato para acertarmos 📱`
  },

  // Templates específicos por categoria
  cobranca_viagem: {
    nome: 'Cobrança - Só Viagem',
    template: `Oi [NOME]! 👋

Falta apenas o valor da *VIAGEM* para garantir sua vaga: *[VALOR_VIAGEM]*

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

Seus passeios já estão pagos! ✅`
  },

  cobranca_passeios: {
    nome: 'Cobrança - Só Passeios',
    template: `Oi [NOME]! 🎯

Sua viagem já está paga! ✅
Falta apenas o valor dos *PASSEIOS*: *[VALOR_PASSEIOS]*

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

Não perca essas experiências incríveis! 🏛️`
  },

  cobranca_completa: {
    nome: 'Cobrança - Viagem + Passeios',
    template: `Oi [NOME]! 👋

Para garantir sua vaga completa, faltam: *[VALOR_PENDENTE]*

📋 Detalhamento:
• Viagem: *[VALOR_VIAGEM]*
• Passeios: *[VALOR_PASSEIOS]*

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123`
  }
};

export default function SistemaCobranca({ passageirosPendentes, onRegistrarCobranca }: SistemaCobrancaProps) {
  const [passageiroSelecionado, setPassageiroSelecionado] = useState<PassageiroPendente | null>(null);
  const [showCobrancaModal, setShowCobrancaModal] = useState(false);
  const [templateSelecionado, setTemplateSelecionado] = useState('lembrete');
  const [tipoContato, setTipoContato] = useState<'whatsapp' | 'email' | 'telefone' | 'presencial'>('whatsapp');
  const [mensagem, setMensagem] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isEnviando, setIsEnviando] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [categoriaCobranca, setCategoriaCobranca] = useState<'geral' | 'viagem' | 'passeios' | 'tudo'>('geral');

  // Filtrar passageiros
  const passageirosFiltrados = passageirosPendentes.filter(p => 
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.telefone.includes(filtro)
  );

  // Gerar mensagem baseada no template
  const gerarMensagem = (templateKey: string, passageiro: PassageiroPendente) => {
    let template = TEMPLATES[templateKey as keyof typeof TEMPLATES].template;
    
    // Substituir variáveis
    template = template
      .replace(/\[NOME\]/g, passageiro.nome.split(' ')[0])
      .replace(/\[VALOR_PENDENTE\]/g, formatCurrency(passageiro.valor_pendente))
      .replace(/\[VALOR_VIAGEM\]/g, formatCurrency(passageiro.pendente_viagem || 0))
      .replace(/\[VALOR_PASSEIOS\]/g, formatCurrency(passageiro.pendente_passeios || 0))
      .replace(/\[DIAS_ATRASO\]/g, passageiro.dias_atraso.toString())
      .replace(/\[DATA_LIMITE\]/g, new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'));

    return template;
  };

  // Abrir modal de cobrança
  const abrirCobranca = (passageiro: PassageiroPendente) => {
    setPassageiroSelecionado(passageiro);
    setCategoriaCobranca('geral');
    setMensagem(gerarMensagem(templateSelecionado, passageiro));
    setShowCobrancaModal(true);
  };

  // Abrir modal de cobrança específica por categoria
  const abrirCobrancaEspecifica = (passageiro: PassageiroPendente, categoria: 'viagem' | 'passeios' | 'tudo') => {
    setPassageiroSelecionado(passageiro);
    setCategoriaCobranca(categoria);
    
    // Selecionar template apropriado
    let templateKey = 'lembrete';
    if (categoria === 'viagem') templateKey = 'cobranca_viagem';
    else if (categoria === 'passeios') templateKey = 'cobranca_passeios';
    else if (categoria === 'tudo') templateKey = 'cobranca_completa';
    
    setTemplateSelecionado(templateKey);
    setMensagem(gerarMensagem(templateKey, passageiro));
    setObservacoes(`Cobrança específica: ${categoria}`);
    setShowCobrancaModal(true);
  };

  // Atualizar mensagem quando template muda
  const handleTemplateChange = (template: string) => {
    setTemplateSelecionado(template);
    if (passageiroSelecionado) {
      setMensagem(gerarMensagem(template, passageiroSelecionado));
    }
  };

  // Copiar mensagem
  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      toast.success('Mensagem copiada!');
    } catch (error) {
      toast.error('Erro ao copiar mensagem');
    }
  };

  // Abrir WhatsApp
  const abrirWhatsApp = () => {
    if (!passageiroSelecionado) return;
    
    const telefone = passageiroSelecionado.telefone.replace(/\D/g, '');
    const mensagemEncoded = encodeURIComponent(mensagem);
    const url = `https://wa.me/55${telefone}?text=${mensagemEncoded}`;
    
    window.open(url, '_blank');
  };

  // Registrar cobrança
  const handleRegistrarCobranca = async () => {
    if (!passageiroSelecionado) return;

    setIsEnviando(true);
    try {
      await onRegistrarCobranca(
        passageiroSelecionado.viagem_passageiro_id,
        tipoContato,
        templateSelecionado,
        mensagem,
        observacoes
      );
      
      // Se for WhatsApp, abrir automaticamente
      if (tipoContato === 'whatsapp') {
        abrirWhatsApp();
      }
      
      toast.success('Cobrança registrada com sucesso!');
      setShowCobrancaModal(false);
      setPassageiroSelecionado(null);
      setMensagem('');
      setObservacoes('');
    } catch (error) {
      toast.error('Erro ao registrar cobrança');
    } finally {
      setIsEnviando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Sistema de Cobrança</h3>
          <p className="text-sm text-gray-600">
            {passageirosPendentes.length} passageiros com pendências
          </p>
        </div>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar passageiro..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      {/* Lista de Passageiros Pendentes */}
      <div className="grid gap-4">
        {passageirosFiltrados.length > 0 ? (
          passageirosFiltrados.map((passageiro) => (
            <Card key={passageiro.viagem_passageiro_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{passageiro.nome}</h4>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-600">{formatPhone(passageiro.telefone)}</p>
                              {passageiro.parcelas_pendentes > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {passageiro.parcelas_pendentes}/{passageiro.total_parcelas} parcelas
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-red-600">
                              {formatCurrency(passageiro.valor_pendente)}
                            </p>
                            <div className="text-xs text-gray-500">
                              <p>deve</p>
                              {/* Breakdown viagem/passeios se disponível */}
                              {(passageiro.pendente_viagem > 0 || passageiro.pendente_passeios > 0) && (
                                <p className="text-xs text-gray-600 mt-1">
                                  V: {formatCurrency(passageiro.pendente_viagem)} | P: {formatCurrency(passageiro.pendente_passeios)}
                                </p>
                              )}
                              {passageiro.proxima_parcela && (
                                <p className={`font-medium ${
                                  passageiro.proxima_parcela.dias_para_vencer < 0 ? 'text-red-600' :
                                  passageiro.proxima_parcela.dias_para_vencer <= 3 ? 'text-orange-600' :
                                  'text-blue-600'
                                }`}>
                                  {passageiro.proxima_parcela.dias_para_vencer < 0 
                                    ? `${Math.abs(passageiro.proxima_parcela.dias_para_vencer)} dias atrasada`
                                    : passageiro.proxima_parcela.dias_para_vencer === 0
                                    ? 'vence hoje'
                                    : `${passageiro.proxima_parcela.dias_para_vencer} dias`
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Valor Total:</p>
                        <p className="font-medium">{formatCurrency(passageiro.valor_total)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Valor Pago:</p>
                        <p className="font-medium text-green-600">{formatCurrency(passageiro.valor_pago)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pendente:</p>
                        <p className="font-medium text-red-600">{formatCurrency(passageiro.valor_pendente)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Atraso:</p>
                        <Badge 
                          variant={
                            passageiro.dias_atraso > 7 ? 'destructive' : 
                            passageiro.dias_atraso > 3 ? 'secondary' : 
                            'default'
                          }
                        >
                          {passageiro.dias_atraso} dias
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {/* Botões específicos por categoria */}
                    {(passageiro.pendente_viagem > 0 || passageiro.pendente_passeios > 0) ? (
                      <div className="flex flex-col gap-1">
                        {passageiro.pendente_viagem > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirCobrancaEspecifica(passageiro, 'viagem')}
                            className="text-xs"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Cobrar Viagem ({formatCurrency(passageiro.pendente_viagem)})
                          </Button>
                        )}
                        {passageiro.pendente_passeios > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirCobrancaEspecifica(passageiro, 'passeios')}
                            className="text-xs"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Cobrar Passeios ({formatCurrency(passageiro.pendente_passeios)})
                          </Button>
                        )}
                        {passageiro.pendente_viagem > 0 && passageiro.pendente_passeios > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => abrirCobrancaEspecifica(passageiro, 'tudo')}
                            className="text-xs bg-red-600 hover:bg-red-700"
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Cobrar Tudo ({formatCurrency(passageiro.valor_pendente)})
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirCobranca(passageiro)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Cobrar
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implementar modal de histórico de parcelas
                        toast.info('Histórico de parcelas em desenvolvimento');
                      }}
                      className="text-xs"
                    >
                      <User className="h-4 w-4 mr-1" />
                      Parcelas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {filtro ? 'Nenhum passageiro encontrado' : 'Nenhuma pendência encontrada'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Cobrança */}
      <Dialog open={showCobrancaModal} onOpenChange={setShowCobrancaModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              Registrar Cobrança - {passageiroSelecionado?.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Informações do Passageiro */}
            {passageiroSelecionado && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor Pendente:</p>
                      <p className="font-semibold text-red-600 text-lg">
                        {formatCurrency(passageiroSelecionado.valor_pendente)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dias em Atraso:</p>
                      <Badge 
                        variant={
                          passageiroSelecionado.dias_atraso > 7 ? 'destructive' : 
                          passageiroSelecionado.dias_atraso > 3 ? 'secondary' : 
                          'default'
                        }
                      >
                        {passageiroSelecionado.dias_atraso} dias
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tipo de Contato */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Tipo de Contato:</label>
              <Select value={tipoContato} onValueChange={(value: any) => setTipoContato(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="telefone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Telefone
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      E-mail
                    </div>
                  </SelectItem>
                  <SelectItem value="presencial">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      Presencial
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template de Mensagem */}
            {(tipoContato === 'whatsapp' || tipoContato === 'email') && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Template:</label>
                <Select value={templateSelecionado} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Editor de Mensagem */}
            {(tipoContato === 'whatsapp' || tipoContato === 'email') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Mensagem:</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarMensagem}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                </div>
                
                <Textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="min-h-[150px] font-mono text-sm"
                />
              </div>
            )}

            {/* Observações */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Observações:</label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre o contato..."
                rows={3}
              />
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCobrancaModal(false)}
              >
                Cancelar
              </Button>
              
              {tipoContato === 'whatsapp' && (
                <Button
                  variant="outline"
                  onClick={abrirWhatsApp}
                  className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Apenas Abrir WhatsApp
                </Button>
              )}
              
              <Button
                onClick={handleRegistrarCobranca}
                disabled={isEnviando}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEnviando ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Registrar Cobrança
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}