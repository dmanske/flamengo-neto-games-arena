
import React, { useState } from "react";
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
import { Parcela } from "./types";

interface ParcelasManagerProps {
  valorTotal: number;
  desconto: number;
  parcelas: Parcela[];
  setParcelas: (parcelas: Parcela[]) => void;
}

export function ParcelasManager({ valorTotal, desconto, parcelas, setParcelas }: ParcelasManagerProps) {
  const [novaParcela, setNovaParcela] = useState<Omit<Parcela, 'id'>>({
    valor_parcela: 0,
    forma_pagamento: "Pix",
    observacoes: ""
  });

  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
  const saldoRestante = valorLiquido - totalPago;

  const adicionarParcela = () => {
    if (novaParcela.valor_parcela <= 0) {
      toast.error("Valor da parcela deve ser maior que zero");
      return;
    }
    
    if (totalPago + novaParcela.valor_parcela > valorLiquido) {
      toast.error("O valor total das parcelas não pode exceder o valor líquido");
      return;
    }
    
    setParcelas([...parcelas, { ...novaParcela }]);
    setNovaParcela({
      valor_parcela: 0,
      forma_pagamento: "Pix",
      observacoes: ""
    });
  };

  const removerParcela = (index: number) => {
    const novasParcelas = parcelas.filter((_, i) => i !== index);
    setParcelas(novasParcelas);
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
            <h4 className="text-sm font-medium text-gray-700">Parcelas Adicionadas:</h4>
            {parcelas.map((parcela, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <span className="text-sm font-medium">{formatCurrency(parcela.valor_parcela)}</span>
                  <span className="text-xs text-gray-500 ml-2">({parcela.forma_pagamento})</span>
                  {parcela.observacoes && (
                    <p className="text-xs text-gray-600 mt-1">{parcela.observacoes}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerParcela(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

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
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          disabled={novaParcela.valor_parcela <= 0 || totalPago + novaParcela.valor_parcela > valorLiquido}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Parcela
        </Button>
      </CardContent>
    </Card>
  );
}
