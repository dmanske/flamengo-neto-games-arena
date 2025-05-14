import React from "react";
import { ClientesPorMesChart } from "./graficos/ClientesPorMesChart";
import { ClientesPorCidadePieChart } from "./graficos/ClientesPorCidadePieChart";
import { OcupacaoViagensChart } from "./graficos/OcupacaoViagensChart";
import { ReceitaPorAdversarioChart } from "./graficos/ReceitaPorAdversarioChart";

export const DashboardChartsGrid = () => {
  return (
    <div className="my-6">
      <h3 className="text-xl font-cinzel mb-4">Estatísticas e Gráficos</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientesPorMesChart />
        <ClientesPorCidadePieChart />
        <OcupacaoViagensChart />
        <ReceitaPorAdversarioChart />
      </div>
    </div>
  );
}; 