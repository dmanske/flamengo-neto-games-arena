
import React from "react";
import { Toaster } from "sonner";
import HeroSection from "@/components/landing/HeroSection";
import NextTripsSection from "@/components/landing/NextTripsSection";
import BusGallerySection from "@/components/landing/BusGallerySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhatsappBotSection from "@/components/landing/WhatsappBotSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import FooterSection from "@/components/landing/FooterSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      <HeroSection />
      <NextTripsSection />
      <BusGallerySection />
      <HowItWorksSection />
      <WhatsappBotSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
