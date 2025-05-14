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
        icon={CalendarCheck}
        className=""
        color="bg-gradient-to-br from-red-200 via-yellow-100 to-rose-100"
        iconContainerClassName="bg-orange-400/80 text-white"
        loading={isLoading}
        hideDescription={true}
      />

      {/* Clientes Card */}
      <DashboardStatCard
        title="Clientes"
        value={clientCount}
        icon={Users}
        className=""
        color="bg-gradient-to-br from-green-200 via-green-100 to-emerald-50"
        iconContainerClassName="bg-green-700/80 text-white"
        loading={isLoading}
        hideDescription={true}
      />

      {/* Ônibus Card */}
      <DashboardStatCard
        title="Ônibus"
        value={busStats.totalBuses}
        icon={Bus}
        className=""
        color="bg-gradient-to-br from-blue-200 via-blue-100 to-sky-50"
        iconContainerClassName="bg-blue-700/80 text-white"
        loading={busStats.isLoading}
        hideDescription={true}
      />

      {/* Ônibus Mais Usado Card */}
      <DashboardStatCard
        title="Ônibus Mais Usado"
        value={busStats.mostUsedBus ? busStats.mostUsedBus.tipo : "Nenhum"}
        description={busStats.mostUsedBus ? `Usado em ${busStats.mostUsedBus.count} ${busStats.mostUsedBus.count === 1 ? "viagem" : "viagens"}` : "Sem dados de utilização"}
        icon={TrendingUp}
        className=""
        color="bg-gradient-to-br from-yellow-100 via-orange-100 to-amber-50"
        iconContainerClassName="bg-yellow-500/80 text-white"
        loading={busStats.isLoading}
      />

      {/* Receita Card */}
      <DashboardStatCard
        title={`Receita ${currentMonthName}`}
        value={formatCurrency(monthlyRevenue)}
        description="Total do mês atual"
        icon={DollarSign}
        className=""
        color="bg-gradient-to-br from-green-100 via-emerald-100 to-lime-50"
        iconContainerClassName="bg-green-500/80 text-white"
        loading={isLoading}
      />
    </div>
  );
};
