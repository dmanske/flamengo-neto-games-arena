import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CheckoutButtonProps {
  tripId: string;
  clientId?: string;
  price: number;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CheckoutButton({
  tripId,
  clientId,
  price,
  description,
  className = "",
  children
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          tripId,
          clientId,
          // Não precisamos mais enviar o preço pois estamos usando um preço fixo no Stripe
          description
        }
      });

      if (error) {
        throw new Error(`Erro ao criar sessão de checkout: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error("URL de checkout não encontrada na resposta");
      }

      // Redirecionar para o checkout do Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error("Erro no processo de checkout:", error);
      
      // Verifica se o erro está relacionado à chave do Stripe
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("STRIPE_SECRET_KEY") || errorMessage.includes("Stripe")) {
        toast.error("Erro de configuração do Stripe. Verifique se a chave API está configurada corretamente.");
      } else {
        toast.error("Erro ao processar pagamento. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      className={`bg-red-600 hover:bg-red-700 ${className}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : children || "Fazer pagamento"}
    </Button>
  );
}
