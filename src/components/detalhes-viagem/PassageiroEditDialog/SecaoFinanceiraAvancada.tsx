// Seção financeira avançada para tela de edição do passageiro
// Task 20: Atualizar tela de detalhes do passageiro

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  DollarSign, 
  History, 
  Plus,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StatusBadgeAvancado, BreakdownVisual } from '../StatusBadgeAvancado';
import { BotoesAcaoRapida } from '../BotoesAcaoRapida';
import { HistoricoPagamentosModal } from '../HistoricoPagamentosModal';
import { HistoricoInline } from '../HistoricoInline';
import { usePagamentosSeparados } from '@/hooks/usePagamentosSeparados';
import type { StatusPagamentoAvancado } from '@/types/pagamentos-separados';
import { formatCurrency } from '@/lib/utils';

interface SecaoFinanceiraAvancadaProps {
  passageiroId: string;
  nomePassageiro: string;
  onPagamentoRealizado?: () => void;
}

export function SecaoFinanceiraAvancada({
  passageiroId,
  nomePassageiro,
  onPagamentoRealizado
}: SecaoFinanceiraAvancadaProps) {
  const {
    passageiro,
    breakdown,
    historicoPagamentos,
    loading,
    error,
    pagarViagem,
    pagarPasseios,
    pagarTudo,
    deletarPagamento,
    editarPagamento,
    obterStatusAtual,
    refetch
  } = usePagamentosSeparados(passageiroId);

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  const handlePagamento = async (
    categoria: 'viagem' | 'passeios' | 'ambos',
    valor: number,
    formaPagamento: string,
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    console.log('🎯 handlePagamento chamado:', { categoria, valor, formaPagamento, observacoes, dataPagamento });
    
    let sucesso = false;
    
    switch (categoria) {
      case 'viagem':
        console.log('💰 Chamando pagarViagem...');
        sucesso = await pagarViagem(valor, formaPagamento, observacoes, dataPagamento);
        break;
      case 'passeios':
        console.log('🎢 Chamando pagarPasseios...');
        sucesso = await pagarPasseios(valor, formaPagamento, observacoes, dataPagamento);
        break;
      // Caso 'ambos' removido - função "Pagar Tudo" desabilitada
    }
    
    console.log('📊 Resultado handlePagamento:', sucesso);

    if (sucesso) {
      console.log('💰 Pagamento bem-sucedido, atualizando dados...');
      
      // Atualizar dados do modal
      await refetch();
      
      // FORÇAR REFRESH com delay para pagamentos que quitam completamente
      setTimeout(async () => {
        console.log('🔄 Refresh com delay executando...');
        await refetch();
        
        if (onPagamentoRealizado) {
          console.log('🔄 Executando onPagamentoRealizado...');
          await onPagamentoRealizado();
          console.log('✅ onPagamentoRealizado concluído');
        } else {
          console.warn('⚠️ onPagamentoRealizado não definido');
        }
      }, 500); // 500ms de delay
    }

    return sucesso;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Situação Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !passageiro || !breakdown) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Erro ao Carregar Dados Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Não foi possível carregar os dados financeiros.'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="mt-2"
          >
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const statusAtual = obterStatusAtual();

  return (
    <div className="space-y-4">
      {/* Card Principal - Status e Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Situação Financeira
              </CardTitle>
              <CardDescription>
                Status atual e breakdown de pagamentos
              </CardDescription>
            </div>
            <StatusBadgeAvancado 
              status={statusAtual}
              size="lg"
              showDescription={true}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Breakdown Visual */}
          <BreakdownVisual
            valorViagem={breakdown.valor_viagem}
            valorPasseios={breakdown.valor_passeios}
            pagoViagem={breakdown.pago_viagem}
            pagoPasseios={breakdown.pago_passeios}
          />

          {/* Botões de Ação */}
          <div className="flex justify-center">
            <BotoesAcaoRapida
              passageiroId={passageiroId}
              nomePassageiro={nomePassageiro}
              valorViagem={breakdown.valor_viagem}
              valorPasseios={breakdown.valor_passeios}
              pagoViagem={breakdown.pago_viagem}
              pagoPasseios={breakdown.pago_passeios}
              onPagamento={handlePagamento}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Pagamentos Inline */}
      <HistoricoInline
        historicoPagamentos={historicoPagamentos}
        onVerCompleto={() => {
          console.log('🔍 [MODAL] Abrindo modal de histórico...');
          setModalHistoricoAberto(true);
        }}
        onDeletarPagamento={deletarPagamento}
        onEditarPagamento={editarPagamento}
      />

      {/* Card de Resumo Rápido */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(breakdown.pago_total)}
              </div>
              <div className="text-xs text-muted-foreground">Total Pago</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(breakdown.pendente_total)}
              </div>
              <div className="text-xs text-muted-foreground">Pendente</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {breakdown.percentual_pago.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Progresso</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Histórico Detalhado */}
      <HistoricoPagamentosModal
        open={modalHistoricoAberto}
        onOpenChange={(open) => {
          console.log('🔍 [MODAL] Estado do modal alterado:', open);
          setModalHistoricoAberto(open);
        }}
        passageiroNome={nomePassageiro}
        historicoPagamentos={historicoPagamentos}
        valorViagem={breakdown.valor_viagem}
        valorPasseios={breakdown.valor_passeios}
        onDeletarPagamento={deletarPagamento}
        onEditarPagamento={editarPagamento}
      />
    </div>
  );
}