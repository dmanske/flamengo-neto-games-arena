
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Plus, User, MapPin } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
}

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [passageirosCount, setPassageirosCount] = useState<Record<string, number>>({});

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
                  <CardTitle className="text-xl mt-2">Flamengo x {viagem.adversario}</CardTitle>
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
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, ((passageirosCount[viagem.id] || 0) / viagem.capacidade_onibus) * 100)}%` 
                              }}
                            />
                          </div>
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
