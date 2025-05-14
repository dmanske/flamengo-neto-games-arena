
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
        
        // Buscar contagem de passageiros para cada viagem
        const { data, error } = await supabase
          .from('viagem_passageiros')
          .select('viagem_id, count')
          .in('viagem_id', viagemIds)
          .group('viagem_id');
          
        if (error) throw error;
        
        const countsMap: Record<string, number> = {};
        
        if (data) {
          data.forEach(item => {
            countsMap[item.viagem_id] = parseInt(item.count);
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
