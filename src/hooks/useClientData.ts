
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ClienteFormData } from "@/components/cliente/ClienteFormSchema";
import { convertISOToBrazilianDate } from "@/utils/formatters";

export const useClientData = (id: string | undefined, form: UseFormReturn<ClienteFormData>) => {
  const [isLoading, setIsLoading] = useState(true);

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
          // Formatando a data para o formato brasileiro (DD/MM/AAAA)
          const formattedDate = cliente.data_nascimento
            ? convertISOToBrazilianDate(cliente.data_nascimento)
            : '';

          console.log("Cliente carregado do banco:", cliente);
          console.log("URL da foto do cliente:", cliente.foto);
          
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

  return { isLoading };
};
