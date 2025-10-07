import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";

// Import images
import tripFlaFlu from "@/assets/landing/trip-fla-flu.jpg";
import tripFlaVasco from "@/assets/landing/trip-fla-vasco.jpg";
import tripFlaBotafogo from "@/assets/landing/trip-fla-botafogo.jpg";

export const galleryEvents = [
  {
    id: "fla-flu-2024",
    title: "Flamengo vs Fluminense",
    slug: "fla-flu-2024",
    date: "15 de Março, 2024",
    location: "Maracanã",
    participants: 45,
    photos: 120,
    image: tripFlaFlu,
    description: "Clássico Fla-Flu em grande estilo no Maracanã",
    category: "Clássico",
  },
  {
    id: "fla-vasco-2024",
    title: "Flamengo vs Vasco",
    slug: "fla-vasco-2024",
    date: "22 de Abril, 2024",
    location: "Maracanã",
    participants: 50,
    photos: 150,
    image: tripFlaVasco,
    description: "Clássico dos Milhões com festa garantida",
    category: "Clássico",
  },
  {
    id: "fla-botafogo-2024",
    title: "Flamengo vs Botafogo",
    slug: "fla-botafogo-2024",
    date: "10 de Maio, 2024",
    location: "Maracanã",
    participants: 42,
    photos: 98,
    image: tripFlaBotafogo,
    description: "Derby carioca com emoção até o último minuto",
    category: "Clássico",
  },
];

interface GalleryGridProps {
  showTitle?: boolean;
}

const GalleryGrid = ({ showTitle = true }: GalleryGridProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Nossas Memórias
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Galeria de <span className="text-primary">Caravanas</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Reviva os melhores momentos das nossas caravanas. Cada jogo, cada emoção, cada vitória eternizada em fotos.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden bg-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    {event.category}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {event.title}
                    </h3>
                    <p className="text-white/80 text-sm">{event.description}</p>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{event.participants} pessoas</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-primary font-semibold">{event.photos} fotos</span>
                    </div>
                  </div>

                  <Link to={`/galeria/${event.slug}`}>
                    <Button className="w-full group/btn" variant="default">
                      Ver Galeria Completa
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryGrid;
