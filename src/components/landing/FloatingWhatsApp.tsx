import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingWhatsApp = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "5547999921907";
    const message = encodeURIComponent("Olá! Gostaria de mais informações sobre as caravanas dos jogos do Flamengo.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        variant="whatsapp"
        size="icon"
        onClick={handleWhatsAppClick}
        className="w-16 h-16 rounded-full shadow-2xl"
        aria-label="Contato via WhatsApp"
      >
        <MessageCircle className="w-8 h-8" />
      </Button>
    </motion.div>
  );
};

export default FloatingWhatsApp;
