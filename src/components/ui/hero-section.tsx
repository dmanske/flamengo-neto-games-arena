
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Trophy, Flame, Users, Calendar, ShoppingBag } from "lucide-react";
import { ModernButton } from "./modern-button";

export const HeroSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        {isVideoPlaying ? (
          <div className="w-full h-full">
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ"
              title="Neto Tours - Apresentação"
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-black to-red-800">
              <img 
                src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&h=1080&fit=crop"
                alt="Estádio do Flamengo"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-red-900/30 to-black/70"></div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-32 right-20 w-48 h-48 bg-yellow-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-red-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          </>
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-xl border border-red-500/30 rounded-full px-6 py-3 mb-8 animate-fade-in">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-white text-sm font-medium">Caravanas Oficiais do Mengão</span>
          <Flame className="w-5 h-5 text-red-400" />
        </div>
        
        {/* Main Title */}
        <h1 className="text-5xl md:text-8xl font-bold text-white mb-8 leading-tight animate-fade-in">
          <span className="block mb-2">NETO</span>
          <span className="bg-gradient-to-r from-red-400 via-red-500 to-yellow-400 bg-clip-text text-transparent block animate-scale-in">
            TOURS
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-red-100 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.5s' }}>
          Viva a paixão rubro-negra em grande estilo! Caravanas oficiais para todos os jogos 
          do Flamengo com <span className="text-yellow-400 font-semibold">conforto</span>, 
          <span className="text-red-400 font-semibold"> segurança</span> e 
          <span className="text-yellow-400 font-semibold"> muita festa</span>.
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <Users className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">1000+</div>
            <div className="text-red-200">Torcedores</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">50+</div>
            <div className="text-red-200">Viagens</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
            <Trophy className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white">5</div>
            <div className="text-red-200">Anos</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in" style={{ animationDelay: '1.5s' }}>
          <ModernButton size="lg" className="group text-lg px-8 py-4" asChild>
            <Link to="/loja">
              <ShoppingBag className="w-6 h-6 mr-2" />
              Ver Próximas Viagens
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </ModernButton>
          
          {!isVideoPlaying && (
            <ModernButton 
              variant="glass" 
              size="lg" 
              className="group text-lg px-8 py-4"
              onClick={() => setIsVideoPlaying(true)}
            >
              <Play className="w-6 h-6 mr-2" />
              Assistir Apresentação
            </ModernButton>
          )}
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
