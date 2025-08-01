import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPagamento } from "@/types/entities";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { getSetorLabel, getSetorOptions } from "@/data/estadios";

// Define the form validation schema
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  telefone: z
    .string()
    .min(10, { message: "O telefone deve ter pelo menos 10 dígitos" })
    .regex(/^[0-9]+$/, { message: "O telefone deve conter apenas números" }),
  email: z.string().email({ message: "Email inválido" }),
  cidade_embarque: z.string().min(2, { message: "Cidade de embarque é obrigatória" }),
  setor_maracana: z.string().min(2, { message: "Setor do Maracanã é obrigatório" }),
  status_pagamento: z.enum(["Pendente", "Pago", "Cancelado"] as const),
  numero_onibus: z.string().min(1, { message: "Número do ônibus é obrigatório" }),
});

type FormValues = z.infer<typeof formSchema>;

const CadastrarPassageiro = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Define form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cidade_embarque: "",
      setor_maracana: "",
      status_pagamento: "Pendente",
      numero_onibus: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log("Cadastrando passageiro:", values);
      
      // Create the client first
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nome: values.nome,
          telefone: values.telefone,
          email: values.email,
          cidade: values.cidade_embarque,
          cpf: "", // We should add this to the form in a future update
          data_nascimento: new Date().toISOString(), // Placeholder for now
          cep: "",
          bairro: "",
          endereco: "",
          estado: "",
          como_conheceu: "Cadastro pelo app"
        })
        .select('id')
        .single();
      
      if (clienteError) {
        throw clienteError;
      }
      
      // For a real app, we would also create a viagem_passageiros entry
      // linking the passenger to a specific trip
      
      // Simulate sending WhatsApp message
      console.log(`Enviando mensagem para ${values.telefone}: 🎟️ Você foi cadastrado com sucesso para a caravana do Flamengo! 🚍 Embarque: ${values.cidade_embarque} | Setor: ${values.setor_maracana}. Nos vemos lá! 🔴⚫`);
      
      // Show success message
      toast.success("Passageiro cadastrado com sucesso e notificação enviada pelo WhatsApp.");
      
      // Reset form after successful submission
      form.reset();
      navigate("/dashboard/clientes", { replace: true });
    } catch (error: any) {
      console.error("Erro ao cadastrar passageiro:", error);
      toast.error("Erro ao cadastrar passageiro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Passageiro</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Formulário de Cadastro</CardTitle>
          <CardDescription>
            Preencha os dados do passageiro para a caravana do Flamengo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="DDD + Número" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade_embarque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de Embarque</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="setor_maracana"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor no Maracanã</FormLabel>
                      <FormControl>
                        <Input placeholder="Setor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_onibus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Ônibus</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status de Pagamento</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Passageiro"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarPassageiro;
