import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Bus, MessageCircle, Clock, Loader2 } from "lucide-react";
import TripBanner from "@/components/landing/TripBanner";
import flamengoLogo from "@/assets/landing/flamengo-logo-oficial.png";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Interface para viagem do Supabase
interface ViagemSupabase {
  id: string;
  adversario: string;
  data_jogo: string;
  data_saida: string | null;
  local_jogo: string;
  cidade_embarque: string;
  nome_estadio: string | null;
  valor_padrao: number | null;
  logo_flamengo: string | null;
  logo_adversario: string | null;
  status_viagem: string;
}

// Interface para trip formatada
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
  logoOrder?: {
    primeiro: string;
    segundo: string;
  };
}

// Função para determinar o tipo de campeonato baseado no adversário
const getTipoJogo = (adversario: string, dataJogo?: string): string => {
  const adversarioLower = adversario.toLowerCase();
  
  // Casos específicos manuais
  if (adversarioLower.includes('estudiantes')) {
    return 'Libertadores';
  }
  
  // Casos gerais
  const classicos = ['vasco', 'botafogo', 'fluminense'];
  const libertadores = ['racing', 'peñarol', 'river plate', 'boca juniors'];
  
  if (classicos.some(time => adversarioLower.includes(time))) {
    return 'Clássico';
  } else if (libertadores.some(time => adversarioLower.includes(time))) {
    return 'Libertadores';
  } else {
    return 'Brasileirão';
  }
};

// Função para formatar viagem do Supabase para Trip
const formatarViagem = (viagem: ViagemSupabase): Trip => {
  const dataJogo = new Date(viagem.data_jogo);
  const dataJogoFormatada = format(dataJogo, "dd/MM/yyyy", { locale: ptBR });
  const horaJogoFormatada = format(dataJogo, "HH:mm", { locale: ptBR });
  
  // Data de saída (apenas data, sem horário)
  let dataSaidaInfo = "";
  if (viagem.data_saida) {
    const dataSaida = new Date(viagem.data_saida);
    const dataSaidaFormatada = format(dataSaida, "dd/MM/yyyy", { locale: ptBR });
    dataSaidaInfo = `Saída da Viagem: ${dataSaidaFormatada}`;
  }
  
  const preco = viagem.valor_padrao 
    ? `R$ ${viagem.valor_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'Consulte';
    
  const estadio = viagem.nome_estadio || 'Estádio';
  const cidade = viagem.local_jogo || 'Rio de Janeiro';
  
  // Determinar se é jogo em casa ou fora
  const isJogoEmCasa = cidade.toLowerCase().includes('rio de janeiro') || 
                      cidade.toLowerCase().includes('rio') ||
                      estadio.toLowerCase().includes('maracanã');
  
  // Definir título e logos baseado em casa/fora
  let title, logoOrder;
  if (isJogoEmCasa) {
    // Jogo em casa: Flamengo x Adversário
    title = `Flamengo x ${viagem.adversario}`;
    logoOrder = {
      primeiro: viagem.logo_flamengo || flamengoLogo,
      segundo: viagem.logo_adversario || `https://via.placeholder.com/100x100?text=${viagem.adversario.substring(0, 3).toUpperCase()}`
    };
  } else {
    // Jogo fora: Adversário x Flamengo
    title = `${viagem.adversario} x Flamengo`;
    logoOrder = {
      primeiro: viagem.logo_adversario || `https://via.placeholder.com/100x100?text=${viagem.adversario.substring(0, 3).toUpperCase()}`,
      segundo: viagem.logo_flamengo || flamengoLogo
    };
  }
  
  const whatsappMessage = `Olá! Gostaria de mais informações sobre a viagem:
🏆 ${title}
📅 ${dataJogoFormatada} às ${horaJogoFormatada}
📍 ${estadio} - ${cidade}
🚌 Embarque: Blumenau e outras cidades a consultar
${dataSaidaInfo ? `🗓️ ${dataSaidaInfo}` : ''}
💰 Valor: ${preco}

Aguardo retorno!`;

  return {
    id: viagem.id,
    opponentLogo: logoOrder.segundo,
    title: title,
    date: `Data do Jogo: ${dataJogoFormatada} às ${horaJogoFormatada}`,
    location: `Local do Jogo: ${cidade}`,
    championship: getTipoJogo(viagem.adversario),
    busType: "Executivo com ar condicionado",
    departure: `Embarque: Blumenau e outras cidades a consultar`,
    returnTime: dataSaidaInfo || "Saída a definir",
    price: `Valor: ${preco}`,
    highlights: [
      "Assento confortável e reclinável",
      "Wi-Fi a bordo",
      "Lanche e água inclusos",
      "Seguro viagem",
    ],
    whatsappMessage,
    // Adicionar propriedades para os logos
    logoOrder: logoOrder
  };
};

const UpcomingTrips = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar próximas viagens do Supabase
  useEffect(() => {
    const buscarProximasViagens = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hoje = new Date().toISOString();
        
        const { data, error: supabaseError } = await supabase
          .from('viagens')
          .select(`
            id, adversario, data_jogo, data_saida, local_jogo, cidade_embarque,
            nome_estadio, valor_padrao, logo_flamengo, logo_adversario, status_viagem
          `)
          .gte('data_jogo', hoje)
          .in('status_viagem', ['Aberta', 'Em andamento'])
          .order('data_jogo', { ascending: true })
          .limit(6);

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const viagensFormatadas = data.map(formatarViagem);
          setTrips(viagensFormatadas);
        }

      } catch (err) {
        console.error('Erro ao buscar próximas viagens:', err);
        setError('Erro ao carregar viagens. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    buscarProximasViagens();
  }, []);

  const handleWhatsAppClick = (message: string) => {
    const phoneNumber = "554799921907";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="upcoming-trips" ref={ref} className="py-20 bg-gradient-to-b from-background to-muted/30" style={{ scrollMarginTop: '80px' }}>
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando próximas viagens...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && trips.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma viagem disponível</h3>
            <p className="text-gray-600 mb-6">
              No momento não há viagens programadas. Entre em contato para mais informações!
            </p>
            <Button onClick={() => handleWhatsAppClick("Olá! Gostaria de saber sobre as próximas viagens do Flamengo.")}>
              <MessageCircle className="h-5 w-5 mr-2" />
              Entrar em Contato
            </Button>
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && !error && trips.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {trips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="group relative hover-float hover:shadow-glow transition-all duration-300 h-full flex flex-col">
                {/* Banner Dinâmico */}
                <TripBanner 
                  title={trip.title}
                  flamengoLogo={flamengoLogo}
                  opponentLogo={trip.opponentLogo}
                  championship={trip.championship}
                  logoOrder={trip.logoOrder}
                />
                
                {/* Badge do Valor */}
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
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                      <span>{trip.departure}</span>
                    </div>
                    {trip.returnTime !== "Saída a definir" && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{trip.returnTime}</span>
                      </div>
                    )}

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
                    className="w-full mt-auto bg-green-600 hover:bg-green-700 text-white"
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
        )}
      </div>
    </section>
  );
};

export default UpcomingTrips;
