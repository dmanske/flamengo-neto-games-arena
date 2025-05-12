
import React from "react";
import { CreditCard, Bus, Calendar } from "lucide-react";

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Como Funciona</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">1. Compra da Passagem</h3>
            <p className="text-gray-600">
              Escolha sua viagem, reserve seu lugar de forma rápida e segura através do nosso sistema de pagamento.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
              <Bus className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">2. Embarque</h3>
            <p className="text-gray-600">
              Nossos ônibus partem um dia antes do jogo para garantir que você chegue com tranquilidade ao estádio.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">3. Retorno</h3>
            <p className="text-gray-600">
              Logo após o final da partida, nossos ônibus estarão prontos para trazer você de volta com segurança.
            </p>
          </div>
        </div>
        
        <div className="mt-16 bg-gray-50 p-6 md:p-10 rounded-xl max-w-3xl mx-auto">
          <h3 className="text-xl font-bold mb-4 text-center">Comunicação Direta</h3>
          <p className="text-center text-gray-600">
            Após a confirmação da sua reserva, você receberá todas as informações e atualizações importantes diretamente pelo WhatsApp, como horários de embarque, pontos de encontro e outras orientações necessárias para sua viagem.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
