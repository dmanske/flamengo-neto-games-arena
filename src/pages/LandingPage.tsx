
import React from "react";
import { Toaster } from "sonner";
import HeaderSection from "@/components/landing/HeaderSection";
import HeroSection from "@/components/landing/HeroSection";
import NextTripsSection from "@/components/landing/NextTripsSection";
import ProductsSection from "@/components/landing/ProductsSection";
import FooterSection from "@/components/landing/FooterSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />
      <HeaderSection />
      <HeroSection />
      <NextTripsSection />
      <ProductsSection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;
