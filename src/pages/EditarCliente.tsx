import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formSchema, type ClienteFormData } from "@/components/cliente/ClienteFormSchema";
import { ClienteFormLoading } from "@/components/cliente/ClienteFormLoading";
import { ClienteFormSections } from "@/components/cliente/ClienteFormSections";
import { useClientData } from "@/hooks/useClientData";
import { useClientFormSubmit } from "@/hooks/useClientFormSubmit";

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      data_nascimento: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      como_conheceu: "",
      indicacao_nome: "",
      observacoes: "",
      foto: "",
      passeio_cristo: "sim",
      fonte_cadastro: "admin",
    },
    mode: "onChange",
  });

  const { isLoading } = useClientData(id, form);
  const { submitForm, isSubmitting, isValidating } = useClientFormSubmit(id);

  if (isLoading) {
    return <ClienteFormLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <div className="container py-6">
        {/* Navigation */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard/clientes')} 
          className="mb-6 hover:bg-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a lista de clientes
        </Button>

        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Cliente</h1>
          <p className="text-gray-600">
            Altere as informações do cliente conforme necessário.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Cliente
            </CardTitle>
            <CardDescription className="text-blue-100 text-base">
              Atualize as informações do cliente. Os campos marcados com * são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
                <ClienteFormSections form={form} />

                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    disabled={isSubmitting || isValidating}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2 shadow-lg"
                  >
                    {isSubmitting || isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando alterações...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditarCliente;
