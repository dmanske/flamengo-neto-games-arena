import React from "react";
import { Toaster } from "sonner";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { HeroSection } from "@/components/ui/hero-section";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <NavigationBar />
      
      {/* Hero Section with Main Video */}
      <HeroSection />
      
      {/* Seção de Próximas Viagens Simplificada */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Próximas Viagens</h2>
          <p className="text-lg text-gray-600 mb-8">
            Em breve, novas viagens serão disponibilizadas aqui!
          </p>
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-8 rounded-xl max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">🔥 Flamengo x Adversário</h3>
            <p className="mb-4">Data: Em breve</p>
            <p className="mb-6">Local: A definir</p>
            <button className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Reservar Vaga
            </button>
          </div>
        </div>
      </section>
      
      {/* Seção Como Funciona */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Escolha sua Viagem</h3>
              <p className="text-gray-600">Selecione o jogo do Flamengo que deseja assistir</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Reserve sua Vaga</h3>
              <p className="text-gray-600">Faça sua reserva de forma rápida e segura</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Viva a Experiência</h3>
              <p className="text-gray-600">Curta o jogo com conforto e segurança</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção de Contato */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Entre em Contato</h2>
          <p className="text-xl text-red-200 mb-8">
            Dúvidas? Fale conosco!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h3 className="text-xl font-bold mb-4">WhatsApp</h3>
              <p className="text-red-200">(21) 99999-9999</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Email</h3>
              <p className="text-red-200">contato@netotours.com</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-red-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-900 font-bold text-sm">NT</span>
            </div>
            <span className="text-xl font-bold">Neto Tours</span>
          </div>
          <p className="text-red-200">
            © 2024 Neto Tours - Caravanas Rubro-Negras. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;