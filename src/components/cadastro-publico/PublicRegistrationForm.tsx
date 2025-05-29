import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClientValidation } from "@/hooks/useClientValidation";
import { cleanCPF, cleanPhone } from "@/utils/formatters";
import { publicRegistrationSchema, type PublicRegistrationFormData } from "./FormSchema";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";

export const PublicRegistrationForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { validateClient, isValidating } = useClientValidation();
  
  const fonte = searchParams.get('fonte') || 'publico';

  const form = useForm<PublicRegistrationFormData>({
    resolver: zodResolver(publicRegistrationSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      data_nascimento: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      como_conheceu: fonte === 'whatsapp' ? 'whatsapp' : '',
      indicacao_nome: "",
      observacoes: "",
      foto: "",
      fonte_cadastro: fonte,
    },
  });

  const onSubmit = async (data: PublicRegistrationFormData) => {
    console.log('🚀 Iniciando submissão do formulário público...', { fonte });
    
    setIsSubmitting(true);
    
    try {
      // Validar cliente
      console.log('🔍 Validando cliente...');
      const validation = await validateClient(data.cpf, data.telefone, data.email);
      
      if (!validation.isValid && validation.existingClient) {
        toast.error(validation.message || "Cliente já cadastrado");
        setIsSubmitting(false);
        return;
      }

      // Preparar dados para inserção
      const clienteData = {
        nome: data.nome.trim(),
        cpf: cleanCPF(data.cpf),
        data_nascimento: data.data_nascimento,
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
        fonte_cadastro: fonte,
        created_at: new Date().toISOString(),
      };

      console.log('💾 Inserindo cliente no banco...', { nome: clienteData.nome, fonte });

      const { data: novoCliente, error } = await supabase
        .from('clientes')
        .insert([clienteData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao cadastrar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente cadastrado com sucesso!', { id: novoCliente?.id, nome: novoCliente?.nome });

      // Feedback de sucesso
      toast.success("Cadastro realizado com sucesso! Entraremos em contato em breve.");
      
      // Reset do formulário
      form.reset();
      
      // Redirecionar para página de sucesso ou inicial
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('💥 Erro no cadastro público:', error);
      
      let errorMessage = "Erro ao realizar cadastro. Tente novamente.";
      
      if (error?.code === '23505') {
        errorMessage = "Já existe um cliente cadastrado com estes dados.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isValidating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Dados Pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>
              Preencha seus dados pessoais para o cadastro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalInfoFields form={form} />
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Informações do seu endereço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressFields form={form} />
          </CardContent>
        </Card>

        {/* Como conheceu e observações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Adicionais</CardTitle>
            <CardDescription>
              Como nos conheceu e observações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralFields form={form} />
          </CardContent>
        </Card>

        {/* Botão de submit */}
        <div className="flex justify-center pt-4">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isLoading}
            className="w-full md:w-auto bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Cadastrando..." : "Realizar Cadastro"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
