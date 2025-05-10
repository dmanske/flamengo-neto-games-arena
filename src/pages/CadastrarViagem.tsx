
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

// Schema para validação do formulário
const viagemFormSchema = z.object({
  adversario: z.string().min(2, "Nome do adversário é obrigatório"),
  data_jogo: z.date({
    required_error: "Data do jogo é obrigatória",
  }),
  tipo_onibus: z.string({
    required_error: "Tipo do ônibus é obrigatório",
  }),
  empresa: z.string({
    required_error: "Empresa é obrigatória",
  }),
  rota: z.string({
    required_error: "Rota é obrigatória",
  }),
  capacidade_onibus: z.number().min(1, "Capacidade deve ser maior que zero"),
  status_viagem: z.string().default("Aberta"),
});

type ViagemFormValues = z.infer<typeof viagemFormSchema>;

// Mapeamento entre tipos de ônibus e empresas
const onibusPorEmpresa: Record<string, string> = {
  "43 Leitos Totais": "Bertoldo",
  "52 Leitos Master": "Majetur",
  "56 Leitos Master": "Sarcella",
};

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Valores padrão para o formulário
  const defaultValues: Partial<ViagemFormValues> = {
    status_viagem: "Aberta",
    capacidade_onibus: 0,
  };

  const form = useForm<ViagemFormValues>({
    resolver: zodResolver(viagemFormSchema),
    defaultValues,
  });

  // Atualiza a capacidade do ônibus e empresa com base no tipo selecionado
  const watchTipoOnibus = form.watch("tipo_onibus");
  
  useEffect(() => {
    if (watchTipoOnibus === "43 Leitos Totais") {
      form.setValue("capacidade_onibus", 43);
      form.setValue("empresa", onibusPorEmpresa[watchTipoOnibus] || "");
    } else if (watchTipoOnibus === "52 Leitos Master") {
      form.setValue("capacidade_onibus", 52);
      form.setValue("empresa", onibusPorEmpresa[watchTipoOnibus] || "");
    } else if (watchTipoOnibus === "56 Leitos Master") {
      form.setValue("capacidade_onibus", 56);
      form.setValue("empresa", onibusPorEmpresa[watchTipoOnibus] || "");
    }
  }, [watchTipoOnibus, form]);

  const onSubmit = async (data: ViagemFormValues) => {
    setIsLoading(true);
    try {
      // Ajuste para garantir que a data está no formato correto
      const dataJogo = new Date(data.data_jogo);
      dataJogo.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
      
      const { error } = await supabase.from("viagens").insert({
        adversario: data.adversario,
        data_jogo: dataJogo.toISOString(),
        tipo_onibus: data.tipo_onibus,
        empresa: data.empresa,
        rota: data.rota,
        capacidade_onibus: data.capacidade_onibus,
        status_viagem: data.status_viagem,
      });

      if (error) {
        throw error;
      }

      toast.success("Viagem cadastrada com sucesso!");
      navigate("/viagens"); // Redireciona para a página de listagem de viagens
    } catch (error) {
      console.error("Erro ao cadastrar viagem:", error);
      toast.error("Erro ao cadastrar viagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Nova Viagem</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="adversario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adversário</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do adversário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_jogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Jogo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Ajustar para meio-dia para evitar problemas de fuso horário
                                const adjustedDate = new Date(date);
                                adjustedDate.setHours(12, 0, 0, 0);
                                field.onChange(adjustedDate);
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo_onibus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ônibus</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de ônibus" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="43 Leitos Totais">43 Leitos Totais</SelectItem>
                          <SelectItem value="52 Leitos Master">52 Leitos Master</SelectItem>
                          <SelectItem value="56 Leitos Master">56 Leitos Master</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacidade_onibus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade do Ônibus</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(Number(e.target.value))} 
                          readOnly
                          className="bg-gray-100"
                        />
                      </FormControl>
                      <FormDescription>
                        Definido automaticamente com base no tipo de ônibus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly
                          className="bg-gray-100"
                        />
                      </FormControl>
                      <FormDescription>
                        Definido automaticamente com base no tipo de ônibus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rota da Viagem</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a rota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rio de Janeiro - Maracanã">Rio de Janeiro - Maracanã</SelectItem>
                          <SelectItem value="São Paulo - Morumbi">São Paulo - Morumbi</SelectItem>
                          <SelectItem value="Belo Horizonte - Mineirão">Belo Horizonte - Mineirão</SelectItem>
                          <SelectItem value="Porto Alegre - Beira-Rio">Porto Alegre - Beira-Rio</SelectItem>
                          <SelectItem value="Brasília - Mané Garrincha">Brasília - Mané Garrincha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Trajeto que o ônibus irá percorrer para o estádio do jogo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_viagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status da Viagem</FormLabel>
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
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Finalizada">Finalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/viagens")} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar Viagem"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CadastrarViagem;
