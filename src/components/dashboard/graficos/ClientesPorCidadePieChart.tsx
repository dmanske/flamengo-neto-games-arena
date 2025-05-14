import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#e40016", "#ff7300", "#ffd700", "#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#a020f0", "#8884d8", "#82ca9d"];

export const ClientesPorCidadePieChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('cidade');
      if (!error && clientes) {
        const cidades: Record<string, number> = {};
        clientes.forEach(c => {
          if (!c.cidade) return;
          cidades[c.cidade] = (cidades[c.cidade] || 0) + 1;
        });
        // Pega as 6 maiores cidades, o resto agrupa em "Outros"
        const cidadesArr = Object.entries(cidades)
          .map(([cidade, total]) => ({ cidade, total }))
          .sort((a, b) => b.total - a.total);
        const top = cidadesArr.slice(0, 6);
        const outrosTotal = cidadesArr.slice(6).reduce((sum, c) => sum + c.total, 0);
        if (outrosTotal > 0) top.push({ cidade: "Outros", total: outrosTotal });
        setData(top);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h4 className="font-cinzel text-lg mb-2">Clientes por Cidade</h4>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="cidade"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value} clientes`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 