
import React from "react";
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
      console.log("Cadastrando passageiro:", values);
      
      // In a real app, this would be an API call to create the passenger
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate sending WhatsApp message
      console.log(`Enviando mensagem para ${values.telefone}: 🎟️ Você foi cadastrado com sucesso para a caravana do Flamengo! 🚍 Embarque: ${values.cidade_embarque} | Setor: ${values.setor_maracana}. Nos vemos lá! 🔴⚫`);
      
      // Show success message
      toast.success("Passageiro cadastrado com sucesso e notificação enviada pelo WhatsApp.");
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Erro ao cadastrar passageiro:", error);
      toast.error("Erro ao cadastrar passageiro. Tente novamente.");
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
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Cadastrando..." : "Cadastrar Passageiro"}
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
