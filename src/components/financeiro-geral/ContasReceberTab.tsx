import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle,
  MessageCircle,
  Phone,
  Mail,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ContaReceber } from '@/hooks/useFinanceiroGeral';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ContasReceberTabProps {
  contasReceber: ContaReceber[];
}

export function ContasReceberTab({ contasReceber }: ContasReceberTabProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Calcular totais
  const totalPendente = contasReceber.reduce((sum, conta) => sum + conta.valor_pendente, 0);
  const totalPago = contasReceber.reduce((sum, conta) => sum + conta.valor_pago, 0);
  const totalGeral = contasReceber.reduce((sum, conta) => sum + conta.valor_total, 0);

  // Agrupar por urgência
  const urgentes = contasReceber.filter(c => c.dias_atraso > 7);
  const atencao = contasReceber.filter(c => c.dias_atraso > 0 && c.dias_atraso <= 7);
  const emDia = contasReceber.filter(c => c.dias_atraso <= 0);

  const toggleExpanded = (contaId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(contaId)) {
      newExpanded.delete(contaId);
    } else {
      newExpanded.add(contaId);
    }
    setExpandedRows(newExpanded);
  };

  // Marcar conta como quitada (quitar valor restante)
  const marcarComoQuitado = async (passageiroId: string) => {
    try {
      // Buscar valor pendente
      const conta = contasReceber.find(c => c.id === passageiroId);
      if (!conta || conta.valor_pendente <= 0) {
        toast.error("Não há valor pendente para quitar");
        return;
      }

      // Confirmar ação
      const confirmar = window.confirm(
        `Confirma a quitação de ${formatCurrency(conta.valor_pendente)} para ${conta.passageiro_nome}?`
      );
      
      if (!confirmar) return;

      // Registrar pagamento do valor restante
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .insert({
          viagem_passageiro_id: passageiroId,
          valor_parcela: conta.valor_pendente,
          forma_pagamento: 'Pix',
          data_pagamento: new Date().toISOString().split('T')[0],
          observacoes: 'Quitação total via Contas a Receber'
        });

      if (error) throw error;

      toast.success(`Conta de ${conta.passageiro_nome} quitada com sucesso!`);
      
      // Recarregar dados (se houver callback)
      window.location.reload(); // Temporário - idealmente usar callback
      
    } catch (error) {
      console.error('Erro ao quitar conta:', error);
      toast.error('Erro ao quitar conta');
    }
  };

  // Marcar parcela individual como paga
  const marcarParcelaComoPaga = async (passageiroId: string, parcela: any) => {
    try {
      const confirmar = window.confirm(
        `Confirma o pagamento da ${parcela.numero}ª parcela de ${formatCurrency(parcela.valor)}?`
      );
      
      if (!confirmar) return;

      // Atualizar parcela para paga
      const { error } = await supabase
        .from('viagem_passageiros_parcelas')
        .update({
          data_pagamento: new Date().toISOString().split('T')[0],
          status: 'pago'
        })
        .eq('viagem_passageiro_id', passageiroId)
        .eq('numero_parcela', parcela.numero);

      if (error) throw error;

      toast.success(`${parcela.numero}ª parcela marcada como paga!`);
      
      // Recarregar dados
      window.location.reload(); // Temporário
      
    } catch (error) {
      console.error('Erro ao marcar parcela como paga:', error);
      toast.error('Erro ao marcar parcela como paga');
    }
  };

  const getStatusColor = (dias_atraso: number) => {
    if (dias_atraso > 7) return 'bg-red-100 text-red-800 border-red-200';
    if (dias_atraso > 0) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (dias_atraso: number) => {
    if (dias_atraso > 7) return 'Urgente';
    if (dias_atraso > 0) return 'Atenção';
    return 'Em dia';
  };

  const getUrgencyIcon = (dias_atraso: number) => {
    if (dias_atraso > 7) return <AlertTriangle className="h-4 w-4" />;
    if (dias_atraso > 0) return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Resumo das Contas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total a Receber</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalPendente)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800">
                {contasReceber.length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(urgentes.reduce((sum, c) => sum + c.valor_pendente, 0))}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-red-100 text-red-800">
                {urgentes.length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(atencao.reduce((sum, c) => sum + c.valor_pendente, 0))}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-yellow-100 text-yellow-800">
                {atencao.length} contas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Cobrança</p>
                <p className="text-2xl font-bold text-green-600">
                  {totalGeral > 0 ? ((totalPago / totalGeral) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800">
                {formatCurrency(totalPago)} recebido
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contas a Receber</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <MessageCircle className="h-4 w-4 mr-2" />
            Cobrança em Massa
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Lista de Contas */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passageiro
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Viagem
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contasReceber.map((conta) => (
                  <React.Fragment key={conta.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap">
                        {conta.parcelas_detalhes && conta.parcelas_detalhes.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(conta.id)}
                            className="p-1 h-6 w-6"
                          >
                            {expandedRows.has(conta.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {conta.passageiro_nome}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{conta.viagem_nome}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(conta.data_vencimento).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(conta.valor_total)}
                        </div>
                        {conta.parcelas_detalhes && conta.parcelas_detalhes.length > 1 && (
                          <div className="text-xs text-gray-500">
                            {conta.parcelas_detalhes.length} parcelas
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(conta.valor_pago)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-red-600">
                          {formatCurrency(conta.valor_pendente)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(conta.dias_atraso)}>
                          <div className="flex items-center gap-1">
                            {getUrgencyIcon(conta.dias_atraso)}
                            {getStatusText(conta.dias_atraso)}
                          </div>
                        </Badge>
                        {conta.dias_atraso > 0 && (
                          <span className="text-xs text-gray-500">
                            {conta.dias_atraso} dias
                          </span>
                        )}
                      </div>
                    </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => marcarComoQuitado(conta.id)}
                            className="bg-green-50 text-green-700 hover:bg-green-100"
                          >
                            Quitar
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>

                    {/* Linha expandida com detalhes das parcelas */}
                    {expandedRows.has(conta.id) && conta.parcelas_detalhes && (
                      <tr>
                        <td colSpan={9} className="px-4 py-2 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Detalhes das Parcelas:
                            </h4>
                            <div className="grid gap-2">
                              {conta.parcelas_detalhes.map((parcela, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                                  <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="text-xs">
                                      {parcela.numero}ª parcela
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {formatCurrency(parcela.valor)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Vence: {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                                    </span>
                                    {parcela.data_pagamento && (
                                      <span className="text-xs text-green-600">
                                        Pago em: {new Date(parcela.data_pagamento).toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                      {parcela.forma_pagamento}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={
                                      parcela.status === 'pago' ? 'bg-green-100 text-green-800' :
                                      parcela.status === 'vencido' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }>
                                      {parcela.status === 'pago' ? 'Pago' :
                                       parcela.status === 'vencido' ? 'Vencido' : 'Pendente'}
                                    </Badge>
                                    
                                    {parcela.status !== 'pago' && (
                                      <Button
                                        size="sm"
                                        onClick={() => marcarParcelaComoPaga(conta.id, parcela)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-6 px-2"
                                      >
                                        Pagar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {contasReceber.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma conta a receber
            </h3>
            <p className="text-gray-600">
              Todas as contas estão em dia! 🎉
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}