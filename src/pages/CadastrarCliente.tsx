import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/cliente/ClienteForm";

const CadastrarCliente = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Cliente</h1>
          <p className="text-gray-600">
            Cadastre um novo cliente no sistema. Apenas o nome completo é obrigatório.
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Novo Cliente
            </CardTitle>
            <CardDescription className="text-red-100 text-base">
              Preencha as informações do cliente. Os campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <ClienteForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CadastrarCliente;
