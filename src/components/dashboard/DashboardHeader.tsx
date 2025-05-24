
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, UserPlus } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-white/70 text-lg">Gerencie suas caravanas rubro-negras</p>
      </div>
      <div className="flex gap-3">
        <Button asChild className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Link to="/dashboard/cadastrar-viagem">
            <Plus className="w-5 h-5 mr-2" />
            Nova Viagem
          </Link>
        </Button>
        <Button asChild className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
          <Link to="/dashboard/cadastrar-cliente">
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastrar Cliente
          </Link>
        </Button>
      </div>
    </div>
  );
};
