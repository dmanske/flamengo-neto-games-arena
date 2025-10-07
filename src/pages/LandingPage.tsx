import "@/styles/landing.css";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import GalleryGrid from "@/components/landing/GalleryGrid";
import BusShowcase from "@/components/landing/BusShowcase";
import Testimonials from "@/components/landing/Testimonials";
import TicketInfo from "@/components/landing/TicketInfo";
import UpcomingTrips from "@/components/landing/UpcomingTrips";
import Tours from "@/components/landing/Tours";
import Contact from "@/components/landing/Contact";
import FloatingWhatsApp from "@/components/landing/FloatingWhatsApp";
import InstagramSection from "@/components/landing/InstagramSection";
import Footer from "@/components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen landing-page" data-testid="landing-page">
      <Navbar />
      <Hero />
      <About />
      <GalleryGrid />
      <BusShowcase />
      <Testimonials />
      <TicketInfo />
      <UpcomingTrips />
      <Tours />
      <InstagramSection />
      <Contact />
      <FloatingWhatsApp />
      <Footer />
    </div>
  );
};

export default LandingPage;