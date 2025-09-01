import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarDays, MapPin, Save, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { formatInputDateToISO } from "@/lib/date-utils";


// Logo padrão do Flamengo
const LOGO_FLAMENGO_PADRAO = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";

// Schema de validação do formulário
const formSchema = z.object({
  adversario: z.string().min(2, { message: "Adversário é obrigatório" }),
  data_jogo: z.string().min(2, { message: "Data do jogo é obrigatória" }),
  local_jogo: z.string().min(2, { message: "Local do jogo é obrigatório" }),
  logo_adversario: z.string().optional(),
  logo_flamengo: z.string().optional(),
});

type ViagemIngressoFormData = z.infer<typeof formSchema>;

const CadastrarViagemIngressos = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdversarios, setIsLoadingAdversarios] = useState(true);
  const [adversarios, setAdversarios] = useState<any[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [viagemToDelete, setViagemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  // Configurar formulário
  const form = useForm<ViagemIngressoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      adversario: "",
      data_jogo: "",
      local_jogo: "casa",
      logo_adversario: "",
      logo_flamengo: LOGO_FLAMENGO_PADRAO,
    },
  });

  // Observar mudanças no adversário para atualizar campos relacionados
  const adversario = form.watch("adversario");

  // Sincronizar logoUrl com o campo do formulário
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'logo_adversario') {
        setLogoUrl(value.logo_adversario || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Carregar adversários do banco de dados
  useEffect(() => {
    const fetchAdversarios = async () => {
      try {
        setIsLoadingAdversarios(true);
        console.log("Iniciando carregamento de adversários...");
        
        const { data, error } = await supabase
          .from("adversarios")
          .select("*")
          .neq("nome", "Flamengo") // Excluir o Flamengo da lista
          .order("nome");
          
        if (error) {
          console.error("Erro ao carregar adversários:", error);
          toast.error("Erro ao carregar adversários");
        } else if (data) {
          console.log("Adversários carregados:", data);
          setAdversarios(data);
        } else {
          console.log("Nenhum adversário encontrado");
        }
      } catch (err) {
        console.error("Exceção ao carregar adversários:", err);
      } finally {
        setIsLoadingAdversarios(false);
      }
    };
    
    fetchAdversarios();
  }, []);

  // Auto-preencher logo do adversário quando selecionar um do banco
  useEffect(() => {
    const adversario = form.watch("adversario");
    
    if (adversario && adversario !== "outro") {
      const adversarioSelecionado = adversarios.find(adv => adv.nome === adversario);
      if (adversarioSelecionado && adversarioSelecionado.logo_url) {
        form.setValue("logo_adversario", adversarioSelecionado.logo_url);
        setLogoUrl(adversarioSelecionado.logo_url);
      }
    } else if (adversario === "outro") {
      // Limpar logo quando selecionar "outro"
      form.setValue("logo_adversario", "");
      setLogoUrl("");
    }
  }, [form.watch("adversario"), form, adversarios]);



  // Enviar o formulário
  const onSubmit = async (data: ViagemIngressoFormData) => {
    try {
      setIsLoading(true);
      
      console.log("Dados do formulário:", data);

      const dataJogoFormatted = formatInputDateToISO(data.data_jogo);
      
      // Criar a viagem específica para ingressos
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens_ingressos")
        .insert({
          adversario: data.adversario,
          data_jogo: dataJogoFormatted,
          local_jogo: data.local_jogo,
          logo_adversario: data.logo_adversario,
          logo_flamengo: data.logo_flamengo || LOGO_FLAMENGO_PADRAO,
          valor_padrao: 100.00, // Valor padrão
          status: "Ativa", // Status padrão
        })
        .select();

      if (viagemError) throw viagemError;

      toast.success("Viagem para ingressos cadastrada com sucesso!");
      navigate("/dashboard/ingressos");
    } catch (error: any) {
      console.error("Erro ao cadastrar viagem:", error);
      toast.error(`Erro ao cadastrar viagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para deletar viagem de ingressos
  const handleDeleteViagem = async (viagemId: string, viagemNome: string) => {
    try {
      setIsDeleting(true);

      console.log(`Iniciando exclusão da viagem de ingressos: ${viagemId} - ${viagemNome}`);

      const { error } = await supabase
        .from('viagens_ingressos')
        .delete()
        .eq('id', viagemId);

      if (error) {
        throw error;
      }

      console.log(`Viagem de ingressos excluída com sucesso: ${viagemId}`);

      toast.success(`Viagem de ingressos "${viagemNome}" removida com sucesso`);
      setViagemToDelete(null);
      
      // Recarregar a página para atualizar a lista
      window.location.reload();
    } catch (err: any) {
      console.error('Erro ao excluir viagem de ingressos:', err);
      toast.error(`Erro ao excluir viagem de ingressos: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cadastrar Viagem para Ingressos</h1>
        <Button variant="outline" onClick={() => navigate("/dashboard/ingressos")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações do Jogo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Jogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adversário */}
              <FormField
                control={form.control}
                name="adversario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adversário *</FormLabel>
                    {isLoadingAdversarios ? (
                      <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-600">Carregando adversários...</span>
                      </div>
                    ) : (
                      <>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o adversário" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {adversarios.map((adv) => (
                              <SelectItem key={adv.id} value={adv.nome}>
                                {adv.nome}
                              </SelectItem>
                            ))}
                            <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                          </SelectContent>
                        </Select>
                        {field.value === "outro" && (
                          <Input
                            placeholder="Digite o nome do adversário"
                            value={field.value === "outro" ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="mt-2"
                          />
                        )}
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data do Jogo */}
              <FormField
                control={form.control}
                name="data_jogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Jogo *</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <CalendarDays className="mr-2 h-4 w-4 text-gray-500" />
                        <Input
                          type="datetime-local"
                          placeholder="Data e hora do jogo"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Local do Jogo */}
              <FormField
                control={form.control}
                name="local_jogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local do Jogo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="casa">Casa (Maracanã)</SelectItem>
                        <SelectItem value="fora">Fora (Visitante)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />






            </CardContent>
          </Card>

          {/* Logos e Visualização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logos e Visualização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Logo do Adversário */}
              <FormField
                control={form.control}
                name="logo_adversario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo do Adversário</FormLabel>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-4 mb-2 p-3 border rounded-md">
                        <div className="relative w-16 h-16">
                          <img 
                            src={LOGO_FLAMENGO_PADRAO} 
                            alt="Logo do Flamengo" 
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "https://via.placeholder.com/64?text=FLA";
                            }} 
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-600">X</span>
                        <div className="relative w-16 h-16 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                          {logoUrl ? (
                            <img 
                              src={logoUrl} 
                              alt="Logo do adversário" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "https://via.placeholder.com/64x64/e5e7eb/9ca3af?text=?";
                              }} 
                            />
                          ) : (
                            <span className="text-2xl text-gray-400">?</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">Flamengo x {form.watch("adversario") || "Adversário"}</span>
                          <span className="text-xs text-gray-500">Preview do confronto</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder="URL do logo (opcional)" 
                            {...field} 
                            value={field.value || ""}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setLogoUrl(e.target.value);
                            }}
                          />
                        </FormControl>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs text-gray-500">
                          Digite a URL do logo ou selecione um adversário para usar seu logo oficial
                        </p>
                        <a 
                          href="https://logodetimes.com/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Buscar logos em logodetimes.com
                        </a>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Viagem
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal de Confirmação de Exclusão */}
      {viagemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir a viagem de ingressos <strong>"{viagemToDelete.adversario}"</strong>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setViagemToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteViagem(viagemToDelete.id, viagemToDelete.adversario)}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CadastrarViagemIngressos;