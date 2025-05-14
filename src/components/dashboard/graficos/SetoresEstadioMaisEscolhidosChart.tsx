import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#e40016", "#ff7300", "#ffd700", "#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#a020f0", "#8884d8", "#82ca9d"];

export const SetoresEstadioMaisEscolhidosChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Busca todos os setores dos passageiros
      const { data: passageiros, error } = await supabase
        .from('viagem_passageiros')
        .select('setor_maracana');
      if (!error && passageiros) {
        const setores: Record<string, number> = {};
        passageiros.forEach(p => {
          const setor = p.setor_maracana || 'Não informado';
          setores[setor] = (setores[setor] || 0) + 1;
        });
        // Ordena e pega os 8 mais escolhidos
        const setoresArr = Object.entries(setores)
          .map(([setor, total]) => ({ setor, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 8);
        setData(setoresArr);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h4 className="font-cinzel text-lg mb-2">Setores do Estádio Mais Escolhidos</h4>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 50, left: 50, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="setor" type="category" width={120} />
            <Tooltip formatter={(value: any) => `${value} clientes`} />
            <Bar dataKey="total" barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 