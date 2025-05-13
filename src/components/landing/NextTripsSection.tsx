
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import LoadingSpinner from "./LoadingSpinner";

interface Trip {
  id: string;
  data_jogo: string;
  rota: string;
  valor_padrao: number;
  adversario: string;
  logo_adversario: string;
}

const NextTripsSection = () => {
  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['upcoming-trips'],
    queryFn: async () => {
      const today = new Date().toISOString();
      const { data, error } = await supabase
        .from('viagens')
        .select(`
          id, 
          data_jogo, 
          rota, 
          valor_padrao, 
          adversario,
          logo_adversario
        `)
        .gte('data_jogo', today)
        .order('data_jogo', { ascending: true })
        .limit(3);

      if (error) throw error;
      return data as Trip[];
    }
  });

  const initiateReservation = (tripId: string) => {
    window.location.href = `/cadastro-publico?viagem=${tripId}`;
  };

  const formatGameDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd/MM", {locale: ptBR}).toUpperCase();
  };

  return (
    <section id="next-trips" className="py-16 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 uppercase">Próximas Excursões</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            Erro ao carregar as próximas viagens. Tente novamente mais tarde.
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-red-700 rounded-lg overflow-hidden">
                <div className="p-6 text-center">
                  <div className="flex justify-center items-center mb-4">
                    <img 
                      src="https://logodetimes.com/wp-content/uploads/flamengo.png" 
                      alt="Flamengo" 
                      className="h-16 object-contain mr-2"
                    />
                    <h3 className="font-bold text-2xl uppercase">
                      {trip.adversario}
                    </h3>
                    <img 
                      src={trip.logo_adversario || "https://upload.wikimedia.org/wikipedia/commons/8/89/HD_transparent_picture.png"} 
                      alt={trip.adversario} 
                      className="h-16 object-contain ml-2"
                    />
                  </div>
                  
                  <div className="text-sm mb-4 opacity-80">
                    {formatGameDate(trip.data_jogo)} · {trip.rota}
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold">
                      R$ {Math.floor(trip.valor_padrao)}
                    </span>
                    <span className="text-sm uppercase ml-1">
                      /ida e volta
                    </span>
                  </div>
                  
                  <Button 
                    className="bg-black hover:bg-gray-900 text-white w-full uppercase font-bold py-6"
                    onClick={() => initiateReservation(trip.id)}
                  >
                    Reservar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-xl">
            Não há viagens agendadas no momento. Volte em breve!
          </div>
        )}
      </div>
    </section>
  );
};

export default NextTripsSection;
