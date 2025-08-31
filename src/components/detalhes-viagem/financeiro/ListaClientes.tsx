import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatPhone } from '@/utils/formatters';
import { 
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageCircle,
  Mail,
  Edit,
  Send,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { PassageiroPendente } from '@/hooks/financeiro/useViagemFinanceiro';

interface ListaClientesProps {
  todosPassageiros: any[]; // Todos os passageiros, não só pendentes
  onRegistrarCobranca: (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => Promise<void>;
}

export default function ListaClientes({ 
  todosPassageiros, 
  onRegistrarCobranca 
}: ListaClientesProps) {
  
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pago' | 'pendente' | 'parcial'>('todos');
  const [ordenacao, setOrdenacao] = useState<'nome' | 'valor_total' | 'valor_pendente' | 'data_pagamento'>('nome');
  
  // Estados para o modal de edição de mensagem
  const [showMensagemModal, setShowMensagemModal] = useState(false);
  const [passageiroSelecionado, setPassageiroSelecionado] = useState<any>(null);
  const [tipoMensagem, setTipoMensagem] = useState<'whatsapp' | 'email'>('whatsapp');
  const [mensagemEditavel, setMensagemEditavel] = useState('');
  const [assuntoEmail, setAssuntoEmail] = useState('');
  
  // Filtrar e ordenar passageiros
  const passageirosFiltrados = useMemo(() => {
    if (!todosPassageiros || todosPassageiros.length === 0) return [];
    
    let filtrados = todosPassageiros.filter(passageiro => {
      // Filtro por busca
      const passaBusca = busca === '' || 
        (passageiro.nome && passageiro.nome.toLowerCase().includes(busca.toLowerCase())) ||
        (passageiro.telefone && passageiro.telefone.includes(busca));
      
      // Filtro por status usando valores calculados
      let passaStatus = true;
      const valorPendente = passageiro.valor_pendente_calculado || 0;
      const valorPago = passageiro.valor_pago_calculado || 0;
      
      if (filtroStatus === 'pago') passaStatus = valorPendente <= 0.01;
      if (filtroStatus === 'pendente') passaStatus = valorPendente > 0.01 && valorPago <= 0.01;
      if (filtroStatus === 'parcial') passaStatus = valorPago > 0.01 && valorPendente > 0.01;
      
      return passaBusca && passaStatus;
    });

    // Ordenação
    filtrados.sort((a, b) => {
      switch (ordenacao) {
        case 'nome':
          return (a.nome || '').localeCompare(b.nome || '');
        case 'valor_total':
          return (b.valor_total || 0) - (a.valor_total || 0);
        case 'valor_pendente':
          return (b.valor_pendente || 0) - (a.valor_pendente || 0);
        case 'data_pagamento':
          // Simulado - em produção viria do banco
          return new Date().getTime() - new Date().getTime();
        default:
          return 0;
      }
    });

    return filtrados;
  }, [todosPassageiros, busca, filtroStatus, ordenacao]);

  // Função para gerar mensagem padrão
  const gerarMensagemPadrao = (passageiro: any, tipo: 'whatsapp' | 'email') => {
    const nome = passageiro.nome ? passageiro.nome.split(' ')[0] : 'Cliente';
    const valorPendente = passageiro.valor_pendente_calculado || 0;
    
    if (tipo === 'email') {
      return `Olá ${nome},

Esperamos que esteja bem!

Identificamos uma pendência em sua viagem conosco:
• Valor pendente: ${formatCurrency(valorPendente)}

Para regularizar, você pode:
💳 PIX: (11) 99999-9999
🔗 Link de pagamento: https://pay.exemplo.com/123

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe Caravana Flamengo`;
    } else {
      return `Oi ${nome}! 👋

Faltam apenas *${formatCurrency(valorPendente)}* para quitar sua viagem.

💳 PIX: (11) 99999-9999
🔗 Link: https://pay.exemplo.com/123

Qualquer dúvida, estou aqui! 🔴⚫`;
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (passageiro: any, tipo: 'whatsapp' | 'email') => {
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
        const telefone = passageiroSelecionado.telefone ? passageiroSelecionado.telefone.replace(/\D/g, '') : '';
        if (telefone) {
          const mensagemEncoded = encodeURIComponent(mensagemEditavel);
          const url = `https://wa.me/55${telefone}?text=${mensagemEncoded}`;
          window.open(url, '_blank');
        } else {
          toast.error('Telefone não encontrado');
          return;
        }
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

  // Estatísticas gerais
  const estatisticas = useMemo(() => {
    if (!todosPassageiros || todosPassageiros.length === 0) {
      return {
        totalPassageiros: 0,
        pagosCompletos: 0,
        pendentesCompletos: 0,
        pagamentosParciais: 0,
        totalArrecadado: 0,
        totalPendente: 0,
        totalGeral: 0,
        percentualArrecadado: 0
      };
    }
    
    const totalPassageiros = todosPassageiros.length;
    
    // Calcular valores reais baseados nos dados do hook
    let totalArrecadado = 0;
    let totalGeral = 0;
    let pagosCompletos = 0;
    let pendentesCompletos = 0;
    let pagamentosParciais = 0;
    
    todosPassageiros.forEach(p => {
      const valorTotal = p.valor_total || 0;
      totalGeral += valorTotal;
      
      // Calcular valor pago baseado no histórico de pagamentos
      const historicoPagamentos = p.historico_pagamentos_categorizado || [];
      const valorPago = historicoPagamentos.reduce((sum: number, h: any) => sum + (h.valor_pago || 0), 0);
      const valorPendente = Math.max(0, valorTotal - valorPago);
      
      totalArrecadado += valorPago;
      
      // Classificar status
      if (valorPendente <= 0.01) { // Considera pago se diferença for menor que 1 centavo
        pagosCompletos++;
      } else if (valorPago <= 0.01) { // Não pagou nada
        pendentesCompletos++;
      } else { // Pagou parcialmente
        pagamentosParciais++;
      }
      
      // Adicionar valores calculados ao objeto do passageiro para uso posterior
      p.valor_pago_calculado = valorPago;
      p.valor_pendente_calculado = valorPendente;
    });
    
    const totalPendente = totalGeral - totalArrecadado;
    
    return {
      totalPassageiros,
      pagosCompletos,
      pendentesCompletos,
      pagamentosParciais,
      totalArrecadado,
      totalPendente,
      totalGeral,
      percentualArrecadado: totalGeral > 0 ? (totalArrecadado / totalGeral) * 100 : 0
    };
  }, [todosPassageiros]);

  const getStatusColor = (passageiro: any) => {
    const valorPendente = passageiro.valor_pendente_calculado || 0;
    const valorPago = passageiro.valor_pago_calculado || 0;
    
    if (valorPendente <= 0.01) return 'text-green-600 bg-green-50 border-green-200';
    if (valorPago <= 0.01) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-orange-600 bg-orange-50 border-orange-200';
  };

  const getStatusIcon = (passageiro: any) => {
    const valorPendente = passageiro.valor_pendente_calculado || 0;
    const valorPago = passageiro.valor_pago_calculado || 0;
    
    if (valorPendente <= 0.01) return <CheckCircle className="h-4 w-4" />;
    if (valorPago <= 0.01) return <AlertTriangle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const getStatusText = (passageiro: any) => {
    const valorPendente = passageiro.valor_pendente_calculado || 0;
    const valorPago = passageiro.valor_pago_calculado || 0;
    
    if (valorPendente <= 0.01) return 'Pago';
    if (valorPago <= 0.01) return 'Pendente';
    return 'Parcial';
  };

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">👥 TOTAL CLIENTES</p>
                <p className="text-2xl font-bold text-blue-900">
                  {estatisticas.totalPassageiros}
                </p>
                <p className="text-xs text-blue-700">passageiros</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">✅ PAGOS</p>
                <p className="text-2xl font-bold text-green-900">
                  {estatisticas.pagosCompletos}
                </p>
                <p className="text-xs text-green-700">
                  {estatisticas.totalPassageiros > 0 ? ((estatisticas.pagosCompletos / estatisticas.totalPassageiros) * 100).toFixed(0) : 0}% do total
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-800">⏳ PARCIAIS</p>
                <p className="text-2xl font-bold text-orange-900">
                  {estatisticas.pagamentosParciais}
                </p>
                <p className="text-xs text-orange-700">pagaram algo</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">❌ PENDENTES</p>
                <p className="text-2xl font-bold text-red-900">
                  {estatisticas.pendentesCompletos}
                </p>
                <p className="text-xs text-red-700">não pagaram nada</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro Geral */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total da Viagem</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(estatisticas.totalGeral)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Arrecadado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(estatisticas.totalArrecadado)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Pendente</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(estatisticas.totalPendente)}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso de Arrecadação</span>
              <span>{estatisticas.percentualArrecadado.toFixed(1)}%</span>
            </div>
            <Progress value={estatisticas.percentualArrecadado} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos ({todosPassageiros.length})</SelectItem>
                <SelectItem value="pago">Pagos ({estatisticas.pagosCompletos})</SelectItem>
                <SelectItem value="parcial">Parciais ({estatisticas.pagamentosParciais})</SelectItem>
                <SelectItem value="pendente">Pendentes ({estatisticas.pendentesCompletos})</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={ordenacao} onValueChange={(value: any) => setOrdenacao(value)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome A-Z</SelectItem>
                <SelectItem value="valor_total">Maior Valor</SelectItem>
                <SelectItem value="valor_pendente">Maior Dívida</SelectItem>
                <SelectItem value="data_pagamento">Último Pagamento</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-sm text-gray-600 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              {passageirosFiltrados.length} de {todosPassageiros.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista Completa de Clientes
            <Badge variant="outline" className="ml-2">
              {passageirosFiltrados.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {passageirosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Nenhum cliente encontrado</p>
              <p>Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {passageirosFiltrados.map((passageiro, index) => (
                <div 
                  key={passageiro.viagem_passageiro_id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${getStatusColor(passageiro)} border-l-4`}
                >
                  <div className="flex items-center justify-between">
                    {/* Informações do Cliente */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(passageiro)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {passageiro.nome || 'Nome não informado'}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{formatPhone(passageiro.telefone || '')}</span>
                                <Badge 
                                  variant={
                                    (passageiro.valor_pendente || 0) === 0 ? 'default' :
                                    (passageiro.valor_pago || 0) === 0 ? 'destructive' :
                                    'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {getStatusText(passageiro)}
                                </Badge>
                                {(passageiro.parcelas_pendentes || 0) > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {passageiro.parcelas_pendentes || 0}/{passageiro.total_parcelas || 0} parcelas
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Resumo Financeiro */}
                            <div className="text-right ml-4">
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Total</p>
                                  <p className="font-bold text-blue-600">
                                    {formatCurrency(passageiro.valor_total || 0)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Pago</p>
                                  <p className="font-bold text-green-600">
                                    {formatCurrency(passageiro.valor_pago_calculado || 0)}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500">Deve</p>
                                  <p className="font-bold text-red-600">
                                    {formatCurrency(passageiro.valor_pendente_calculado || 0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Detalhes Adicionais */}
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                            <div>
                              <span className="font-medium">Progresso:</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress 
                                  value={((passageiro.valor_pago_calculado || 0) / Math.max(passageiro.valor_total || 1, 1)) * 100} 
                                  className="h-1 flex-1"
                                />
                                <span className="text-xs">
                                  {Math.round(((passageiro.valor_pago_calculado || 0) / Math.max(passageiro.valor_total || 1, 1)) * 100)}%
                                </span>
                              </div>
                            </div>
                            
                            {passageiro.historico_pagamentos_categorizado && passageiro.historico_pagamentos_categorizado.length > 0 && (
                              <div>
                                <span className="font-medium">Último pagamento:</span>
                                <p className="text-gray-500">
                                  {(() => {
                                    const ultimoPagamento = passageiro.historico_pagamentos_categorizado
                                      .sort((a: any, b: any) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())[0];
                                    return ultimoPagamento ? new Date(ultimoPagamento.data_pagamento).toLocaleDateString('pt-BR') : 'Não informado';
                                  })()}
                                </p>
                              </div>
                            )}
                            
                            {(passageiro.dias_atraso || 0) > 0 && (
                              <div>
                                <span className="font-medium">Atraso:</span>
                                <p className="text-red-600 font-medium">
                                  {passageiro.dias_atraso || 0} dias
                                </p>
                              </div>
                            )}
                            
                            {((passageiro.pendente_viagem || 0) > 0 || (passageiro.pendente_passeios || 0) > 0) && (
                              <div>
                                <span className="font-medium">Breakdown:</span>
                                <p className="text-gray-600">
                                  V: {formatCurrency(passageiro.pendente_viagem || 0)} | P: {formatCurrency(passageiro.pendente_passeios || 0)}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Histórico de Pagamentos */}
                          {passageiro.historico_pagamentos_categorizado && passageiro.historico_pagamentos_categorizado.length > 0 && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <span className="font-medium">Pagamentos registrados:</span>
                              <div className="mt-1 space-y-1">
                                {passageiro.historico_pagamentos_categorizado
                                  .sort((a: any, b: any) => new Date(b.data_pagamento).getTime() - new Date(a.data_pagamento).getTime())
                                  .slice(0, 3) // Mostrar apenas os 3 mais recentes
                                  .map((pagamento: any, index: number) => (
                                    <div key={index} className="flex justify-between text-xs">
                                      <span className="text-gray-600">
                                        {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')} - {pagamento.categoria}
                                      </span>
                                      <span className="font-medium text-green-600">
                                        {formatCurrency(pagamento.valor_pago)}
                                      </span>
                                    </div>
                                  ))}
                                {passageiro.historico_pagamentos_categorizado.length > 3 && (
                                  <div className="text-center text-gray-500 text-xs">
                                    +{passageiro.historico_pagamentos_categorizado.length - 3} pagamentos anteriores
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações (apenas para quem deve) */}
                    {(passageiro.valor_pendente_calculado || 0) > 0.01 && (
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
                    )}
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
                    <p className="text-red-600 font-bold">
                      {formatCurrency(passageiroSelecionado.valor_pendente_calculado || 0)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span>
                    <p className="font-bold">{formatPhone(passageiroSelecionado.telefone || '')}</p>
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
                placeholder={`Digite sua mensagem de ${tipoMensagem === 'email' ? 'email' : 'WhatsApp'}...`}
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-gray-500">
                {mensagemEditavel.length} caracteres
                {tipoMensagem === 'whatsapp' && mensagemEditavel.length > 1000 && (
                  <span className="text-orange-600 ml-2">
                    ⚠️ Mensagem muito longa para WhatsApp
                  </span>
                )}
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowMensagemModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={enviarMensagem}
                className={tipoMensagem === 'whatsapp' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                <Send className="h-4 w-4 mr-2" />
                {tipoMensagem === 'email' ? 'Abrir Email' : 'Abrir WhatsApp'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}