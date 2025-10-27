import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import type { CarouselApi } from "@/components/ui/carousel";
import heroImage from "@/assets/landing/hero-maracana.jpg";
import maracanaFanImg from "@/assets/landing/maracana-fan.png";
import flamengoLogo from "@/assets/landing/flamengo-logo-oficial.png";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BannerTrip {
  id: string;
  title: string;
  opponentLogo: string;
  date: string;
  cidade: string;
  logoOrder: {
    primeiro: string;
    segundo: string;
  };
}

interface ViagemSupabase {
  id: string;
  adversario: string;
  data_jogo: string;
  local_jogo: string;
  nome_estadio: string | null;
  logo_adversario: string | null;
}

const Hero = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [bannerTrips, setBannerTrips] = useState<BannerTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar próximas viagens para o banner
  useEffect(() => {
    const buscarProximasViagens = async () => {
      try {
        setIsLoading(true);
        
        const hoje = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo, local_jogo, logo_adversario')
          .gte('data_jogo', hoje)
          .in('status_viagem', ['Aberta', 'Em andamento'])
          .order('data_jogo', { ascending: true })
          .limit(4);

        if (error) {
          console.error('Erro ao buscar viagens para banner:', error);
          return;
        }

        if (data) {
          const viagensFormatadas: BannerTrip[] = data.map((viagem: ViagemSupabase) => {
            const dataJogo = new Date(viagem.data_jogo);
            const dataFormatada = format(dataJogo, "dd/MM/yyyy", { locale: ptBR });
            
            // Determinar se é jogo em casa ou fora
            const isJogoEmCasa = viagem.local_jogo?.toLowerCase().includes('rio de janeiro') || 
                                viagem.local_jogo?.toLowerCase().includes('rio');
            
            const logoAdversario = viagem.logo_adversario || `https://via.placeholder.com/100x100?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
            
            let title, logoOrder;
            if (isJogoEmCasa) {
              // Jogo em casa: Flamengo x Adversário
              title = `Flamengo x ${viagem.adversario}`;
              logoOrder = {
                primeiro: flamengoLogo,
                segundo: logoAdversario
              };
            } else {
              // Jogo fora: Adversário x Flamengo
              title = `${viagem.adversario} x Flamengo`;
              logoOrder = {
                primeiro: logoAdversario,
                segundo: flamengoLogo
              };
            }

            return {
              id: viagem.id,
              title,
              opponentLogo: logoAdversario,
              date: dataFormatada,
              cidade: viagem.local_jogo || 'Rio de Janeiro',
              logoOrder
            };
          });
          
          setBannerTrips(viagensFormatadas);
        }
      } catch (error) {
        console.error('Erro inesperado ao buscar viagens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    buscarProximasViagens();
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });

    // Auto-play apenas se houver viagens
    if (bannerTrips.length > 0) {
      const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
    }
  }, [api, bannerTrips.length]);

  const scrollToContact = () => {
    const element = document.querySelector("#contact");
    element?.scrollIntoView({
      behavior: "smooth"
    });
  };

  const scrollToUpcomingTrips = () => {
    const element = document.querySelector("#upcoming-trips");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Video Background Fallback with Image */}
      <div className="absolute inset-0 z-0">
        <img src={heroImage} alt="Maracanã Stadium" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" style={{
        background: "var(--gradient-overlay)"
      }} />
      </div>

      {/* Floating Particles Effect */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 bg-primary/30 rounded-full" initial={{
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)
      }} animate={{
        y: [0, -30, 0],
        opacity: [0.2, 0.5, 0.2]
      }} transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 2
      }} />)}
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        {/* Banner Carousel - Posicionado no topo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent>
              {isLoading ? (
                <CarouselItem>
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                    <span className="ml-3 text-white">Carregando próximos jogos...</span>
                  </div>
                </CarouselItem>
              ) : bannerTrips.length === 0 ? (
                <CarouselItem>
                  <div className="text-center py-8">
                    <p className="text-white text-lg">Nenhum jogo programado no momento</p>
                  </div>
                </CarouselItem>
              ) : (
                bannerTrips.map((trip) => (
                <CarouselItem key={trip.id}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card 
                      className="overflow-hidden cursor-pointer hover:shadow-glow transition-all duration-300 group"
                      onClick={scrollToUpcomingTrips}
                    >
                      <div className="relative h-[200px] md:h-[250px]">
                        {/* Background do Maracanã */}
                        <div 
                          className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                          style={{ backgroundImage: `url(${maracanaFanImg})` }}
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />
                        
                        {/* Conteúdo */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6">
                          {/* Logos dos Times */}
                          <div className="flex items-center justify-center gap-4 md:gap-8">
                            <motion.div 
                              initial={{ x: -50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20"
                            >
                              <img 
                                src={trip.logoOrder.primeiro} 
                                alt="Primeiro Time" 
                                className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-2xl"
                              />
                            </motion.div>
                            
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="text-white text-3xl md:text-4xl font-bold drop-shadow-lg"
                            >
                              VS
                            </motion.div>
                            
                            <motion.div 
                              initial={{ x: 50, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="flex items-center justify-center bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 shadow-2xl border border-white/20"
                            >
                              <img 
                                src={trip.logoOrder.segundo} 
                                alt="Segundo Time" 
                                className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-2xl"
                              />
                            </motion.div>
                          </div>
                          
                          {/* Info do Jogo */}
                          <motion.div 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-center"
                          >
                            <h3 className="text-xl md:text-2xl font-bold text-white drop-shadow-lg mb-1">
                              {trip.title}
                            </h3>
                            <p className="text-sm md:text-base text-white/90 drop-shadow-md">
                              {trip.date} • {trip.cidade}
                            </p>
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </CarouselItem>
                ))
              )}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:left-4" />
            <CarouselNext className="right-2 md:right-4" />
          </Carousel>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-4">
            {bannerTrips.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === current 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        {/* Conteúdo Principal do Hero */}
        <div className="text-center">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.8
      }} className="max-w-5xl mx-auto">
          {/* Content Backdrop */}
          <div className="bg-black/60 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Badge */}
            <motion.div initial={{
            opacity: 0,
            scale: 0.8
          }} animate={{
            opacity: 1,
            scale: 1
          }} transition={{
            delay: 0.2
          }} className="inline-flex items-center gap-2 px-6 py-3 bg-primary/30 backdrop-blur-sm rounded-full border border-primary/50 mb-8">
              <MapPin className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">
                Experiências Inesquecíveis nos Estádios
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight drop-shadow-2xl">
              <span className="text-white">Viva a Paixão pelo</span>
              <br />
              <div className="flex items-center justify-center gap-4">
                <span className="text-gradient drop-shadow-lg px-[6px] my-[7px] py-[11px]">Flamengo
              </span>
                <img src={flamengoLogo} alt="Flamengo" className="h-16 md:h-20 lg:h-24 inline-block drop-shadow-2xl" />
              </div>
            </motion.h1>

            {/* Subtitle */}
            <motion.p initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.6
          }} className="text-xl md:text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Junte-se à Neto Tours Viagens e vivencie cada jogo com conforto, segurança e
              toda a energia da Nação Rubro-Negra
            </motion.p>

          {/* CTA Buttons */}
          <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.8
          }} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="default" size="lg" onClick={scrollToContact} className="group px-8 py-3">
              Reserve Sua Vaga
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              const element = document.querySelector("#upcoming-trips");
              element?.scrollIntoView({
                behavior: "smooth"
              });
            }} className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
              Ver Caravanas
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 1
          }} className="grid grid-cols-3 gap-8 mt-12 max-w-3xl mx-auto">
            {[{
              number: "500+",
              label: "Torcedores Viajaram"
            }, {
              number: "50+",
              label: "Jogos Realizados"
            }, {
              number: "100%",
              label: "Satisfação"
            }].map((stat, index) => <motion.div key={index} initial={{
              opacity: 0,
              scale: 0.8
            }} animate={{
              opacity: 1,
              scale: 1
            }} transition={{
              delay: 1.2 + index * 0.1
            }} className="text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-primary drop-shadow-lg mb-2">
                  {stat.number}
                </h3>
                <p className="text-sm text-white/90 drop-shadow-md">{stat.label}</p>
              </motion.div>)}
          </motion.div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }} className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <motion.div animate={{
        y: [0, 10, 0]
      }} transition={{
        duration: 1.5,
        repeat: Infinity
      }} className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex items-start justify-center p-2">
          <motion.div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};
export default Hero;