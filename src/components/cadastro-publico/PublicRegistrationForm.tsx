
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useClientValidation } from "@/hooks/useClientValidation";
import { publicRegistrationSchema, type PublicRegistrationFormData } from "./FormSchema";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PublicRegistrationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [debugMode] = useState(process.env.NODE_ENV === 'development');
  
  const { validateClient, isValidating } = useClientValidation();

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
      como_conheceu: "",
      indicacao_nome: "",
      observacoes: "",
      foto: null,
      passeio_cristo: "sim",
      fonte_cadastro: "publico",
    },
  });

  const onSubmit = async (data: PublicRegistrationFormData) => {
    console.log('🚀 Iniciando processo de cadastro...', debugMode ? data : 'dados ocultos');
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Etapa 1: Validação de duplicidade
      console.log('📋 Etapa 1: Validando duplicidade...');
      toast.loading("Verificando se já existe cadastro...", { id: "validation" });
      
      const validation = await validateClient(data.cpf, data.telefone, data.email);
      
      toast.dismiss("validation");
      
      if (!validation.isValid) {
        console.log('⚠️ Validação falhou:', validation.message);
        setSubmitError(validation.message || "Cliente já cadastrado");
        toast.error(validation.message || "Cliente já cadastrado");
        return;
      }

      console.log('✅ Etapa 1 concluída: Validação passou');

      // Etapa 2: Preparação dos dados
      console.log('📝 Etapa 2: Preparando dados para inserção...');
      toast.loading("Preparando dados...", { id: "preparation" });

      // Converter data para formato ISO
      let formattedDate: string;
      try {
        const [year, month, day] = data.data_nascimento.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        if (isNaN(dateObj.getTime())) {
          throw new Error('Data inválida');
        }
        
        formattedDate = dateObj.toISOString().split('T')[0];
        console.log('📅 Data formatada:', { original: data.data_nascimento, formatted: formattedDate });
      } catch (error) {
        console.error('❌ Erro ao formatar data:', error);
        throw new Error('Erro ao processar data de nascimento');
      }

      const clientData = {
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ''),
        data_nascimento: formattedDate,
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep.replace(/\D/g, ''),
        cidade: data.cidade,
        estado: data.estado,
        como_conheceu: data.como_conheceu,
        indicacao_nome: data.indicacao_nome,
        observacoes: data.observacoes,
        foto: data.foto,
        passeio_cristo: data.passeio_cristo,
        fonte_cadastro: data.fonte_cadastro,
      };

      console.log('✅ Etapa 2 concluída: Dados preparados');
      toast.dismiss("preparation");

      // Etapa 3: Inserção no banco
      console.log('💾 Etapa 3: Inserindo no banco de dados...');
      toast.loading("Salvando cadastro...", { id: "saving" });

      const { data: insertedClient, error } = await supabase
        .from('clientes')
        .insert([clientData])
        .select()
        .single();

      toast.dismiss("saving");

      if (error) {
        console.error('❌ Erro ao inserir cliente:', error);
        console.error('Detalhes do erro:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Erro ao salvar cadastro: ${error.message}`);
      }

      console.log('✅ Etapa 3 concluída: Cliente inserido com sucesso', insertedClient);

      // Sucesso
      setSubmitSuccess(true);
      toast.success("Cadastro realizado com sucesso! Bem-vindo(a) ao Neto Tours!");
      
      // Reset form
      form.reset();
      
      console.log('🎉 Processo de cadastro concluído com sucesso!');

    } catch (error) {
      console.error('💥 Erro durante o cadastro:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro inesperado. Tente novamente em alguns minutos.';
      
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isValidating;

  if (submitSuccess) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold text-green-700">
              Cadastro Realizado com Sucesso!
            </h3>
            <p className="text-gray-600">
              Bem-vindo(a) ao Neto Tours! Entraremos em contato em breve.
            </p>
            <Button 
              onClick={() => {
                setSubmitSuccess(false);
                form.reset();
              }}
              variant="outline"
            >
              Fazer Novo Cadastro
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Dados Pessoais</h3>
              <PersonalInfoFields form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Endereço</h3>
              <AddressFields form={form} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Como nos conheceu?</h3>
              <ReferralFields form={form} />
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-700" 
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Salvando cadastro..." : 
             isValidating ? "Verificando dados..." : 
             "Finalizar Cadastro"}
          </Button>
        </form>
      </Form>
    </div>
  );
};
