
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Users, DollarSign, ArrowLeft, Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";
import { EnhancedCard } from "@/components/ui/enhanced-card";

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
      <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white text-lg">Carregando viagens disponíveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 to-black/50"></div>
        <div className="container mx-auto relative z-10">
          <Button 
            onClick={() => navigate("/")} 
            variant="ghost" 
            className="text-white hover:bg-white/10 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Site
          </Button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-red-100 font-medium">Loja Oficial</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              🔴⚫ Neto Tours
              <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
                Flamengo
              </span>
            </h1>
            
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Reserve sua vaga nas próximas viagens do Mengão! Pagamento seguro e confirmação imediata.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {viagens.length === 0 ? (
          <EnhancedCard variant="glass" className="text-center py-16 max-w-2xl mx-auto">
            <div className="mb-6">
              <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Em Breve Novas Viagens!
              </h2>
              <p className="text-red-200 text-lg">
                Estamos preparando as próximas caravanas do Mengão. 
                Fique ligado nas nossas redes sociais para não perder nenhuma oportunidade!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/")}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Voltar ao Site
              </Button>
              <Button 
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
              >
                Receber Notificações
              </Button>
            </div>
          </EnhancedCard>
        ) : (
          <>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Próximas Viagens Disponíveis ({viagens.length})
              </h2>
              <p className="text-red-200">
                Clique em "Reservar Agora" para fazer sua reserva com pagamento seguro via Stripe
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {viagens.map((viagem, index) => (
                <EnhancedCard 
                  key={viagem.id} 
                  variant="interactive"
                  className="overflow-hidden group"
                  glow={index === 0}
                >
                  {index === 0 && (
                    <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 font-bold">
                      ⭐ DESTAQUE ⭐
                    </div>
                  )}
                  
                  <CardHeader className="bg-red-600 text-white p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          🔴
                        </div>
                        <span className="text-lg font-medium">VS</span>
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          {viagem.logo_adversario ? (
                            <img 
                              src={viagem.logo_adversario} 
                              alt={viagem.adversario}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-black text-sm font-bold">
                              {viagem.adversario.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        {viagem.status_viagem}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">
                      Flamengo x {viagem.adversario}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-6 space-y-4 bg-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-2 text-red-200">
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">{formatDate(viagem.data_jogo)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-red-200">
                      <MapPin className="h-5 w-5" />
                      <span>{viagem.rota}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-red-200">
                      <Users className="h-5 w-5" />
                      <span>{viagem.capacidade_onibus} vagas disponíveis</span>
                    </div>
                    
                    <div className="border-t border-red-500/20 pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-red-200">Valor:</span>
                        <span className="text-3xl font-bold text-white">
                          {formatCurrency(viagem.valor_padrao)}
                        </span>
                      </div>
                      
                      <CheckoutButton
                        tripId={viagem.id}
                        price={viagem.valor_padrao}
                        description={`Viagem Flamengo x ${viagem.adversario} - ${viagem.rota}`}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        Reservar Agora 🎫
                      </CheckoutButton>
                    </div>
                    
                    <p className="text-xs text-red-300 text-center mt-2">
                      Pagamento seguro via Stripe • Confirmação imediata
                    </p>
                  </CardContent>
                </EnhancedCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Loja;
