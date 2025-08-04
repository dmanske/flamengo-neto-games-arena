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
import { cleanCPF, cleanPhone, convertBrazilianDateToISO } from "@/utils/formatters";
import { publicRegistrationSchema, type PublicRegistrationFormData } from "./FormSchema";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";
import LogoEmpresa from "@/components/empresa/LogoEmpresa";

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
    console.log('📋 Dados do formulário:', {
      nome: data.nome,
      estado: data.estado,
      como_conheceu: data.como_conheceu,
      hasEstado: !!data.estado,
      hasComoConheceu: !!data.como_conheceu
    });

    setIsSubmitting(true);

    try {
      // Validar dados críticos antes de prosseguir
      if (!data.estado || data.estado.trim() === '') {
        throw new Error('Estado é obrigatório');
      }

      // Validar cliente
      console.log('🔍 Validando cliente...');
      const validation = await validateClient(data.cpf, data.telefone, data.email);

      if (!validation.isValid && validation.existingClient) {
        toast.error(validation.message || "Cliente já cadastrado");
        setIsSubmitting(false);
        return;
      }

      // Preparar dados para inserção com validação extra
      console.log('🔧 Preparando dados para inserção...');
      
      const clienteData = {
        nome: data.nome?.trim() || '',
        cpf: cleanCPF(data.cpf || ''),
        data_nascimento: data.data_nascimento ? convertBrazilianDateToISO(data.data_nascimento) : null,
        telefone: cleanPhone(data.telefone || ''),
        email: (data.email || '').toLowerCase().trim(),
        cep: (data.cep || '').replace(/\D/g, ''),
        endereco: (data.endereco || '').trim(),
        numero: (data.numero || '').trim(),
        complemento: data.complemento?.trim() || null,
        bairro: (data.bairro || '').trim(),
        cidade: (data.cidade || '').trim(),
        estado: (data.estado || '').toUpperCase().trim(),
        como_conheceu: data.como_conheceu || '',
        indicacao_nome: data.indicacao_nome?.trim() || null,
        observacoes: data.observacoes?.trim() || null,
        foto: data.foto || null,
        fonte_cadastro: fonte,
        created_at: new Date().toISOString(),
      };

      console.log('✅ Dados preparados:', {
        nome: clienteData.nome,
        estado: clienteData.estado,
        como_conheceu: clienteData.como_conheceu,
        fonte_cadastro: clienteData.fonte_cadastro
      });

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
      console.error('📊 Stack trace:', error?.stack);
      console.error('📋 Dados que causaram erro:', {
        estado: data?.estado,
        como_conheceu: data?.como_conheceu,
        fonte
      });

      let errorMessage = "Erro ao realizar cadastro. Tente novamente.";

      if (error?.code === '23505') {
        errorMessage = "Já existe um cliente cadastrado com estes dados.";
      } else if (error?.message) {
        errorMessage = `Erro: ${error.message}`;
      }

      toast.error(errorMessage);
      
      // Em desenvolvimento, mostrar erro detalhado
      if (process.env.NODE_ENV === 'development') {
        console.error('🔍 Erro detalhado para debug:', {
          error,
          formData: data,
          fonte
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isValidating;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header com Logo da Empresa */}
      <div className="text-center mb-8 bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 pb-0">
          <LogoEmpresa size="2xl" className="justify-center" />
        </div>
        <div className="bg-white-600 text-blackfecg py-3 px-6">
          <p className="text-lg font-light italic tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Realizando sonhos, criando histórias.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Por favor, informe todos os seus dados pessoais para realizarmos o cadastro.
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
    </div>
  );
};
