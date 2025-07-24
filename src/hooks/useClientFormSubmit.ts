// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useClientValidation } from "./useClientValidation";
import { cleanCPF, cleanPhone, convertBrazilianDateToISO } from "@/utils/formatters";
import { ClienteFormData } from "@/components/cliente/ClienteFormSchema";

export const useClientFormSubmit = (clienteId?: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { validateClient, isValidating } = useClientValidation();

  const submitForm = async (data: ClienteFormData) => {
    setIsSubmitting(true);
    try {
      // Validar cliente
      const validation = await validateClient(data.cpf, data.telefone, data.email, clienteId);

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
        passeio_cristo: data.passeio_cristo,
        fonte_cadastro: data.fonte_cadastro,
      };

      const { error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', clienteId);

      if (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast.error("Erro ao atualizar cliente.");
        return;
      }

      toast.success("Cliente atualizado com sucesso!");
      navigate('/dashboard/clientes');
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error("Erro ao atualizar cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitForm,
    isSubmitting,
    isValidating
  };
};
