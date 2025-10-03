import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IngressoPendente, HistoricoCobranca, TemplateCobranca } from '@/hooks/financeiro/useCobrancaJogo';
import { JogoDetails } from '@/hooks/useJogoDetails';
import { Ingresso } from '@/types/ingressos';
import { formatCurrency, formatPhone } from '@/utils/formatters';
import { formatarDataBrasil, calcularDiferencaDias } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  MessageCircle, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  Target,
  Search,
  Calendar,
  Star,
  Edit,
  Send,
  Copy,
  DollarSign
} from 'lucide-react';

interface PendenciasJogoProps {
  ingressos: Ingresso[];
  jogo: JogoDetails;
  ingressosPendentes: IngressoPendente[];
  historicoCobrancas: HistoricoCobranca[];
  estatisticasGerais: {
    totalPendentes: number;
    valorTotalPendente: number;
    tentativasTotal: number;
    prioridadeAlta: number;
    prioridadeMedia: number;
    prioridadeBaixa: number;
    ticketMedioPendente: number;
  };
  onRegistrarCobranca: (ingressoId: string, tipo: 'whatsapp' | 'email' | 'telefone' | 'presencial' | 'outros', mensagem?: string) => Promise<string>;
  onMarcarComoRespondido: (cobrancaId: string, resposta: string) => Promise<void>;
  onMarcarComoPago: (ingressoId: string) => Promise<void>;
  templates: TemplateCobranca[];
  onGerarMensagem: (template: TemplateCobranca, ingresso: IngressoPendente) => string;
}

