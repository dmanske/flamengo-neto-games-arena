
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, User, MapPin } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
  logo_adversario?: string;
}

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

// Mapa com logos de times conhecidos brasileiros
const logosTimesConhecidos: Record<string, string> = {
  "Flamengo": "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png",
  "Fluminense": "https://upload.wikimedia.org/wikipedia/commons/a/a3/FFC_escudo.svg",
  "Vasco": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Club_de_Regatas_Vasco_da_Gama.svg",
  "Botafogo": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Escudo_Botafogo.png",
  "Palmeiras": "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
  "Corinthians": "https://upload.wikimedia.org/wikipedia/commons/5/51/Corinthians_logo.png",
  "São Paulo": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg",
  "Santos": "https://upload.wikimedia.org/wikipedia/commons/5/58/Santos_logo.svg",
  "Cruzeiro": "https://upload.wikimedia.org/wikipedia/commons/9/90/Cruzeiro_Esporte_Clube_%28logo%29.svg",
  "Atlético Mineiro": "https://upload.wikimedia.org/wikipedia/commons/2/27/Clube_Atl%C3%A9tico_Mineiro_logo.svg",
  "Internacional": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg",
  "Grêmio": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Gremio.svg",
  "Bahia": "https://upload.wikimedia.org/wikipedia/commons/a/ac/ECBahia.svg",
  "Sport": "https://upload.wikimedia.org/wikipedia/commons/4/45/Sport_Club_do_Recife.svg",
  "Fortaleza": "https://upload.wikimedia.org/wikipedia/commons/4/40/FortalezaEsporteClube.svg",
  "Ceará": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Ceara_logo.svg",
  "Athletico Paranaense": "https://upload.wikimedia.org/wikipedia/commons/b/b3/CA_Paranaense.svg",
  "Coritiba": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Coritiba_FBC_%282011%29_-_PR.svg",
  "Goiás": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Logo_of_Goias_Esporte_Clube.svg",
  "Vitória": "https://upload.wikimedia.org/wikipedia/commons/0/0c/EC_Vit%C3%B3ria.svg",
  "Ponte Preta": "https://upload.wikimedia.org/wikipedia/commons/0/03/Associa%C3%A7%C3%A3o_Atl%C3%A9tica_Ponte_Preta.svg",
  "Chapecoense": "https://upload.wikimedia.org/wikipedia/commons/e/e4/Associa%C3%A7%C3%A3o_Chapecoense_de_Futebol.svg",
  "América Mineiro": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Escudo_do_Am%C3%A9rica_Futebol_Clube.svg",
  "Cuiabá": "https://upload.wikimedia.org/wikipedia/commons/0/0a/Cuiab%C3%A1_Esporte_Clube_logo.svg",
  "Juventude": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Esporte_Clube_Juventude.svg",
  "Bragantino": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Red_Bull_Bragantino_logo.svg",
  "LDU": "https://upload.wikimedia.org/wikipedia/commons/8/80/Liga_deportiva_universitaria_de_quito_logo.svg",
  "Peñarol": "https://upload.wikimedia.org/wikipedia/commons/a/a8/Pe%C3%B1arol_logo_%282022%29.png",
  "River Plate": "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_Club_Atl%C3%A9tico_River_Plate.svg",
  "Boca Juniors": "https://upload.wikimedia.org/wikipedia/commons/4/41/CABJ70.png",
  "Independiente": "https://upload.wikimedia.org/wikipedia/commons/d/db/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg"
};

// Função para obter o logo do time
const getLogoTime = (time: string, logoSalvo?: string): string => {
  // Se temos um logo salvo no banco, use-o
  if (logoSalvo) {
    return logoSalvo;
  }
  
  // Se o time estiver no nosso mapa de logos conhecidos, retorne o logo
  if (logosTimesConhecidos[time]) {
    return logosTimesConhecidos[time];
  }
  
  // Para times desconhecidos, tentamos escapar o nome para uso em uma URL
  const nomeTimeEscapado = encodeURIComponent(time);
  
  // Usamos API externas para encontrar logos de times
  return `https://www.thesportsdb.com/images/media/team/badge/small/${nomeTimeEscapado.toLowerCase().replace(/\s/g, '')}.png`;
};

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("viagens")
          .select("*")
          .order("data_jogo", { ascending: true });
        
        if (error) {
          throw error;
        }
        
        setViagens(data || []);
        
        // Fetch passenger counts for each trip
        if (data?.length) {
          const passageirosData: Record<string, number> = {};
          
          // In a real implementation, this would fetch actual passenger counts
          // For now, we'll simulate random counts
          data.forEach(viagem => {
            // This is a placeholder. In a real implementation, you would query the 
            // database for the actual count of passengers for each trip
            passageirosData[viagem.id] = Math.floor(Math.random() * viagem.capacidade_onibus);
          });
          
          setPassageirosCount(passageirosData);
        }
      } catch (err) {
        console.error("Erro ao buscar viagens:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagens();
  }, []);

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = (time: string) => {
    setLogoErrors(prev => ({
      ...prev,
      [time]: true
    }));
    console.log(`Erro ao carregar logo do time: ${time}`);
  };

  // Função para obter o logo com tratamento de erro
  const getTeamLogo = (viagem: Viagem) => {
    if (logoErrors[viagem.adversario]) {
      // Se já tivemos um erro com esse time, use placeholder
      return `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3)}`;
    }
    
    // Usar o logo salvo no banco, se disponível
    if (viagem.logo_adversario) {
      return viagem.logo_adversario;
    }
    
    return getLogoTime(viagem.adversario);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Viagens</h1>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/cadastrar-viagem">
            <Plus className="mr-2 h-4 w-4" /> Nova Viagem
          </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <p className="text-muted-foreground">Carregando viagens...</p>
        </div>
      ) : viagens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium">Nenhuma viagem cadastrada</p>
            <p className="text-muted-foreground mt-1">
              Clique em "Nova Viagem" para cadastrar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viagens.map((viagem) => (
            <Link to={`/viagem/${viagem.id}`} key={viagem.id} className="block transition-transform hover:-translate-y-1">
              <Card className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge className={statusColors[viagem.status_viagem as keyof typeof statusColors] || "bg-gray-100"}>
                      {viagem.status_viagem}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-4">
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage 
                            src={logosTimesConhecidos["Flamengo"]}
                            alt="Flamengo"
                            onError={() => console.log("Erro ao carregar logo do Flamengo")}
                          />
                          <AvatarFallback>FLA</AvatarFallback>
                        </Avatar>
                        <Avatar className="h-10 w-10 border-2 border-white">
                          <AvatarImage 
                            src={getTeamLogo(viagem)} 
                            alt={viagem.adversario}
                            onError={() => handleImageError(viagem.adversario)}
                          />
                          <AvatarFallback>{viagem.adversario.substring(0, 3).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      </div>
                      <span>Flamengo x {viagem.adversario}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(viagem.data_jogo)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{viagem.rota}</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Ônibus: {viagem.tipo_onibus} ({viagem.empresa})</p>
                    </div>
                    <div className="pt-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Passageiros confirmados</span>
                            <span>{passageirosCount[viagem.id] || 0} de {viagem.capacidade_onibus}</span>
                          </div>
                          <Progress value={Math.min(100, ((passageirosCount[viagem.id] || 0) / viagem.capacidade_onibus) * 100)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button variant="secondary" className="w-full">Ver Detalhes</Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Viagens;
