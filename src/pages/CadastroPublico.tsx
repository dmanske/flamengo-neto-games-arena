
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRegistrationForm } from "@/components/cadastro-publico/PublicRegistrationForm";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const CadastroPublico = () => {
  return (
    <ErrorBoundary>
      <div className="container py-6 max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <div className="flex flex-col justify-center items-center text-center">
            <h1 className="text-3xl font-bold">Neto Tours Viagens</h1>
            <p className="text-sm text-gray-600">Caravanas Rubro-Negras</p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Formulário de Cadastro</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados para cadastro nas caravanas do Flamengo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PublicRegistrationForm />
          </CardContent>
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default CadastroPublico;
