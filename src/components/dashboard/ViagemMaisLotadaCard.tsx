import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const ViagemMaisLotadaCard = () => {
  const [viagem, setViagem] = useState<any>(null);
  const [percentual, setPercentual] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViagemMaisLotada = async () => {
      setLoading(true);
      // Busca todas as viagens e passageiros
      const { data: viagens, error } = await supabase
        .from('viagens')
        .select('id, adversario, capacidade_onibus, data_jogo, rota');
      if (!error && viagens) {
        let maior = null;
        let maiorPercentual = 0;
        for (const v of viagens) {
          const { count } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', v.id)
            .eq('status_pagamento', 'Pago');
          const ocupacao = count || 0;
          const capacidade = v.capacidade_onibus || 1;
          const perc = Math.round((ocupacao / capacidade) * 100);
          if (perc > maiorPercentual) {
            maior = v;
            maiorPercentual = perc;
          }
        }
        setViagem(maior);
        setPercentual(maiorPercentual);
      }
      setLoading(false);
    };
    fetchViagemMaisLotada();
  }, []);

  return (
    <Card className="roman-card overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-red-600 via-red-800 to-black p-4 flex items-center rounded-t-xl mb-4">
        <TrendingUp className="text-white mr-2" />
        <h3 className="text-lg font-cinzel tracking-wide drop-shadow-sm m-0 text-white">Viagem Mais Lotada</h3>
      </div>
      <CardContent className="pt-6 flex flex-col items-center">
        {loading ? (
          <span className="text-2xl font-bold text-rome-navy">...</span>
        ) : viagem ? (
          <>
            <span className="text-2xl font-bold text-rome-navy">{viagem.adversario}</span>
            <span className="text-sm text-muted-foreground mb-2">{viagem.rota}</span>
            <span className="text-lg font-semibold text-green-700">{percentual}%</span>
            <span className="text-xs text-muted-foreground">Ocupação</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Nenhuma viagem encontrada</span>
        )}
      </CardContent>
    </Card>
  );
}; 