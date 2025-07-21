import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useClientValidation } from "@/hooks/useClientValidation";
import { cleanCPF, cleanPhone, convertBrazilianDateToISO, convertISOToBrazilianDate } from "@/utils/formatters";
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
      data_nascimento: convertISOToBrazilianDate(cliente?.data_nascimento || ""),
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
        data_nascimento: data.data_nascimento ? convertBrazilianDateToISO(data.data_nascimento) : null,
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
        fonte_cadastro: data.fonte_cadastro,
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
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Dados Pessoais</h3>
            <p className="text-sm text-gray-600">Informações básicas do cliente</p>
          </div>
          <PersonalInfoFields form={form} />
        </div>

        {/* Informações de Contato */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Contato</h3>
            <p className="text-sm text-gray-600">Telefone e informações de contato</p>
          </div>
          <ContactInfoFields form={form} />
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Endereço</h3>
            <p className="text-sm text-gray-600">Informações de localização (opcional)</p>
          </div>
          <AddressFields form={form} />
        </div>

        {/* Como conheceu e observações */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Informações Adicionais</h3>
            <p className="text-sm text-gray-600">Como conheceu a Neto Tours Viagens e observações</p>
          </div>
          <ReferralFields form={form} />
        </div>

        {/* Botão de submit */}
        <div className="flex justify-end pt-6 border-t">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {isLoading ? "Salvando..." : cliente ? "Atualizar Cliente" : "Cadastrar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
