
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, CalendarCheck, CreditCard, User, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Dashboard = () => {
  const [clientCount, setClientCount] = useState<number>(0);
  const [viagemCount, setViagemCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flamengoLogo, setFlamengoLogo] = useState<string>("https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png");
  
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
        
        // Fetch most recent trip to get the logo
        const { data: recentTrip, error: logoError } = await supabase
          .from('viagens')
          .select('logo_flamengo')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (!logoError && recentTrip && recentTrip.logo_flamengo) {
          setFlamengoLogo(recentTrip.logo_flamengo);
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <p className="text-2xl font-bold">0</p>
            <CardDescription>Nenhum ônibus cadastrado</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Receita Total</CardTitle>
              <div className="bg-purple-100 text-purple-500 p-2 rounded-full">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">R$ 0,00</p>
            <CardDescription>Sem transações registradas</CardDescription>
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
            {viagemCount > 0 ? (
              <div>
                {/* Viagens serão listadas aqui */}
                <Button asChild variant="outline" className="w-full mt-4">
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
      
      {/* Flamengo Logo Section */}
      <div className="flex justify-center items-center my-8">
        <img 
          src={flamengoLogo}
          alt="Logo do Flamengo"
          className="h-40 w-auto"
        />
      </div>
    </div>
  );
};

export default Dashboard;
