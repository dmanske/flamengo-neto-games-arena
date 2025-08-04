import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatPhone } from '@/utils/formatters';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Phone, 
  MessageCircle, 
  Mail,
  TrendingDown,
  Users,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroPendente } from '@/hooks/financeiro/useViagemFinanceiro';

interface DashboardPendenciasProps {
  passageirosPendentes: PassageiroPendente[];
  onRegistrarCobranca: (
    viagemPassageiroId: string,
    tipoContato: 'whatsapp' | 'email' | 'telefone' | 'presencial',
    templateUsado?: string,
    mensagem?: string,
    observacoes?: string
  ) => Promise<void>;
}

export default function DashboardPendencias({ 
  passageirosPendentes, 
  onRegistrarCobranca
}: DashboardPendenciasProps) {
  
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'so_viagem' | 'so_passeios' | 'ambos'>('todos');
  
  // Filtrar passageiros por categoria de pendência
  const passageirosFiltrados = passageirosPendentes.filter(passageiro => {
    if (filtroCategoria === 'todos') return true;
    if (filtroCategoria === 'so_viagem') return passageiro.pendente_viagem > 0 && passageiro.pendente_passeios === 0;
    if (filtroCategoria === 'so_passeios') return passageiro.pendente_passeios > 0 && passageiro.pendente_viagem === 0;
    if (filtroCategoria === 'ambos') return passageiro.pendente_viagem > 0 && passageiro.pendente_passeios > 0;
    return true;
  });
  
  // Categorizar pendências por urgência (usando passageiros filtrados)
  const urgentes = passageirosFiltrados.filter(p => p.dias_atraso > 7);
  const atencao = passageirosFiltrados.filter(p => p.dias_atraso >= 3 && p.dias_atraso <= 7);
  const emDia = passageirosFiltrados.filter(p => p.dias_atraso < 3);

  const valorUrgente = urgentes.reduce((sum, p) => sum + p.valor_pendente, 0);
  const valorAtencao = atencao.reduce((sum, p) => sum + p.valor_pendente, 0);
  const valorEmDia = emDia.reduce((sum, p) => sum + p.valor_pendente, 0);
  const totalPendente = valorUrgente + valorAtencao + valorEmDia;

  const taxaInadimplencia = passageirosPendentes.length > 0 ? 
    (passageirosPendentes.length / (passageirosPendentes.length + 10)) * 100 : 0; // Estimativa

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

  const cobrarPassageiro = async (passageiro: PassageiroPendente, tipo: 'whatsapp' | 'email' | 'telefone') => {
    const template = tipo === 'whatsapp' ? 'lembrete' : undefined;
    const mensagem = tipo === 'whatsapp' ? 
      `Oi ${passageiro.nome.split(' ')[0]}! Faltam ${formatCurrency(passageiro.valor_pendente)} para quitar sua viagem. PIX: (11) 99999-9999` :
      undefined;

    await onRegistrarCobranca(
      passageiro.viagem_passageiro_id,
      tipo,
      template,
      mensagem,
      `Cobrança automática - ${passageiro.dias_atraso} dias de atraso`
    );
  };

  const cobrarTodos = async () => {
    for (const passageiro of passageirosPendentes) {
      await cobrarPassageiro(passageiro, 'whatsapp');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros por Categoria */}
      {passageirosPendentes.some(p => p.pendente_viagem > 0 || p.pendente_passeios > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Filtrar Pendências por Categoria
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

      {/* Resumo de Situação */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">🔴 URGENTE</p>
                <p className="text-xs text-red-600">+7 dias de atraso</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(valorUrgente)}</p>
                <p className="text-xs text-red-700">
                  {urgentes.length} {urgentes.length === 1 ? 'passageiro deve' : 'passageiros devem'}
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
                <p className="text-xl font-bold text-orange-900">{formatCurrency(valorAtencao)}</p>
                <p className="text-xs text-orange-700">
                  {atencao.length} {atencao.length === 1 ? 'passageiro deve' : 'passageiros devem'}
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
                <p className="text-xl font-bold text-green-900">{formatCurrency(valorEmDia)}</p>
                <p className="text-xs text-green-700">
                  {emDia.length} {emDia.length === 1 ? 'passageiro deve' : 'passageiros devem'}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-800">📊 RESUMO</p>
                <p className="text-xs text-blue-600">Taxa de inadimplência</p>
                <p className="text-lg font-bold text-blue-900">{taxaInadimplencia.toFixed(1)}%</p>
                <p className="text-xs text-blue-700">
                  Valor médio: {formatCurrency(totalPendente / Math.max(passageirosPendentes.length, 1))}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      {passageirosPendentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ações de Cobrança
              </span>
              <Badge variant="destructive">
                {passageirosFiltrados.length} pendências
                {filtroCategoria !== 'todos' && ` (${passageirosPendentes.length} total)`}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={cobrarTodos}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={passageirosPendentes.length === 0}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Cobrar Todos via WhatsApp
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                Total a receber: <span className="font-semibold">{formatCurrency(totalPendente)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Devedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Devedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {passageirosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium">🎉 Parabéns!</p>
              <p>Não há pendências no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {passageirosFiltrados.map((passageiro) => (
                <div 
                  key={passageiro.viagem_passageiro_id}
                  className={`p-4 rounded-lg border ${getUrgenciaColor(passageiro.dias_atraso)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getUrgenciaIcon(passageiro.dias_atraso)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{passageiro.nome}</h4>
                              <div className="flex items-center gap-2">
                                <p className="text-sm opacity-75">{formatPhone(passageiro.telefone)}</p>
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
                      
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <span className="opacity-75">Valor devido:</span>
                          <p className="font-semibold text-red-600">{formatCurrency(passageiro.valor_pendente)}</p>
                        </div>
                        <div>
                          <span className="opacity-75">Dias em atraso:</span>
                          <p className="font-semibold">{passageiro.dias_atraso} dias</p>
                        </div>
                        <div>
                          <span className="opacity-75">Total pago:</span>
                          <p className="font-semibold text-green-600">{formatCurrency(passageiro.valor_pago)}</p>
                        </div>
                        <div>
                          <span className="opacity-75">Total viagem:</span>
                          <p className="font-semibold">{formatCurrency(passageiro.valor_total)}</p>
                        </div>
                        <div>
                          <span className="opacity-75">Parcelas:</span>
                          <p className="font-semibold">
                            {passageiro.parcelas_pendentes}/{passageiro.total_parcelas} pendentes
                          </p>
                        </div>
                        <div>
                          <span className="opacity-75">Status:</span>
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

                      {/* Informações da Próxima Parcela */}
                      {passageiro.proxima_parcela && (
                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Próxima Parcela:</p>
                              <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(passageiro.proxima_parcela.valor)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm opacity-75">Vencimento:</p>
                              <p className="font-medium">
                                {new Date(passageiro.proxima_parcela.data_vencimento).toLocaleDateString('pt-BR')}
                              </p>
                              <p className={`text-xs font-medium ${
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
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Progress bar do pagamento */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progresso do pagamento</span>
                          <span>{Math.round((passageiro.valor_pago / passageiro.valor_total) * 100)}%</span>
                        </div>
                        <Progress 
                          value={(passageiro.valor_pago / passageiro.valor_total) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => cobrarPassageiro(passageiro, 'whatsapp')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cobrarPassageiro(passageiro, 'email')}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cobrarPassageiro(passageiro, 'telefone')}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Ligar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}