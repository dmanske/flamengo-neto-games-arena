import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

// Schema de validação do formulário - corrigido para aceitar string vazia ou null nas observações
const formSchema = clienteFormSchema;

type FormValues = z.infer<typeof formSchema>;

export function ClienteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { validateClient, isValidating } = useClientValidation();

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
      estado: "SC",
      bairro: "",
      numero: "",
      complemento: "",
      observacoes: "",
      como_conheceu: "",
      indicacao_nome: "",
      foto: null,
    },
  });

  // Watch para mostrar preview da foto
  const clienteFoto = form.watch("foto");
  const comoConheceu = form.watch("como_conheceu");
  const nomeCliente = form.watch("nome");
  const telefone = form.watch("telefone");
  const cpfValue = form.watch("cpf");

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

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Validate for duplicates
      const validation = await validateClient(values.cpf, values.telefone, values.email);
      
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
      
      // Clean phone and CPF before saving
      const dataToSave = {
        ...values,
        telefone: cleanPhone(values.telefone),
        cpf: cleanCPF(values.cpf),
        email: values.email.toLowerCase()
      };
      
      const { data, error } = await supabase
        .from("clientes")
        .insert(dataToSave)
        .single();

      if (error) {
        throw error;
      }

      toast.success("Cliente cadastrado com sucesso!");
      navigate("/dashboard/clientes");
    } catch (error: any) {
      console.error("Erro ao cadastrar cliente:", error);
      toast.error(`Erro ao cadastrar cliente: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
                  <Input 
                    placeholder="Nome completo" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
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
                  <Input 
                    placeholder="000.000.000-00" 
                    value={field.value}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                  <Input 
                    type="date" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="exemplo@email.com" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
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
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
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
                <FormLabel>CEP *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="00000-000" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="Rua, Avenida, etc." 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="Número" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="Apartamento, bloco, etc." 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="Bairro" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="Cidade" 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
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
                  <Input 
                    placeholder="SC" 
                    maxLength={2} 
                    {...field} 
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                  />
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
                    <Input 
                      placeholder="Nome de quem indicou" 
                      {...field} 
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
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
                        <RadioGroupItem value={fonte} />
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
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isValidating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting || isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isValidating ? "Validando..." : "Salvando..."}
              </>
            ) : (
              'Cadastrar Cliente'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
