import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPhone } from '@/utils/formatters';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  MessageCircle, 
  Mail,
  TrendingUp,
  Users,
  DollarSign,
  Search,
  Calendar,
  Star,
  Edit,
  Send,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { PassageiroPendente } from '@/hooks/financeiro/useViagemFinanceiro';

interface DashboardPendenciasNovoProps {
  passageirosPendentes: PassageiroPendente[];
  onRegistrarCobranca: (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => Promise<void>;
}

export default function DashboardPendenciasNovo({ 
  passageirosPendentes, 
  onRegistrarCobranca
}: DashboardPendenciasNovoProps) {
  
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'so_viagem' | 'so_passeios' | 'ambos'>('todos');
  const [busca, setBusca] = useState('');
  
  // Estados para o modal de edição de mensagem
  const [showMensagemModal, setShowMensagemModal] = useState(false);
  const [passageiroSelecionado, setPassageiroSelecionado] = useState<PassageiroPendente | null>(null);
  const [tipoMensagem, setTipoMensagem] = useState<'whatsapp' | 'email'>('whatsapp');
  const [mensagemEditavel, setMensagemEditavel] = useState('');
  const [assuntoEmail, setAssuntoEmail] = useState('');
  

  
  // Filtrar passageiros por categoria e busca
  const passageirosFiltrados = useMemo(() => {
    return passageirosPendentes.filter(passageiro => {
      // Filtro por categoria
      let passaCategoria = true;
      if (filtroCategoria === 'so_viagem') passaCategoria = passageiro.pendente_viagem > 0 && passageiro.pendente_passeios === 0;
      if (filtroCategoria === 'so_passeios') passaCategoria = passageiro.pendente_passeios > 0 && passageiro.pendente_viagem === 0;
      if (filtroCategoria === 'ambos') passaCategoria = passageiro.pendente_viagem > 0 && passageiro.pendente_passeios > 0;
      
      // Filtro por busca
      const passaBusca = busca === '' || 
        passageiro.nome.toLowerCase().includes(busca.toLowerCase()) ||
        passageiro.telefone.includes(busca);
      
      return passaCategoria && passaBusca;
    });
  }, [passageirosPendentes, filtroCategoria, busca]);
  
  // Cálculos para os cards melhorados
  const dadosCalculados = useMemo(() => {
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const tresDiasFrente = new Date(hoje.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    // Pagamentos recentes (simulado - em produção viria do banco)
    const pagamentosRecentes = passageirosPendentes.filter(p => {
      // Simular alguns pagamentos recentes baseado no valor pago
      return p.valor_pago > 0 && Math.random() > 0.7; // 30% chance de ter pago recentemente
    });
    
    // Próximos vencimentos
    const proximosVencimentos = passageirosPendentes.filter(p => 
      p.proxima_parcela && 
      new Date(p.proxima_parcela.data_vencimento) <= tresDiasFrente &&
      new Date(p.proxima_parcela.data_vencimento) >= hoje
    );
    
    // Maior devedor
    const maiorDevedor = passageirosPendentes.reduce((maior, atual) => 
      atual.valor_pendente > maior.valor_pendente ? atual : maior, 
      passageirosPendentes[0] || { valor_pendente: 0, nome: '' }
    );
    
    // Categorização por urgência
    const urgentes = passageirosFiltrados.filter(p => p.dias_atraso > 7);
    const atencao = passageirosFiltrados.filter(p => p.dias_atraso >= 3 && p.dias_atraso <= 7);
    const emDia = passageirosFiltrados.filter(p => p.dias_atraso < 3);
    
    const valorUrgente = urgentes.reduce((sum, p) => sum + p.valor_pendente, 0);
    const valorAtencao = atencao.reduce((sum, p) => sum + p.valor_pendente, 0);
    const valorEmDia = emDia.reduce((sum, p) => sum + p.valor_pendente, 0);
    const totalPendente = valorUrgente + valorAtencao + valorEmDia;
    
    return {
      pagamentosRecentes,
      proximosVencimentos,
      maiorDevedor,
      urgentes,
      atencao,
      emDia,
      valorUrgente,
      valorAtencao,
      valorEmDia,
      totalPendente
    };
  }, [passageirosPendentes, passageirosFiltrados]);

  const getUrgenciaColor = (diasAtraso: number) => {
    if (diasAtraso > 7) return 'text-red-600 bg-red-50 border-red-200';
    if (diasAtraso >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getUrgenciaIcon = (diasAtraso: number) => {
    if (diasAtraso > 7) return <AlertTriangle className="h-4 w-4" />;
    if (diasAtraso >= 3) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  // Função para gerar mensagem padrão
  const gerarMensagemPadrao = (passageiro: PassageiroPendente, tipo: 'whatsapp' | 'email') => {
    const nome = passageiro.nome.split(' ')[0];
    
    if (tipo === 'email') {
      return `Olá ${nome},

Esperamos que esteja bem!

Identificamos uma pendência em sua viagem conosco:
• Valor pendente: ${formatCurrency(passageiro.valor_pendente)}
• Dias em atraso: ${passageiro.dias_atraso} dias

${passageiro.pendente_viagem > 0 ? `• Viagem: ${formatCurrency(passageiro.pendente_viagem)}` : ''}
${passageiro.pendente_passeios > 0 ? `• Passeios: ${formatCurrency(passageiro.pendente_passeios)}` : ''}

Para regularizar, você pode:
💳 PIX: (11) 99999-9999
🔗 Link de pagamento: https://pay.exemplo.com/123

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe Caravana Flamengo`;
    } else {
      let mensagem = `Oi ${nome}! 👋

Faltam apenas *${formatCurrency(passageiro.valor_pendente)}* para quitar sua viagem.`;

      if (passageiro.pendente_viagem > 0 && passageiro.pendente_passeios > 0) {
        mensagem += `

📋 Detalhamento:
• Viagem: *${formatCurrency(passageiro.pendente_viagem)}*
• Passeios: *${formatCurrency(passageiro.pendente_passeios)}*`;
      } else if (passageiro.pendente_viagem > 0) {
        mensagem += `

✅ Seus passeios já estão pagos!
Falta apenas a viagem: *${formatCurrency(passageiro.pendente_viagem)}*`;
      } else if (passageiro.pendente_passeios > 0) {
        mensagem += `

✅ Sua viagem já está paga!
Falta apenas os passeios: *${formatCurrency(passageiro.pendente_passeios)}*`;
      }

      mensagem += `

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

Qualquer dúvida, estou aqui! 🔴⚫`;

      return mensagem;
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (passageiro: PassageiroPendente, tipo: 'whatsapp' | 'email') => {
    setPassageiroSelecionado(passageiro);
    setTipoMensagem(tipo);
    setMensagemEditavel(gerarMensagemPadrao(passageiro, tipo));
    setAssuntoEmail('Pendência Financeira - Viagem Flamengo');
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
    if (!passageiroSelecionado) return;

    try {
      if (tipoMensagem === 'email') {
        const mailtoLink = `mailto:${passageiroSelecionado.email || ''}?subject=${encodeURIComponent(assuntoEmail)}&body=${encodeURIComponent(mensagemEditavel)}`;
        window.open(mailtoLink);
      } else {
        const telefone = passageiroSelecionado.telefone.replace(/\D/g, '');
        const mensagemEncoded = encodeURIComponent(mensagemEditavel);
        const url = `https://wa.me/55${telefone}?text=${mensagemEncoded}`;
        window.open(url, '_blank');
      }

      // Registrar a tentativa de contato
      await onRegistrarCobranca(
        passageiroSelecionado.viagem_passageiro_id,
        tipoMensagem,
        `cobranca_${tipoMensagem}`,
        mensagemEditavel,
        `${tipoMensagem === 'email' ? 'Email' : 'WhatsApp'} enviado com mensagem editada`
      );

      toast.success(`${tipoMensagem === 'email' ? 'Email' : 'WhatsApp'} aberto com sucesso!`);
      setShowMensagemModal(false);
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
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
                placeholder="Buscar por nome ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {passageirosFiltrados.length} de {passageirosPendentes.length} passageiros
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pagamentos Recentes */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">💰 PAGAMENTOS RECENTES</p>
                <p className="text-xs text-green-600">Últimos 7 dias</p>
                <p className="text-xl font-bold text-green-900">
                  {dadosCalculados.pagamentosRecentes.length}
                </p>
                <p className="text-xs text-green-700">
                  {dadosCalculados.pagamentosRecentes.length === 1 ? 'pagamento' : 'pagamentos'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Próximos Vencimentos */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">📅 PRÓXIMOS VENCIMENTOS</p>
                <p className="text-xs text-blue-600">Próximos 3 dias</p>
                <p className="text-xl font-bold text-blue-900">
                  {dadosCalculados.proximosVencimentos.length}
                </p>
                <p className="text-xs text-blue-700">
                  {formatCurrency(dadosCalculados.proximosVencimentos.reduce((sum, p) => 
                    sum + (p.proxima_parcela?.valor || 0), 0))}
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
                <p className="text-xs text-purple-600 truncate" title={dadosCalculados.maiorDevedor?.nome}>
                  {dadosCalculados.maiorDevedor?.nome?.split(' ')[0] || 'N/A'}
                </p>
                <p className="text-xl font-bold text-purple-900">
                  {formatCurrency(dadosCalculados.maiorDevedor?.valor_pendente || 0)}
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
                <p className="text-xs text-gray-600">Todos os passageiros</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(dadosCalculados.totalPendente)}
                </p>
                <p className="text-xs text-gray-700">
                  Média: {formatCurrency(dadosCalculados.totalPendente / Math.max(passageirosFiltrados.length, 1))}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por Categoria */}
      {passageirosPendentes.some(p => p.pendente_viagem > 0 || p.pendente_passeios > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filtrar por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={filtroCategoria === 'todos' ? 'default' : 'outline'}
                onClick={() => setFiltroCategoria('todos')}
              >
                Todas ({passageirosPendentes.length})
              </Button>
              <Button
                size="sm"
                variant={filtroCategoria === 'so_viagem' ? 'default' : 'outline'}
                onClick={() => setFiltroCategoria('so_viagem')}
              >
                Só Viagem ({passageirosPendentes.filter(p => p.pendente_viagem > 0 && p.pendente_passeios === 0).length})
              </Button>
              <Button
                size="sm"
                variant={filtroCategoria === 'so_passeios' ? 'default' : 'outline'}
                onClick={() => setFiltroCategoria('so_passeios')}
              >
                Só Passeios ({passageirosPendentes.filter(p => p.pendente_passeios > 0 && p.pendente_viagem === 0).length})
              </Button>
              <Button
                size="sm"
                variant={filtroCategoria === 'ambos' ? 'default' : 'outline'}
                onClick={() => setFiltroCategoria('ambos')}
              >
                Ambos ({passageirosPendentes.filter(p => p.pendente_viagem > 0 && p.pendente_passeios > 0).length})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Situação por Urgência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">🔴 URGENTE</p>
                <p className="text-xs text-red-600">+7 dias de atraso</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(dadosCalculados.valorUrgente)}</p>
                <p className="text-xs text-red-700">
                  {dadosCalculados.urgentes.length} {dadosCalculados.urgentes.length === 1 ? 'passageiro' : 'passageiros'}
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
                <p className="text-xs text-orange-600">3-7 dias de atraso</p>
                <p className="text-xl font-bold text-orange-900">{formatCurrency(dadosCalculados.valorAtencao)}</p>
                <p className="text-xs text-orange-700">
                  {dadosCalculados.atencao.length} {dadosCalculados.atencao.length === 1 ? 'passageiro' : 'passageiros'}
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
                <p className="text-sm font-medium text-green-800">🟢 EM DIA</p>
                <p className="text-xs text-green-600">Menos de 3 dias</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(dadosCalculados.valorEmDia)}</p>
                <p className="text-xs text-green-700">
                  {dadosCalculados.emDia.length} {dadosCalculados.emDia.length === 1 ? 'passageiro' : 'passageiros'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Passageiros Pendentes - Formato Compacto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Passageiros com Pendências
            <Badge variant="destructive" className="ml-2">
              {passageirosFiltrados.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {passageirosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">🎉 Parabéns!</p>
              <p>
                {busca ? 'Nenhum passageiro encontrado com esse filtro' : 'Não há pendências no momento'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {passageirosFiltrados.map((passageiro, index) => (
                <div 
                  key={passageiro.viagem_passageiro_id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    passageiro.dias_atraso > 7 ? 'border-l-4 border-l-red-500 bg-red-50' :
                    passageiro.dias_atraso >= 3 ? 'border-l-4 border-l-orange-500 bg-orange-50' :
                    'border-l-4 border-l-green-500 bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* Informações do Passageiro */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {getUrgenciaIcon(passageiro.dias_atraso)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {passageiro.nome}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{formatPhone(passageiro.telefone)}</span>
                                {passageiro.parcelas_pendentes > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {passageiro.parcelas_pendentes}/{passageiro.total_parcelas} parcelas
                                  </Badge>
                                )}
                                <Badge 
                                  variant={
                                    passageiro.status_pagamento === 'pago' ? 'default' :
                                    passageiro.status_pagamento === 'pendente' ? 'secondary' :
                                    'destructive'
                                  }
                                  className="text-xs"
                                >
                                  {passageiro.status_pagamento}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Valores */}
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-red-600">
                                {formatCurrency(passageiro.valor_pendente)}
                              </p>
                              <div className="text-xs text-gray-500">
                                <p>{passageiro.dias_atraso} dias atraso</p>
                                {(passageiro.pendente_viagem > 0 || passageiro.pendente_passeios > 0) && (
                                  <p className="text-gray-600">
                                    V: {formatCurrency(passageiro.pendente_viagem)} | P: {formatCurrency(passageiro.pendente_passeios)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Informações Adicionais Compactas */}
                          <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Pago:</span> {formatCurrency(passageiro.valor_pago)}
                              {passageiro.valor_pago > 0 && (
                                <div className="text-gray-500">
                                  Último: {new Date().toLocaleDateString('pt-BR')}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium">Total:</span> {formatCurrency(passageiro.valor_total)}
                            </div>
                            <div>
                              <span className="font-medium">Progresso:</span> {Math.round((passageiro.valor_pago / passageiro.valor_total) * 100)}%
                              <Progress 
                                value={(passageiro.valor_pago / passageiro.valor_total) * 100} 
                                className="h-1 mt-1"
                              />
                            </div>
                          </div>

                          {/* Próxima Parcela - Compacta */}
                          {passageiro.proxima_parcela && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <span className="font-medium">Próxima parcela:</span> {formatCurrency(passageiro.proxima_parcela.valor)} - 
                              <span className={`ml-1 font-medium ${
                                passageiro.proxima_parcela.dias_para_vencer < 0 ? 'text-red-600' :
                                passageiro.proxima_parcela.dias_para_vencer <= 3 ? 'text-orange-600' :
                                'text-green-600'
                              }`}>
                                {passageiro.proxima_parcela.dias_para_vencer < 0 
                                  ? `${Math.abs(passageiro.proxima_parcela.dias_para_vencer)} dias em atraso`
                                  : passageiro.proxima_parcela.dias_para_vencer === 0
                                  ? 'Vence hoje!'
                                  : `Vence em ${passageiro.proxima_parcela.dias_para_vencer} dias`
                                }
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botões de Contato - Compactos */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => abrirModalEdicao(passageiro, 'whatsapp')}
                        className="bg-green-600 hover:bg-green-700 px-3"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirModalEdicao(passageiro, 'email')}
                        className="px-3"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
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
              {passageiroSelecionado && (
                <span className="text-sm font-normal text-gray-600">
                  para {passageiroSelecionado.nome}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informações do Passageiro */}
            {passageiroSelecionado && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Valor Pendente:</span>
                    <p className="text-red-600 font-bold">{formatCurrency(passageiroSelecionado.valor_pendente)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Dias em Atraso:</span>
                    <p className="font-bold">{passageiroSelecionado.dias_atraso} dias</p>
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