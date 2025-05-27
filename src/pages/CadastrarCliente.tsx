import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/cliente/ClienteForm";

const CadastrarCliente = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Formulário de Cadastro de Cliente</CardTitle>
            <CardDescription>
              Preencha os dados do cliente para cadastro nas caravanas do Flamengo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClienteForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastrarCliente;
