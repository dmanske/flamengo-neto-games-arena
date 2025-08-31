import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  MessageSquare
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useClienteFinanceiro, type FinanceiroCliente } from '@/hooks/useClienteFinanceiro';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LembreteWhatsAppModal from './LembreteWhatsAppModal';

interface SituacaoFinanceiraProps {
  clienteId: string;
  cliente?: {
    nome: string;
    telefone: string;
  };
}

const SituacaoFinanceira: React.FC<SituacaoFinanceiraProps> = ({ clienteId, cliente }) => {
  const { financeiro, loading, error, refetch } = useClienteFinanceiro(clienteId);
  const [lembreteModal, setLembreteModal] = useState<{
    isOpen: boolean;
    parcela: any;
  }>({ isOpen: false, parcela: null });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !financeiro) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">Erro ao carregar dados financeiros</p>
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );
  }
  const getStatusBadge = (classificacao: string) => {
    switch (classificacao) {
      case 'bom':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Bom Pagador
          </Badge>
        );
      case 'atencao':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Atenção
          </Badge>
        );
      case 'inadimplente':
        return (
          <Badge className="bg-red-100 text-red-800">
            <Clock className="h-3 w-3 mr-1" />
            Inadimplente
          </Badge>
        );
      default:
        return <Badge variant="secondary">{classificacao}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financeiro.resumo.total_gasto)}
            </div>
            <div className="text-sm text-gray-500">Total Gasto</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financeiro.resumo.valor_pendente)}
            </div>
            <div className="text-sm text-gray-500">Pendente</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(financeiro.resumo.ticket_medio)}
            </div>
            <div className="text-sm text-gray-500">Ticket Médio</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {financeiro.resumo.total_viagens}
            </div>
            <div className="text-sm text-gray-500">Viagens</div>
          </CardContent>
        </Card>
      </div>

      {/* Status de Crédito */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Status de Crédito</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={refetch}
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              {getStatusBadge(financeiro.status_credito.classificacao)}
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getScoreColor(financeiro.status_credito.score)}`}>
                {financeiro.status_credito.score}/100
              </div>
              <div className="text-sm text-gray-500">Score de Crédito</div>
            </div>
          </div>
          
          {/* Barra de progresso do score */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                financeiro.status_credito.score >= 80 ? 'bg-green-500' :
                financeiro.status_credito.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${financeiro.status_credito.score}%` }}
            />
          </div>
          
          {financeiro.status_credito.motivo && (
            <p className="text-sm text-gray-600 mt-2">
              {financeiro.status_credito.motivo}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Parcelas Pendentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span>Parcelas Pendentes ({financeiro.parcelas_pendentes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financeiro.parcelas_pendentes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Nenhuma parcela pendente</p>
              <p className="text-sm text-gray-500">Cliente em dia com os pagamentos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {financeiro.parcelas_pendentes.map((parcela) => (
                <div 
                  key={parcela.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    parcela.dias_atraso > 0 ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium">
                        Parcela {parcela.numero_parcela}/{parcela.total_parcelas}
                      </p>
                      {parcela.dias_atraso > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {parcela.dias_atraso} dias de atraso
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {parcela.viagem_adversario} - {format(new Date(parcela.viagem_data), 'dd/MM/yyyy')}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Vence em: {format(new Date(parcela.data_vencimento), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      parcela.dias_atraso > 0 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {formatCurrency(parcela.valor_parcela)}
                    </p>
                    <Button 
                      size="sm" 
                      className={`mt-2 gap-1 ${
                        parcela.dias_atraso > 0 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-yellow-600 hover:bg-yellow-700'
                      }`}
                      onClick={() => setLembreteModal({ isOpen: true, parcela })}
                      disabled={!cliente?.telefone}
                    >
                      <MessageSquare className="h-3 w-3" />
                      {parcela.dias_atraso > 0 ? 'Cobrar Urgente' : 'Lembrar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Histórico de Pagamentos ({financeiro.historico_pagamentos.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {financeiro.historico_pagamentos.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">Nenhum pagamento registrado</p>
              <p className="text-sm text-gray-500">Os pagamentos aparecerão aqui quando realizados</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {financeiro.historico_pagamentos.map((pagamento) => (
                <div key={pagamento.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="font-medium">
                        Parcela {pagamento.numero_parcela}/{pagamento.total_parcelas} - Paga
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {pagamento.viagem_adversario} - {format(new Date(pagamento.viagem_data), 'dd/MM/yyyy')}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        <span>{pagamento.forma_pagamento}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(pagamento.valor_pago)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Lembrete WhatsApp */}
      {lembreteModal.isOpen && lembreteModal.parcela && cliente && (
        <LembreteWhatsAppModal
          isOpen={lembreteModal.isOpen}
          onClose={() => setLembreteModal({ isOpen: false, parcela: null })}
          cliente={cliente}
          parcela={lembreteModal.parcela}
        />
      )}
    </div>
  );
};

export default SituacaoFinanceira;