
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, CalendarCheck, CreditCard, User, Users } from "lucide-react";

const Dashboard = () => {
  // Mock data for the dashboard
  const stats = [
    {
      title: "Total Viagens",
      value: "12",
      description: "Próxima viagem: 25/05",
      icon: CalendarCheck,
      color: "bg-blue-100 text-blue-500"
    },
    {
      title: "Passageiros",
      value: "248",
      description: "92 ativos",
      icon: Users,
      color: "bg-green-100 text-green-500"
    },
    {
      title: "Ônibus",
      value: "5",
      description: "Todos ativos",
      icon: Bus,
      color: "bg-amber-100 text-amber-500"
    },
    {
      title: "Receita Total",
      value: "R$ 24.800",
      description: "R$ 5.200 pendente",
      icon: CreditCard,
      color: "bg-purple-100 text-purple-500"
    },
  ];
  
  const proximasViagens = [
    { destino: "Flamengo x Fluminense", data: "25/05/2025", status: "Aberta", lotacao: "35/45" },
    { destino: "Flamengo x Botafogo", data: "10/06/2025", status: "Aberta", lotacao: "18/45" },
    { destino: "Flamengo x Vasco", data: "25/06/2025", status: "Aberta", lotacao: "5/45" },
  ];
  
  const ultimosPagamentos = [
    { passageiro: "João Silva", valor: "R$ 120,00", data: "12/05/2025", status: "Pago" },
    { passageiro: "Maria Santos", valor: "R$ 120,00", data: "11/05/2025", status: "Pago" },
    { passageiro: "Carlos Oliveira", valor: "R$ 120,00", data: "10/05/2025", status: "Pendente" },
  ];

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <Button className="bg-primary hover:bg-primary/90">Nova Viagem</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-full`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximas Viagens</CardTitle>
            <CardDescription>Acompanhe as próximas caravanas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasViagens.map((viagem) => (
                <div key={viagem.destino} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <h3 className="font-medium">{viagem.destino}</h3>
                    <p className="text-sm text-muted-foreground">{viagem.data}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {viagem.status}
                    </span>
                    <span className="text-sm text-muted-foreground mt-1">
                      {viagem.lotacao} passageiros
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Ver todas as viagens</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Últimos Pagamentos</CardTitle>
            <CardDescription>Transações recentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ultimosPagamentos.map((pagamento) => (
                <div key={pagamento.passageiro} className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{pagamento.passageiro}</h3>
                      <p className="text-sm text-muted-foreground">{pagamento.data}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">{pagamento.valor}</span>
                    <span className={`text-xs ${pagamento.status === 'Pago' ? 'text-green-600' : 'text-amber-600'} font-medium`}>
                      {pagamento.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">Ver todos os pagamentos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
