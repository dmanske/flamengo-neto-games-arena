import "@/styles/landing.css";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const ContatoSucesso = () => {
  return (
    <div className="min-h-screen flex flex-col landing-page">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4 bg-gradient-to-b from-background via-muted/30 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <Card className="border-2">
            <CardContent className="pt-12 pb-12 px-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <CheckCircle className="h-24 w-24 text-primary" />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                Mensagem <span className="text-gradient">Enviada!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto"
              >
                Obrigado por entrar em contato! Recebemos sua mensagem e retornaremos em breve.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button asChild variant="default" size="lg">
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Voltar ao Início
                  </Link>
                </Button>
                
                <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  <a 
                    href="https://wa.me/5547999921907" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    WhatsApp
                  </a>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-12 pt-8 border-t"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Enquanto isso, você pode:
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/galeria">Ver Galeria Completa</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/#tours">Conhecer os Tours</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/#trips">Próximas Viagens</Link>
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default ContatoSucesso;