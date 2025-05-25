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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
        // Verificar duplicidade de CPF apenas se CPF foi fornecido
        if (data.cpf) {
          const { data: existingCPF, error: cpfError } = await supabase
            .from('clientes')
            .select('id')
            .eq('cpf', data.cpf)
            .single();

          if (existingCPF) {
            throw new Error("CPF já cadastrado no sistema");
          }
        }

        // Verificar duplicidade de telefone
        const { data: existingPhone, error: phoneError } = await supabase
          .from('clientes')
          .select('id')
          .eq('telefone', data.telefone)
          .single();

        if (existingPhone) {
          throw new Error("Telefone já cadastrado no sistema");
        }

        // Convert string date to Date object for API
        let dataNascimento = null;
        if (data.data_nascimento && data.data_nascimento.trim() !== '') {
          try {
            // Tenta converter a data no formato DD/MM/AAAA
            const dateParts = data.data_nascimento.split('/');
            if (dateParts.length === 3) {
              dataNascimento = new Date(
                parseInt(dateParts[2]), // year
                parseInt(dateParts[1]) - 1, // month (0-based)
                parseInt(dateParts[0]) // day
              ).toISOString();
            } else {
              // Se não estiver no formato esperado, tenta converter diretamente
              const date = new Date(data.data_nascimento);
              if (!isNaN(date.getTime())) {
                dataNascimento = date.toISOString();
              }
            }
          } catch (error) {
            console.error("Erro ao converter data de nascimento:", error);
            // Se houver erro na conversão, mantém como null
          }
        }

        const clientData = {
          nome: data.nome,
          endereco: data.endereco || null,
          numero: data.numero || null,
          complemento: data.complemento || null,
          bairro: data.bairro || null,
          telefone: data.telefone,
          cep: data.cep || null,
          cidade: data.cidade || null,
          estado: data.estado || null,
          cpf: data.cpf || null,
          data_nascimento: dataNascimento,
          email: data.email,
          como_conheceu: data.como_conheceu || null,
          indicacao_nome: data.indicacao_nome || null,
          observacoes: data.observacoes || null,
          fonte_cadastro: data.fonte_cadastro || fonte,
          foto: data.foto || null,
        };

        console.log("Inserting client data:", clientData);

        // Insert client into Supabase
        const { data: client, error } = await supabase
          .from('clientes')
          .insert([clientData])
          .select();
          
        console.log("Supabase response:", { client, error });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        return client;
      } catch (error: any) {
        console.error("Error in mutation function:", error);
        if (error.message === "CPF já cadastrado no sistema" || error.message === "Telefone já cadastrado no sistema") {
          throw error;
        }
        throw new Error("Erro ao cadastrar cliente. Tente novamente.");
      }
    },
    onSuccess: () => {
      console.log("Form submission successful");
      // Send WhatsApp message (in production you'd use a proper API/service)
      console.log(`Enviando mensagem para ${form.getValues().telefone}: 🎟️ Olá, ${form.getValues().nome}! Seu cadastro foi realizado com sucesso para as caravanas do Flamengo. 🔴⚫ Em breve, você poderá escolher sua caravana para o próximo jogo!`);
      
      // Show success dialog
      setSuccessDialogOpen(true);
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar cliente:", error);
      if (error.message === "CPF já cadastrado no sistema") {
        toast.error("Este CPF já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato conosco.");
      } else if (error.message === "Telefone já cadastrado no sistema") {
        toast.error("Este telefone já está cadastrado no sistema. Por favor, verifique os dados ou entre em contato conosco.");
      } else {
        toast.error("Erro ao cadastrar cliente. Tente novamente.");
      }
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
      estado: "SC",
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
      <style>{`
        @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
        a[href*="lovable.dev"],
        iframe[src*="lovable.dev"],
        div[style*="Edit with Lovable"],
        .lovable-badge {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          position: absolute !important;
          z-index: -9999 !important;
        }
      `}</style>
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

            <div className="col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="fonte_cadastro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fonte do Cadastro</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <FormField
                control={form.control}
                name="foto"
                render={({ field }) => (
                  <FormItem className="flex flex-col w-full">
                    <FormLabel className="mb-2">Foto do Cliente (opcional)</FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value || null}
                        onChange={field.onChange}
                        bucketName="client-photos"
                        folderPath="cadastro-publico"
                        maxSizeInMB={2}
                        showPreview={true}
                        previewClassName="h-32 w-32 md:h-48 md:w-48 object-cover rounded-lg shadow-md"
                        uploadText="Clique ou arraste para enviar uma foto (máx. 2MB)"
                      />
                    </FormControl>
                    {field.value && (
                      <span className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {field.value.split('/').pop()}
                      </span>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-center md:justify-end mt-6">
            <Button 
              type="submit" 
              variant="default"
              className="w-full md:w-auto"
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

