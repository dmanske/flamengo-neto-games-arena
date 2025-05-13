
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const NotFound = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    };
    
    checkSession();
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        A página que você está procurando não existe ou foi removida.
      </p>
      <div className="space-x-4">
        {isLoggedIn ? (
          <Button onClick={() => navigate("/dashboard")}>
            Voltar para o Dashboard
          </Button>
        ) : (
          <Button onClick={() => navigate("/")}>
            Voltar para a Página Inicial
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link to={isLoggedIn ? "/dashboard" : "/"}>
            {isLoggedIn ? "Ir para o Dashboard" : "Ir para a Página Inicial"}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
