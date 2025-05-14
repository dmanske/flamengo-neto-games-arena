
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, CalendarCheck, CreditCard, Users, DollarSign, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { useBusStats } from "@/hooks/useBusStats";

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
  const busStats = useBusStats();
  
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

  const formatViagemDescription = (count: number) => {
    if (count === 0) return 'Nenhuma viagem agendada';
    if (count === 1) return '1 viagem agendada';
    return `${count} viagens agendadas`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  // Get current month name
  const currentMonthName = format(new Date(), "MMMM", { locale: ptBR });

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <div className="flex gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/dashboard/cadastrar-viagem">Nova Viagem</Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/dashboard/cadastrar-cliente">Cadastrar Cliente</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {/* Viagens Card */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Total Viagens</CardTitle>
              <div className="bg-blue-100 text-blue-600 p-2 rounded-full shadow-sm dark:bg-blue-800 dark:text-blue-300">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{isLoading ? '...' : viagemCount}</p>
            <CardDescription className="text-blue-600 dark:text-blue-400">{isLoading ? '...' : formatViagemDescription(viagemCount)}</CardDescription>
          </CardContent>
        </Card>
        
        {/* Clientes Card */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-green-700 dark:text-green-300">Clientes</CardTitle>
              <div className="bg-green-100 text-green-600 p-2 rounded-full shadow-sm dark:bg-green-800 dark:text-green-300">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200">{isLoading ? '...' : clientCount}</p>
            <CardDescription className="text-green-600 dark:text-green-400">
              {clientCount === 0
                ? 'Nenhum cliente cadastrado'
                : clientCount === 1
                  ? '1 cliente cadastrado'
                  : `${clientCount} clientes cadastrados`}
            </CardDescription>
          </CardContent>
        </Card>
        
        {/* Ônibus Card */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-amber-700 dark:text-amber-300">Ônibus</CardTitle>
              <div className="bg-amber-100 text-amber-600 p-2 rounded-full shadow-sm dark:bg-amber-800 dark:text-amber-300">
                <Bus className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">{busStats.isLoading ? '...' : busStats.totalBuses}</p>
            <CardDescription className="text-amber-600 dark:text-amber-400">
              {busStats.isLoading
                ? 'Carregando...'
                : busStats.totalBuses === 0
                  ? 'Nenhum ônibus cadastrado'
                  : busStats.totalBuses === 1
                    ? '1 ônibus cadastrado'
                    : `${busStats.totalBuses} ônibus cadastrados`}
            </CardDescription>
          </CardContent>
        </Card>
        
        {/* Ônibus Mais Usado Card */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Ônibus Mais Usado</CardTitle>
              <div className="bg-purple-100 text-purple-600 p-2 rounded-full shadow-sm dark:bg-purple-800 dark:text-purple-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {busStats.isLoading ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : busStats.mostUsedBus ? (
              <>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{busStats.mostUsedBus.tipo}</p>
                <CardDescription className="text-purple-600 dark:text-purple-400">
                  Usado em {busStats.mostUsedBus.count} {busStats.mostUsedBus.count === 1 ? 'viagem' : 'viagens'}
                </CardDescription>
              </>
            ) : (
              <>
                <p className="text-xl font-bold text-purple-800 dark:text-purple-200">Nenhum</p>
                <CardDescription className="text-purple-600 dark:text-purple-400">Sem dados de utilização</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receita Card */}
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg text-emerald-700 dark:text-emerald-300">Receita {currentMonthName}</CardTitle>
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full shadow-sm dark:bg-emerald-800 dark:text-emerald-300">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">{isLoading ? '...' : formatCurrency(monthlyRevenue)}</p>
            <CardDescription className="text-emerald-600 dark:text-emerald-400">
              Total do mês atual
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Viagens Card */}
        <Card className="overflow-hidden border shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-700 text-white">
            <CardTitle>Próximas Viagens</CardTitle>
            <CardDescription className="text-red-100">Acompanhe as próximas caravanas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-muted-foreground">Carregando viagens...</p>
              </div>
            ) : proximasViagens.length > 0 ? (
              <div className="space-y-5">
                {proximasViagens.map((viagem) => (
                  <div 
                    key={viagem.id} 
                    className="flex items-center justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        <div className="h-10 w-10 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                          <img 
                            src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                            alt="Flamengo" 
                            className="h-8 w-8 object-contain"
                          />
                        </div>
                        <div className="h-10 w-10 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                          <img 
                            src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                            alt={viagem.adversario} 
                            className="h-8 w-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-base">Flamengo x {viagem.adversario}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CalendarCheck className="h-3.5 w-3.5" />
                          {formatDate(viagem.data_jogo)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{viagem.rota}</span>
                      </div>
                      <Link to={`/dashboard/viagem/${viagem.id}`} className="text-sm text-primary hover:underline">
                        Detalhes
                      </Link>
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/dashboard/viagens">Ver todas as viagens</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>Nenhuma viagem programada</p>
                <p className="text-sm">Clique em "Nova Viagem" para cadastrar</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/dashboard/cadastrar-viagem">Cadastrar Viagem</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Últimos Pagamentos Card */}
        <Card className="overflow-hidden border shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-700 text-white">
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription className="text-green-100">Transações recentes</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>Nenhuma transação registrada</p>
              <p className="text-sm">As transações aparecerão aqui quando realizadas</p>
            </div>
            <Button variant="outline" className="w-full mt-4">Ver todos os pagamentos</Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Single Image Section */}
      <div className="flex justify-center items-center my-8">
        <img 
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRULonro80DLVex706fDQXv1GEjjAhog4ON_g&s" 
          alt="Flamengo Image" 
          className="h-auto max-w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default Dashboard;
