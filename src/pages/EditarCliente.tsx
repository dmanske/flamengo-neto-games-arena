import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useClientValidation } from "@/hooks/useClientValidation";
import { cleanCPF, cleanPhone } from "@/utils/formatters";
import { formSchema, type ClienteFormData } from "@/components/cliente/ClienteFormSchema";
import { PersonalInfoFields } from "@/components/cliente/PersonalInfoFields";
import { ContactInfoFields } from "@/components/cliente/ContactInfoFields";
import { AddressFields } from "@/components/cliente/AddressFields";
import { ReferralFields } from "@/components/cliente/ReferralFields";

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateClient, isValidating } = useClientValidation();

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

  useEffect(() => {
    const fetchCliente = async () => {
      setIsLoading(true);
      try {
        const { data: cliente, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error("Erro ao buscar cliente:", error);
          toast.error("Erro ao buscar cliente.");
          return;
        }

        if (cliente) {
          // Formatando a data para o formato de input date (YYYY-MM-DD)
          const formattedDate = cliente.data_nascimento
            ? new Date(cliente.data_nascimento).toISOString().split('T')[0]
            : '';

          form.reset({
            nome: cliente.nome || "",
            cpf: cliente.cpf || "",
            data_nascimento: formattedDate,
            telefone: cliente.telefone || "",
            email: cliente.email || "",
            cep: cliente.cep || "",
            endereco: cliente.endereco || "",
            numero: cliente.numero || "",
            complemento: cliente.complemento || "",
            bairro: cliente.bairro || "",
            cidade: cliente.cidade || "",
            estado: cliente.estado || "",
            como_conheceu: cliente.como_conheceu || "",
            indicacao_nome: cliente.indicacao_nome || "",
            observacoes: cliente.observacoes || "",
            foto: cliente.foto || "",
            passeio_cristo: cliente.passeio_cristo || "sim",
            fonte_cadastro: cliente.fonte_cadastro || "admin",
          });
        }
      } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        toast.error("Erro ao buscar cliente.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCliente();
    }
  }, [id, form]);

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Validar cliente
      const validation = await validateClient(data.cpf, data.telefone, data.email, id);

      if (!validation.isValid && validation.existingClient) {
        toast.error(validation.message || "Cliente já cadastrado");
        setIsSubmitting(false);
        return;
      }

      const clienteData = {
        nome: data.nome.trim(),
        cpf: cleanCPF(data.cpf),
        data_nascimento: data.data_nascimento,
        telefone: cleanPhone(data.telefone),
        email: data.email.toLowerCase().trim(),
        cep: data.cep.replace(/\D/g, ''),
        endereco: data.endereco.trim(),
        numero: data.numero.trim(),
        complemento: data.complemento?.trim() || null,
        bairro: data.bairro.trim(),
        cidade: data.cidade.trim(),
        estado: data.estado.toUpperCase().trim(),
        como_conheceu: data.como_conheceu,
        indicacao_nome: data.indicacao_nome?.trim() || null,
        observacoes: data.observacoes?.trim() || null,
        foto: data.foto || null,
        passeio_cristo: data.passeio_cristo,
        fonte_cadastro: data.fonte_cadastro,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente.");
        return;
      }

      toast.success("Cliente atualizado com sucesso!");
      navigate('/clientes');
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando informações do cliente...
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Button variant="ghost" onClick={() => navigate('/clientes')} className="mb-4">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle>Dados Pessoais</CardTitle>
                  <CardDescription>
                    Informações básicas do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalInfoFields form={form} />
                </CardContent>
              </Card>

              {/* Contato */}
              <Card>
                <CardHeader>
                  <CardTitle>Contato</CardTitle>
                  <CardDescription>
                    Informações de contato do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ContactInfoFields form={form} />
                </CardContent>
              </Card>

              {/* Endereço */}
              <Card>
                <CardHeader>
                  <CardTitle>Endereço</CardTitle>
                  <CardDescription>
                    Informações do endereço do cliente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddressFields form={form} />
                </CardContent>
              </Card>

              {/* Como conheceu e observações */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                  <CardDescription>
                    Como o cliente conheceu a empresa e observações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReferralFields form={form} />
                </CardContent>
              </Card>

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
