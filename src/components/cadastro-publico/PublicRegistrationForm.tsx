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
          passeio_cristo: data.passeio_cristo,
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
              passeio_cristo: data.passeio_cristo,
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
      estado: "SC",
      cpf: "",
      data_nascimento: "",
      email: "",
      como_conheceu: fonte === 'whatsapp' ? "WhatsApp" : undefined,
      indicacao_nome: "",
      observacoes: "",
      fonte_cadastro: fonte,
      foto: null,
      passeio_cristo: "sim",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-5">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="p-10">
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-8 flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div className="text-green-800">
              <strong>Seus dados serão enviados via WhatsApp</strong><br />
              Preencha todas as informações corretamente
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6 pb-3 border-b-3 border-red-600 flex items-center gap-3">
                    <span>👤</span> Dados Pessoais
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PersonalInfoFields 
                      control={form.control} 
                      calendarOpen={calendarOpen} 
                      setCalendarOpen={setCalendarOpen} 
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-6 pb-3 border-b-3 border-red-600 flex items-center gap-3">
                    <span>📍</span> Endereço
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AddressFields 
                      control={form.control} 
                      loadingCep={loadingCep} 
                      onCepBlur={handleCepBlur} 
                      estadosBrasileiros={estadosBrasileiros}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-6 pb-3 border-b-3 border-red-600 flex items-center gap-3">
                    <span>📋</span> Informações Adicionais
                  </h2>
                  <div className="space-y-6">
                    <div className="col-span-2">
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
                                previewClassName="h-48 w-48 object-cover rounded-lg shadow-md"
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

                    <ReferralFields 
                      control={form.control} 
                      watchComoConheceu={watchComoConheceu} 
                    />
                  </div>
                </div>

                <div className="bg-slate-50 -mx-10 px-10 py-10 border-t border-slate-200">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-semibold text-center mb-6">
                      Deseja fazer o passeio no Cristo Redentor?<span className="text-red-600">*</span>
                    </h3>
                    <div className="flex justify-center gap-5">
                      <FormField
                        control={form.control}
                        name="passeio_cristo"
                        render={({ field }) => (
                          <FormItem>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Selecione uma opção" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sim">✅ Sim</SelectItem>
                                <SelectItem value="nao">❌ Não</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={loading || addClientMutation.isPending}
                  >
                    {(loading || addClientMutation.isPending) ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                        Cadastrando...
                      </>
                    ) : "📱 Enviar via WhatsApp"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>

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
            }} className="bg-red-600 hover:bg-red-700">
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
