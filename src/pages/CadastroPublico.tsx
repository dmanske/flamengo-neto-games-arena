import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCEP, formatTelefone, formatCPF, fetchAddressByCEP } from "@/utils/cepUtils";
import { FonteConhecimento } from "@/types/entities";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";
import { FileUpload } from "@/components/ui/file-upload";

// Define the form validation schema
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  cep: z.string().min(9, { message: "CEP é obrigatório e deve estar no formato 00000-000" }),
  endereco: z.string().min(5, { message: "Endereço é obrigatório" }),
  numero: z.string().min(1, { message: "Número é obrigatório" }),
  complemento: z.string().optional(),
  bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
  telefone: z
    .string()
    .min(14, { message: "O telefone deve estar completo" })
    .regex(/^\(\d{2}\) \d \d{4}-\d{4}$/, { message: "Formato de telefone inválido" }),
  cidade: z.string().min(2, { message: "Cidade é obrigatória" }),
  estado: z.string().min(2, { message: "Estado é obrigatório" }),
  cpf: z
    .string()
    .min(14, { message: "CPF deve estar completo" })
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, { message: "Formato de CPF inválido" }),
  data_nascimento: z.string().refine((val) => {
    try {
      const date = parse(val, 'dd/MM/yyyy', new Date());
      return !isNaN(date.getTime());
    } catch {
      return false;
    }
  }, { message: "Data inválida. Use o formato DD/MM/AAAA" }),
  email: z.string().email({ message: "Email inválido" }),
  como_conheceu: z.enum(["Instagram", "Indicação", "Facebook", "Google", "Outro", "WhatsApp"], {
    message: "Por favor selecione como conheceu a Neto Tours"
  }),
  indicacao_nome: z.string().optional(),
  observacoes: z.string().optional(),
  fonte_cadastro: z.string().optional(),
  foto: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Lista de estados brasileiros para o dropdown
const estadosBrasileiros = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const CadastroPublico = () => {
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
    },
    onSuccess: () => {
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
        
        // Set the state correctly by directly using setValue with the state from the API
        form.setValue("estado", addressData.uf);
        form.setValue("bairro", addressData.bairro || "");
        
        // Trigger a re-render of the form
        form.trigger();
        
        // Se tiver complemento, adiciona ao campo complemento
        if (addressData.complemento) {
          form.setValue("complemento", addressData.complemento);
        }
        
        toast.success("Endereço encontrado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao buscar endereço. Verifique o CEP informado.");
    } finally {
      setLoadingCep(false);
    }
  };

  const watchComoConheceu = form.watch("como_conheceu");

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    addClientMutation.mutate(values);
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="flex justify-center mb-8">
        <img 
          src="https://logodetimes.com/wp-content/uploads/flamengo.png" 
          alt="Flamengo" 
          className="h-20 w-20"
        />
        <div className="ml-4 flex flex-col justify-center">
          <h1 className="text-3xl font-bold">FlaViagens</h1>
          <p className="text-sm text-gray-600">Caravanas Rubro-Negras</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Formulário de Cadastro</CardTitle>
          <CardDescription className="text-center">
            Preencha os dados para cadastro nas caravanas do Flamengo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
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
                      <FormLabel>Email*</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
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
                      <FormLabel>Telefone (WhatsApp)*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 0 0000-0000" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(formatTelefone(e.target.value));
                          }}
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
                      <FormLabel>CPF*</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(formatCPF(e.target.value));
                          }}
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Nascimento*</FormLabel>
                      <div className="flex">
                        <FormControl>
                          <Input
                            placeholder="DD/MM/AAAA"
                            {...field}
                          />
                        </FormControl>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="ml-2 px-2"
                              type="button"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value ? parse(field.value, 'dd/MM/yyyy', new Date()) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, 'dd/MM/yyyy'));
                                  setCalendarOpen(false);
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              locale={ptBR}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP*</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="00000-000" 
                            {...field} 
                            onChange={(e) => {
                              const formattedCEP = formatCEP(e.target.value);
                              field.onChange(formattedCEP);
                            }}
                            onBlur={() => handleCepBlur(field.value)}
                          />
                        </FormControl>
                        {loadingCep && (
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço*</FormLabel>
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
                        <FormLabel>Número*</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade*</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
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
                        <FormLabel>Bairro*</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, bloco, etc." {...field} />
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
                      <FormLabel>Estado*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {estadosBrasileiros.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="como_conheceu"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Como conheceu a Neto Tours?*</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Instagram" id="instagram" />
                            <FormLabel htmlFor="instagram" className="font-normal cursor-pointer">Instagram</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Facebook" id="facebook" />
                            <FormLabel htmlFor="facebook" className="font-normal cursor-pointer">Facebook</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Google" id="google" />
                            <FormLabel htmlFor="google" className="font-normal cursor-pointer">Google</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="WhatsApp" id="whatsapp" />
                            <FormLabel htmlFor="whatsapp" className="font-normal cursor-pointer">WhatsApp</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Indicação" id="indicacao" />
                            <FormLabel htmlFor="indicacao" className="font-normal cursor-pointer">Indicação</FormLabel>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Outro" id="outro" />
                            <FormLabel htmlFor="outro" className="font-normal cursor-pointer">Outro</FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="foto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sua foto</FormLabel>
                      <FormControl>
                        <FileUpload
                          value={field.value || null}
                          onChange={field.onChange}
                          bucketName="client-photos"
                          folderPath="cadastro-publico"
                          allowedFileTypes={["image/jpeg", "image/png", "image/jpg"]}
                          maxSizeInMB={5}
                          showPreview={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchComoConheceu === "Indicação" && (
                  <FormField
                    control={form.control}
                    name="indicacao_nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quem indicou?*</FormLabel>
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
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informações adicionais" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  className="bg-[#e40016] hover:bg-[#c20012]"
                  disabled={addClientMutation.isPending}
                >
                  {addClientMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Cadastrando...
                    </>
                  ) : "Cadastrar"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default CadastroPublico;
