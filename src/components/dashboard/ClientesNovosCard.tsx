import React, { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const ClientesNovosCard = () => {
  const [novosClientes, setNovosClientes] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNovosClientes = async () => {
      setLoading(true);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
      const { count, error } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', firstDay)
        .lte('created_at', lastDay);
      if (!error) setNovosClientes(count || 0);
      setLoading(false);
    };
    fetchNovosClientes();
  }, []);

  return (
    <Card className="roman-card overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all max-w-xs p-6">
      <div className="bg-gradient-to-r from-red-600 via-red-800 to-black p-4 flex items-center rounded-t-xl mb-4">
        <UserPlus className="text-white mr-2" />
        <h3 className="text-lg font-cinzel tracking-wide drop-shadow-sm m-0 text-white">Clientes Novos</h3>
      </div>
      <CardContent className="pt-6 flex flex-col items-center">
        <span className="text-4xl font-bold text-rome-navy">{loading ? '...' : novosClientes}</span>
        <span className="text-sm text-muted-foreground mt-2">Cadastrados este mês</span>
      </CardContent>
    </Card>
  );
}; 