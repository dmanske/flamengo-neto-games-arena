
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { ContactInfoFields } from "./ContactInfoFields";
import { ReferralFields } from "./ReferralFields";
import { FonteConhecimento } from "@/types/entities";

// Define the form validation schema
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cep: z.string().min(9, { message: "CEP é obrigatório e deve estar no formato 00000-000" }),
  endereco: z.string().min(5, { message: "Endereço é obrigatório" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  complemento: z.string().optional(),
  bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
  telefone: z
    .string()
    .min(14, { message: "O telefone deve estar completo" })
    .regex(/^\(\d{2}\) \d \d{4}-\d{4}$/, { message: "Formato de telefone inválido" }),
  cidade: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado: z.string().min(2, { message: "Estado é obrigatório" }),
  cpf: z
    .string()
    .min(14, { message: "CPF deve estar completo" })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "Formato de CPF inválido" }),
  data_nascimento: z.string().refine((val) => {
    try {
      const date = new Date(val.split('/').reverse().join('-'));
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, { message: "Data inválida. Use o formato DD/MM/AAAA" }),
  email: z.string().email({ message: "Email inválido" }),
  como_conheceu: z.enum(["Instagram", "Indicação", "Facebook", "Google", "Outro"], {
    message: "Por favor selecione como conheceu a Neto Tours"
  }),
  indicacao_nome: z.string().optional(),
  observacoes: z.string().optional(),
  foto: z.string().nullable().optional(),
}).refine((data) => {
  // If como_conheceu is "Indicação", indicacao_nome is required
  if (data.como_conheceu === "Indicação" && (!data.indicacao_nome || data.indicacao_nome.length < 2)) {
    return false;
  }
  return true;
}, {
  message: "Nome de quem indicou é obrigatório",
  path: ["indicacao_nome"]
});

type FormValues = z.infer<typeof formSchema>;

export const ClienteForm: React.FC = () => {
  const navigate = useNavigate();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      telefone: "",
      cidade: "",
      estado: "RJ",
      cpf: "",
      data_nascimento: "",
      email: "",
      como_conheceu: undefined,
      indicacao_nome: "",
      observacoes: "",
      foto: null,
    },
  });

  const watchComoConheceu = form.watch("como_conheceu") as FonteConhecimento | undefined;

  // Set up react-query mutation for adding client
  const addClientMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert string date to Date object for API
      const dateParts = data.data_nascimento.split('/');
      const dateObject = new Date(
        parseInt(dateParts[2]), // year
        parseInt(dateParts[1]) - 1, // month (0-based)
        parseInt(dateParts[0]) // day
      );

      console.log("Inserting client data:", {
        nome: data.nome,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        telefone: data.telefone,
        cep: data.cep,
        cidade: data.cidade,
        estado: data.estado,
        cpf: data.cpf,
        data_nascimento: dateObject.toISOString(),
        email: data.email,
        como_conheceu: data.como_conheceu,
        indicacao_nome: data.indicacao_nome || null,
        observacoes: data.observacoes || null,
        foto: data.foto || null,
      });

      // Insert client into Supabase
      const { data: client, error } = await supabase
        .from('clientes')
        .insert([
          {
            nome: data.nome,
            endereco: data.endereco,
            numero: data.numero,
            complemento: data.complemento || null,
            bairro: data.bairro,
            telefone: data.telefone,
            cep: data.cep,
            cidade: data.cidade,
            estado: data.estado,
            cpf: data.cpf,
            data_nascimento: dateObject.toISOString(),
            email: data.email,
            como_conheceu: data.como_conheceu,
            indicacao_nome: data.indicacao_nome || null,
            observacoes: data.observacoes || null,
            foto: data.foto || null,
          }
        ])
        .select();
        
      console.log("Supabase response:", { client, error });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      return client;
    },
    onSuccess: () => {
      // Send WhatsApp message (in production you'd use a proper API/service)
      console.log(`Enviando mensagem para ${form.getValues().telefone}: 🎟️ Olá, ${form.getValues().nome}! Seu cadastro foi realizado com sucesso para as caravanas do Flamengo. 🔴⚫ Em breve, você poderá escolher sua caravana para o próximo jogo!`);
      
      // Show success dialog
      setSuccessDialogOpen(true);
    },
    onError: (error) => {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error("Erro ao cadastrar cliente. Tente novamente.");
    }
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    addClientMutation.mutate(values);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonalInfoFields 
              form={form} 
              calendarOpen={calendarOpen} 
              setCalendarOpen={setCalendarOpen} 
            />
            
            <ContactInfoFields form={form} />
            
            <AddressFields form={form} />

            <ReferralFields form={form} watchComoConheceu={watchComoConheceu} />
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-[#e40016] hover:bg-[#c20012]"
              disabled={addClientMutation.isPending}
            >
              {addClientMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Cadastrando...
                </>
              ) : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cliente cadastrado com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              O cliente foi cadastrado com sucesso e uma notificação foi enviada pelo WhatsApp.
              O que você deseja fazer agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              form.reset();
              setSuccessDialogOpen(false);
            }}>
              Cadastrar Novo Cliente
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/clientes")} className="bg-[#e40016] hover:bg-[#c20012]">
              Ver Lista de Clientes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
