import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Bus, MessageCircle, Clock } from "lucide-react";
import TripBanner from "@/components/landing/TripBanner";
import flamengoLogo from "@/assets/landing/flamengo-logo-oficial.png";
import logoPalmeiras from "@/assets/landing/logo-palmeiras.png";
import logoRacing from "@/assets/landing/logo-racing.png";
import logoSport from "@/assets/landing/logo-sport.png";
import logoBragantino from "@/assets/landing/logo-bragantino.png";
import logoSantos from "@/assets/landing/logo-santos.png";

interface Trip {
  id: string;
  opponentLogo: string;
  title: string;
  date: string;
  location: string;
  championship: string;
  busType: string;
  departure: string;
  returnTime: string;
  price: string;
  highlights: string[];
  whatsappMessage: string;
}

const upcomingTrips: Trip[] = [
  {
    id: "1",
    opponentLogo: logoPalmeiras,
    title: "Flamengo x Palmeiras",
    date: "19/10/2025",
    location: "Maracanã - RJ",
    championship: "Brasileirão",
    busType: "Executivo com ar condicionado",
    departure: "09:00 - Blumenau (18/10/2025)",
    returnTime: "Após o jogo",
    price: "R$ 890,00",
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage: `Olá! Gostaria de mais informações sobre a viagem:
🏆 Flamengo x Palmeiras
📅 19/10/2025
📍 Maracanã - RJ
🚌 Saída de Blumenau às 09:00 (18/10/2025)
💰 Valor: R$ 890,00

Aguardo retorno!`,
  },
  {
    id: "2",
    opponentLogo: logoRacing,
    title: "Flamengo x Racing",
    date: "22/10/2025",
    location: "Maracanã - RJ",
    championship: "Libertadores",
    busType: "Executivo com ar condicionado",
    departure: "09:00 - Blumenau (21/10/2025)",
    returnTime: "Após o jogo",
    price: "R$ 1.290,00",
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage: `Olá! Gostaria de mais informações sobre a viagem:
🏆 Flamengo x Racing
📅 22/10/2025
📍 Maracanã - RJ
🚌 Saída de Blumenau às 09:00 (21/10/2025)
💰 Valor: R$ 1.290,00

Aguardo retorno!`,
  },
  {
    id: "3",
    opponentLogo: logoSport,
    title: "Flamengo x Sport",
    date: "01/11/2025",
    location: "Maracanã - RJ",
    championship: "Brasileirão",
    busType: "Executivo com ar condicionado",
    departure: "09:00 - Blumenau (31/10/2025)",
    returnTime: "Após o jogo",
    price: "R$ 750,00",
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage: `Olá! Gostaria de mais informações sobre a viagem:
🏆 Flamengo x Sport
📅 01/11/2025
📍 Maracanã - RJ
🚌 Saída de Blumenau às 09:00 (31/10/2025)
💰 Valor: R$ 750,00

Aguardo retorno!`,
  },
  {
    id: "4",
    opponentLogo: logoSantos,
    title: "Flamengo x Santos",
    date: "09/11/2025",
    location: "Maracanã - RJ",
    championship: "Brasileirão",
    busType: "Executivo com ar condicionado",
    departure: "09:00 - Blumenau (08/11/2025)",
    returnTime: "Após o jogo",
    price: "R$ 890,00",
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage: `Olá! Gostaria de mais informações sobre a viagem:
🏆 Flamengo x Santos
📅 09/11/2025
📍 Maracanã - RJ
🚌 Saída de Blumenau às 09:00 (08/11/2025)
💰 Valor: R$ 890,00

Aguardo retorno!`,
  },
  {
    id: "5",
    opponentLogo: logoBragantino,
    title: "Flamengo x Bragantino",
    date: "23/11/2025",
    location: "Maracanã - RJ",
    championship: "Brasileirão",
    busType: "Executivo com ar condicionado",
    departure: "09:00 - Blumenau (22/11/2025)",
    returnTime: "Após o jogo",
    price: "R$ 890,00",
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage: `Olá! Gostaria de mais informações sobre a viagem:
🏆 Flamengo x Bragantino
📅 23/11/2025
📍 Maracanã - RJ
🚌 Saída de Blumenau às 09:00 (22/11/2025)
💰 Valor: R$ 890,00

Aguardo retorno!`,
  },
];

const UpcomingTrips = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleWhatsAppClick = (message: string) => {
    const phoneNumber = "554799921907";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="upcoming-trips" ref={ref} className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Próximas <span className="text-gradient">Viagens</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Garanta sua vaga nas próximas caravanas e não perca nenhum jogo do Mengão!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {upcomingTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="group relative overflow-hidden hover-float hover:shadow-glow transition-all duration-300 h-full flex flex-col">
                {/* Banner Dinâmico */}
                <TripBanner 
                  title={trip.title}
                  flamengoLogo={flamengoLogo}
                  opponentLogo={trip.opponentLogo}
                  championship={trip.championship}
                />
                
                {/* Preço Badge */}
                <div className="px-6 pt-4">
                  <Badge className="bg-green-600/90 backdrop-blur-sm text-white border-0 shadow-lg font-bold text-base px-3 py-1">
                    {trip.price}
                  </Badge>
                </div>

                {/* Conteúdo */}
                <CardContent className="p-6 flex-grow flex flex-col">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-medium">{trip.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{trip.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Bus className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{trip.busType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{trip.departure}</span>
                    </div>
                  </div>

                  {/* Destaques */}
                  <div className="mb-6">
                    <p className="font-semibold mb-2 text-sm">Destaques:</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {trip.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA WhatsApp */}
                  <Button 
                    variant="whatsapp" 
                    className="w-full mt-auto"
                    onClick={() => handleWhatsAppClick(trip.whatsappMessage)}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Tenho Interesse
                  </Button>
                </CardContent>

                {/* Efeito de borda gradiente */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-yellow-400 opacity-0 group-hover:opacity-30 blur transition duration-500 -z-10" />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingTrips;
