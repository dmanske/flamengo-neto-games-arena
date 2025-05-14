import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const ClientesPorMesChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('created_at');
      if (!error && clientes) {
        // Agrupa por mês
        const meses: Record<string, number> = {};
        clientes.forEach(c => {
          const date = new Date(c.created_at);
          const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
          meses[key] = (meses[key] || 0) + 1;
        });
        const arr = Object.entries(meses).map(([mes, total]) => ({ mes, total }));
        arr.sort((a, b) => a.mes.localeCompare(b.mes));
        setData(arr);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h4 className="font-cinzel text-lg mb-2">Novos Clientes por Mês</h4>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#e40016" strokeWidth={3} dot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}; 