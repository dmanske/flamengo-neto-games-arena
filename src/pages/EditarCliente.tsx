import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft } from "lucide-react";
import { FonteConhecimento } from "@/types/entities";
import { FileUpload } from "@/components/ui/file-upload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useClientValidation } from "@/hooks/useClientValidation";
import { formatPhone, formatCPF, cleanPhone, cleanCPF } from "@/utils/formatters";
import { formSchema as clienteFormSchema } from "@/components/cadastro-publico/FormSchema";

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
const formSchema = clienteFormSchema;

type FormValues = z.infer<typeof formSchema>;

const EditarCliente = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { validateClient, isValidating } = useClientValidation();

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
  const nomeCliente = form.watch("nome");

  // Format phone on change
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    form.setValue("telefone", formatted);
  };

  // Format CPF on change
  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value);
    form.setValue("cpf", formatted);
  };

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
            // Se já está no formato YYYY-MM-DD, usar diretamente
            if (formattedData.data_nascimento.includes('-') && formattedData.data_nascimento.length === 10) {
              // Já está no formato correto
            } else {
              // Converter de timestamp para YYYY-MM-DD
              const dateObj = new Date(formattedData.data_nascimento);
              if (!isNaN(dateObj.getTime())) {
                const year = dateObj.getFullYear();
                const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const day = dateObj.getDate().toString().padStart(2, '0');
                formattedData.data_nascimento = `${year}-${month}-${day}`;
              }
            }
          }
          
          // Format phone and CPF for display
          formattedData.telefone = formatPhone(formattedData.telefone);
          formattedData.cpf = formatCPF(formattedData.cpf);
          
          // Garantir que observacoes e indicacao_nome sejam strings vazias se for null
          formattedData.observacoes = formattedData.observacoes || "";
          formattedData.indicacao_nome = formattedData.indicacao_nome || "";
          
          // Preencher o formulário com os dados do cliente
          form.reset(formattedData);
        }
      } catch (error: any) {
        console.error("Erro ao buscar cliente:", error);
        toast.error("Erro ao carregar dados do cliente");
        navigate("/dashboard/clientes");
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
      
      // Validate for duplicates (excluding current client)
      const validation = await validateClient(values.cpf, values.telefone, values.email, id);
      
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
      
      // Formatar a data de nascimento para o formato do banco de dados
      let formattedValues = { ...values };
      
      // Tratar a data de nascimento
      if (formattedValues.data_nascimento && formattedValues.data_nascimento.trim() !== '') {
        try {
          // Tenta converter a data no formato DD/MM/AAAA ou DD/MM/AA
          const dateParts = formattedValues.data_nascimento.split('/');
          if (dateParts.length === 3) {
            const day = parseInt(dateParts[0]);
            const month = parseInt(dateParts[1]);
            let year = parseInt(dateParts[2]);
            
            // Converter anos de 2 dígitos para 4 dígitos
            if (year < 100) {
              // Se o ano for menor que 30, assume 20xx, senão 19xx
              year = year < 30 ? 2000 + year : 1900 + year;
            }
            
            // Criar data no formato YYYY-MM-DD para evitar problemas de timezone
            formattedValues.data_nascimento = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          } else {
            // Se não estiver no formato esperado, tenta converter diretamente
            const date = new Date(formattedValues.data_nascimento);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const day = date.getDate().toString().padStart(2, '0');
              formattedValues.data_nascimento = `${year}-${month}-${day}`;
            } else {
              formattedValues.data_nascimento = null;
            }
          }
        } catch (error) {
          console.error("Erro ao converter data de nascimento:", error);
          formattedValues.data_nascimento = null;
        }
      } else {
        formattedValues.data_nascimento = null;
      }
      
      // Clean phone and CPF before saving
      formattedValues.telefone = cleanPhone(formattedValues.telefone);
      formattedValues.cpf = cleanCPF(formattedValues.cpf);
      formattedValues.email = formattedValues.email.toLowerCase();
      
      // Garantir que observacoes e indicacao_nome sejam strings vazias e não null
      formattedValues.observacoes = formattedValues.observacoes || "";
      formattedValues.indicacao_nome = formattedValues.indicacao_nome || "";
      
      // Remover campos que não devem ser atualizados
      delete formattedValues.foto;
      
      const { error } = await supabase
        .from("clientes")
        .update(formattedValues)
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Cliente atualizado com sucesso");
      navigate("/dashboard/clientes");
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
          onClick={() => navigate("/dashboard/clientes")}
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
                <div className="flex flex-col items-center gap-4 mb-6">
                  <FormField
                    control={form.control}
                    name="foto"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center">
                        <FormLabel>Foto do Cliente (opcional)</FormLabel>
                        
                        {/* Preview da foto */}
                        <div className="flex flex-col items-center gap-3">
                          <Avatar className="h-24 w-24 border-2 border-gray-200">
                            {clienteFoto ? (
                              <AvatarImage 
                                src={clienteFoto} 
                                alt={nomeCliente || "Preview"}
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="bg-gray-100 text-gray-400 text-lg">
                                {nomeCliente ? nomeCliente.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "FT"}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          
                          <FormControl>
                            <FileUpload
                              value={field.value}
                              onChange={field.onChange}
                              bucketName="client-photos"
                              folderPath="clientes"
                              maxSizeInMB={5}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="000.000.000-00 (opcional)" 
                            value={field.value}
                            onChange={(e) => handleCPFChange(e.target.value)}
                            className="bg-white"
                          />
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
                          <Input 
                            placeholder="(00) 00000-0000" 
                            value={field.value}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                            className="bg-white"
                          />
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
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000 (opcional)" {...field} />
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
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc. (opcional)" {...field} />
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
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="Número (opcional)" {...field} />
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
                          <Input placeholder="Apartamento, bloco, etc. (opcional)" {...field} />
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
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro (opcional)" {...field} />
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
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade (opcional)" {...field} />
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
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="UF (opcional)" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {comoConheceu === "Indicação" && (
                    <FormField
                      control={form.control}
                      name="indicacao_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da indicação</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome de quem indicou (opcional)" {...field} className="bg-white" />
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
                    onClick={() => navigate("/dashboard/clientes")}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || isValidating}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {submitting || isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isValidating ? "Validando..." : "Salvando..."}
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
