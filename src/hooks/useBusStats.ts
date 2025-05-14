
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export interface BusStats {
  mostUsedBus: {
    tipo: string;
    count: number;
  } | null;
  totalBuses: number;
  revenueByBusType: Record<string, number>;
  isLoading: boolean;
}

export function useBusStats() {
  const [stats, setStats] = useState<BusStats>({
    mostUsedBus: null,
    totalBuses: 0,
    revenueByBusType: {},
    isLoading: true
  });

  useEffect(() => {
    fetchBusStats();
  }, []);

  const fetchBusStats = async () => {
    try {
      // 1. Get count of distinct buses from the onibus table
      const { data: busesData, error: busesError } = await supabase
        .from("onibus")
        .select("id, tipo_onibus");
      
      if (busesError) throw busesError;
      
      // 2. Get most used bus type from viagens table
      const { data: viagensData, error: viagensError } = await supabase
        .from("viagens")
        .select("tipo_onibus");
        
      if (viagensError) throw viagensError;
      
      // Count buses by type in viagens
      const busTypeCount: Record<string, number> = {};
      
      viagensData?.forEach(viagem => {
        busTypeCount[viagem.tipo_onibus] = (busTypeCount[viagem.tipo_onibus] || 0) + 1;
      });
      
      // Find most used bus type
      let maxCount = 0;
      let mostUsedType = null;
      
      Object.entries(busTypeCount).forEach(([tipo, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsedType = tipo;
        }
      });

      // 3. Get revenue data by bus type
      const { data: revenueData, error: revenueError } = await supabase
        .from("viagem_passageiros")
        .select(`
          valor, 
          desconto,
          viagens!inner(tipo_onibus)
        `)
        .eq("status_pagamento", "Pago");
      
      if (revenueError) throw revenueError;
      
      // Calculate revenue by bus type
      const revenueByType: Record<string, number> = {};
      
      revenueData?.forEach(item => {
        // Fix the type issue by correctly accessing the tipo_onibus 
        // viagens is an object with the tipo_onibus property
        const viagensObj = item.viagens as any; // First cast to any
        const tipoOnibus = viagensObj ? viagensObj.tipo_onibus : null;
        
        if (tipoOnibus) {
          const valor = item.valor || 0;
          const desconto = item.desconto || 0;
          const revenue = valor - desconto;
          
          revenueByType[tipoOnibus] = (revenueByType[tipoOnibus] || 0) + revenue;
        }
      });
      
      setStats({
        mostUsedBus: mostUsedType ? { tipo: mostUsedType, count: busTypeCount[mostUsedType] } : null,
        totalBuses: busesData?.length || 0,
        revenueByBusType: revenueByType,
        isLoading: false
      });
      
    } catch (err) {
      console.error("Erro ao buscar estatísticas de ônibus:", err);
      toast({
        title: "Erro", 
        description: "Não foi possível carregar estatísticas dos ônibus",
        variant: "destructive"
      });
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return stats;
}
