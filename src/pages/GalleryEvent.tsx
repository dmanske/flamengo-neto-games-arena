import "@/styles/landing.css";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";

// Import images
import tripFlaFlu from "@/assets/landing/trip-fla-flu.jpg";
import tripFlaVasco from "@/assets/landing/trip-fla-vasco.jpg";
import tripFlaBotafogo from "@/assets/landing/trip-fla-botafogo.jpg";
import heroMaracana from "@/assets/landing/hero-maracana.jpg";
import flamengoFans from "@/assets/landing/flamengo-fans.jpg";
import busExterior from "@/assets/landing/bus-exterior.jpg";
import busInterior from "@/assets/landing/bus-interior.jpg";

const GalleryEvent = () => {
  const { slug } = useParams();

  const eventsData: Record<string, any> = {
    "fla-flu-2024": {
      title: "Flamengo vs Fluminense",
      date: "15 de Março, 2024",
      location: "Maracanã",
      participants: 45,
      result: "Flamengo 3 x 1 Fluminense",
      description: "Uma tarde inesquecível no Maracanã! O Mengão dominou do início ao fim e conquistou mais uma vitória no clássico Fla-Flu. A torcida fez a festa nas arquibancadas e nossa caravana vibrou a cada gol.",
      highlights: [
        "Ambiente incrível no estádio",
        "Três gols do Mengão",
        "Festa da torcida rubro-negra",
        "Confraternização pós-jogo"
      ],
      photos: [
        { src: tripFlaFlu, alt: "Chegada ao Maracanã" },
        { src: heroMaracana, alt: "Vista do estádio" },
        { src: flamengoFans, alt: "Torcida vibrando" },
        { src: busExterior, alt: "Nossa caravana" },
        { src: busInterior, alt: "Dentro do ônibus" },
        { src: tripFlaFlu, alt: "Momento do gol" },
        { src: heroMaracana, alt: "Festa nas arquibancadas" },
        { src: flamengoFans, alt: "Grupo animado" },
        { src: busExterior, alt: "Retorno feliz" },
      ],
    },
    "fla-vasco-2024": {
      title: "Flamengo vs Vasco",
      date: "22 de Abril, 2024",
      location: "Maracanã",
      participants: 50,
      result: "Flamengo 2 x 0 Vasco",
      description: "O Clássico dos Milhões não decepcionou! Com um Maracanã lotado e vibrante, o Flamengo mostrou sua superioridade e venceu com autoridade. Nossa caravana lotou o ônibus e fez a festa do início ao fim.",
      highlights: [
        "Maracanã lotado e vibrante",
        "Vitória tranquila do Mengão",
        "Caravana com 50 torcedores",
        "Festa pós-clássico"
      ],
      photos: [
        { src: tripFlaVasco, alt: "Preparação para o clássico" },
        { src: heroMaracana, alt: "Maracanã lotado" },
        { src: flamengoFans, alt: "Torcida organizada" },
        { src: busExterior, alt: "Frota completa" },
        { src: busInterior, alt: "Animação no ônibus" },
        { src: tripFlaVasco, alt: "Comemoração do gol" },
        { src: heroMaracana, alt: "Mosaico da torcida" },
        { src: flamengoFans, alt: "Após o jogo" },
      ],
    },
    "fla-botafogo-2024": {
      title: "Flamengo vs Botafogo",
      date: "10 de Maio, 2024",
      location: "Maracanã",
      participants: 42,
      result: "Flamengo 1 x 1 Botafogo",
      description: "Derby emocionante até o último minuto! Em um jogo equilibrado, o Flamengo buscou o empate no final e deixou a torcida em êxtase. Nossa caravana viveu cada lance com muita intensidade.",
      highlights: [
        "Jogo emocionante até o fim",
        "Gol nos acréscimos",
        "Derby carioca clássico",
        "Atmosfera elétrica"
      ],
      photos: [
        { src: tripFlaBotafogo, alt: "Pré-jogo animado" },
        { src: heroMaracana, alt: "Campo do Maracanã" },
        { src: flamengoFans, alt: "Torcida cantando" },
        { src: busExterior, alt: "Chegada ao estádio" },
        { src: busInterior, alt: "Caravana unida" },
        { src: tripFlaBotafogo, alt: "Gol salvador" },
        { src: heroMaracana, alt: "Comemoração" },
        { src: flamengoFans, alt: "Festa da torcida" },
      ],
    },
  };

  const event = slug ? eventsData[slug] : null;

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center landing-page">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Evento não encontrado</h1>
          <Link to="/galeria">
            <Button variant="default">Voltar para Galeria</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background landing-page">
      <Navbar />
      <FloatingWhatsApp />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/galeria">
            <Button variant="ghost" className="mb-6 group">
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Voltar para Galeria
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Galeria do Evento
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span>{event.participants} torcedores</span>
              </div>
            </div>
            <div className="bg-card border border-primary rounded-lg p-4 inline-block mb-6">
              <p className="text-2xl font-bold text-primary">{event.result}</p>
            </div>
            <p className="text-lg text-foreground max-w-3xl">{event.description}</p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-8 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-foreground">Destaques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {event.highlights.map((highlight: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-background border border-border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <p className="text-foreground font-medium">✓ {highlight}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Galeria de Fotos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {event.photos.map((photo: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer"
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-medium">{photo.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GalleryEvent;
