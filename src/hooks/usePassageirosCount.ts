
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export function usePassageirosCount(viagemIds: string[]) {
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassageirosCount = async () => {
      if (!viagemIds.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar e contar passageiros para cada viagem
        const { data, error } = await supabase
          .from('viagem_passageiros')
          .select('viagem_id')
          .in('viagem_id', viagemIds);
          
        if (error) throw error;
        
        // Contar manualmente os passageiros por viagem_id
        const countsMap: Record<string, number> = {};
        
        if (data) {
          data.forEach(item => {
            if (countsMap[item.viagem_id]) {
              countsMap[item.viagem_id]++;
            } else {
              countsMap[item.viagem_id] = 1;
            }
          });
        }
        
        // Garantir que todas as viagens tenham uma contagem, mesmo que zero
        viagemIds.forEach(id => {
          if (!countsMap[id]) {
            countsMap[id] = 0;
          }
        });
        
        setPassageirosCount(countsMap);
      } catch (error) {
        console.error("Erro ao buscar contagem de passageiros:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar a contagem de passageiros"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPassageirosCount();
  }, [viagemIds]);

  return { passageirosCount, loading };
}
