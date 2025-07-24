
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRegistrationForm } from "@/components/cadastro-publico/PublicRegistrationForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CadastroPublico = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="container py-8 max-w-4xl mx-auto">


          <Card className="shadow-lg">
            <CardContent className="p-6">
              <PublicRegistrationForm />
            </CardContent>
          </Card>

          <div className="text-center mt-6 text-sm text-gray-600">
            <p>Dúvidas? Entre em contato conosco pelo WhatsApp</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CadastroPublico;
