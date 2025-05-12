
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  const scrollToTrips = () => {
    const tripsSection = document.getElementById("next-trips");
    if (tripsSection) {
      tripsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-black to-[#990000] text-white">
      <div className="absolute inset-0 bg-[url('https://logodetimes.com/wp-content/uploads/flamengo.png')] bg-no-repeat bg-center opacity-10 bg-contain"></div>
      <div className="container mx-auto px-4 py-28 md:py-40 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Viva a Experiência de Torcer pelo Flamengo ao Vivo com a NetoTours!
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 animate-fade-in">
            Organizamos tudo para você: transporte, camisas e muita emoção! 
            Partida um dia antes do jogo e retorno logo após a partida.
          </p>
          <Button 
            size="lg" 
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 text-lg animate-fade-in"
            onClick={scrollToTrips}
          >
            Ver Próximas Viagens <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
