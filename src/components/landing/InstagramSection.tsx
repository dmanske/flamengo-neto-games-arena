import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

// Importar imagens existentes para simular feed do Instagram
import heroMaracana from "@/assets/landing/hero-maracana.jpg";
import busExterior from "@/assets/landing/bus-exterior.jpg";
import busInterior from "@/assets/landing/bus-interior.jpg";
import cristoRedentor from "@/assets/landing/cristo-redentor.jpg";
import flamengoFans from "@/assets/landing/flamengo-fans.jpg";
import paoDeAcucar from "@/assets/landing/pao-de-acucar.jpg";

const instagramPhotos = [
  { id: 1, url: heroMaracana, likes: 245 },
  { id: 2, url: flamengoFans, likes: 312 },
  { id: 3, url: busExterior, likes: 189 },
  { id: 4, url: cristoRedentor, likes: 421 },
  { id: 5, url: busInterior, likes: 156 },
  { id: 6, url: paoDeAcucar, likes: 298 },
];

const InstagramSection = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section 
      ref={ref}
      className="py-20 bg-gradient-to-br from-purple-900/10 via-background to-pink-900/10"
    >
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center animate-pulse-glow">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              Siga no <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">Instagram</span>
            </h2>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acompanhe as melhores fotos e vídeos das nossas caravanas!
          </p>
          <Button 
            variant="hero"
            size="lg"
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 shadow-lg hover:shadow-xl"
            onClick={() => window.open("https://www.instagram.com/neto.viagens/?igsh=MWRkODhvbjh3dW1lbg3D3D", "_blank")}
          >
            <Instagram className="mr-2 h-5 w-5" />
            @neto.viagens
          </Button>
        </motion.div>

        {/* Grid de Fotos Estilo Instagram */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {instagramPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="aspect-square overflow-hidden rounded-lg cursor-pointer relative group"
            >
              <img 
                src={photo.url} 
                alt={`Instagram post ${photo.id}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 fill-white" />
                  <span className="font-semibold">{photo.likes}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
