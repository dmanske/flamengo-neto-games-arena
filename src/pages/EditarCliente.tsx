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
    <div className="container py-6">
      <Button variant="ghost" onClick={() => navigate('/dashboard/clientes')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para a lista de clientes
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Cliente</CardTitle>
          <CardDescription>
            Altere os dados do cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitForm)} className="space-y-8">
              <ClienteFormSections form={form} />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || isValidating}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting || isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
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
  );
};

export default EditarCliente;
