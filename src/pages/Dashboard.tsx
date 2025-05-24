import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBusStats } from "@/hooks/useBusStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStatsGrid } from "@/components/dashboard/DashboardStatsGrid";
import { ProximasViagensCard } from "@/components/dashboard/ProximasViagensCard";
import { UltimosPaymentsCard } from "@/components/dashboard/UltimosPagamentosCard";
import { DashboardImageSection } from "@/components/dashboard/DashboardImageSection";
import { ClientesNovosCard } from "@/components/dashboard/ClientesNovosCard";
import { PagamentosPendentesCard } from "@/components/dashboard/PagamentosPendentesCard";
import { ViagemMaisLotadaCard } from "@/components/dashboard/ViagemMaisLotadaCard";
import { RankingAdversariosCard } from "@/components/dashboard/RankingAdversariosCard";
import { DashboardChartsGrid } from "@/components/dashboard/DashboardChartsGrid";
import { TopClientesCard } from "@/components/dashboard/TopClientesCard";
import { SetoresEstadioMaisEscolhidosChart } from "@/components/dashboard/graficos/SetoresEstadioMaisEscolhidosChart";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
  logo_adversario: string | null;
  logo_flamengo: string | null;
}

const Dashboard = () => {
  const [clientCount, setClientCount] = useState<number>(0);
  const [viagemCount, setViagemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flamengoLogo, setFlamengoLogo] = useState<string>("https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png");
  const [proximasViagens, setProximasViagens] = useState<Viagem[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  
  // Use the BusStats hook to get bus data
  const { stats: busStats } = useBusStats();
  
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setIsLoading(true);
        
        // Fetch client count
        const { count: clientsCount, error: clientError } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true });
        
        if (clientError) {
          console.error('Erro ao buscar contagem de clientes:', clientError);
        } else {
          setClientCount(clientsCount || 0);
        }
        
        // Fetch trips count
        const { count: tripCount, error: tripError } = await supabase
          .from('viagens')
          .select('*', { count: 'exact', head: true });
        
        if (tripError) {
          console.error('Erro ao buscar contagem de viagens:', tripError);
        } else {
          setViagemCount(tripCount || 0);
        }
        
        // Fetch upcoming trips
        const today = new Date().toISOString();
        const { data: upcomingTrips, error: upcomingError } = await supabase
          .from('viagens')
          .select('*')
          .gte('data_jogo', today)
          .order('data_jogo', { ascending: true })
          .limit(3);
        
        if (!upcomingError && upcomingTrips) {
          setProximasViagens(upcomingTrips);
        } else {
          console.error('Erro ao buscar próximas viagens:', upcomingError);
        }
        
        // Fetch Flamengo logo from system_config
        const { data: logoData, error: logoError } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'flamengo_logo')
          .single();
        
        if (!logoError && logoData && logoData.value) {
          setFlamengoLogo(logoData.value);
        } else {
          console.error('Erro ao buscar logo do Flamengo:', logoError);
        }
        
        // Fetch current month's revenue
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
        
        const { data: revenueData, error: revenueError } = await supabase
          .from('viagem_passageiros')
          .select('valor, desconto')
          .gte('created_at', firstDayOfMonth)
          .lte('created_at', lastDayOfMonth)
          .eq('status_pagamento', 'Pago');
        
        if (!revenueError && revenueData) {
          const totalRevenue = revenueData.reduce((sum, item) => {
            const valor = item.valor || 0;
            const desconto = item.desconto || 0;
            return sum + (valor - desconto);
          }, 0);
          
          setMonthlyRevenue(totalRevenue);
        } else {
          console.error('Erro ao buscar dados de receita:', revenueError);
        }
        
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCounts();
  }, []);

  return (
    <div className="container py-6">
      {/* Dashboard Header */}
      <DashboardHeader />
      
      {/* Stats Grid */}
      <DashboardStatsGrid
        isLoading={isLoading}
        clientCount={clientCount}
        viagemCount={viagemCount}
        monthlyRevenue={monthlyRevenue}
        busStats={busStats}
      />
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-0 mb-6">
        <ProximasViagensCard 
          isLoading={isLoading} 
          proximasViagens={proximasViagens} 
        />
        <SetoresEstadioMaisEscolhidosChart />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <ClientesNovosCard />
        <PagamentosPendentesCard />
        <ViagemMaisLotadaCard />
        <RankingAdversariosCard />
        <TopClientesCard />
      </div>
      
      {/* Charts Grid */}
      <DashboardChartsGrid />
      
      {/* Image Section */}
      <DashboardImageSection imageUrl="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRULonro80DLVex706fDQXv1GEjjAhog4ON_g&s" />
    </div>
  );
};

export default Dashboard;
