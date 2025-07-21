
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRegistrationForm } from "@/components/cadastro-publico/PublicRegistrationForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CadastroPublico = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="container py-8 max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-4xl font-bold text-red-600 mb-2">Neto Turs</h1>
              <p className="text-lg text-gray-700 font-medium">Caravanas Rubro-Negras</p>
              <p className="text-sm text-gray-600 mt-1">Sua paixão pelo Flamengo em cada viagem</p>
            </div>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader className="text-center bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">
                Cadastro de Cliente
              </CardTitle>
              <CardDescription className="text-red-100 text-base">
                Faça seu cadastro e embarque nas melhores caravanas do Flamengo!
                <br />
                Apenas o nome completo é obrigatório, os demais campos são opcionais.
              </CardDescription>
            </CardHeader>
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
