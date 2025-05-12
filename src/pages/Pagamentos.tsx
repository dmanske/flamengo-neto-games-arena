
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Pagamentos = () => {
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Gerenciamento de Pagamentos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Integrações de Pagamento</CardTitle>
            <CardDescription>Status das integrações de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="warning" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Stripe não configurado</AlertTitle>
              <AlertDescription>
                A integração com o Stripe está pronta, mas a chave secreta (STRIPE_SECRET_KEY) ainda não foi configurada.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-gray-600">
              Para completar a configuração do Stripe, você precisa adicionar sua chave secreta nas configurações de secrets do Supabase.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Instruções</CardTitle>
            <CardDescription>Como configurar o Stripe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">1. Obtenha sua chave secreta do Stripe</h3>
              <p className="text-sm text-gray-600">
                Acesse o Dashboard do Stripe e copie sua chave secreta (Secret Key) em Developers &gt; API Keys.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">2. Configure a chave no Supabase</h3>
              <p className="text-sm text-gray-600">
                Adicione a chave secreta na configuração de Secrets do Supabase com o nome STRIPE_SECRET_KEY.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium">3. Teste o pagamento</h3>
              <p className="text-sm text-gray-600">
                Após configurar a chave, teste o pagamento utilizando um cartão de teste do Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Esta funcionalidade estará disponível após a configuração do Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>O histórico de pagamentos ficará disponível após a configuração da integração com o Stripe.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pagamentos;
