import React, { useState } from "react";
import { ClientesPorMesChart } from "./graficos/ClientesPorMesChart";
import { ClientesPorCidadePieChart } from "./graficos/ClientesPorCidadePieChart";
import { OcupacaoViagensChart } from "./graficos/OcupacaoViagensChart";
import { ReceitaPorAdversarioChart } from "./graficos/ReceitaPorAdversarioChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, PieChart, LineChart, TrendingUp, Filter, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const DashboardChartsGrid = () => {
  return (
    <div>
      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="mb-4 bg-transparent border-b border-gray-200 w-full justify-start gap-4 pb-0 rounded-none">
          <TabsTrigger 
            value="clientes" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none pb-2 px-1"
          >
            <LineChart className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger 
            value="cidades" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none pb-2 px-1"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Cidades
          </TabsTrigger>
          <TabsTrigger 
            value="ocupacao" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none pb-2 px-1"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Ocupação
          </TabsTrigger>
          <TabsTrigger 
            value="receita" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent rounded-none pb-2 px-1"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Receita
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="clientes" className="mt-4">
          <div className="h-[300px]">
            <ClientesPorMesChart />
          </div>
        </TabsContent>
        
        <TabsContent value="cidades" className="mt-4">
          <div className="h-[300px]">
            <ClientesPorCidadePieChart />
          </div>
        </TabsContent>
        
        <TabsContent value="ocupacao" className="mt-4">
          <div className="h-[300px]">
            <OcupacaoViagensChart />
          </div>
        </TabsContent>
        
        <TabsContent value="receita" className="mt-4">
          <div className="h-[300px]">
            <ReceitaPorAdversarioChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};