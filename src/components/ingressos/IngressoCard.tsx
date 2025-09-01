import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Calendar, 
  MapPin, 
  User, 
  CreditCard, 
  TrendingUp, 
  Phone,
  Mail,
  Trophy,
  Home,
  Plane,
  DollarSign,
  Clock,
  CheckCircle,
  Receipt,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { Ingresso, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency, formatCPF, formatPhone } from '@/utils/formatters';
import { formatDateTimeSafe } from '@/lib/date-utils';

interface IngressoCardProps {
  ingresso: Ingresso;
  pagamentos: any[];
  resumoPagamentos: any;
  onEditarPagamento: (pagamento: any) => void;
  onDeletarPagamento: (pagamentoId: string) => void;
  onNovoPagamento: () => void;
  isLoading?: boolean;
}

export function IngressoCard({
  ingresso,
  pagamentos,
  resumoPagamentos,
  onEditarPagamento,
  onDeletarPagamento,
  onNovoPagamento,
  isLoading = false
}: IngressoCardProps) {
  
  // Função para obter cor do badge de status
  const getStatusBadgeVariant = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return 'default';
      case 'pendente':
        return 'secondary';
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Função para obter texto do status
  const getStatusText = (status: SituacaoFinanceiraIngresso) => {
    switch (status) {
      case 'pago':
        return '✅ Pago';
      case 'pendente':
        return '⏳ Pendente';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Card Principal - Informações do Jogo e Cliente */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trophy className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {ingresso.local_jogo === 'casa' ? 'Flamengo' : ingresso.adversario}
                    <span className="mx-2 text-muted-foreground">×</span>
                    {ingresso.local_jogo === 'casa' ? ingresso.adversario : 'Flamengo'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ingresso.jogo_data), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge 
                  variant={getStatusBadgeVariant(ingresso.situacao_financeira)}
                  className="mb-2"
                >
                  {getStatusText(ingresso.situacao_financeira)}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Badge variant={ingresso.local_jogo === 'casa' ? 'default' : 'secondary'} className="text-xs">
                    {ingresso.local_jogo === 'casa' ? (
                      <><Home className="h-3 w-3 mr-1" /> Casa</>
                    ) : (
                      <><Plane className="h-3 w-3 mr-1" /> Fora</>
                    )}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações do Jogo */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Setor</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{ingresso.setor_estadio}</span>
                  </div>
                </div>
                
                {ingresso.viagem && (
                  <div>
                    <p className="text-xs text-muted-foreground">Viagem Vinculada</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {ingresso.viagem.adversario} - {format(new Date(ingresso.viagem.data_jogo), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Valor Final</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(ingresso.valor_final)}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground">Lucro</p>
                  <p className={`font-semibold ${
                    ingresso.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(ingresso.lucro)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cliente */}
            {ingresso.cliente && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-3 mb-3">
                  {/* Foto do Cliente */}
                  <div className="relative">
                    {ingresso.cliente?.foto ? (
                      <img 
                        src={ingresso.cliente.foto} 
                        alt={ingresso.cliente.nome}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold ${ingresso.cliente?.foto ? 'hidden' : ''}`}>
                      {ingresso.cliente.nome.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{ingresso.cliente.nome}</p>
                    <p className="text-xs text-muted-foreground">Cliente</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {ingresso.cliente.cpf && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">CPF:</span>
                      <span className="font-mono">{formatCPF(ingresso.cliente.cpf)}</span>
                    </div>
                  )}
                  {ingresso.cliente.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-green-600" />
                      <span>{formatPhone(ingresso.cliente.telefone)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {ingresso.observacoes && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm bg-amber-50 p-2 rounded border border-amber-200">
                  {ingresso.observacoes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Card Lateral - Status de Pagamento e Ações */}
      <div className="space-y-4">
        {/* Status de Pagamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Resumo */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Pago:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(resumoPagamentos.totalPago)}
                </span>
              </div>
              {resumoPagamentos.saldoDevedor > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Devedor:</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(resumoPagamentos.saldoDevedor)}
                  </span>
                </div>
              )}
            </div>

            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>{resumoPagamentos.percentualPago.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(resumoPagamentos.percentualPago, 100)} 
                className="h-2"
              />
            </div>

            {/* Status Visual */}
            <div className={`p-2 rounded text-center text-sm ${
              resumoPagamentos.quitado 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
            }`}>
              {resumoPagamentos.quitado ? (
                <div className="flex items-center justify-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Quitado</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Pendente</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Custo</p>
                <p className="font-semibold text-blue-600">
                  {formatCurrency(ingresso.preco_custo)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Venda</p>
                <p className="font-semibold text-green-600">
                  {formatCurrency(ingresso.preco_venda)}
                </p>
              </div>
            </div>
            
            {ingresso.desconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto:</span>
                <span className="text-red-600">-{formatCurrency(ingresso.desconto)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Margem:</span>
              <Badge variant={ingresso.margem_percentual >= 0 ? 'default' : 'destructive'}>
                {ingresso.margem_percentual.toFixed(1)}%
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={onNovoPagamento}
              className="w-full gap-2"
              size="sm"
              disabled={resumoPagamentos.quitado}
              title={resumoPagamentos.quitado ? "Ingresso já está totalmente pago" : "Registrar novo pagamento"}
            >
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                const info = `🎫 INGRESSO FLAMENGO
📅 ${format(new Date(ingresso.jogo_data), "dd/MM/yyyy", { locale: ptBR })}
⚽ ${ingresso.local_jogo === 'casa' ? 'Flamengo' : ingresso.adversario} × ${ingresso.local_jogo === 'casa' ? ingresso.adversario : 'Flamengo'}
📍 ${ingresso.setor_estadio}
👤 ${ingresso.cliente?.nome || 'Cliente não informado'}
💰 ${formatCurrency(ingresso.valor_final)}
📊 Status: ${getStatusText(ingresso.situacao_financeira)}`;
                navigator.clipboard.writeText(info);
              }}
              className="w-full gap-2"
              size="sm"
            >
              <Receipt className="h-4 w-4" />
              Copiar Info
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos - Span completo */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Histórico de Pagamentos ({pagamentos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : pagamentos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum pagamento registrado</p>
                <Button
                  onClick={onNovoPagamento}
                  className="mt-3 gap-2"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  Registrar Primeiro Pagamento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {pagamentos.map((pagamento, index) => (
                  <div key={pagamento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-green-600">
                            {formatCurrency(pagamento.valor_pago)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {pagamento.forma_pagamento || 'Não informado'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDateTimeSafe(pagamento.data_pagamento)}
                          </div>
                          {pagamento.observacoes && (
                            <span className="truncate max-w-[200px]">
                              {pagamento.observacoes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditarPagamento(pagamento)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletarPagamento(pagamento.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}