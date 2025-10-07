import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import busExterior from "@/assets/landing/bus-neto-tours.jpg";
import busInterior from "@/assets/landing/bus-interior.jpg";

const busFeatures = [
  "Ar condicionado moderno",
  "Poltronas reclináveis confortáveis",
  "Sistema de som de alta qualidade",
  "Banheiro a bordo",
  "Tomadas USB para carregar dispositivos",
  "Wi-Fi gratuito durante a viagem",
  "Espaço para bagagem",
  "Motorista profissional e experiente"
];

const BusShowcase = () => {
  return (
    <section id="buses" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Nossos <span className="text-gradient">Ônibus</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Viaje com conforto e segurança nos nossos ônibus modernos e equipados
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto space-y-12">
          {/* Exterior do Ônibus */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative h-64 lg:h-auto">
                  <img 
                    src={busExterior} 
                    alt="Exterior do ônibus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="flex flex-col justify-center">
                  <CardTitle className="text-3xl mb-4">Exterior Moderno</CardTitle>
                  <div className="text-base text-muted-foreground space-y-4">
                    <p>
                      Nossos ônibus são cuidadosamente selecionados e mantidos para garantir 
                      a melhor experiência de viagem. Com design moderno e pintura impecável, 
                      você viaja com estilo!
                    </p>
                    <p>
                      Todos os veículos passam por rigorosas inspeções de segurança antes 
                      de cada viagem, garantindo tranquilidade do início ao fim.
                    </p>
                  </div>
                </CardHeader>
              </div>
            </Card>
          </motion.div>

          {/* Interior do Ônibus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="overflow-hidden hover:shadow-glow transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <CardHeader className="flex flex-col justify-center order-2 lg:order-1">
                  <CardTitle className="text-3xl mb-4">Conforto Interior</CardTitle>
                  <div className="text-base text-muted-foreground space-y-4">
                    <p>
                      O interior dos nossos ônibus é projetado pensando no seu conforto. 
                      Poltronas espaçosas e reclináveis garantem uma viagem relaxante, 
                      seja ela curta ou longa.
                    </p>
                    <p>
                      Com climatização perfeita e sistema de entretenimento, você chega 
                      ao destino descansado e pronto para torcer pelo Mengão!
                    </p>
                  </div>
                </CardHeader>
                <div className="relative h-64 lg:h-auto order-1 lg:order-2">
                  <img 
                    src={busInterior} 
                    alt="Interior do ônibus"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl mb-4">
                  Comodidades <span className="text-gradient">Incluídas</span>
                </CardTitle>
                <p className="text-base text-muted-foreground">
                  Todos os nossos ônibus são equipados com:
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {busFeatures.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="flex items-start gap-3 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BusShowcase;
