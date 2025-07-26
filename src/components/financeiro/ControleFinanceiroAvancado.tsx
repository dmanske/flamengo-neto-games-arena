import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  History,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { usePagamentoAvancado } from '@/hooks/usePagamentoAvancado';
import type { ControleFinanceiroUnificado } from '@/types/pagamento-avancado';

interface ControleFinanceiroAvancadoProps {
  viagemPassageiroId: string;
  clienteNome: string;
}

export const ControleFinanceiroAvancado: React.FC<ControleFinanceiroAvancadoProps> = ({
  viagemPassageiroId,
  clienteNome
}) => {
  const {
    controleFinanceiro,
    loading,
    error,
    registrarPagamentoLivre,
    pagarParcela,
    calcularSaldoDevedor,
    verificarPodeViajar,
    obterProximoVencimento
  } = usePagamentoAvancado(viagemPassageiroId);

  const [showPagamentoForm, setShowPagamentoForm] = useState(false);
  const [valorPagamento, setValorPagamento] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [observacoes, setObservacoes] = useState('');

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !controleFinanceiro) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Erro ao carregar dados financeiros</p>
            {error && <p className="text-sm mt-1">{error}</p>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleRegistrarPagamento = async () => {
    const valor = parseFloat(valorPagamento);
    if (!valor || valor <= 0) {
      toast.error('Valor inválido');
      return;
    }

    const sucesso = await registrarPagamentoLivre(valor, formaPagamento, observacoes);
    if (sucesso) {
      setShowPagamentoForm(false);
      setValorPagamento('');
      setObservacoes('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-700';
      case 'pendente': return 'bg-yellow-100 text-yellow-700';
      case 'vencido': return 'bg-red-100 text-red-700';
      case 'bloqueado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'livre': return DollarSign;
      case 'parcelado_flexivel': return Calendar;
      case 'parcelado_obrigatorio': return CreditCard;
      default: return DollarSign;
    }
  };

  const TipoIcon = getTipoIcon(controleFinanceiro.tipo_pagamento);
  const proximoVencimento = obterProximoVencimento();
  const podeViajar = verificarPodeViajar();
  const saldoDevedor = calcularSaldoDevedor();

  return (
    <div className="space-y-6">
      {/* Header com Resumo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TipoIcon className="h-6 w-6" />
              <div>
                <CardTitle className="text-lg">{clienteNome}</CardTitle>
                <CardDescription>
                  {controleFinanceiro.tipo_pagamento === 'livre' && 'Pagamento Livre'}
                  {controleFinanceiro.tipo_pagamento === 'parcelado_flexivel' && 'Parcelamento Flexível'}
                  {controleFinanceiro.tipo_pagamento === 'parcelado_obrigatorio' && 'Parcelamento Obrigatório'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(controleFinanceiro.status_pagamento)}>
                {controleFinanceiro.status_pagamento.toUpperCase()}
              </Badge>
              {podeViajar ? (
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pode Viajar
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-lg font-semibold">
                R$ {controleFinanceiro.valor_total.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Base: R$ {controleFinanceiro.valor_viagem.toFixed(2)} + 
                Passeios: R$ {controleFinanceiro.valor_passeios.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor Pago</p>
              <p className="text-lg font-semibold text-green-600">
                R$ {controleFinanceiro.valor_pago.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Saldo Devedor</p>
              <p className={`text-lg font-semibold ${saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'}`}>
                R$ {saldoDevedor.toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Próximo Vencimento</p>
              <p className="text-sm font-medium">
                {proximoVencimento ? (
                  format(proximoVencimento, 'dd/MM/yyyy', { locale: ptBR })
                ) : (
                  'Sem data'
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo Específico por Tipo */}
      {controleFinanceiro.tipo_pagamento === 'livre' && controleFinanceiro.pagamento_livre && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pagamento Livre
            </CardTitle>
            <CardDescription>
              Cliente pode pagar valores aleatórios quando quiser
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Dias em aberto: {controleFinanceiro.pagamento_livre.dias_em_aberto}
                </p>
                <Badge 
                  className={
                    controleFinanceiro.pagamento_livre.categoria_inadimplencia === 'ok' 
                      ? 'bg-green-100 text-green-700'
                      : controleFinanceiro.pagamento_livre.categoria_inadimplencia === 'atencao'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }
                >
                  {controleFinanceiro.pagamento_livre.categoria_inadimplencia === 'ok' && 'Em Dia'}
                  {controleFinanceiro.pagamento_livre.categoria_inadimplencia === 'atencao' && 'Atenção'}
                  {controleFinanceiro.pagamento_livre.categoria_inadimplencia === 'critico' && 'Crítico'}
                </Badge>
              </div>
              <Button 
                onClick={() => setShowPagamentoForm(!showPagamentoForm)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Registrar Pagamento
              </Button>
            </div>

            {showPagamentoForm && (
              <Card className="bg-gray-50">
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={valorPagamento}
                        onChange={(e) => setValorPagamento(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Forma de Pagamento</Label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                      >
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao">Cartão</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Observações</Label>
                    <Textarea
                      placeholder="Observações sobre o pagamento..."
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRegistrarPagamento}>
                      Confirmar Pagamento
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPagamentoForm(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Histórico de Pagamentos */}
            {controleFinanceiro.pagamento_livre.historico_pagamentos.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Histórico de Pagamentos
                </h4>
                <div className="space-y-2">
                  {controleFinanceiro.pagamento_livre.historico_pagamentos.map((pagamento) => (
                    <div key={pagamento.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">R$ {pagamento.valor.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy HH:mm', { locale: ptBR })} - {pagamento.forma_pagamento}
                        </p>
                      </div>
                      {pagamento.observacoes && (
                        <p className="text-xs text-muted-foreground max-w-xs truncate">
                          {pagamento.observacoes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parcelamento Flexível */}
      {controleFinanceiro.tipo_pagamento === 'parcelado_flexivel' && controleFinanceiro.parcelamento_flexivel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Parcelamento Flexível
            </CardTitle>
            <CardDescription>
              Parcelas sugeridas + pagamentos extras aceitos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Parcelas Pagas</p>
                <p className="text-lg font-semibold text-green-600">
                  R$ {controleFinanceiro.parcelamento_flexivel.valor_parcelas_pagas.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Pagamentos Extras</p>
                <p className="text-lg font-semibold text-blue-600">
                  R$ {controleFinanceiro.parcelamento_flexivel.valor_pagamentos_extras.toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Saldo Restante</p>
                <p className="text-lg font-semibold text-red-600">
                  R$ {controleFinanceiro.parcelamento_flexivel.saldo_restante.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Lista de Parcelas */}
            {controleFinanceiro.parcelamento_flexivel.parcelas_sugeridas.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Parcelas Sugeridas</h4>
                <div className="space-y-2">
                  {controleFinanceiro.parcelamento_flexivel.parcelas_sugeridas.map((parcela) => (
                    <div key={parcela.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">
                          Parcela {parcela.numero_parcela} - R$ {parcela.valor_parcela.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {format(new Date(parcela.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <Badge className={getStatusColor(parcela.status)}>
                        {parcela.status.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Parcelamento Obrigatório */}
      {controleFinanceiro.tipo_pagamento === 'parcelado_obrigatorio' && controleFinanceiro.parcelamento_obrigatorio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Parcelamento Obrigatório
            </CardTitle>
            <CardDescription>
              Parcelas fixas e obrigatórias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Parcelas Pagas</p>
                <p className="text-lg font-semibold text-green-600">
                  {controleFinanceiro.parcelamento_obrigatorio.parcelas_pagas}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Parcelas Vencidas</p>
                <p className="text-lg font-semibold text-red-600">
                  {controleFinanceiro.parcelamento_obrigatorio.parcelas_vencidas}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Parcelas Futuras</p>
                <p className="text-lg font-semibold text-blue-600">
                  {controleFinanceiro.parcelamento_obrigatorio.parcelas_futuras}
                </p>
              </div>
            </div>

            {/* Lista de Parcelas Fixas */}
            <div>
              <h4 className="font-medium mb-2">Parcelas Fixas</h4>
              <div className="space-y-2">
                {controleFinanceiro.parcelamento_obrigatorio.parcelas_fixas.map((parcela) => (
                  <div key={parcela.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">
                        Parcela {parcela.numero_parcela}/{parcela.total_parcelas} - R$ {parcela.valor_parcela.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vencimento: {format(new Date(parcela.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                        {parcela.dias_atraso && parcela.dias_atraso > 0 && (
                          <span className="text-red-600 ml-2">
                            ({parcela.dias_atraso} dias de atraso)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(parcela.status)}>
                        {parcela.status.toUpperCase()}
                      </Badge>
                      {parcela.status === 'pendente' && (
                        <Button 
                          size="sm"
                          onClick={() => pagarParcela(parcela.id, parcela.valor_parcela, 'pix')}
                        >
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};