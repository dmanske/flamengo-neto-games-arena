import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

function getInitials(nome: string) {
  return nome
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const TopClientesCard = () => {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopClientes = async () => {
      setLoading(true);
      // Busca todos os passageiros com cliente_id
      const { data: passageiros, error } = await supabase
        .from('viagem_passageiros')
        .select('cliente_id');
      if (!error && passageiros) {
        // Conta quantas vezes cada cliente aparece
        const countMap: Record<string, number> = {};
        passageiros.forEach(p => {
          if (p.cliente_id) {
            countMap[p.cliente_id] = (countMap[p.cliente_id] || 0) + 1;
          }
        });
        // Ordena e pega os 4 maiores
        const topIds = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([id]) => id);
        // Busca nomes dos clientes
        if (topIds.length > 0) {
          const { data: clientesData } = await supabase
            .from('clientes')
            .select('id, nome')
            .in('id', topIds);
          // Junta nome e quantidade
          const topClientes = topIds.map(id => {
            const cliente = clientesData.find((c: any) => c.id === id);
            return {
              id,
              nome: cliente ? cliente.nome : 'Desconhecido',
              viagens: countMap[id]
            };
          });
          setClientes(topClientes);
        } else {
          setClientes([]);
        }
      }
      setLoading(false);
    };
    fetchTopClientes();
  }, []);

  return (
    <Card className="roman-card overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-red-600 via-red-800 to-black p-4 flex items-center rounded-t-xl mb-4">
        <User className="text-white mr-2" />
        <h3 className="text-lg font-cinzel tracking-wide drop-shadow-sm m-0 text-white">Top Clientes</h3>
      </div>
      <CardContent className="pt-6 flex flex-col items-center">
        {loading ? (
          <span className="text-2xl font-bold text-rome-navy">...</span>
        ) : clientes.length > 0 ? (
          <ol className="w-full space-y-3">
            {clientes.map((item, idx) => (
              <li
                key={item.id}
                className={`flex items-center justify-between px-2 py-2 rounded-lg ${idx === 0 ? 'bg-red-100/80 border-l-4 border-red-600 shadow' : 'bg-gray-50'} mb-1`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold text-lg ${idx === 0 ? 'bg-red-600 text-white' : 'bg-gray-200 text-rome-navy'}`}>{getInitials(item.nome)}</div>
                  <div>
                    <span className={`font-cinzel text-base ${idx === 0 ? 'font-bold text-red-700' : 'text-rome-navy'}`}>{idx + 1}º {item.nome}</span>
                  </div>
                </div>
                <span className={`font-bold text-lg ${idx === 0 ? 'text-red-700' : 'text-rome-navy'}`}>{item.viagens}</span>
              </li>
            ))}
          </ol>
        ) : (
          <span className="text-sm text-muted-foreground">Sem dados suficientes</span>
        )}
      </CardContent>
    </Card>
  );
}; 