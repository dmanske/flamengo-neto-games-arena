
import React, { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const RankingAdversariosCard = () => {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      // Busca todas as viagens
      const { data: viagens, error } = await supabase
        .from('viagens')
        .select('id, adversario');
      if (!error && viagens) {
        // Para cada viagem, conta passageiros pagos
        const adversarioMap: Record<string, number> = {};
        for (const v of viagens) {
          const { count } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', v.id)
            .eq('status_pagamento', 'Pago');
          adversarioMap[v.adversario] = (adversarioMap[v.adversario] || 0) + (count || 0);
        }
        // Ordena e pega top 3
        const rankingArr = Object.entries(adversarioMap)
          .map(([adversario, total]) => ({ adversario, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 3);
        setRanking(rankingArr);
      }
      setLoading(false);
    };
    fetchRanking();
  }, []);

  return (
    <Card className="bg-white rounded-xl shadow-professional border border-gray-100 hover:shadow-professional-md transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center rounded-t-xl mb-4">
        <Trophy className="text-white mr-2" />
        <h3 className="text-lg font-semibold tracking-wide drop-shadow-sm m-0 text-white">Ranking Adversários</h3>
      </div>
      <CardContent className="pt-6 flex flex-col items-center">
        {loading ? (
          <span className="text-2xl font-bold text-gray-900">...</span>
        ) : ranking.length > 0 ? (
          <ol className="w-full">
            {ranking.map((item, idx) => (
              <li key={item.adversario} className="flex justify-between text-lg font-medium mb-1">
                <span className="text-gray-700">{idx + 1}º {item.adversario}</span>
                <span className="text-gray-900 font-bold">{item.total}</span>
              </li>
            ))}
          </ol>
        ) : (
          <span className="text-sm text-gray-600">Sem dados suficientes</span>
        )}
      </CardContent>
    </Card>
  );
}; 
