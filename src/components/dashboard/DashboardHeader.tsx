
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
      <div className="flex gap-3">
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/dashboard/cadastrar-viagem">Nova Viagem</Link>
        </Button>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link to="/dashboard/cadastrar-cliente">Cadastrar Cliente</Link>
        </Button>
      </div>
    </div>
  );
};
