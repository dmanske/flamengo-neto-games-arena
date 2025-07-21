import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/cliente/ClienteForm";

const CadastrarCliente = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Cadastro de Cliente
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              Cadastre um novo cliente para as viagens da Neto Tours Viagens.
              Apenas o nome completo é obrigatório, os demais campos são opcionais.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ClienteForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastrarCliente;
