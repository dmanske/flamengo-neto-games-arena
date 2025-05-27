
import React, { useState, useEffect } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ShoppingBag, MapPin, Calendar, Users, ArrowRight, Zap } from "lucide-react";
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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

export const StoreSection = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('*')
          .eq('status_viagem', 'Aberta')
          .order('data_jogo', { ascending: true })
          .limit(3);

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

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-red-900/30 to-black/60"></div>
      <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <ShoppingBag className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">Loja Oficial</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Reserve Sua
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
              Viagem
            </span>
          </h2>
          
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Garante sua vaga nas próximas viagens do Mengão! Pagamento seguro via Stripe 
            e confirmação imediata da sua reserva.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-red-200 mt-4">Carregando viagens disponíveis...</p>
          </div>
        ) : viagens.length === 0 ? (
          <EnhancedCard variant="glass" className="text-center py-16">
            <h3 className="text-2xl font-bold text-white mb-4">
              Nenhuma viagem disponível no momento
            </h3>
            <p className="text-red-200 mb-6">
              Fique ligado nas nossas redes sociais para não perder as próximas oportunidades!
            </p>
            <button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200">
              Receber Notificações
            </button>
          </EnhancedCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {viagens.map((viagem, index) => (
                <EnhancedCard 
                  key={viagem.id}
                  variant="interactive"
                  className="group overflow-hidden"
                  glow={index === 0}
                >
                  {index === 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 text-sm font-bold">
                      <Zap className="w-4 h-4 inline mr-1" />
                      DESTAQUE
                    </div>
                  )}
                  
                  <div className={`p-6 ${index === 0 ? 'pt-12' : ''}`}>
                    {/* Header com logos */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">FLA</span>
                        </div>
                        <span className="text-gray-400 font-medium">VS</span>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          {viagem.logo_adversario ? (
                            <img 
                              src={viagem.logo_adversario} 
                              alt={viagem.adversario}
                              className="w-6 h-6 object-contain"
                            />
                          ) : (
                            <span className="text-gray-800 text-xs font-bold">
                              {viagem.adversario.substring(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                        Disponível
                      </div>
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-xl font-bold text-white mb-4">
                      Flamengo x {viagem.adversario}
                    </h3>
                    
                    {/* Informações */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-red-200">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(viagem.data_jogo)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-red-200">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{viagem.rota}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-red-200">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{viagem.capacidade_onibus} vagas disponíveis</span>
                      </div>
                    </div>
                    
                    {/* Preço */}
                    <div className="border-t border-red-500/20 pt-4 mb-6">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">
                          {formatCurrency(viagem.valor_padrao)}
                        </span>
                        <p className="text-red-300 text-sm mt-1">por pessoa</p>
                      </div>
                    </div>
                    
                    {/* Botão de Compra */}
                    <CheckoutButton
                      tripId={viagem.id}
                      price={viagem.valor_padrao}
                      description={`Viagem para ${viagem.adversario} - ${viagem.rota}`}
                      className="w-full group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      <span className="flex items-center justify-center gap-2">
                        Reservar Agora
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CheckoutButton>
                  </div>
                </EnhancedCard>
              ))}
            </div>
            
            {/* Link para ver todas as viagens */}
            <div className="text-center">
              <a 
                href="/loja" 
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200 transform hover:scale-105"
              >
                Ver Todas as Viagens
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
