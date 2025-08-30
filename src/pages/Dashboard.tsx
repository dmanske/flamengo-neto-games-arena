import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useBusStats } from "@/hooks/useBusStats";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ModernStatCard } from "@/components/ui/modern-stat-card";
import { ModernCard } from "@/components/ui/modern-card";
import { ProximasViagensCard } from "@/components/dashboard/ProximasViagensCard";
import { UltimosPaymentsCard } from "@/components/dashboard/UltimosPagamentosCard";
import { ClientesNovosCard } from "@/components/dashboard/ClientesNovosCard";
import { PagamentosPendentesCard } from "@/components/dashboard/PagamentosPendentesCard";
import { ViagemMaisLotadaCard } from "@/components/dashboard/ViagemMaisLotadaCard";
import { RankingAdversariosCard } from "@/components/dashboard/RankingAdversariosCard";
import { DashboardChartsGrid } from "@/components/dashboard/DashboardChartsGrid";
import { DashboardPerformanceSummary } from "@/components/dashboard/DashboardPerformanceSummary";
import { RecentActivitiesCard } from "@/components/dashboard/RecentActivitiesCard";
import { ReceitasBreakdownCard } from "@/components/dashboard/ReceitasBreakdownCard";
import { SetoresEstadioMaisEscolhidosChart } from "@/components/dashboard/graficos/SetoresEstadioMaisEscolhidosChart";
import { Users, Calendar, DollarSign, Bus, TrendingUp, Activity, BarChart3, Clock, Zap, Calculator } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useFinanceiroGeral } from '@/hooks/useFinanceiroGeral';
import { OcupacaoViagensChart } from "@/components/dashboard/graficos/OcupacaoViagensChart";
import { ClientesPorCidadePieChart } from "@/components/dashboard/graficos/ClientesPorCidadePieChart";
import { ClientesPorMesChart } from "@/components/dashboard/graficos/ClientesPorMesChart";

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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [filteredData, setFilteredData] = useState({
    clientesCount: 0,
    viagensCount: 0,
    totalReceita: 0
  });
  
  // Hook para dados financeiros gerais
  const [filtroFinanceiro] = useState(() => {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    return {
      inicio: inicioMes.toISOString().split('T')[0],
      fim: hoje.toISOString().split('T')[0]
    };
  });
  
  // Use the BusStats hook to get bus data
  const { stats: busStats } = useBusStats();
  
  // Hook para dados financeiros com breakdown
  const { resumoGeral, isLoading: isLoadingFinanceiro } = useFinanceiroGeral(filtroFinanceiro);
  
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
        
        // Fetch Flamengo logo from system_config (opcional)
        try {
          const { data: logoData, error: logoError } = await supabase
            .from('system_config')
            .select('value')
            .eq('key', 'flamengo_logo')
            .maybeSingle(); // Use maybeSingle() instead of single() to handle no results
          
          if (!logoError && logoData && logoData.value) {
            setFlamengoLogo(logoData.value);
          }
          // Silently use default logo if not found in database
        } catch (error) {
          // Silently use default logo if there's any error
          console.debug('Logo do Flamengo não encontrado na configuração, usando padrão');
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

  // Função para lidar com mudanças nos filtros
  const handleFiltersChange = async (filters: any) => {
    try {
      setIsLoading(true);
      
      // Aqui você pode implementar a lógica para aplicar os filtros
      // Por enquanto, vamos manter os dados originais
      const { startDate, endDate } = getDateRange(filters.dateRange);
      
      // Buscar dados filtrados
      let clientesQuery = supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true });
      
      if (startDate && endDate) {
        clientesQuery = clientesQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.cidade) {
        clientesQuery = clientesQuery.eq('cidade', filters.cidade);
      }

      let viagensQuery = supabase
        .from('viagens')
        .select('*', { count: 'exact', head: true });
      
      if (startDate && endDate) {
        viagensQuery = viagensQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.adversario) {
        viagensQuery = viagensQuery.eq('adversario', filters.adversario);
      }

      let receitaQuery = supabase
        .from('viagem_passageiros')
        .select('valor, desconto');
      
      if (startDate && endDate) {
        receitaQuery = receitaQuery.gte('created_at', startDate).lte('created_at', endDate);
      }
      if (filters.statusPagamento) {
        receitaQuery = receitaQuery.eq('status_pagamento', filters.statusPagamento);
      } else {
        receitaQuery = receitaQuery.eq('status_pagamento', 'Pago');
      }

      const [
        { count: clientesCount },
        { count: viagensCount },
        { data: receitaData }
      ] = await Promise.all([
        clientesQuery,
        viagensQuery,
        receitaQuery
      ]);

      const totalReceita = receitaData?.reduce((sum, item) => {
        const valor = item.valor || 0;
        const desconto = item.desconto || 0;
        return sum + (valor - desconto);
      }, 0) || 0;

      setFilteredData({
        clientesCount: clientesCount || 0,
        viagensCount: viagensCount || 0,
        totalReceita
      });

    } catch (error) {
      console.error('Erro ao aplicar filtros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = (range: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (range) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };

  // Função para renderizar o conteúdo do card com skeleton loading
  const renderCardContent = (isLoading: boolean, content: React.ReactNode) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      );
    }
    return content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container py-6 px-4 sm:px-6">
        {/* Modern Dashboard Header */}
        <DashboardHeader onFiltersChange={handleFiltersChange} />
        
        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-white shadow-sm border border-gray-100">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Activity className="w-4 h-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <BarChart3 className="w-4 h-4 mr-2" />
                Análises
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                <Clock className="w-4 h-4 mr-2" />
                Próximas Viagens
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-0">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ModernStatCard
                icon={Users}
                value={isLoading ? "..." : (filteredData.clientesCount || clientCount).toLocaleString()}
                label="Total de Clientes"
                change={{ value: 12, type: 'increase' }}
                gradient="from-blue-600 to-blue-800"
                className="group"
              />
              
              <ModernStatCard
                icon={Calendar}
                value={isLoading ? "..." : (filteredData.viagensCount || viagemCount).toLocaleString()}
                label="Viagens Cadastradas"
                change={{ value: 8, type: 'increase' }}
                gradient="from-indigo-600 to-violet-700"
                className="group"
              />
              
              <ModernStatCard
                icon={DollarSign}
                value={isLoading ? "..." : `R$ ${(filteredData.totalReceita || monthlyRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                label="Receita Mensal"
                change={{ value: 15, type: 'increase' }}
                gradient="from-emerald-600 to-green-700"
                className="group"
              />
              
              <ModernStatCard
                icon={Bus}
                value={isLoading ? "..." : (busStats?.totalBuses || 0).toString()}
                label="Ônibus Disponíveis"
                change={{ value: 5, type: 'increase' }}
                gradient="from-amber-500 to-orange-600"
                className="group"
              />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="shadow-md border-0 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
                    <CardTitle className="flex items-center text-xl">
                      <Zap className="w-5 h-5 mr-2" />
                      Desempenho Recente
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Análise dos últimos 30 dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    {renderCardContent(isLoading, <DashboardChartsGrid />)}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Clientes Novos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderCardContent(isLoading, <ClientesNovosCard />)}
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-md border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold">Pagamentos Pendentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderCardContent(isLoading, <PagamentosPendentesCard />)}
                    </CardContent>
                  </Card>
                </div>
                
                {/* Recent Activities Card */}
                <RecentActivitiesCard />
              </div>
              
              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                <Card className="shadow-md border-0">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white pb-3">
                    <CardTitle className="text-lg">Próximas Viagens</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {renderCardContent(isLoading, 
                      <ProximasViagensCard 
                        isLoading={isLoading} 
                        proximasViagens={proximasViagens} 
                      />
                    )}
                  </CardContent>
                </Card>
                
                {/* Breakdown de Receitas */}
                <ReceitasBreakdownCard 
                  resumoGeral={resumoGeral}
                  isLoading={isLoadingFinanceiro}
                />
                
                {/* Performance Summary Card */}
                <Card className="shadow-md border-0">
                  <CardContent className="p-4">
                    {renderCardContent(isLoading, <DashboardPerformanceSummary />)}
                  </CardContent>
                </Card>
                
                <Card className="shadow-md border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Ranking de Adversários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderCardContent(isLoading, <RankingAdversariosCard />)}
                  </CardContent>
                </Card>
                
                {/* ✨ NOVO: Card de Configuração de Passeios */}
                <Card className="shadow-md border-0 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-purple-800 flex items-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Configuração de Passeios
                    </CardTitle>
                    <CardDescription className="text-purple-600">
                      Configure custos e margens dos passeios
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Passeios Pagos:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-purple-700">Margem Média:</span>
                      <span className="font-medium text-green-600">~65%</span>
                    </div>
                    <Link 
                      to="/dashboard/configuracao-passeios"
                      className="block w-full"
                    >
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        <Calculator className="w-4 h-4 mr-2" />
                        Configurar Custos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Analytics Tab Content */}
          <TabsContent value="analytics" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Clientes por Mês</CardTitle>
                  <CardDescription>Crescimento mensal de novos clientes</CardDescription>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {renderCardContent(isLoading, <ClientesPorMesChart />)}
                </CardContent>
              </Card>
              
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Distribuição por Cidade</CardTitle>
                  <CardDescription>Origem dos clientes por cidade</CardDescription>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {renderCardContent(isLoading, <ClientesPorCidadePieChart />)}
                </CardContent>
              </Card>
              
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Ocupação de Viagens</CardTitle>
                  <CardDescription>Taxa de ocupação por viagem</CardDescription>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {renderCardContent(isLoading, <OcupacaoViagensChart />)}
                </CardContent>
              </Card>
              
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle>Setores Mais Escolhidos</CardTitle>
                  <CardDescription>Preferência de setores no estádio</CardDescription>
                </CardHeader>
                <CardContent className="p-6 h-[350px]">
                  {renderCardContent(isLoading, <SetoresEstadioMaisEscolhidosChart />)}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Upcoming Trips Tab Content */}
          <TabsContent value="upcoming" className="mt-0">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Próximas Viagens Detalhadas</CardTitle>
                <CardDescription>Planejamento completo das próximas caravanas</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {renderCardContent(isLoading, 
                  <div className="space-y-6">
                    <ProximasViagensCard 
                      isLoading={isLoading} 
                      proximasViagens={proximasViagens}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;