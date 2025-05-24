
import React from "react";
import { Bus, CalendarCheck, CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { ModernStatsCard } from "./ModernStatsCard";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";
import { BusStats } from "@/hooks/useBusStats";

interface DashboardStatsGridProps {
  isLoading: boolean;
  clientCount: number;
  viagemCount: number;
  monthlyRevenue: number;
  busStats: BusStats;
}

export const DashboardStatsGrid = ({
  isLoading,
  clientCount,
  viagemCount,
  monthlyRevenue,
  busStats,
}: DashboardStatsGridProps) => {
  const currentMonthName = format(new Date(), "MMMM", { locale: ptBR });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <ModernStatsCard
        title="Total Viagens"
        value={viagemCount}
        description={viagemCount === 1 ? "viagem agendada" : "viagens agendadas"}
        icon={CalendarCheck}
        loading={isLoading}
        gradient="from-orange-200/30 to-red-200/20"
      />

      <ModernStatsCard
        title="Clientes"
        value={clientCount}
        description={clientCount === 1 ? "cliente cadastrado" : "clientes cadastrados"}
        icon={Users}
        loading={isLoading}
        gradient="from-green-200/30 to-emerald-200/20"
      />

      <ModernStatsCard
        title="Ônibus"
        value={busStats.totalBuses}
        description={busStats.totalBuses === 1 ? "ônibus cadastrado" : "ônibus cadastrados"}
        icon={Bus}
        loading={busStats.isLoading}
        gradient="from-blue-200/30 to-sky-200/20"
      />

      <ModernStatsCard
        title="Mais Usado"
        value={busStats.mostUsedBus ? busStats.mostUsedBus.tipo : "Nenhum"}
        description={busStats.mostUsedBus ? `${busStats.mostUsedBus.count} ${busStats.mostUsedBus.count === 1 ? "viagem" : "viagens"}` : "Sem dados"}
        icon={TrendingUp}
        loading={busStats.isLoading}
        gradient="from-yellow-200/30 to-orange-200/20"
      />

      <ModernStatsCard
        title={`Receita ${currentMonthName}`}
        value={formatCurrency(monthlyRevenue)}
        description="Total do mês atual"
        icon={DollarSign}
        loading={isLoading}
        trend="up"
        trendValue="+12%"
        gradient="from-green-200/30 to-lime-200/20"
      />
    </div>
  );
};
