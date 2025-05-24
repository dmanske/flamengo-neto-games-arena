
import React from "react";
import { Link } from "react-router-dom";
import { ModernButton } from "./modern-button";

export const NavigationBar = () => {
  return (
    <nav className="relative z-50 p-6">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <img src="https://logodetimes.com/wp-content/uploads/flamengo.png" alt="Flamengo" className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Neto Tours</h1>
            <p className="text-red-200 text-sm">Caravanas Rubro-Negras</p>
          </div>
        </Link>
        
        <div className="flex gap-4">
          <ModernButton variant="ghost" asChild>
            <Link to="/login">Login</Link>
          </ModernButton>
          <ModernButton variant="primary" asChild>
            <Link to="/cadastro-publico">Cadastrar</Link>
          </ModernButton>
        </div>
      </div>
    </nav>
  );
};
