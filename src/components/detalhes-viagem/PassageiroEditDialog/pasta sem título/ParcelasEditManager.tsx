// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Plus, Trash2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Parcela } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ParcelasEditManagerProps {
  passageiroId: string;
  valorTotal: number;
  desconto: number;
  onStatusUpdate?: () => void;
  onPaymentComplete?: (isComplete: boolean) => void;
}

export function ParcelasEditManager({ passageiroId, valorTotal, desconto, onStatusUpdate, onPaymentComplete }: ParcelasEditManagerProps) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [novaParcela, setNovaParcela] = useState({
    valor_parcela: 0,
    forma_pagamento: "Pix",
    observacoes: "",
    data_pagamento: format(new Date(), 'yyyy-MM-dd')
  });

  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
  const saldoRestante = valorLiquido - totalPago;

  // Função para verificar e atualizar o status do pagamento
  const verificarEAtualizarStatus = async (totalPagoAtual: number) => {
    try {
      console.log('🔄 Verificando status do pagamento:', {
        totalPagoAtual,
        valorLiquido,
        passageiroId,
        diferenca: Math.abs(totalPagoAtual - valorLiquido)
      });

      let novoStatus = "Pendente";
      
      // Determinar o novo status baseado no valor pago
      if (totalPagoAtual >= valorLiquido) {
        novoStatus = "Pago";
      } else if (totalPagoAtual > 0) {
        novoStatus = "Pendente";
      } else {
        novoStatus = "Pendente";
      }

      console.log('📝 Atualizando status para:', novoStatus);

      // Atualizar o status no banco de dados
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({ status_pagamento: novoStatus })
        .eq("id", passageiroId);

      if (error) {
        console.error('❌ Erro ao atualizar status:', error);
        throw error;
      }

      console.log('✅ Status atualizado com sucesso no banco de dados');

      // Mostrar notificação baseada no novo status
      if (novoStatus === "Pago") {
        toast.success("🎉 Pagamento completado! Status atualizado para 'Pago'");
      } else if (novoStatus === "Pendente" && totalPagoAtual > 0) {
        toast.info("💰 Pagamento parcial registrado - Status: Pendente");
      }

      // Notificar se o pagamento foi completado
      if (onPaymentComplete) {
        onPaymentComplete(novoStatus === "Pago");
      }

      // Chamar callback para atualizar a interface pai
      if (onStatusUpdate) {
        console.log('🔄 Chamando callback para atualizar interface');
        setTimeout(() => {
          onStatusUpdate();
        }, 500); // Pequeno delay para garantir que o banco foi atualizado
      } else {
        console.warn('⚠️ Callback onStatusUpdate não fornecido');
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status do pagamento");
    }
  };

  useEffect(() => {
    fetchParcelas();
  }, [passageiroId]);

  const fetchParcelas = async () => {
    if (!passageiroId) return;
    
    try {
      const { data, error } = await supabase
        .from("viagem_passageiros_parcelas")
        .select("*")
        .eq("viagem_passageiro_id", passageiroId)
        .order("numero_parcela");

      if (error) throw error;
      setParcelas(data || []);
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error);
      toast.error("Erro ao carregar parcelas");
    }
  };

  const adicionarParcela = async () => {
    if (novaParcela.valor_parcela <= 0) {
      toast.error("Valor da parcela deve ser maior que zero");
      return;
    }
    
    if (totalPago + novaParcela.valor_parcela > valorLiquido) {
      toast.error("O valor total das parcelas não pode exceder o valor líquido");
      return;
    }

    try {
      console.log('💰 Adicionando parcela:', {
        valor: novaParcela.valor_parcela,
        totalAtual: totalPago,
        valorLiquido,
        novoTotal: totalPago + novaParcela.valor_parcela
      });

      const { data, error } = await supabase
        .from("viagem_passageiros_parcelas")
        .insert({
          viagem_passageiro_id: passageiroId,
          valor_parcela: novaParcela.valor_parcela,
          forma_pagamento: novaParcela.forma_pagamento,
          observacoes: novaParcela.observacoes || null,
          data_pagamento: novaParcela.data_pagamento
        })
        .select()
        .single();

      if (error) throw error;

      const novasParcelas = [...parcelas, data];
      setParcelas(novasParcelas);
      
      // Calcular novo total pago
      const novoTotalPago = novasParcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
      
      console.log('📊 Novo total calculado:', {
        novoTotalPago,
        valorLiquido,
        statusDeveSer: novoTotalPago >= valorLiquido ? 'Pago' : 'Pendente'
      });
      
      // Verificar e atualizar status
      await verificarEAtualizarStatus(novoTotalPago);
      
      // Reset do formulário
      setNovaParcela({
        valor_parcela: 0,
        forma_pagamento: "Pix",
        observacoes: "",
        data_pagamento: format(new Date(), 'yyyy-MM-dd')
      });
      
      toast.success("Parcela adicionada com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao adicionar parcela:", error);
      toast.error("Erro ao adicionar parcela");
    }
  };

  // Marcar parcela como paga
  const marcarComoPago = async (parcela: Parcela) => {
    try {
      console.log('✅ Marcando parcela como paga:', parcela.id);

      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .update({
          data_pagamento: new Date().toISOString().split('T')[0],
          status: 'pago'
        })
        .eq("id", parcela.id);

      if (error) throw error;

      // Atualizar lista local
      await fetchParcelas();
      
      toast.success("Parcela marcada como paga!");
    } catch (error) {
      console.error("❌ Erro ao marcar parcela como paga:", error);
      toast.error("Erro ao marcar parcela como paga");
    }
  };

  // Marcar parcela como pendente (reverter pagamento)
  const marcarComoPendente = async (parcela: Parcela) => {
    try {
      console.log('⏳ Marcando parcela como pendente:', parcela.id);

      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .update({
          data_pagamento: null,
          status: 'pendente'
        })
        .eq("id", parcela.id);

      if (error) throw error;

      // Atualizar lista local
      await fetchParcelas();
      
      toast.success("Parcela marcada como pendente!");
    } catch (error) {
      console.error("❌ Erro ao marcar parcela como pendente:", error);
      toast.error("Erro ao marcar parcela como pendente");
    }
  };

  // Criar parcelamento automático
  const criarParcelamento = async (numParcelas: number, intervaloDias: number = 7) => {
    try {
      if (saldoRestante <= 0) {
        toast.error("Não há valor para parcelar");
        return;
      }

      const valorParcela = saldoRestante / numParcelas;
      const hoje = new Date();
      
      const novasParcelas = [];
      for (let i = 0; i < numParcelas; i++) {
        const dataVencimento = new Date(hoje);
        dataVencimento.setDate(hoje.getDate() + (i * intervaloDias));
        
        novasParcelas.push({
          viagem_passageiro_id: passageiroId,
          numero_parcela: parcelas.length + i + 1,
          total_parcelas: numParcelas,
          valor_parcela: Math.round(valorParcela * 100) / 100,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'pendente',
          tipo_parcelamento: numParcelas === 1 ? 'avista' : 'parcelado',
          forma_pagamento: 'Pix',
          data_pagamento: null
        });
      }

      // Inserir todas as parcelas
      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .insert(novasParcelas);

      if (error) throw error;

      // Recarregar parcelas
      await fetchParcelas();
      
      const tipoParcelamento = numParcelas === 1 ? 'à vista' : 
                              intervaloDias === 7 ? `${numParcelas}x semanais` :
                              `${numParcelas}x quinzenais`;
      
      toast.success(`Parcelamento ${tipoParcelamento} criado com sucesso!`);
      
    } catch (error) {
      console.error("❌ Erro ao criar parcelamento:", error);
      toast.error("Erro ao criar parcelamento");
    }
  };

  const removerParcela = async (parcelaId: string) => {
    try {
      console.log('🗑️ Removendo parcela:', parcelaId);

      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .delete()
        .eq("id", parcelaId);

      if (error) throw error;

      const novasParcelas = parcelas.filter(p => p.id !== parcelaId);
      setParcelas(novasParcelas);
      
      // Calcular novo total após remoção
      const novoTotalPago = novasParcelas.reduce((sum, p) => p.data_pagamento ? sum + p.valor_parcela : sum, 0);
      
      console.log('📊 Total após remoção:', {
        novoTotalPago,
        valorLiquido,
        statusDeveSer: novoTotalPago >= valorLiquido ? 'Pago' : 'Pendente'
      });
      
      // Verificar se o status precisa ser atualizado após remoção
      await verificarEAtualizarStatus(novoTotalPago);
      
      toast.success("Parcela removida com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao remover parcela:", error);
      toast.error("Erro ao remover parcela");
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Sistema de Parcelas
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Valor Líquido:</span>
            <p className="font-semibold text-blue-600">{formatCurrency(valorLiquido)}</p>
            {desconto > 0 && (
              <p className="text-xs text-gray-500">
                (Original: {formatCurrency(valorTotal)} - Desconto: {formatCurrency(desconto)})
              </p>
            )}
          </div>
          <div>
            <span className="text-gray-600">Valor Pago:</span>
            <p className="font-semibold text-green-600">{formatCurrency(totalPago)}</p>
            <p className="text-xs text-gray-500">
              {valorLiquido > 0 ? Math.round((totalPago / valorLiquido) * 100) : 0}% do total
            </p>
          </div>
          <div>
            <span className="text-gray-600">Saldo Restante:</span>
            <p className={`font-semibold ${
              Math.abs(saldoRestante) < 0.01 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {formatCurrency(saldoRestante)}
            </p>
            {Math.abs(saldoRestante) < 0.01 && (
              <p className="text-xs text-green-600 font-medium">✓ Pagamento Completo</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {parcelas.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Parcelas do Passageiro:</h4>
            {parcelas.map((parcela) => (
              <div key={parcela.id} className={`p-3 rounded-md border ${
                parcela.data_pagamento ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(parcela.valor_parcela)}</span>
                      <span className="text-xs text-gray-500">({parcela.forma_pagamento})</span>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        parcela.data_pagamento 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {parcela.data_pagamento ? '✅ Pago' : '⏳ Pendente'}
                      </div>
                    </div>
                    
                    {/* Mostrar data de vencimento */}
                    {parcela.data_vencimento && (
                      <p className="text-xs text-gray-600 mt-1">
                        Vencimento: {format(new Date(parcela.data_vencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    )}
                    
                    {/* Mostrar data de pagamento se pago */}
                    {parcela.data_pagamento && (
                      <p className="text-xs text-green-600 mt-1">
                        Pago em: {format(new Date(parcela.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    )}
                    
                    {parcela.observacoes && (
                      <p className="text-xs text-gray-600 mt-1">{parcela.observacoes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Botão para marcar como pago/pendente */}
                    {!parcela.data_pagamento ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => marcarComoPago(parcela)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        Marcar como Pago
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => marcarComoPendente(parcela)}
                        className="text-yellow-600 hover:text-yellow-700 text-xs"
                      >
                        Reverter
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerParcela(parcela.id!)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sistema de Parcelamento Inteligente */}
        {parcelas.length === 0 && saldoRestante > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-3">
              💡 Criar Parcelamento Automático
            </h4>
            <p className="text-xs text-blue-600 mb-3">
              Valor a parcelar: {formatCurrency(saldoRestante)}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(1)}
                className="text-xs"
              >
                À Vista
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(2)}
                className="text-xs"
              >
                2x Semanal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(3)}
                className="text-xs"
              >
                3x Semanal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(4)}
                className="text-xs"
              >
                4x Semanal
              </Button>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(2, 15)}
                className="text-xs"
              >
                2x Quinzenal
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => criarParcelamento(3, 15)}
                className="text-xs"
              >
                3x Quinzenal
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Valor da Parcela</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={novaParcela.valor_parcela || ""}
              onChange={(e) => setNovaParcela({
                ...novaParcela,
                valor_parcela: parseFloat(e.target.value) || 0
              })}
              className="mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Forma de Pagamento</label>
            <Select
              value={novaParcela.forma_pagamento}
              onValueChange={(value) => setNovaParcela({
                ...novaParcela,
                forma_pagamento: value
              })}
            >
              <SelectTrigger className="mt-1 bg-white text-gray-900 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                <SelectItem value="Pix" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Pix</SelectItem>
                <SelectItem value="Cartão" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Cartão</SelectItem>
                <SelectItem value="Dinheiro" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Dinheiro</SelectItem>
                <SelectItem value="Boleto" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Boleto</SelectItem>
                <SelectItem value="Outro" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Data do Pagamento</label>
            <Input
              type="date"
              value={novaParcela.data_pagamento}
              onChange={(e) => setNovaParcela({
                ...novaParcela,
                data_pagamento: e.target.value
              })}
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            onClick={adicionarParcela}
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            disabled={novaParcela.valor_parcela <= 0 || totalPago + novaParcela.valor_parcela > valorLiquido}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Parcela
          </Button>
          
          {saldoRestante > 0.01 && (
            <Button
              type="button"
              onClick={() => {
                setNovaParcela({
                  ...novaParcela,
                  valor_parcela: saldoRestante
                });
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Quitar Restante ({formatCurrency(saldoRestante)})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
