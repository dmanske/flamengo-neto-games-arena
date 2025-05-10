import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, CalendarCheck, CreditCard, User, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

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

interface OnibusCount {
  tipo: string;
  count: number;
}

const Dashboard = () => {
  const [clientCount, setClientCount] = useState<number>(0);
  const [viagemCount, setViagemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flamengoLogo, setFlamengoLogo] = useState<string>("https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png");
  const [proximasViagens, setProximasViagens] = useState<Viagem[]>([]);
  const [busCount, setBusCount] = useState<number>(3); // We have 3 types of buses
  const [mostUsedBus, setMostUsedBus] = useState<OnibusCount | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  
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

        // Fetch most used bus type
        const { data: busData, error: busError } = await supabase
          .from('viagens')
          .select('tipo_onibus')
          
        if (!busError && busData) {
          const busCounts: Record<string, number> = {};
          busData.forEach(trip => {
            if (trip.tipo_onibus) {
              busCounts[trip.tipo_onibus] = (busCounts[trip.tipo_onibus] || 0) + 1;
            }
          });
          
          let maxCount = 0;
          let maxType = '';
          Object.entries(busCounts).forEach(([tipo, count]) => {
            if (count > maxCount) {
              maxCount = count;
              maxType = tipo;
            }
          });
          
          if (maxType) {
            setMostUsedBus({ tipo: maxType, count: maxCount });
          }
        } else {
          console.error('Erro ao buscar dados de ônibus:', busError);
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
            <Link to="/cadastrar-viagem">Nova Viagem</Link>
          </Button>
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link to="/cadastrar-cliente">Cadastrar Cliente</Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Total Viagens</CardTitle>
              <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isLoading ? '...' : viagemCount}</p>
            <CardDescription>{isLoading ? '...' : formatViagemDescription(viagemCount)}</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Clientes</CardTitle>
              <div className="bg-green-100 text-green-500 p-2 rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isLoading ? '...' : clientCount}</p>
            <CardDescription>
              {clientCount === 0
                ? 'Nenhum cliente cadastrado'
                : clientCount === 1
                  ? '1 cliente cadastrado'
                  : `${clientCount} clientes cadastrados`}
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Ônibus</CardTitle>
              <div className="bg-amber-100 text-amber-500 p-2 rounded-full">
                <Bus className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{busCount}</p>
            <CardDescription>
              {busCount === 0
                ? 'Nenhum ônibus cadastrado'
                : busCount === 1
                  ? '1 tipo de ônibus'
                  : `${busCount} tipos de ônibus`}
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Ônibus Mais Usado</CardTitle>
              <div className="bg-purple-100 text-purple-500 p-2 rounded-full">
                <Bus className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mostUsedBus ? (
              <>
                <p className="text-xl font-bold">{mostUsedBus.tipo}</p>
                <CardDescription>Usado em {mostUsedBus.count} {mostUsedBus.count === 1 ? 'viagem' : 'viagens'}</CardDescription>
              </>
            ) : (
              <>
                <p className="text-xl font-bold">Nenhum</p>
                <CardDescription>Sem dados de utilização</CardDescription>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Receita {currentMonthName}</CardTitle>
              <div className="bg-green-100 text-green-500 p-2 rounded-full">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{isLoading ? '...' : formatCurrency(monthlyRevenue)}</p>
            <CardDescription>
              Total do mês atual
            </CardDescription>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Viagens</CardTitle>
            <CardDescription>Acompanhe as próximas caravanas</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-muted-foreground">Carregando viagens...</p>
              </div>
            ) : proximasViagens.length > 0 ? (
              <div className="space-y-4">
                {proximasViagens.map((viagem) => (
                  <div 
                    key={viagem.id} 
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                          <img 
                            src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                            alt="Flamengo" 
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                        <div className="h-8 w-8 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden">
                          <img 
                            src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                            alt={viagem.adversario} 
                            className="h-6 w-6 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">Flamengo x {viagem.adversario}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(viagem.data_jogo)}</p>
                      </div>
                    </div>
                    <Link to={`/viagem/${viagem.id}`} className="text-sm text-primary hover:underline">
                      Detalhes
                    </Link>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link to="/viagens">Ver todas as viagens</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CalendarCheck className="h-12 w-12 mb-2 text-muted-foreground/50" />
                <p>Nenhuma viagem programada</p>
                <p className="text-sm">Clique em "Nova Viagem" para cadastrar</p>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link to="/cadastrar-viagem">Cadastrar Viagem</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription>Transações recentes</CardDescription>
          </CardHeader>
          <CardContent>
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
          className="h-auto max-w-full"
        />
      </div>
    </div>
  );
};

export default Dashboard;
