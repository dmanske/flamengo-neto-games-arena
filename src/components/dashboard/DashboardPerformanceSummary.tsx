import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PerformanceMetric {
  label: string;
  value: number;
  target: number;
  change: number;
  icon: React.ReactNode;
  actualValue: number;
  targetValue: number;
}

export const DashboardPerformanceSummary = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setIsLoading(true);
        
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Buscar novos clientes do mês atual
        const { count: currentMonthClients } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentMonth.toISOString());

        // Buscar novos clientes do mês passado
        const { count: lastMonthClients } = await supabase
          .from('clientes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());

        // Buscar viagens do mês atual
        const { count: currentMonthTrips } = await supabase
          .from('viagens')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', currentMonth.toISOString());

        // Buscar viagens do mês passado
        const { count: lastMonthTrips } = await supabase
          .from('viagens')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', lastMonth.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());

        // Buscar receita do mês atual
        const { data: currentMonthRevenue } = await supabase
          .from('viagem_passageiros')
          .select('valor, desconto')
          .eq('status_pagamento', 'Pago')
          .gte('created_at', currentMonth.toISOString());

        // Buscar receita do mês passado
        const { data: lastMonthRevenue } = await supabase
          .from('viagem_passageiros')
          .select('valor, desconto')
          .eq('status_pagamento', 'Pago')
          .gte('created_at', lastMonth.toISOString())
          .lte('created_at', lastMonthEnd.toISOString());

        const currentRevenue = currentMonthRevenue?.reduce((sum, item) => {
          return sum + ((item.valor || 0) - (item.desconto || 0));
        }, 0) || 0;

        const lastRevenue = lastMonthRevenue?.reduce((sum, item) => {
          return sum + ((item.valor || 0) - (item.desconto || 0));
        }, 0) || 0;

        // Calcular mudanças percentuais
        const clientsChange = lastMonthClients ? 
          Math.round(((currentMonthClients || 0) - lastMonthClients) / lastMonthClients * 100) : 0;
        
        const tripsChange = lastMonthTrips ? 
          Math.round(((currentMonthTrips || 0) - lastMonthTrips) / lastMonthTrips * 100) : 0;
        
        const revenueChange = lastRevenue ? 
          Math.round((currentRevenue - lastRevenue) / lastRevenue * 100) : 0;

        // Definir metas (podem ser configuráveis no futuro)
        const clientsTarget = 50;
        const tripsTarget = 15;
        const revenueTarget = 50000; // R$ 50.000

        const performanceMetrics: PerformanceMetric[] = [
          {
            label: "Novos Clientes",
            value: Math.min(Math.round((currentMonthClients || 0) / clientsTarget * 100), 100),
            target: 100,
            change: clientsChange,
            icon: <Users className="w-4 h-4 text-blue-600" />,
            actualValue: currentMonthClients || 0,
            targetValue: clientsTarget
          },
          {
            label: "Viagens Realizadas",
            value: Math.min(Math.round((currentMonthTrips || 0) / tripsTarget * 100), 100),
            target: 100,
            change: tripsChange,
            icon: <Calendar className="w-4 h-4 text-indigo-600" />,
            actualValue: currentMonthTrips || 0,
            targetValue: tripsTarget
          },
          {
            label: "Receita Mensal",
            value: Math.min(Math.round(currentRevenue / revenueTarget * 100), 100),
            target: 100,
            change: revenueChange,
            icon: <DollarSign className="w-4 h-4 text-green-600" />,
            actualValue: currentRevenue,
            targetValue: revenueTarget
          }
        ];

        setMetrics(performanceMetrics);
        
      } catch (error) {
        console.error('Erro ao buscar dados de performance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Desempenho Mensal</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Desempenho Mensal</h3>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-gray-100">
                    {metric.icon}
                  </div>
                  <span className="font-medium text-gray-700">{metric.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  {metric.change > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : metric.change < 0 ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : null}
                  <span className={`text-sm font-medium ${
                    metric.change > 0 ? 'text-green-600' : 
                    metric.change < 0 ? 'text-red-600' : 
                    'text-gray-600'
                  }`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{metric.value}% do objetivo</span>
                  <span className="font-medium">
                    {metric.label === "Receita Mensal" 
                      ? `R$ ${metric.actualValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : `${metric.actualValue}/${metric.targetValue}`
                    }
                  </span>
                </div>
                <Progress 
                  value={metric.value} 
                  max={metric.target} 
                  className="h-2"
                  indicatorClassName={
                    metric.value >= 80 ? "bg-green-600" : 
                    metric.value >= 50 ? "bg-amber-500" : 
                    "bg-red-600"
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};