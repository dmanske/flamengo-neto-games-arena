
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, CalendarCheck, CreditCard, User, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
        <div className="flex gap-3">
          <Button className="bg-primary hover:bg-primary/90">Nova Viagem</Button>
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
            <p className="text-2xl font-bold">0</p>
            <CardDescription>Sem viagens agendadas</CardDescription>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Passageiros</CardTitle>
              <div className="bg-green-100 text-green-500 p-2 rounded-full">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <CardDescription>Nenhum passageiro cadastrado</CardDescription>
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
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CalendarCheck className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>Nenhuma viagem programada</p>
              <p className="text-sm">Clique em "Nova Viagem" para cadastrar</p>
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
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mb-2 text-muted-foreground/50" />
              <p>Nenhuma transação registrada</p>
              <p className="text-sm">As transações aparecerão aqui quando realizadas</p>
            </div>
            <Button variant="outline" className="w-full mt-4">Ver todos os pagamentos</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
