import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, User } from "lucide-react";
import { FonteConhecimento } from "@/types/entities";
import { FileUpload } from "@/components/FileUpload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação do formulário - corrigido para aceitar string vazia ou null nas observações
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpf: z.string().min(11, "CPF inválido"),
  data_nascimento: z.string().optional(),
  endereco: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  cep: z.string().min(8, "CEP inválido"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  estado: z.string().length(2, "Estado deve ter 2 caracteres"),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  observacoes: z.string().optional().nullable().transform(val => val === null ? "" : val),
  como_conheceu: z.string().min(2, "Selecione como conheceu a empresa"),
  indicacao_nome: z.string().optional().nullable().transform(val => val === null ? "" : val),
  foto: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Inicializar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      data_nascimento: "",
      endereco: "",
      cep: "",
      cidade: "",
      estado: "",
      bairro: "",
      numero: "",
      complemento: "",
      observacoes: "",
      como_conheceu: "",
      indicacao_nome: "",
      foto: null,
    },
  });

  // Obter o valor atual do campo "como_conheceu"
  const comoConheceu = form.watch("como_conheceu");
  const clienteFoto = form.watch("foto");

  // Carregar dados do cliente
  useEffect(() => {
    const fetchCliente = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Formatar a data para o formato do input date
          let formattedData = { ...data };
          if (formattedData.data_nascimento) {
            const dateObj = new Date(formattedData.data_nascimento);
            formattedData.data_nascimento = format(dateObj, "yyyy-MM-dd");
          }
          
          // Garantir que observacoes e indicacao_nome sejam strings vazias se for null
          formattedData.observacoes = formattedData.observacoes || "";
          formattedData.indicacao_nome = formattedData.indicacao_nome || "";
          
          // Preencher o formulário com os dados do cliente
          form.reset(formattedData);
        }
      } catch (error: any) {
        console.error("Erro ao buscar cliente:", error);
        toast.error("Erro ao carregar dados do cliente");
        navigate("/clientes");
      } finally {
        setLoading(false);
      }
    };

    fetchCliente();
  }, [id, form, navigate]);

  // Enviar o formulário
  const onSubmit = async (values: FormValues) => {
    try {
      setSubmitting(true);
      
      // Formatar a data de nascimento para o formato do banco de dados
      let formattedValues = { ...values };
      if (formattedValues.data_nascimento) {
        formattedValues.data_nascimento = new Date(formattedValues.data_nascimento).toISOString();
      }
      
      // Garantir que observacoes e indicacao_nome sejam strings vazias e não null
      formattedValues.observacoes = formattedValues.observacoes || "";
      formattedValues.indicacao_nome = formattedValues.indicacao_nome || "";
      
      const { error } = await supabase
        .from("clientes")
        .update(formattedValues)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Cliente atualizado com sucesso");
      navigate("/clientes");
    } catch (error: any) {
      console.error("Erro ao atualizar cliente:", error);
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const fontesConhecimento: FonteConhecimento[] = [
    "Instagram", 
    "Indicação", 
    "Facebook", 
    "Google", 
    "Outro"
  ];

  return (
    <div className="container py-6">
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          onClick={() => navigate("/clientes")}
          className="p-0 h-auto"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Editar Cliente</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações do Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Carregando dados do cliente...</span>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="foto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto do Cliente (opcional)</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          bucketName="client-photos"
                          allowedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
                          maxSizeInMB={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF *</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="data_nascimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Nascimento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="exemplo@email.com" {...field} />
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
                        <FormLabel>Telefone *</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP *</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço *</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número *</FormLabel>
                        <FormControl>
                          <Input placeholder="Número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input placeholder="Apartamento, bloco, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <FormControl>
                          <Input placeholder="UF" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Campo de nome da indicação condicionalmente */}
                  {comoConheceu === "Indicação" && (
                    <FormField
                      control={form.control}
                      name="indicacao_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da indicação</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome de quem indicou" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="como_conheceu"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Como conheceu *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          {fontesConhecimento.map((fonte) => (
                            <FormItem key={fonte} className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value={fonte} checked={field.value === fonte} />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {fonte}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações (opcional)" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate("/clientes")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarCliente;
