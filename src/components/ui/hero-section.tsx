
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Trophy } from "lucide-react";
import { ModernButton } from "./modern-button";

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video or Image */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-red-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-yellow-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-white text-sm font-medium">Rumo ao Hexa Mundial</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Viva a Paixão
          <br />
          <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
            Rubro-Negra
          </span>
        </h1>
        
        <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto leading-relaxed">
          Acompanhe o Mengão em grande estilo! Caravanas oficiais para todos os jogos no Maracanã com conforto, segurança e muita festa.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ModernButton size="lg" className="group" asChild>
            <Link to="/loja">
              Ver Próximas Viagens
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ModernButton>
          
          <ModernButton variant="glass" size="lg" className="group">
            <Play className="w-5 h-5" />
            Assistir Vídeo
          </ModernButton>
        </div>
      </div>
    </div>
  );
};
