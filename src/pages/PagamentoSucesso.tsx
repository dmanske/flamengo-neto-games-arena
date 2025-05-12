
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const PagamentoSucesso = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const viagemId = searchParams.get('viagem');
  const clienteId = searchParams.get('cliente');
  
  const [isVerifying, setIsVerifying] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("Sessão de pagamento não identificada");
      setIsVerifying(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) {
          throw new Error(`Erro ao verificar pagamento: ${error.message}`);
        }

        setIsPaid(data.isPaid);
        
        // Se o pagamento foi confirmado e temos viagemId e clienteId, podemos registrar o pagamento no banco de dados
        // Isso seria implementado posteriormente para registrar no banco de dados
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
        setError("Não foi possível verificar o status do pagamento. Por favor, entre em contato com o suporte.");
        toast.error("Erro ao verificar pagamento");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, viagemId, clienteId]);

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <div className="container py-12 max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl">Processamento de Pagamento</CardTitle>
          <CardDescription>
            Verificando o status do seu pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8 space-y-6">
          {isVerifying ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 text-red-600 animate-spin" />
              <p className="text-lg">Verificando seu pagamento...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Ocorreu um problema</p>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          ) : isPaid ? (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Pagamento confirmado!</p>
                <p className="text-gray-600">
                  Seu pagamento foi processado com sucesso. Em breve você receberá 
                  a confirmação do pagamento e os detalhes da viagem por e-mail ou WhatsApp.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Pagamento pendente</p>
                <p className="text-gray-600">
                  Seu pagamento está sendo processado. Assim que confirmado, 
                  você receberá uma notificação por e-mail ou WhatsApp.
                </p>
              </div>
            </div>
          )}
          
          <Button onClick={goToHomePage} className="mt-6 bg-red-600 hover:bg-red-700">
            Voltar para a página inicial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagamentoSucesso;
