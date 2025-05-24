
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  rota: string;
  capacidade_onibus: number;
  valor_padrao: number;
  status_viagem: string;
  logo_adversario?: string;
}

const Loja = () => {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('*')
          .eq('status_viagem', 'Aberta')
          .order('data_jogo', { ascending: true });

        if (error) throw error;

        setViagens(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar viagens:', error);
        toast.error('Erro ao carregar viagens disponíveis');
      } finally {
        setLoading(false);
      }
    };

    fetchViagens();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white p-4">
        <div className="container mx-auto py-8">
          <div className="text-center">Carregando viagens...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            🔴⚫ Loja de Viagens Flamengo
          </h1>
          <p className="text-gray-600 text-lg">
            Reserve sua vaga nas próximas viagens do Mengão!
          </p>
        </div>

        {viagens.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">
              Nenhuma viagem disponível no momento
            </h2>
            <p className="text-gray-500">
              Fique ligado nas nossas redes sociais para não perder as próximas viagens!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {viagens.map((viagem) => (
              <Card key={viagem.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="bg-red-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        🔴
                      </div>
                      <span className="text-sm font-medium">VS</span>
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs">
                        {viagem.logo_adversario ? (
                          <img 
                            src={viagem.logo_adversario} 
                            alt={viagem.adversario}
                            className="w-6 h-6 object-contain"
                          />
                        ) : (
                          viagem.adversario.substring(0, 3).toUpperCase()
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-white text-red-600">
                      {viagem.status_viagem}
                    </Badge>
                  </div>
                  <CardTitle className="mt-2">
                    Flamengo x {viagem.adversario}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(viagem.data_jogo)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{viagem.rota}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{viagem.capacidade_onibus} vagas</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                    <DollarSign className="h-4 w-4" />
                    <span>{formatCurrency(viagem.valor_padrao)}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
                    onClick={() => navigate(`/cadastro-publico?viagem=${viagem.id}`)}
                  >
                    Reservar Vaga
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loja;
