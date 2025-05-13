
import React from "react";
import LandingPage from "./LandingPage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  // Removed the auto-check and redirect to prevent tab switching issues
  // This allows users to view the landing page even when logged in
  
  return <LandingPage />;
};

export default Index;
