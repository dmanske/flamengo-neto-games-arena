
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

interface ParcelasEditManagerProps {
  passageiroId: string;
  valorTotal: number;
  desconto: number;
}

export function ParcelasEditManager({ passageiroId, valorTotal, desconto }: ParcelasEditManagerProps) {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [novaParcela, setNovaParcela] = useState({
    valor_parcela: 0,
    forma_pagamento: "Pix",
    observacoes: ""
  });

  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
  const saldoRestante = valorLiquido - totalPago;

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
      const { data, error } = await supabase
        .from("viagem_passageiros_parcelas")
        .insert({
          viagem_passageiro_id: passageiroId,
          valor_parcela: novaParcela.valor_parcela,
          forma_pagamento: novaParcela.forma_pagamento,
          observacoes: novaParcela.observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      setParcelas([...parcelas, data]);
      setNovaParcela({
        valor_parcela: 0,
        forma_pagamento: "Pix",
        observacoes: ""
      });
      
      toast.success("Parcela adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar parcela:", error);
      toast.error("Erro ao adicionar parcela");
    }
  };

  const removerParcela = async (parcelaId: string) => {
    try {
      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .delete()
        .eq("id", parcelaId);

      if (error) throw error;

      setParcelas(parcelas.filter(p => p.id !== parcelaId));
      toast.success("Parcela removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover parcela:", error);
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
            <span className="text-gray-600">Valor Total:</span>
            <p className="font-semibold text-blue-600">{formatCurrency(valorTotal)}</p>
          </div>
          <div>
            <span className="text-gray-600">Valor Pago:</span>
            <p className="font-semibold text-green-600">{formatCurrency(totalPago)}</p>
          </div>
          <div>
            <span className="text-gray-600">Saldo Restante:</span>
            <p className="font-semibold text-orange-600">{formatCurrency(saldoRestante)}</p>
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
                      {new Date(parcela.data_pagamento).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerParcela(parcela.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {saldoRestante > 0 && (
          <>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Nova Parcela:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Observações</label>
                  <Input
                    placeholder="Observações (opcional)"
                    value={novaParcela.observacoes || ""}
                    onChange={(e) => setNovaParcela({
                      ...novaParcela,
                      observacoes: e.target.value
                    })}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={adicionarParcela}
                className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                disabled={novaParcela.valor_parcela <= 0 || totalPago + novaParcela.valor_parcela > valorLiquido}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Parcela
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