export function PendenciasJogo({
  ingressos,
  jogo,
  ingressosPendentes,
  historicoCobrancas,
  estatisticasGerais,
  onRegistrarCobranca,
  onMarcarComoRespondido,
  onMarcarComoPago,
  templates,
  onGerarMensagem
}: PendenciasJogoProps) {
  const [filtrosPrioridade, setFiltrosPrioridade] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [showMensagemModal, setShowMensagemModal] = useState(false);
  const [ingressoSelecionado, setIngressoSelecionado] = useState<IngressoPendente | null>(null);
  const [tipoMensagem, setTipoMensagem] = useState<'whatsapp' | 'email'>('whatsapp');
  const [mensagemEditavel, setMensagemEditavel] = useState('');
  const [assuntoEmail, setAssuntoEmail] = useState('');

  // Usar ingressos pendentes do hook ou filtrar dos ingressos diretos
  const ingressosPendentesReais = useMemo(() => {
    if (ingressosPendentes && ingressosPendentes.length > 0) {
      return ingressosPendentes;
    }
    
    // Se o hook não retornou dados, filtrar dos ingressos diretos
    return ingressos
      .filter(ing => ing.situacao_financeira === 'pendente')
      .map(ing => {
        // Converter para o formato IngressoPendente
        const hoje = new Date();
        const diasParaJogo = calcularDiferencaDias(hoje, ing.jogo_data);
        const diasEmAtraso = Math.max(0, -diasParaJogo);
        
        // Determinar prioridade
        let prioridade: 'alta' | 'media' | 'baixa' = 'baixa';
        if (ing.valor_final > 200 && diasEmAtraso > 7) {
          prioridade = 'alta';
        } else if (ing.valor_final > 100 || diasEmAtraso > 3) {
          prioridade = 'media';
        }
        
        return {
          ...ing,
          dias_em_atraso: diasEmAtraso,
          total_tentativas_cobranca: 0, // Será atualizado quando o histórico funcionar
          ultima_tentativa: undefined,
          prioridade
        } as IngressoPendente;
      });
  }, [ingressosPendentes, ingressos]);

  // Filtrar ingressos por prioridade e busca
  const ingressosFiltrados = useMemo(() => {
    return ingressosPendentesReais.filter(ingresso => {
      // Filtro por prioridade
      let passaPrioridade = true;
      if (filtrosPrioridade !== 'todos') {
        passaPrioridade = ingresso.prioridade === filtrosPrioridade;
      }
      
      // Filtro por busca
      const passaBusca = busca === '' || 
        ingresso.cliente?.nome.toLowerCase().includes(busca.toLowerCase()) ||
        ingresso.cliente?.telefone?.includes(busca) ||
        ingresso.setor_estadio.toLowerCase().includes(busca.toLowerCase());
      
      return passaPrioridade && passaBusca;
    });
  }, [ingressosPendentesReais, filtrosPrioridade, busca]);

  // Cálculos para os cards melhorados
  const dadosCalculados = useMemo(() => {
    const hoje = new Date();
    
    // Maior devedor
    const maiorDevedor = ingressosPendentesReais.reduce((maior, atual) => 
      atual.valor_final > maior.valor_final ? atual : maior, 
      ingressosPendentesReais[0] || { valor_final: 0, cliente: { nome: '' } }
    );
    
    // Categorização por urgência
    const urgentes = ingressosFiltrados.filter(p => p.prioridade === 'alta');
    const atencao = ingressosFiltrados.filter(p => p.prioridade === 'media');
    const emDia = ingressosFiltrados.filter(p => p.prioridade === 'baixa');
    
    const valorUrgente = urgentes.reduce((sum, p) => sum + p.valor_final, 0);
    const valorAtencao = atencao.reduce((sum, p) => sum + p.valor_final, 0);
    const valorEmDia = emDia.reduce((sum, p) => sum + p.valor_final, 0);
    const totalPendente = valorUrgente + valorAtencao + valorEmDia;
    
    // Ingressos com muitas tentativas de cobrança
    const muitasTentativas = ingressosFiltrados.filter(p => p.total_tentativas_cobranca >= 3);
    
    // Próximos ao jogo (baseado na data do jogo)
    const diasParaJogo = calcularDiferencaDias(hoje, jogo.jogo_data);
    const proximosJogo = ingressosFiltrados.filter(p => diasParaJogo <= 7); // próximos 7 dias
    
    return {
      maiorDevedor,
      urgentes,
      atencao,
      emDia,
      valorUrgente,
      valorAtencao,
      valorEmDia,
      totalPendente,
      muitasTentativas,
      proximosJogo
    };
  }, [ingressosPendentesReais, ingressosFiltrados, jogo.jogo_data]);

  // Função para gerar mensagem padrão
  const gerarMensagemPadrao = (ingresso: IngressoPendente, tipo: 'whatsapp' | 'email') => {
    const nome = ingresso.cliente?.nome.split(' ')[0] || 'Cliente';
    
    if (tipo === 'email') {
      return `Olá ${nome},

Esperamos que esteja bem!

Identificamos uma pendência em seu ingresso para o jogo:
• Valor pendente: ${formatCurrency(ingresso.valor_final)}
• Setor: ${ingresso.setor_estadio}
• Adversário: ${ingresso.adversario}

Para regularizar, você pode:
💳 PIX: (11) 99999-9999
🔗 Link de pagamento: https://pay.exemplo.com/123

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe de Ingressos Flamengo`;
    } else {
      return `Oi ${nome}! 👋

Falta apenas *${formatCurrency(ingresso.valor_final)}* para quitar seu ingresso.

🎫 *Detalhes do Ingresso:*
• Jogo: Flamengo vs ${ingresso.adversario}
• Setor: ${ingresso.setor_estadio}
• Valor: ${formatCurrency(ingresso.valor_final)}

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

Qualquer dúvida, estou aqui! 🔴⚫`;
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (ingresso: IngressoPendente, tipo: 'whatsapp' | 'email') => {
    setIngressoSelecionado(ingresso);
    setTipoMensagem(tipo);
    setMensagemEditavel(gerarMensagemPadrao(ingresso, tipo));
    setAssuntoEmail('Pendência Financeira - Ingresso Flamengo');
    setShowMensagemModal(true);
  };

  // Função para copiar mensagem
  const copiarMensagem = async () => {
    try {
      await navigator.clipboard.writeText(mensagemEditavel);
      toast.success('Mensagem copiada!');
    } catch (error) {
      toast.error('Erro ao copiar mensagem');
    }
  };

  // Função para enviar mensagem editada
  const enviarMensagem = async () => {
    if (!ingressoSelecionado) return;

    try {
      if (tipoMensagem === 'email') {
        const mailtoLink = `mailto:${ingressoSelecionado.cliente?.email || ''}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(mensagemEditavel)}`;
        window.open(mailtoLink);
      } else {
        const telefone = ingressoSelecionado.cliente?.telefone?.replace(/\D/g, '') || '';
        const mensagemEncoded = encodeURIComponent(mensagemEditavel);
        const url = `https://wa.me/55${telefone}?text=${mensagemEncoded}`;
        window.open(url, '_blank');
      }

      // Registrar a tentativa de contato
      await onRegistrarCobranca(
        ingressoSelecionado.id,
        tipoMensagem,
        mensagemEditavel
      );

      toast.success(`${tipoMensagem === 'email' ? 'Email' : 'WhatsApp'} aberto com sucesso!`);
      setShowMensagemModal(false);
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    }
  };

  const handleMarcarComoPago = async (ingresso: IngressoPendente) => {
    if (confirm(`Marcar ingresso de ${ingresso.cliente?.nome} como pago?`)) {
      await onMarcarComoPago(ingresso.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone ou setor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {ingressosFiltrados.length} de {ingressosPendentesReais.length} ingressos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tentativas de Cobrança */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">📞 TENTATIVAS HOJE</p>
                <p className="text-xs text-green-600">Cobranças realizadas</p>
                <p className="text-xl font-bold text-green-900">
                  {dadosCalculados.muitasTentativas.length}
                </p>
                <p className="text-xs text-green-700">
                  {dadosCalculados.muitasTentativas.length === 1 ? 'cobrança' : 'cobranças'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Próximos ao Jogo */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">🎫 PRÓXIMOS AO JOGO</p>
                <p className="text-xs text-blue-600">Menos de 3 dias</p>
                <p className="text-xl font-bold text-blue-900">
                  {dadosCalculados.proximosJogo.length}
                </p>
                <p className="text-xs text-blue-700">
                  {formatCurrency(dadosCalculados.proximosJogo.reduce((sum, p) => sum + p.valor_final, 0))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Maior Devedor */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-800">👑 MAIOR DEVEDOR</p>
                <p className="text-xs text-purple-600 truncate" title={dadosCalculados.maiorDevedor?.cliente?.nome}>
                  {dadosCalculados.maiorDevedor?.cliente?.nome?.split(' ')[0] || 'N/A'}
                </p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(dadosCalculados.maiorDevedor?.valor_final || 0)}
                </p>
                <p className="text-xs text-purple-700">deve</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Resumo Geral */}
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">📊 TOTAL PENDENTE</p>
                <p className="text-xs text-gray-600">Todos os ingressos</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dadosCalculados.totalPendente)}
                </p>
                <p className="text-xs text-gray-700">
                  Média: {formatCurrency(dadosCalculados.totalPendente / Math.max(ingressosFiltrados.length, 1))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Prioridade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Filtrar por Prioridade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filtrosPrioridade === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltrosPrioridade('todos')}
            >
              Todas ({ingressosPendentesReais.length})
            </Button>
            <Button
              size="sm"
              variant={filtrosPrioridade === 'alta' ? 'default' : 'outline'}
              onClick={() => setFiltrosPrioridade('alta')}
            >
              Alta ({ingressosPendentesReais.filter(p => p.prioridade === 'alta').length})
            </Button>
            <Button
              size="sm"
              variant={filtrosPrioridade === 'media' ? 'default' : 'outline'}
              onClick={() => setFiltrosPrioridade('media')}
            >
              Média ({ingressosPendentesReais.filter(p => p.prioridade === 'media').length})
            </Button>
            <Button
              size="sm"
              variant={filtrosPrioridade === 'baixa' ? 'default' : 'outline'}
              onClick={() => setFiltrosPrioridade('baixa')}
            >
              Baixa ({ingressosPendentesReais.filter(p => p.prioridade === 'baixa').length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Situação por Urgência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">🔴 URGENTE</p>
                <p className="text-xs text-red-600">Prioridade Alta</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(dadosCalculados.valorUrgente)}</p>
                <p className="text-xs text-red-700">
                  {dadosCalculados.urgentes.length} {dadosCalculados.urgentes.length === 1 ? 'ingresso' : 'ingressos'}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">🟡 ATENÇÃO</p>
                <p className="text-xs text-orange-600">Prioridade Média</p>
                <p className="text-xl font-bold text-orange-900">{formatCurrency(dadosCalculados.valorAtencao)}</p>
                <p className="text-xs text-orange-700">
                  {dadosCalculados.atencao.length} {dadosCalculados.atencao.length === 1 ? 'ingresso' : 'ingressos'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">🟢 NORMAL</p>
                <p className="text-xs text-green-600">Prioridade Baixa</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(dadosCalculados.valorEmDia)}</p>
                <p className="text-xs text-green-700">
                  {dadosCalculados.emDia.length} {dadosCalculados.emDia.length === 1 ? 'ingresso' : 'ingressos'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ingressos Pendentes - Formato Compacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Ingressos com Pendências
            <Badge variant="destructive" className="ml-2">
              {ingressosFiltrados.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ingressosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">🎉 Parabéns!</p>
              <p>
                {busca ? 'Nenhum ingresso encontrado com esse filtro' : 'Não há pendências no momento'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ingressosFiltrados.map((ingresso, index) => (
                <div 
                  key={ingresso.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    ingresso.prioridade === 'alta' ? 'border-l-4 border-l-red-500 bg-red-50' :
                    ingresso.prioridade === 'media' ? 'border-l-4 border-l-orange-500 bg-orange-50' :
                    'border-l-4 border-l-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Informações do Cliente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {ingresso.prioridade === 'alta' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                         ingresso.prioridade === 'media' ? <Clock className="h-4 w-4 text-orange-600" /> :
                         <CheckCircle className="h-4 w-4 text-green-600" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {ingresso.cliente?.nome}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{formatPhone(ingresso.cliente?.telefone || '')}</span>
                                <Badge variant="outline" className="text-xs">
                                  {ingresso.setor_estadio}
                                </Badge>
                                <Badge 
                                  variant={
                                    ingresso.prioridade === 'alta' ? 'destructive' :
                                    ingresso.prioridade === 'media' ? 'default' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {ingresso.prioridade === 'alta' ? 'Alta' :
                                   ingresso.prioridade === 'media' ? 'Média' : 'Baixa'}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Valores */}
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(ingresso.valor_final)}
                              </p>
                              <div className="text-xs text-gray-500">
                                <p>{ingresso.total_tentativas_cobranca} tentativa{ingresso.total_tentativas_cobranca !== 1 ? 's' : ''}</p>
                                {ingresso.dias_em_atraso > 0 && (
                                  <p className="text-red-600">
                                    {ingresso.dias_em_atraso} dia{ingresso.dias_em_atraso !== 1 ? 's' : ''} atraso
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Informações Adicionais Compactas */}
                          <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Adversário:</span> {ingresso.adversario}
                            </div>
                            <div>
                              <span className="font-medium">Data Jogo:</span> {formatarDataBrasil(ingresso.jogo_data)}
                            </div>
                            <div>
                              <span className="font-medium">Última Cobrança:</span> 
                              {ingresso.ultima_tentativa ? 
                                formatarDataBrasil(ingresso.ultima_tentativa) : 
                                'Nunca'
                              }
                            </div>
                          </div>

                          {/* Progresso de Cobrança */}
                          {ingresso.total_tentativas_cobranca > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <span className="font-medium">Tentativas de cobrança:</span> {ingresso.total_tentativas_cobranca}
                              <Progress 
                                value={Math.min((ingresso.total_tentativas_cobranca / 5) * 100, 100)} 
                                className="h-1 mt-1"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Contato - Compactos */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => abrirModalEdicao(ingresso, 'whatsapp')}
                        className="bg-green-600 hover:bg-green-700 px-3"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirModalEdicao(ingresso, 'email')}
                        className="px-3"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarcarComoPago(ingresso)}
                        className="px-3"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Pago
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição de Mensagem */}
      <Dialog open={showMensagemModal} onOpenChange={setShowMensagemModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Mensagem - {tipoMensagem === 'email' ? 'Email' : 'WhatsApp'}
              {ingressoSelecionado && (
                <span className="text-sm font-normal text-gray-600">
                  para {ingressoSelecionado.cliente?.nome}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações do Ingresso */}
            {ingressoSelecionado && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Valor Pendente:</span>
                    <p className="text-red-600 font-bold">{formatCurrency(ingressoSelecionado.valor_final)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Setor:</span>
                    <p className="font-bold">{ingressoSelecionado.setor_estadio}</p>
                  </div>
                  <div>
                    <span className="font-medium">Adversário:</span>
                    <p className="font-bold">{ingressoSelecionado.adversario}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tentativas:</span>
                    <p className="font-bold">{ingressoSelecionado.total_tentativas_cobranca}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Campo de Assunto (apenas para email) */}
            {tipoMensagem === 'email' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Assunto:</label>
                <Input
                  value={assuntoEmail}
                  onChange={(e) => setAssuntoEmail(e.target.value)}
                  placeholder="Assunto do email..."
                />
              </div>
            )}

            {/* Editor de Mensagem */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {tipoMensagem === 'email' ? 'Corpo do Email:' : 'Mensagem do WhatsApp:'}
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copiarMensagem}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </div>
              
              <Textarea
                value={mensagemEditavel}
                onChange={(e) => setMensagemEditavel(e.target.value)}
                placeholder={`Digite sua ${tipoMensagem === 'email' ? 'mensagem de email' : 'mensagem do WhatsApp'}...`}
                className="min-h-[200px] font-mono text-sm"
              />
              
              <div className="text-xs text-gray-500">
                {mensagemEditavel.length} caracteres
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowMensagemModal(false)}
              >
                Cancelar
              </Button>
              
              <Button
                onClick={enviarMensagem}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar {tipoMensagem === 'email' ? 'Email' : 'WhatsApp'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}