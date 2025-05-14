
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
      
      // Count total unique buses
      const totalBuses = busesData?.length || 0;
      
      // 2. Get most used bus type by counting occurrences in viagem_onibus table
      const { data: viagemOnibusData, error: viagemOnibusError } = await supabase
        .from("viagem_onibus")
        .select("tipo_onibus, id");
        
      if (viagemOnibusError) throw viagemOnibusError;
      
      // Count buses by type
      const busTypeCount: Record<string, number> = {};
      
      if (viagemOnibusData) {
        viagemOnibusData.forEach(onibus => {
          if (onibus.tipo_onibus) {
            busTypeCount[onibus.tipo_onibus] = (busTypeCount[onibus.tipo_onibus] || 0) + 1;
          }
        });
      }
      
      // Find most used bus type
      let maxCount = 0;
      let mostUsedType = null;
      
      Object.entries(busTypeCount).forEach(([tipo, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostUsedType = tipo;
        }
      });
      
      // 3. Get revenue data by bus type from viagem_passageiros joined with viagem_onibus
      const { data: revenueData, error: revenueError } = await supabase
        .from("viagem_passageiros")
        .select(`
          valor, 
          desconto,
          onibus_id
        `)
        .eq("status_pagamento", "Pago");
      
      if (revenueError) throw revenueError;
      
      // Get all onibus to map IDs to types
      const { data: allOnibus, error: allOnibusError } = await supabase
        .from("viagem_onibus")
        .select("id, tipo_onibus");
        
      if (allOnibusError) throw allOnibusError;
      
      // Create map of onibus_id to tipo_onibus
      const onibusTypeMap: Record<string, string> = {};
      if (allOnibus) {
        allOnibus.forEach(onibus => {
          if (onibus.id) {
            onibusTypeMap[onibus.id] = onibus.tipo_onibus;
          }
        });
      }
      
      // Calculate revenue by bus type
      const revenueByType: Record<string, number> = {};
      
      if (revenueData) {
        revenueData.forEach(item => {
          if (item.onibus_id && onibusTypeMap[item.onibus_id]) {
            const tipoOnibus = onibusTypeMap[item.onibus_id];
            const valor = item.valor || 0;
            const desconto = item.desconto || 0;
            const revenue = valor - desconto;
            
            revenueByType[tipoOnibus] = (revenueByType[tipoOnibus] || 0) + revenue;
          }
        });
      }
      
      setStats({
        mostUsedBus: mostUsedType ? { tipo: mostUsedType, count: busTypeCount[mostUsedType] } : null,
        totalBuses: totalBuses,
        revenueByBusType: revenueByType,
        isLoading: false
      });
      
    } catch (err) {
      console.error("Erro ao buscar estatísticas de ônibus:", err);
      toast("Erro: Não foi possível carregar estatísticas dos ônibus");
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  return stats;
}
