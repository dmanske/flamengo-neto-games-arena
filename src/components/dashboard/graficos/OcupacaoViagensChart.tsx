import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const OcupacaoViagensChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Busca viagens recentes
      const { data: viagens, error } = await supabase
        .from('viagens')
        .select('id, adversario, capacidade_onibus, data_jogo')
        .order('data_jogo', { ascending: false })
        .limit(8);

      if (!error && viagens) {
        const results = [];
        // Para cada viagem, busca quantidade de passageiros
        for (const viagem of viagens) {
          const { count } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', viagem.id);
          
          const ocupacao = count || 0;
          const capacidade = viagem.capacidade_onibus || 1;
          const percentual = Math.round((ocupacao / capacidade) * 100);
          
          // Formata a data
          const dataJogo = new Date(viagem.data_jogo);
          const dataFormatada = format(dataJogo, "dd/MM", { locale: ptBR });
          
          results.push({
            id: viagem.id,
            nome: `${viagem.adversario} (${dataFormatada})`,
            percentual,
            ocupacao,
            capacidade
          });
        }
        
        setData(results.reverse()); // Inverte para ordem cronológica
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h4 className="font-cinzel text-lg mb-2">Ocupação das Viagens (%)</h4>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" tickMargin={5} angle={-15} textAnchor="end" height={60} />
            <YAxis domain={[0, 100]} unit="%" />
            <Tooltip 
              formatter={(value: any, name: any, props: any) => [
                `${value}% (${props.payload.ocupacao}/${props.payload.capacidade})`, 'Ocupação'
              ]}
            />
            <Bar dataKey="percentual" maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.percentual > 80 ? '#e40016' : entry.percentual > 50 ? '#ffa500' : '#82ca9d'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 