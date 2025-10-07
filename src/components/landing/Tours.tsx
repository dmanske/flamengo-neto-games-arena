import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Camera, Landmark, Trophy, MessageCircle } from "lucide-react";
import cristoRedentor from "@/assets/landing/cristo-redentor.jpg";
import paoDeAcucar from "@/assets/landing/pao-de-acucar.jpg";
import tourMaracana from "@/assets/landing/tour-maracana.jpg";
import escadariaSelaron from "@/assets/landing/escadaria-selaron.jpg";
import arcosLapa from "@/assets/landing/arcos-lapa.jpg";
import theatroMunicipal from "@/assets/landing/theatro-municipal.jpg";
import catedralMetropolitana from "@/assets/landing/catedral-metropolitana.jpg";
import jardimBotanico from "@/assets/landing/jardim-botanico.jpg";
import praiasRio from "@/assets/landing/praias-rio.jpg";

interface Tour {
  id: string;
  title: string;
  description: string;
  duration: string;
  highlights: string[];
  image: string;
  icon: React.ReactNode;
}

const mainTours: Tour[] = [
  {
    id: "1",
    title: "Cristo Redentor",
    description: "Visite uma das Sete Maravilhas do Mundo Moderno e tenha uma vista panorâmica de 360° do Rio de Janeiro. Uma experiência única e inesquecível!",
    duration: "4 horas",
    highlights: [
      "Transporte ida e volta",
      "Ingresso para o Cristo Redentor",
      "Vista panorâmica da cidade",
      "Tempo livre para fotos"
    ],
    image: cristoRedentor,
    icon: <Landmark className="h-6 w-6" />
  },
  {
    id: "2",
    title: "Pão de Açúcar",
    description: "Suba de bondinho e contemple a beleza do Rio de Janeiro do alto do Pão de Açúcar. Vista incrível da Baía de Guanabara e da cidade maravilhosa!",
    duration: "3 horas",
    highlights: [
      "Transporte ida e volta",
      "Ingresso para o Pão de Açúcar",
      "2 trajetos de bondinho",
      "Vista da Baía de Guanabara",
      "Morro da Urca incluído"
    ],
    image: paoDeAcucar,
    icon: <Camera className="h-6 w-6" />
  },
  {
    id: "3",
    title: "Tour do Maracanã",
    description: "Conheça o templo sagrado do Flamengo e do futebol brasileiro! Visite os bastidores, vestiários, sala de imprensa e pise no gramado mais famoso do Brasil.",
    duration: "2 horas",
    highlights: [
      "Acesso aos bastidores do estádio",
      "Visita aos vestiários",
      "Sala de imprensa",
      "Campo e arquibancadas",
      "Museu do Futebol",
      "Loja oficial do Flamengo"
    ],
    image: tourMaracana,
    icon: <Trophy className="h-6 w-6" />
  }
];

const additionalAttractions = [
  {
    title: "Escadaria Selarón",
    description: "Obra de arte icônica com mais de 2.000 azulejos coloridos",
    image: escadariaSelaron,
  },
  {
    title: "Arcos da Lapa",
    description: "Aqueduto histórico e símbolo da boemia carioca",
    image: arcosLapa,
  },
  {
    title: "Theatro Municipal",
    description: "Arquitetura deslumbrante e história cultural do Rio",
    image: theatroMunicipal,
  },
  {
    title: "Catedral Metropolitana",
    description: "Arquitetura moderna única em forma cônica",
    image: catedralMetropolitana,
  },
  {
    title: "Jardim Botânico",
    description: "Natureza exuberante com mais de 6.500 espécies de plantas",
    image: jardimBotanico,
  },
  {
    title: "Praias de Copacabana e Ipanema",
    description: "As praias mais famosas do mundo",
    image: praiasRio,
  }
];

const Tours = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleWhatsAppClick = (tourTitle: string) => {
    const phoneNumber = "554799921907";
    const message = encodeURIComponent(`Olá! Gostaria de mais informações sobre o passeio: ${tourTitle}`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <section id="tours" ref={ref} className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Passeios no <span className="text-gradient">Rio de Janeiro</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Além do futebol, aproveite para conhecer as maravilhas da Cidade Maravilhosa!
          </p>
        </motion.div>

        {/* Tours Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
          {mainTours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover-float h-full flex flex-col group">
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm flex items-center gap-2 border-0 shadow-lg">
                    {tour.icon}
                    {tour.title}
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{tour.title}</CardTitle>
                  <CardDescription className="text-base">
                    {tour.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <div className="space-y-4 flex-grow">
                    <div>
                      <p className="font-semibold mb-2">O que está incluído:</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {tour.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Outras Atrações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">
              Outras <span className="text-gradient">Atrações</span>
            </h3>
            <p className="text-muted-foreground">
              Explore outros pontos turísticos icônicos da cidade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalAttractions.map((attraction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <Card className="hover:shadow-glow transition-all duration-300 hover-float h-full overflow-hidden group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={attraction.image} 
                      alt={attraction.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <CardTitle className="text-lg">{attraction.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {attraction.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Final */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Interessado nos Passeios?
              </h3>
              <p className="text-muted-foreground mb-6">
                Entre em contato pelo WhatsApp para mais informações sobre os passeios turísticos 
                e combine sua viagem do Flamengo com um tour pela cidade!
              </p>
              <Button 
                variant="whatsapp" 
                size="lg"
                onClick={() => handleWhatsAppClick("Passeios Turísticos no Rio")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Tours;
