import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

export const ReceitaPorAdversarioChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Busca todas as viagens
      const { data: viagens, error: viagensError } = await supabase
        .from('viagens')
        .select('id, adversario');
      
      if (!viagensError && viagens) {
        const receitas = [];
        
        for (const viagem of viagens) {
          // Busca passageiros com pagamento confirmado para cada viagem
          const { data: passageiros, error: passageirosError } = await supabase
            .from('viagem_passageiros')
            .select('valor, desconto')
            .eq('viagem_id', viagem.id)
            .eq('status_pagamento', 'Pago');
          
          if (!passageirosError && passageiros && passageiros.length > 0) {
            // Calcula a receita total da viagem (valor - desconto)
            const receita = passageiros.reduce((total, p) => {
              return total + ((p.valor || 0) - (p.desconto || 0));
            }, 0);
            
            receitas.push({
              adversario: viagem.adversario,
              receita
            });
          }
        }
        
        // Agrupa por adversário (soma valores de múltiplas viagens contra o mesmo adversário)
        const adversarioMap: Record<string, number> = {};
        receitas.forEach(item => {
          adversarioMap[item.adversario] = (adversarioMap[item.adversario] || 0) + item.receita;
        });
        
        // Converte para array e ordena por receita (maior para menor)
        const result = Object.entries(adversarioMap)
          .map(([adversario, receita]) => ({ adversario, receita }))
          .sort((a, b) => b.receita - a.receita)
          .slice(0, 8); // Limita aos 8 maiores
        
        setData(result);
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h4 className="font-cinzel text-lg mb-2">Receita por Adversário</h4>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 50, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
            <YAxis dataKey="adversario" type="category" width={100} />
            <Tooltip formatter={(value: any) => formatCurrency(value)} />
            <Bar dataKey="receita" fill="#e40016" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 