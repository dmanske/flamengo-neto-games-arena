
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, Users, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

  const initiateCheckout = async (trip: Trip) => {
    window.location.href = `/cadastro-publico?viagem=${trip.id}`;
  };

  return (
    <section id="next-trips" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Próximas Viagens</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-slate-200 h-10 w-10"></div>
              <div className="flex-1 space-y-6 py-1">
                <div className="h-2 bg-slate-200 rounded"></div>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                    <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                  </div>
                  <div className="h-2 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            Erro ao carregar as próximas viagens. Tente novamente mais tarde.
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trips.map((trip) => (
              <Card key={trip.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gray-100 p-4 flex justify-between items-center">
                  <img 
                    src={trip.logo_flamengo} 
                    alt="Flamengo" 
                    className="h-24"
                  />
                  <div className="font-bold text-xl">VS</div>
                  <img 
                    src={trip.logo_adversario || "https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png"} 
                    alt={trip.adversario} 
                    className="h-24"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3">Flamengo x {trip.adversario}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-5 w-5 mr-2 text-red-600" />
                      <span>{format(new Date(trip.data_jogo), "dd 'de' MMMM 'de' yyyy, HH:mm", {locale: ptBR})}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="h-5 w-5 mr-2 text-red-600" />
                      <span>{trip.rota}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <DollarSign className="h-5 w-5 mr-2 text-red-600" />
                      <span>{formatCurrency(trip.valor_padrao || 0)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="h-5 w-5 mr-2 text-red-600" />
                      <span>{trip.capacidade_onibus - (trip.passageiros_count || 0)} vagas disponíveis</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    onClick={() => initiateCheckout(trip)}
                  >
                    Reservar Agora <Check className="ml-2 h-4 w-4" />
                  </Button>
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
