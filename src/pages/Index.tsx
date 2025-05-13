
import React, { useEffect } from "react";
import LandingPage from "./LandingPage";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const navigate = useNavigate();

  // Check if user is logged in and redirect to dashboard if needed
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // If user is already logged in, don't automatically redirect
        // This allows them to view the landing page if they navigated to it directly
        console.log("User is logged in, but staying on landing page");
      }
    };
    
    checkSession();
  }, [navigate]);
  
  return <LandingPage />;
};

export default Index;
