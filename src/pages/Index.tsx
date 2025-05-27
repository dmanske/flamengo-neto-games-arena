
import React from "react";
import { Toaster } from "sonner";
import { NavigationBar } from "@/components/ui/navigation-bar";
import { HeroSection } from "@/components/ui/hero-section";
import NextTripsSection from "@/components/landing/NextTripsSection";
import BusGallerySection from "@/components/landing/BusGallerySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ContactSection from "@/components/landing/ContactSection";
import FooterSection from "@/components/landing/FooterSection";
import { GamePhotosSection } from "@/components/landing/GamePhotosSection";
import { VideoGallerySection } from "@/components/landing/VideoGallerySection";
import { StoreSection } from "@/components/landing/StoreSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      <Toaster position="top-center" />
      
      {/* Navigation */}
      <NavigationBar />
      
      {/* Hero Section with Main Video */}
      <HeroSection />
      
      {/* Store Section */}
      <StoreSection />
      
      {/* Next Trips */}
      <NextTripsSection />
      
      {/* Game Photos Gallery */}
      <GamePhotosSection />
      
      {/* Video Gallery */}
      <VideoGallerySection />
      
      {/* Bus Gallery */}
      <BusGallerySection />
      
      {/* How It Works */}
      <HowItWorksSection />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* Contact */}
      <ContactSection />
      
      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default Index;
