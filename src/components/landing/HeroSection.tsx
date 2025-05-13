
import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToTrips = () => {
    const tripsSection = document.getElementById("next-trips");
    if (tripsSection) {
      tripsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-black text-white">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ 
          backgroundImage: "url('https://logodetimes.com/times/flamengo/flamengo-torcida.jpg')", 
          backgroundPosition: "center 25%" 
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-28 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 uppercase leading-tight">
            Viva a emoção do Mengão ao vivo!
          </h1>
          
          <div className="mt-10">
            <Button 
              size="lg" 
              className="bg-red-700 hover:bg-red-800 text-white px-12 py-6 text-xl uppercase font-bold"
              onClick={scrollToTrips}
            >
              Ver Pacotes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
