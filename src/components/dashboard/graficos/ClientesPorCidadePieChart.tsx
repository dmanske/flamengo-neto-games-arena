import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Text } from "recharts";

const COLORS = ["#e40016", "#ff7300", "#ffd700", "#0088fe", "#00c49f", "#ffbb28", "#ff8042", "#a020f0", "#8884d8", "#82ca9d"];

// Função para padronizar nomes das cidades
function normalizeCityName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Label customizado para evitar sobreposição
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index % COLORS.length]}
      fontSize={14}
      fontWeight="bold"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      style={{ textShadow: "1px 1px 2px #fff" }}
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

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
          const nomePadronizado = normalizeCityName(c.cidade);
          cidades[nomePadronizado] = (cidades[nomePadronizado] || 0) + 1;
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
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="cidade"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => `${value} clientes`} />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 15, marginTop: 16 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 