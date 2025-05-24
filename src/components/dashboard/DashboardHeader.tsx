
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, UserPlus } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8 p-6 bg-white rounded-xl shadow-professional border border-gray-100">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Gerencie suas caravanas rubro-negras</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-base font-medium shadow-professional hover:shadow-professional-md transition-all duration-200">
          <Link to="/dashboard/cadastrar-viagem">
            <Plus className="w-5 h-5 mr-2" />
            Nova Viagem
          </Link>
        </Button>
        <Button asChild className="bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 px-6 py-3 text-base font-medium shadow-professional hover:shadow-professional-md transition-all duration-200">
          <Link to="/dashboard/cadastrar-cliente">
            <UserPlus className="w-5 h-5 mr-2" />
            Cadastrar Cliente
          </Link>
        </Button>
      </div>
    </div>
  );
};
