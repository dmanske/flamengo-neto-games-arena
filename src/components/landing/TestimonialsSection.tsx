
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Carlos Silva",
    text: "Já fiz 3 viagens com a NetoTours e não troco por nada! Organização impecável, ônibus confortáveis e o melhor: a energia da torcida é sensacional!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    name: "Marina Santos",
    text: "Primeira vez que viajei com a NetoTours e superou minhas expectativas. Tudo muito bem organizado, desde o embarque até o retorno. Com certeza viajarei mais vezes!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Roberto Almeida",
    text: "O que mais gosto é a pontualidade e a segurança. O ônibus é super confortável e o pessoal da NetoTours está sempre disponível para ajudar. Recomendo demais!",
    rating: 5,
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 4,
    name: "Amanda Costa",
    text: "Atendimento excelente e preço justo! Já viajei 2 vezes e voltarei sempre. É uma experiência incrível poder torcer pelo Flamengo ao vivo sem preocupações com transporte.",
    rating: 4,
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">O Que Dizem Nossos Clientes</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name} 
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
