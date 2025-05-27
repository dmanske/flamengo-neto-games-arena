
import React from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Camera, Trophy, Heart } from "lucide-react";

export const GamePhotosSection = () => {
  const gamePhotos = [
    {
      id: 1,
      title: "Final da Libertadores 2022",
      description: "Flamengo Campeão!",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
      date: "2022"
    },
    {
      id: 2,
      title: "Maracanã Lotado",
      description: "80 mil rubro-negros",
      image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop",
      date: "2023"
    },
    {
      id: 3,
      title: "Festa da Torcida",
      description: "Caravana Neto Tours",
      image: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=800&h=600&fit=crop",
      date: "2024"
    },
    {
      id: 4,
      title: "Gol Histórico",
      description: "Momento épico",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop",
      date: "2024"
    },
    {
      id: 5,
      title: "Concentração",
      description: "Antes do jogo",
      image: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=800&h=600&fit=crop",
      date: "2024"
    },
    {
      id: 6,
      title: "Comemoração",
      description: "Vitória garantida",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
      date: "2024"
    }
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-red-900/20 to-black/80"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <Camera className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">Galeria de Jogos</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Momentos
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
              Inesquecíveis
            </span>
          </h2>
          
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Reviva os melhores momentos do Mengão através da nossa galeria exclusiva. 
            Cada foto conta uma história de paixão e vitória.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gamePhotos.map((photo, index) => (
            <EnhancedCard 
              key={photo.id}
              variant="interactive"
              className="group overflow-hidden h-80"
              glow={true}
            >
              <div className="relative h-full">
                <img 
                  src={photo.image} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">{photo.date}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{photo.title}</h3>
                  <p className="text-red-200 text-sm">{photo.description}</p>
                </div>
                
                {/* Hover Heart */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-red-500/80 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </EnhancedCard>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg">
            Ver Todas as Fotos
          </button>
        </div>
      </div>
    </section>
  );
};
