import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/cliente/ClienteForm";

const CadastrarCliente = () => {
  return (
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
  );
};

export default CadastrarCliente;
