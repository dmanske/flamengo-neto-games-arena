import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Shield, Bus, Heart } from "lucide-react";
import caravanaMaior from "@/assets/landing/caravana-maior.jpg";
import introsofiaVideo from "@/assets/landing/introsofia.webm";

const About = () => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
    console.log("Erro ao carregar vídeo");
  };

  const features = [
    {
      icon: Bus,
      title: "Ônibus Executivo",
      description: "Viaje com todo conforto em nossos ônibus modernos e climatizados",
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Equipe experiente e seguro viagem incluído para sua tranquilidade",
    },
    {
      icon: Users,
      title: "Grupo Exclusivo",
      description: "Faça parte da maior torcida organizada em caravanas do Flamengo",
    },
    {
      icon: Heart,
      title: "Paixão Rubro-Negra",
      description: "Viva a emoção de cada jogo com verdadeiros flamenguistas",
    },
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Quem <span className="text-gradient">Somos</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Há mais de 10 anos levando a paixão rubro-negra aos estádios do Brasil
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-start mb-20">
          {/* Coluna do texto - 2/3 do espaço */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-3xl md:text-4xl font-bold leading-tight">
              A Maior Caravana do <span className="text-primary">Mengão</span>
            </h3>

            <div className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Somos especialistas em proporcionar experiências inesquecíveis para os torcedores
                do Flamengo. Nossa missão é levar você aos jogos mais importantes com toda a
                estrutura, segurança e conforto que você merece.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Com uma equipe apaixonada e experiente, já realizamos centenas de viagens e
                levamos milhares de torcedores para vibrar nas arquibancadas. Cada detalhe é
                planejado para que você só precise se preocupar em torcer e celebrar cada vitória!
              </p>
            </div>

            {/* Stats em linha */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">Anos de História</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Viagens Realizadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15k+</div>
                <div className="text-sm text-muted-foreground">Torcedores Atendidos</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground/80 italic pt-4">
              <span className="text-primary">▶️</span>
              <span>Assista ao vídeo e conheça mais sobre nossa história</span>
            </div>
          </motion.div>

          {/* Coluna do vídeo - 1/3 do espaço */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-1 flex justify-start lg:justify-center"
          >
            <div className="relative group">
              {/* Vídeo Introsofia - Formato Instagram maior */}
              <div className="aspect-[9/16] w-full max-w-[320px] lg:max-w-[350px] rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                {!videoError ? (
                  <video
                    ref={videoRef}
                    controls
                    muted
                    playsInline
                    onClick={handleVideoClick}
                    onPlay={handleVideoClick}
                    onError={handleVideoError}
                    className="w-full h-full object-cover cursor-pointer"
                    preload="metadata"
                  >
                    <source src={introsofiaVideo} type="video/webm" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                    <div className="text-center text-white p-6">
                      <div className="text-4xl mb-4">🎥</div>
                      <h4 className="font-bold mb-2">Vídeo Indisponível</h4>
                      <p className="text-sm opacity-80">
                        Entre em contato para conhecer nossa história
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Seção de Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Por que escolher a <span className="text-primary">Neto Tours</span>?
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos a melhor experiência em caravanas do Flamengo
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group bg-card/50 backdrop-blur-sm p-6 rounded-xl shadow-md border border-primary/10 hover:border-primary/30 hover:shadow-glow hover:bg-card/80 transition-all duration-300 cursor-pointer"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-primary" />
              </motion.div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h4>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
