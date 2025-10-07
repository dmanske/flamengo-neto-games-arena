import "@/styles/landing.css";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import GalleryGrid from "@/components/landing/GalleryGrid";

const Gallery = () => {
  return (
    <div className="min-h-screen bg-background landing-page">
      <Navbar />
      <FloatingWhatsApp />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge className="mb-4 bg-primary text-primary-foreground">
              Nossas Memórias
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Galeria de <span className="text-primary">Caravanas</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Reviva os melhores momentos das nossas caravanas. Cada jogo, cada emoção, cada vitória eternizada em fotos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Grid */}
      <GalleryGrid showTitle={false} />

      <Footer />
    </div>
  );
};

export default Gallery;
