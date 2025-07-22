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
        .order("created_at");

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
      const novoTotalPago = novasParcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
      
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
            <h4 className="text-sm font-medium text-gray-700">Parcelas Pagas:</h4>
            {parcelas.map((parcela) => (
              <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="text-sm font-medium">{formatCurrency(parcela.valor_parcela)}</span>
                  <span className="text-xs text-gray-500 ml-2">({parcela.forma_pagamento})</span>
                  {parcela.observacoes && (
                    <p className="text-xs text-gray-600 mt-1">{parcela.observacoes}</p>
                  )}
                  {parcela.data_pagamento && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(parcela.data_pagamento), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  )}
                </div>
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
            ))}
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
