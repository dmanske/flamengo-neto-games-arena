import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Bus, CheckCircle, Loader2, Trophy } from "lucide-react";
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
  local_jogo: string;
  cidade_embarque: string;
  nome_estadio: string | null;
  valor_padrao: number | null;
  logo_flamengo: string | null;
  logo_adversario: string | null;
  status_viagem: string;
}

// Interface para trip formatada
interface CompletedTrip {
  id: string;
  opponentLogo: string;
  title: string;
  date: string;
  location: string;
  championship: string;
  busType: string;
  departure: string;
  price: string;
  status: string;
}

// Função para determinar o tipo de campeonato baseado no adversário
const getTipoJogo = (adversario: string): string => {
  const classicos = ['Vasco', 'Botafogo', 'Fluminense'];
  const libertadores = ['Racing', 'Peñarol', 'River Plate', 'Boca Juniors'];
  
  if (classicos.some(time => adversario.includes(time))) {
    return 'Clássico';
  } else if (libertadores.some(time => adversario.includes(time))) {
    return 'Libertadores';
  } else {
    return 'Brasileirão';
  }
};

// Função para formatar viagem do Supabase para CompletedTrip
const formatarViagemRealizada = (viagem: ViagemSupabase): CompletedTrip => {
  const dataJogo = new Date(viagem.data_jogo);
  const dataFormatada = format(dataJogo, "dd/MM/yyyy", { locale: ptBR });
  
  const preco = viagem.valor_padrao 
    ? `R$ ${viagem.valor_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : 'Consulte';
    
  const estadio = viagem.nome_estadio || 'Estádio';
  const cidade = viagem.local_jogo || 'Cidade';
  const embarque = viagem.cidade_embarque || 'Blumenau';

  return {
    id: viagem.id,
    opponentLogo: viagem.logo_adversario || `https://via.placeholder.com/100x100?text=${viagem.adversario.substring(0, 3).toUpperCase()}`,
    title: `Flamengo x ${viagem.adversario}`,
    date: dataFormatada,
    location: `${estadio} - ${cidade}`,
    championship: getTipoJogo(viagem.adversario),
    busType: "Executivo com ar condicionado",
    departure: `Embarque: ${embarque}`,
    price: preco,
    status: "Realizada com Sucesso"
  };
};

const CompletedTrips = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Buscar viagens realizadas do Supabase
  useEffect(() => {
    const buscarViagensRealizadas = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const hoje = new Date().toISOString();
        
        const { data, error: supabaseError } = await supabase
          .from('viagens')
          .select(`
            id, adversario, data_jogo, local_jogo, cidade_embarque,
            nome_estadio, valor_padrao, logo_flamengo, logo_adversario, status_viagem
          `)
          .lt('data_jogo', hoje)
          .order('data_jogo', { ascending: false })
          .limit(showAll ? 50 : 6);

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const viagensFormatadas = data.map(formatarViagemRealizada);
          setTrips(viagensFormatadas);
        }

      } catch (err) {
        console.error('Erro ao buscar viagens realizadas:', err);
        setError('Erro ao carregar histórico. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    buscarViagensRealizadas();
  }, [showAll]);

  const handleShowMore = () => {
    setShowAll(true);
  };

  return (
    <section id="completed-trips" ref={ref} className="py-20 bg-gradient-to-b from-muted/30 to-background" style={{ scrollMarginTop: '80px' }}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Viagens <span className="text-gradient">Realizadas</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Confira nosso histórico de sucesso! Mais de 1.000 viagens realizadas com segurança e alegria.
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-lg">Carregando histórico de viagens...</span>
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
            <Trophy className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma viagem realizada</h3>
            <p className="text-gray-600">
              O histórico de viagens aparecerá aqui conforme forem sendo realizadas.
            </p>
          </div>
        )}

        {/* Trips Grid */}
        {!isLoading && !error && trips.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="group relative overflow-hidden transition-all duration-300 h-full flex flex-col opacity-90 hover:opacity-100">
                    {/* Banner Dinâmico com filtro cinza */}
                    <div className="relative">
                      <TripBanner 
                        title={trip.title}
                        flamengoLogo={flamengoLogo}
                        opponentLogo={trip.opponentLogo}
                        championship={trip.championship}
                      />
                      {/* Overlay cinza para indicar "realizada" */}
                      <div className="absolute inset-0 bg-gray-900/20"></div>
                    </div>
                    


                    {/* Conteúdo */}
                    <CardContent className="p-6 flex-grow flex flex-col">
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium">{trip.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span>{trip.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Bus className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span>{trip.busType}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{trip.departure}</span>
                        </div>
                      </div>

                      {/* Status de Sucesso */}
                      <div className="mt-auto text-center">
                        <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
                          <CheckCircle className="h-5 w-5" />
                          <span>{trip.status}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Botão Ver Mais */}
            {!showAll && trips.length >= 6 && (
              <div className="text-center mt-12">
                <Button 
                  onClick={handleShowMore}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Ver Mais Viagens Realizadas
                </Button>
              </div>
            )}


          </>
        )}
      </div>
    </section>
  );
};

export default CompletedTrips;