import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Ticket, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const TicketInfo = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/5547999921907", "_blank");
  };

  return (
    <section id="ticket-info" className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-card border-2 border-primary/30 rounded-2xl p-8 md:p-12 shadow-glow">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Icon */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={isInView ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex-shrink-0"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center">
                  <Ticket className="w-10 h-10 text-primary" />
                </div>
              </motion.div>

              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold mb-3"
                >
                  Quer apenas o <span className="text-primary">ingresso</span>?
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                  className="text-muted-foreground text-lg mb-6"
                >
                  Também vendemos ingressos avulsos para qualquer jogo do Flamengo. Entre em contato e garanta o seu!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    onClick={handleWhatsAppClick}
                    size="lg"
                    className="group"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Consultar Ingressos
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TicketInfo;
