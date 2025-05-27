import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

const Pagamentos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Gerenciamento de Pagamentos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrações de Pagamento</CardTitle>
              <CardDescription>Status das integrações de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="default" className="mb-4 bg-green-50 border-green-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Stripe configurado</AlertTitle>
                <AlertDescription>
                  A integração com o Stripe está pronta e configurada. Você pode começar a receber pagamentos.
                </AlertDescription>
              </Alert>
              
              <p className="text-sm text-gray-600">
                Sua chave secreta do Stripe foi configurada com sucesso. Você pode testá-la realizando um checkout.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
              <CardDescription>Como usar o Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">1. Teste o pagamento</h3>
                <p className="text-sm text-gray-600">
                  Você pode usar os cartões de teste do Stripe para simular pagamentos. Use o número 4242 4242 4242 4242 com qualquer data futura e CVC.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">2. Verifique webhooks (opcional)</h3>
                <p className="text-sm text-gray-600">
                  Para notificações em tempo real de eventos do Stripe, você pode configurar webhooks.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">3. Monitore transações</h3>
                <p className="text-sm text-gray-600">
                  Visite o dashboard do Stripe para monitorar todas as transações e pagamentos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Todos os pagamentos realizados serão exibidos aqui.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>Quando houver pagamentos, eles aparecerão nesta seção.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagamentos;
