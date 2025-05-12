
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const WhatsappBotSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <MessageSquare className="h-8 w-8 text-red-600 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-center">Robô WhatsApp</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Atendimento Automático</h3>
              <p className="text-gray-600 mb-6">
                Nossa tecnologia de atendimento automatizado via WhatsApp garante que você receba todas as informações importantes sobre sua viagem em tempo real.
              </p>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold mb-2">Confirmação de Reserva</h4>
                  <p className="text-gray-600">Receba a confirmação instantânea após realizar sua reserva, com todos os detalhes da sua viagem.</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold mb-2">Lembretes de Embarque</h4>
                  <p className="text-gray-600">Um dia antes da viagem, nosso robô enviará um lembrete com o horário e local de embarque.</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-bold mb-2">Dúvidas Frequentes</h4>
                  <p className="text-gray-600">Obtenha respostas rápidas para as perguntas mais comuns sobre a viagem, a qualquer momento.</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="relative max-w-xs">
                <div className="bg-[#128C7E] rounded-t-lg p-3">
                  <div className="text-white text-center">NetoTours</div>
                </div>
                <div className="bg-[#E5DDD5] h-96 p-3 rounded-b-lg overflow-hidden flex flex-col">
                  <div className="flex-grow space-y-3">
                    <div className="bg-white p-3 rounded-lg max-w-[75%] ml-auto">
                      Olá! Gostaria de informações sobre a próxima viagem para o jogo do Flamengo.
                    </div>
                    <div className="bg-white p-3 rounded-lg max-w-[75%]">
                      Olá! Temos excursão para Flamengo x Botafogo no dia 15/10/2025. Valor: R$150,00. Saída: 14/10 às 22h. Deseja reservar?
                    </div>
                    <div className="bg-white p-3 rounded-lg max-w-[75%] ml-auto">
                      Sim! Como faço para reservar?
                    </div>
                    <div className="bg-white p-3 rounded-lg max-w-[75%]">
                      Ótimo! Clique neste link para fazer sua reserva: [LINK]. Após a confirmação do pagamento, enviaremos todos os detalhes.
                    </div>
                  </div>
                  <div className="flex items-center mt-2">
                    <input 
                      type="text" 
                      placeholder="Digite sua mensagem" 
                      className="flex-grow rounded-full px-4 py-2 text-sm bg-white border-none outline-none"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsappBotSection;
