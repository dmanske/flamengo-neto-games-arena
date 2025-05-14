
import React from "react";
import { Bus, CalendarCheck, CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { DashboardStatCard } from "./DashboardStatCard";
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
  const formatViagemDescription = (count: number) => {
    if (count === 0) return "Nenhuma viagem agendada";
    if (count === 1) return "1 viagem agendada";
    return `${count} viagens agendadas`;
  };

  const formatClientDescription = (count: number) => {
    if (count === 0) return "Nenhum cliente cadastrado";
    if (count === 1) return "1 cliente cadastrado";
    return `${count} clientes cadastrados`;
  };

  const formatBusDescription = (count: number) => {
    if (count === 0) return "Nenhum ônibus cadastrado";
    if (count === 1) return "1 ônibus cadastrado";
    return `${count} ônibus cadastrados`;
  };

  // Get current month name
  const currentMonthName = format(new Date(), "MMMM", { locale: ptBR });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {/* Viagens Card */}
      <DashboardStatCard
        title="Total Viagens"
        value={viagemCount}
        description={formatViagemDescription(viagemCount)}
        icon={CalendarCheck}
        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30"
        iconContainerClassName="bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300"
        loading={isLoading}
      />

      {/* Clientes Card */}
      <DashboardStatCard
        title="Clientes"
        value={clientCount}
        description={formatClientDescription(clientCount)}
        icon={Users}
        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30"
        iconContainerClassName="bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-300"
        loading={isLoading}
      />

      {/* Ônibus Card */}
      <DashboardStatCard
        title="Ônibus"
        value={busStats.totalBuses}
        description={formatBusDescription(busStats.totalBuses)}
        icon={Bus}
        className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
        iconContainerClassName="bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-300"
        loading={busStats.isLoading}
      />

      {/* Ônibus Mais Usado Card */}
      <DashboardStatCard
        title="Ônibus Mais Usado"
        value={busStats.mostUsedBus ? busStats.mostUsedBus.tipo : "Nenhum"}
        description={
          busStats.mostUsedBus
            ? `Usado em ${busStats.mostUsedBus.count} ${
                busStats.mostUsedBus.count === 1 ? "viagem" : "viagens"
              }`
            : "Sem dados de utilização"
        }
        icon={TrendingUp}
        className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30"
        iconContainerClassName="bg-purple-100 text-purple-600 dark:bg-purple-800 dark:text-purple-300"
        loading={busStats.isLoading}
      />

      {/* Receita Card */}
      <DashboardStatCard
        title={`Receita ${currentMonthName}`}
        value={formatCurrency(monthlyRevenue)}
        description="Total do mês atual"
        icon={DollarSign}
        className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30"
        iconContainerClassName="bg-emerald-100 text-emerald-600 dark:bg-emerald-800 dark:text-emerald-300"
        loading={isLoading}
      />
    </div>
  );
};
