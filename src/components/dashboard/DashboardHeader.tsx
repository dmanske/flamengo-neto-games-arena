import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="section-title text-3xl font-cinzel font-bold text-rome-navy">Dashboard</h1>
      <div className="flex gap-3">
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base font-semibold">
          <Link to="/dashboard/cadastrar-viagem">Nova Viagem</Link>
        </Button>
        <Button asChild className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-base font-semibold">
          <Link to="/dashboard/cadastrar-cliente">Cadastrar Cliente</Link>
        </Button>
      </div>
    </div>
  );
};
