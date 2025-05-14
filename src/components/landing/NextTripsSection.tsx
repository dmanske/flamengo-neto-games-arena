
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, Users, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LoadingSpinner from "./LoadingSpinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Trip {
  id: string;
  data_jogo: string;
  rota: string;
  valor_padrao: number;
  adversario: string;
  capacidade_onibus: number;
  logo_flamengo: string;
  logo_adversario: string;
  passageiros_count?: number;
}

const NextTripsSection = () => {
  const isMobile = useIsMobile();
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['upcoming-trips'],
    queryFn: async () => {
      // Get current date in ISO format
      const today = new Date().toISOString();

      const { data, error } = await supabase
        .from('viagens')
        .select(`
          id, 
          data_jogo, 
          rota, 
          valor_padrao, 
          adversario, 
          capacidade_onibus,
          logo_flamengo,
          logo_adversario
        `)
        .gte('data_jogo', today)
        .order('data_jogo', { ascending: true })
        .limit(4);

      if (error) throw error;

      // For each trip, get the count of passengers
      const tripsWithCount = await Promise.all(
        (data || []).map(async (trip) => {
          const { count, error: countError } = await supabase
            .from('viagem_passageiros')
            .select('*', { count: 'exact', head: true })
            .eq('viagem_id', trip.id);
          
          return { 
            ...trip, 
            passageiros_count: count || 0 
          };
        })
      );

      return tripsWithCount;
    }
  });

  const initiateReservation = async (trip: Trip) => {
    window.location.href = `/cadastro-publico?viagem=${trip.id}`;
  };

  return (
    <section id="next-trips" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Próximas Viagens</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            Erro ao carregar as próximas viagens. Tente novamente mais tarde.
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all">
                {/* Header with Flamengo gradient */}
                <div className="bg-gradient-to-r from-red-600 to-black text-white p-4">
                  <h3 className="font-bold text-xl">Caravana Rubro-Negra</h3>
                </div>
                
                {/* Team logos section */}
                <div className="flex items-center justify-center gap-6 py-6 bg-white">
                  <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={trip.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                      alt="Flamengo" 
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="text-2xl font-bold text-gray-800">×</div>
                  <div className="h-16 w-16 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img 
                      src={trip.logo_adversario || `https://via.placeholder.com/150?text=${trip.adversario.substring(0, 3).toUpperCase()}`}
                      alt={trip.adversario}
                      className="h-12 w-12 object-contain"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://via.placeholder.com/150?text=${trip.adversario.substring(0, 3).toUpperCase()}`;
                      }}
                    />
                  </div>
                </div>
                
                <CardContent className="bg-white p-6">
                  <h4 className="font-bold text-xl mb-5">Flamengo x {trip.adversario}</h4>
                  
                  {/* Details with icons */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center text-red-600">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <span>{format(new Date(trip.data_jogo), "dd 'de' MMMM 'de' yyyy, HH:mm", {locale: ptBR})}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center text-red-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span>{trip.rota}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center text-red-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <span className="font-bold">{formatCurrency(trip.valor_padrao || 0)}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center text-red-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <span className="font-medium">
                        {trip.capacidade_onibus - (trip.passageiros_count || 0)} vagas disponíveis
                      </span>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="space-y-3 mt-6">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 py-6 text-lg"
                      onClick={() => initiateReservation(trip)}
                    >
                      Reservar Vaga <Check className="ml-2 h-5 w-5" />
                    </Button>
                    
                    <CheckoutButton
                      tripId={trip.id}
                      price={trip.valor_padrao}
                      description={`Viagem para Flamengo x ${trip.adversario} - ${trip.rota}`}
                      className="w-full py-6 text-lg"
                    >
                      Pagar Diretamente
                    </CheckoutButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-lg">
            Não há viagens agendadas no momento. Volte em breve!
          </div>
        )}
      </div>
    </section>
  );
};

export default NextTripsSection;
