
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, Clock, Zap, Bot } from "lucide-react";

const WhatsappBotSection = () => {
  const features = [
    {
      icon: CheckCircle,
      title: "Confirmação Instantânea",
      description: "Receba a confirmação da sua reserva imediatamente após o pagamento, com todos os detalhes da viagem.",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: Clock,
      title: "Lembretes Automáticos",
      description: "Receba lembretes sobre horários de embarque, documentos necessários e informações importantes.",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Zap,
      title: "Respostas Rápidas",
      description: "Tire suas dúvidas a qualquer momento com respostas automáticas para as perguntas mais frequentes.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-[#25D366] rounded-xl mr-4">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Assistente WhatsApp
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa inteligência artificial cuida de tudo para você, desde a confirmação da reserva 
              até lembretes importantes sobre sua viagem.
            </p>
            <Badge className="mt-4 bg-green-100 text-green-700 hover:bg-green-100">
              🤖 Atendimento 24/7 Automatizado
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Como Funciona o Atendimento
                </h3>
                
                <div className="space-y-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex gap-4">
                      <div className={`p-3 rounded-xl ${feature.bgColor} flex-shrink-0`}>
                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <h4 className="font-bold text-green-900">Exemplo de Interação</h4>
                  </div>
                  <p className="text-green-800 text-sm">
                    "Olá! Sua reserva para Flamengo x Botafogo foi confirmada! 🔴⚫<br/>
                    📅 Data: 15/10/2025<br/>
                    🚍 Embarque: 14/10 às 22h<br/>
                    📍 Local: Praça da Bandeira<br/>
                    Nos vemos lá, Mengão!"
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <div className="relative max-w-sm w-full">
                {/* Phone Frame */}
                <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                  <div className="bg-black rounded-[2rem] p-1">
                    <div className="bg-white rounded-[1.5rem] overflow-hidden">
                      {/* WhatsApp Header */}
                      <div className="bg-[#128C7E] p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          <Bot className="h-6 w-6 text-[#128C7E]" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">NetoTours Bot</h3>
                          <p className="text-green-100 text-xs">online</p>
                        </div>
                      </div>
                      
                      {/* Chat Messages */}
                      <div className="bg-[#E5DDD5] h-80 p-4 overflow-hidden flex flex-col justify-end">
                        <div className="space-y-3">
                          <div className="bg-white p-3 rounded-lg max-w-[80%] ml-auto shadow-sm">
                            <p className="text-sm">Oi! Quero ir no próximo jogo do Flamengo 🔴⚫</p>
                            <span className="text-xs text-gray-500">14:32</span>
                          </div>
                          
                          <div className="bg-[#DCF8C6] p-3 rounded-lg max-w-[85%] shadow-sm">
                            <p className="text-sm">
                              🎉 Ótima escolha! Temos caravana para:<br/>
                              <strong>Flamengo x Botafogo</strong><br/>
                              📅 15/10/2025<br/>
                              💰 R$ 150,00<br/>
                              🚍 Saída: 14/10 às 22h
                            </p>
                            <span className="text-xs text-gray-500">14:32</span>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg max-w-[80%] ml-auto shadow-sm">
                            <p className="text-sm">Perfeito! Como faço para reservar?</p>
                            <span className="text-xs text-gray-500">14:33</span>
                          </div>
                          
                          <div className="bg-[#DCF8C6] p-3 rounded-lg max-w-[85%] shadow-sm">
                            <p className="text-sm">
                              🎟️ Clique aqui para se cadastrar:<br/>
                              <span className="text-blue-600 underline">[LINK DE CADASTRO]</span><br/>
                              Após o pagamento, envio todos os detalhes! 🚍
                            </p>
                            <span className="text-xs text-gray-500">14:33</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Input Area */}
                      <div className="bg-white p-3 border-t">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            placeholder="Digite uma mensagem..." 
                            className="flex-grow rounded-full px-4 py-2 text-sm bg-gray-100 border-none outline-none"
                            disabled
                          />
                          <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
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
