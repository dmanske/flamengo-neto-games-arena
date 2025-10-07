import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useRef, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import avatarCarlos from "@/assets/landing/fotoleo.jpeg";
import avatarMarina from "@/assets/landing/avatar-marina.jpg";
import avatarRoberto from "@/assets/landing/avatar-roberto.jpg";
import avatarAna from "@/assets/landing/avatar-ana.jpg";
import avatarJoao from "@/assets/landing/avatar-joao.jpg";

import testimonial6 from "@/assets/landing/fotojunior.jpeg";
import videoThumbnail from "@/assets/landing/video-thumbnail.png";
import depobiancaVideo from "@/assets/landing/depobianca.webm";

interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  type: "text" | "video";
  videoUrl?: string;
  avatar?: string;
  verified?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Leonardo Keller",
    location: "Blumenau - SC",
    text: " Segunda viagem com a Neto Tour Viagens, excelente atendimento e organização, recomendo e irei em mais viagens nos jogos no Maracanã e conhecer os pontos turísticos do Rio de Janeiro.",
    rating: 5,
    type: "text",
    avatar: avatarCarlos,
    verified: true,
  },
  {
    id: "2",
    name: "Marina Oliveira",
    location: "Belo Horizonte, MG",
    text: "Primeira vez que fui ao Maracanã e não poderia ter sido melhor. O time estava perfeito, todos super atenciosos!",
    rating: 5,
    type: "text",
    avatar: avatarMarina,
    verified: true,
  },
  {
    id: "3",
    name: "Roberto Santos",
    location: "Curitiba, PR",
    text: "Melhor caravana que já participei! Atmosfera incrível, conheci pessoas maravilhosas e ainda vimos uma vitória épica!",
    rating: 5,
    type: "text",
    avatar: avatarRoberto,
    verified: true,
  },
  {
    id: "4",
    name: "Ana Paula Costa",
    location: "Salvador, BA",
    text: "Organização nota 10! Ônibus confortável, lanche de qualidade e a energia no estádio foi inesquecível. Já estou na próxima!",
    rating: 5,
    type: "text",
    avatar: avatarAna,
    verified: true,
  },
  {
    id: "5",
    name: "João Pedro Alves",
    location: "Brasília, DF",
    text: "Realizei o sonho de ver o Mengão no Maraca! A equipe foi super atenciosa e tudo correu perfeitamente. Recomendo demais!",
    rating: 5,
    type: "text",
    avatar: avatarJoao,
    verified: true,
  },
  {
    id: "6",
    name: "Arnaldo Kuhnen Junior",
    location: "Blumenau - SC",
    text: "Parabéns pelo excelente trabalho! 👏 Tive oportunidade de viajar de ônibus e de avião com vocês e sempre tudo muito bem organizado, com atenção e profissionalismo em cada detalhe. 🔴⚫✈️",
    rating: 5,
    type: "text",
    avatar: testimonial6,
    verified: true,
  }
];



const Testimonials = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  const handleVideoClick = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      // Força o play se não estiver tocando
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {
          console.log("Erro ao reproduzir vídeo");
        });
      }
    }
  };

  const handleVideoError = () => {
    setVideoError(true);
    console.log("Erro ao carregar vídeo da Bianca");
  };



  return (
    <section id="testimonials" ref={ref} className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Depoimentos em Texto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Depoimentos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Veja o que nossos torcedores estão dizendo sobre as caravanas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-20">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="relative group h-full overflow-hidden hover:shadow-glow transition-all duration-300">
                {/* Borda gradiente animada */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 opacity-0 group-hover:opacity-75 blur-sm transition duration-500 animate-border-flow bg-[length:200%_200%]" />

                <div className="relative glassmorphism h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16 border-2 border-primary shadow-lg">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-foreground">{testimonial.name}</h4>
                          {testimonial.verified && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                      </div>
                    </div>

                    {/* Quote Icon */}
                    <Quote className="text-primary/30 h-10 w-10 mb-3" />

                    {/* Texto */}
                    <p className="text-muted-foreground mb-4 flex-grow italic leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Footer com Estrelas e Badge */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 transition-all duration-300 ${i < testimonial.rating
                              ? "fill-yellow-400 text-yellow-400 animate-pulse-glow"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      {testimonial.verified && (
                        <Badge variant="secondary" className="text-xs">
                          ✓ Verificado
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Depoimentos em Vídeo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse-glow">
              <Quote className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-3xl md:text-4xl font-bold">
              Depoimentos em <span className="text-gradient">Vídeo</span>
            </h3>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Assista aos relatos emocionantes de quem viveu a experiência
          </p>
        </motion.div>

        <div className="flex justify-center max-w-4xl mx-auto">
          {/* Vídeo Depoimento Bianca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="overflow-hidden border-2 shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
              {/* Vídeo formato vertical (Instagram/TikTok) */}
              <div className="aspect-[9/16] relative overflow-hidden bg-black">
                {!videoError ? (
                  <>
                    <video
                      ref={videoRef}
                      controls
                      muted
                      playsInline
                      onClick={handleVideoClick}
                      onPlay={handleVideoClick}
                      onError={handleVideoError}
                      poster={videoThumbnail}
                      className="w-full h-full object-cover cursor-pointer"
                      preload="metadata"
                    >
                      <source src={depobiancaVideo} type="video/webm" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                    
                    {/* Overlay com informações */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <div className="text-white">
                        <h4 className="font-bold text-lg mb-1">Depoimento da Bianca</h4>
                        <p className="text-sm opacity-90">Experiência na Caravana Neto Tours</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <div className="text-center text-white p-6">
                      <div className="text-4xl mb-4">🎥</div>
                      <h4 className="font-bold mb-2">Depoimento da Bianca</h4>
                      <p className="text-sm opacity-80 mb-2">
                        Vídeo temporariamente indisponível
                      </p>
                      <p className="text-xs opacity-60">
                        Entre em contato para mais depoimentos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
