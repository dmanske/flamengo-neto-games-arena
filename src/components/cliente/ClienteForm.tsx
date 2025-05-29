import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useClientValidation } from "@/hooks/useClientValidation";
import { cleanCPF, cleanPhone } from "@/utils/formatters";
import { formSchema, type ClienteFormData } from "./ClienteFormSchema";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";
import type { Cliente } from "@/types/entities";

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmitSuccess?: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({ cliente, onSubmitSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateClient, isValidating } = useClientValidation();

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: cliente?.nome || "",
      cpf: cliente?.cpf || "",
      data_nascimento: cliente?.data_nascimento || "",
      telefone: cliente?.telefone || "",
      email: cliente?.email || "",
      cep: cliente?.cep || "",
      endereco: cliente?.endereco || "",
      numero: cliente?.numero || "",
      complemento: cliente?.complemento || "",
      bairro: cliente?.bairro || "",
      cidade: cliente?.cidade || "",
      estado: cliente?.estado || "",
      como_conheceu: cliente?.como_conheceu || "",
      indicacao_nome: cliente?.indicacao_nome || "",
      observacoes: cliente?.observacoes || "",
      foto: cliente?.foto || "",
      passeio_cristo: cliente?.passeio_cristo || "sim",
      fonte_cadastro: cliente?.fonte_cadastro || "admin",
    },
  });

  const onSubmit = async (data: ClienteFormData) => {
    setIsSubmitting(true);

    try {
      // Validar cliente
      const validation = await validateClient(data.cpf, data.telefone, data.email, cliente?.id);

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

      if (cliente) {
        // Atualizar cliente existente
        const { error } = await supabase
          .from('clientes')
          .update(clienteData)
          .eq('id', cliente.id);

        if (error) {
          console.error("Erro ao atualizar cliente:", error);
          toast.error("Erro ao atualizar cliente. Tente novamente.");
          setIsSubmitting(false);
          return;
        }

        toast.success("Cliente atualizado com sucesso!");
      } else {
        // Criar novo cliente
        clienteData['created_at'] = new Date().toISOString();
        const { error } = await supabase
          .from('clientes')
          .insert([clienteData]);

        if (error) {
          console.error("Erro ao criar cliente:", error);
          toast.error("Erro ao criar cliente. Tente novamente.");
          setIsSubmitting(false);
          return;
        }

        toast.success("Cliente criado com sucesso!");
      }

      // Reset do formulário
      form.reset();

      // Notificar sucesso
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast.error("Erro ao submeter formulário. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isValidating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Pessoais */}
        <PersonalInfoFields form={form} />

        {/* Informações de Contato */}
        <ContactInfoFields form={form} />

        {/* Endereço */}
        <AddressFields form={form} />

        {/* Como conheceu e observações */}
        <ReferralFields form={form} />

        {/* Botão de submit */}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Salvar"}
        </Button>
      </form>
    </Form>
  );
};
