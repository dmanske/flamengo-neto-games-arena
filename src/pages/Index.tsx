
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Star, ArrowRight, Play, Trophy, Bus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { ModernButton } from "@/components/ui/modern-button";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-red-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-yellow-500/10 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
              <img src="https://logodetimes.com/wp-content/uploads/flamengo.png" alt="Flamengo" className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Neto Tours</h1>
              <p className="text-red-200 text-sm">Caravanas Rubro-Negras</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <ModernButton variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </ModernButton>
            <ModernButton variant="primary" asChild>
              <Link to="/cadastro-publico">Cadastrar</Link>
            </ModernButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">Rumo ao Hexa Mundial</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Viva a Paixão
            <br />
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
              Rubro-Negra
            </span>
          </h1>
          
          <p className="text-xl text-red-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Acompanhe o Mengão em grande estilo! Caravanas oficiais para todos os jogos no Maracanã com conforto, segurança e muita festa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ModernButton size="lg" className="group" asChild>
              <Link to="/loja">
                <Calendar className="w-5 h-5" />
                Ver Próximas Viagens
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </ModernButton>
            
            <ModernButton variant="glass" size="lg" className="group">
              <Play className="w-5 h-5" />
              Assistir Vídeo
            </ModernButton>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {[
            { label: "Viagens Realizadas", value: "150+", icon: Bus },
            { label: "Torcedores Felizes", value: "5.000+", icon: Users },
            { label: "Anos de Experiência", value: "12+", icon: Trophy },
            { label: "Avaliação Média", value: "4.9★", icon: Star }
          ].map((stat, index) => (
            <GlassCard key={index} variant="elevated" className="text-center p-6 hover:scale-105 transition-transform duration-300">
              <stat.icon className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-red-200 text-sm">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Featured Trip */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Próxima Viagem Destacada</h2>
          
          <GlassCard variant="elevated" className="overflow-hidden">
            <div className="relative h-64 bg-gradient-to-r from-red-600 via-red-700 to-black">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="flex items-center justify-center gap-8 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <img src="https://logodetimes.com/wp-content/uploads/flamengo.png" alt="Flamengo" className="w-12 h-12" />
                    </div>
                    <div className="text-3xl font-bold">VS</div>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <span className="text-2xl font-bold">PAL</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Flamengo x Palmeiras</h3>
                  <p className="text-red-200">Maracanã • Campeonato Brasileiro</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-white">15 de Dezembro</div>
                    <div className="text-red-200 text-sm">Domingo, 16:00</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-white">Saída: Barra</div>
                    <div className="text-red-200 text-sm">Retorno incluído</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-red-500" />
                  <div>
                    <div className="font-semibold text-white">23 vagas restantes</div>
                    <div className="text-red-200 text-sm">de 45 disponíveis</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">R$ 85,00</div>
                  <div className="text-red-200 text-sm">por pessoa</div>
                </div>
                
                <ModernButton size="lg" asChild>
                  <Link to="/cadastro-publico">
                    Reservar Agora
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </ModernButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Por que escolher a Neto Tours?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Bus,
                title: "Ônibus Premium",
                description: "Frota moderna com ar-condicionado, poltronas reclináveis e entretenimento a bordo."
              },
              {
                icon: Users,
                title: "Grupo Animado",
                description: "Viaje com torcedores apaixonados e viva a emoção antes, durante e depois do jogo."
              },
              {
                icon: Trophy,
                title: "Experiência Completa",
                description: "Mais de 12 anos organizando caravanas com segurança e diversão garantida."
              }
            ].map((feature, index) => (
              <GlassCard key={index} variant="interactive" className="text-center p-8 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-red-200 leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto para viver essa emoção?</h2>
          <p className="text-xl text-red-200 mb-8 max-w-2xl mx-auto">
            Cadastre-se agora e garante sua vaga nas próximas caravanas rubro-negras!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ModernButton size="lg" asChild>
              <Link to="/cadastro-publico">
                Fazer Cadastro
                <ArrowRight className="w-5 h-5" />
              </Link>
            </ModernButton>
            
            <ModernButton variant="secondary" size="lg" asChild>
              <Link to="/loja">Ver Todas as Viagens</Link>
            </ModernButton>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center">
                <img src="https://logodetimes.com/wp-content/uploads/flamengo.png" alt="Flamengo" className="w-6 h-6" />
              </div>
              <div>
                <div className="text-white font-bold">Neto Tours</div>
                <div className="text-red-200 text-sm">Caravanas Oficiais</div>
              </div>
            </div>
            
            <div className="text-red-200 text-sm">
              © 2024 Neto Tours. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
