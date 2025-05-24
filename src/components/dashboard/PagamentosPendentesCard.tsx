
import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export const PagamentosPendentesCard = () => {
  const [totalPendente, setTotalPendente] = useState<number>(0);
  const [countPendente, setCountPendente] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendentes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select('valor, desconto')
        .eq('status_pagamento', 'Pendente');
      if (!error && data) {
        setCountPendente(data.length);
        const total = data.reduce((sum, item) => sum + ((item.valor || 0) - (item.desconto || 0)), 0);
        setTotalPendente(total);
      }
      setLoading(false);
    };
    fetchPendentes();
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-professional border border-gray-100 hover:shadow-professional-md transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 flex items-center rounded-t-xl mb-4">
        <AlertCircle className="text-white mr-2" />
        <h3 className="text-lg font-semibold tracking-wide drop-shadow-sm m-0 text-white">Pagamentos Pendentes</h3>
      </div>
      <CardContent className="pt-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-gray-900">{loading ? '...' : countPendente}</span>
        <span className="text-sm text-gray-600 mt-2">pendentes</span>
        <span className="text-lg font-semibold text-orange-600 mt-2">{loading ? '...' : formatCurrency(totalPendente)}</span>
        <span className="text-xs text-gray-500">Valor total</span>
      </CardContent>
    </Card>
  );
}; 
