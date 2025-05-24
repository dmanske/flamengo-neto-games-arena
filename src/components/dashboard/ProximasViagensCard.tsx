
import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { CalendarCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
  logo_adversario: string | null;
  logo_flamengo: string | null;
}

interface ProximasViagensCardProps {
  isLoading: boolean;
  proximasViagens: Viagem[];
}

export const ProximasViagensCard = ({
  isLoading,
  proximasViagens
}: ProximasViagensCardProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd 'de' MMMM 'de' yyyy", {
        locale: ptBR
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-professional border border-gray-100 hover:shadow-professional-md transition-all max-w-lg w-full p-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center rounded-t-xl mb-4">
        <h3 className="text-lg font-semibold tracking-wide drop-shadow-sm m-0 text-white">Próximas Viagens</h3>
      </div>
      <CardContent className="pt-6 bg-white">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <p className="italic text-gray-600">Carregando viagens...</p>
          </div>
        ) : proximasViagens.length > 0 ? (
          <div className="space-y-5">
            {proximasViagens.map(viagem => (
              <div key={viagem.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="h-12 w-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={viagem.logo_flamengo || "https://upload.wikimedia.org/wikipedia/commons/4/43/Flamengo_logo.png"} 
                        alt="Flamengo" 
                        className="h-10 w-10 object-contain" 
                      />
                    </div>
                    <div className="h-12 w-12 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={viagem.logo_adversario || `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`} 
                        alt={viagem.adversario} 
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = `https://via.placeholder.com/150?text=${viagem.adversario.substring(0, 3).toUpperCase()}`;
                        }} 
                        className="h-10 w-10 object-contain" 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-base text-gray-900">
                      Flamengo x {viagem.adversario}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      {formatDate(viagem.data_jogo)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden md:flex items-center gap-1 text-xs text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{viagem.rota}</span>
                  </div>
                  <Link to={`/dashboard/viagem/${viagem.id}`} className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    Detalhes
                  </Link>
                </div>
              </div>
            ))}
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg text-white shadow-professional">
              <Link to="/dashboard/viagens">Ver todas as viagens</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-gray-600">
            <CalendarCheck className="h-12 w-12 mb-2 text-gray-400" />
            <p>Nenhuma viagem programada</p>
            <p className="italic text-sm">
              Clique em "Nova Viagem" para cadastrar
            </p>
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg text-white mt-4 shadow-professional">
              <Link to="/dashboard/cadastrar-viagem">Cadastrar Viagem</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
