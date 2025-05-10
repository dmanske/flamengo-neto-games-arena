import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { supabase } from "@/lib/supabase";
import { fetchAddressByCEP } from "@/utils/cepUtils";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { AddressFields } from "./AddressFields";
import { ReferralFields } from "./ReferralFields";
import { formSchema, FormValues, estadosBrasileiros } from "./FormSchema";
import { FileUpload } from "@/components/ui/file-upload";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function PublicRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fonte = searchParams.get('fonte') || 'site';

  // Set up react-query mutation for adding client
  const addClientMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log("Starting form submission with data:", data);
      
      try {
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
          fonte_cadastro: data.fonte_cadastro || fonte,
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
              fonte_cadastro: data.fonte_cadastro || fonte,
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
      } catch (error: any) {
        console.error("Error in mutation function:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Form submission successful");
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
      como_conheceu: fonte === 'whatsapp' ? "WhatsApp" : undefined,
      indicacao_nome: "",
      observacoes: "",
      fonte_cadastro: fonte,
      foto: null,
    },
  });

  const handleCepBlur = async (cep: string) => {
    if (cep.length < 8) return;
    
    setLoadingCep(true);
    try {
      const addressData = await fetchAddressByCEP(cep);
      if (addressData) {
        form.setValue("endereco", addressData.logradouro);
        form.setValue("cidade", addressData.localidade);
        form.setValue("estado", addressData.uf);
        form.setValue("bairro", addressData.bairro || "");
        form.trigger();
        
        if (addressData.complemento) {
          form.setValue("complemento", addressData.complemento);
        }
        
        toast.success("Endereço encontrado com sucesso!", {
          duration: 2000,
          position: "top-right"
        });
      }
    } catch (error) {
      toast.error("Erro ao buscar endereço. Verifique o CEP informado.", {
        duration: 3000,
        position: "top-right"
      });
    } finally {
      setLoadingCep(false);
    }
  };

  const watchComoConheceu = form.watch("como_conheceu");

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    console.log("Form submitted with values:", values);
    setLoading(true);
    try {
      await addClientMutation.mutateAsync(values);
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonalInfoFields 
              control={form.control} 
              calendarOpen={calendarOpen} 
              setCalendarOpen={setCalendarOpen} 
            />
            
            <AddressFields 
              control={form.control} 
              loadingCep={loadingCep} 
              onCepBlur={handleCepBlur} 
              estadosBrasileiros={estadosBrasileiros}
            />

            <ReferralFields 
              control={form.control} 
              watchComoConheceu={watchComoConheceu} 
            />

            {/* Photo Upload Field */}
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="foto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto (opcional)</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        bucketName="client-photos"
                        folderPath="clientes"
                        maxSizeInMB={2}
                        showPreview={true}
                        previewClassName="h-40 w-40 mx-auto"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button 
              type="submit" 
              className="bg-[#e40016] hover:bg-[#c20012]"
              disabled={loading || addClientMutation.isPending}
            >
              {(loading || addClientMutation.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Cadastrando...
                </>
              ) : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Form>

      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cadastro realizado com sucesso!</AlertDialogTitle>
            <AlertDialogDescription>
              Seu cadastro foi realizado com sucesso para as caravanas do Flamengo. Em breve entraremos em contato com mais informações sobre as próximas caravanas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              form.reset();
              setSuccessDialogOpen(false);
            }} className="bg-[#e40016] hover:bg-[#c20012]">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
