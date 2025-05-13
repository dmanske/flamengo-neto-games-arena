import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { OnibusForm } from "@/components/viagem/OnibusForm";
import { ViagemOnibus } from "@/types/entities";

// Schema para validação do formulário
const viagemFormSchema = z.object({
  adversario: z.string().min(2, "Nome do adversário é obrigatório"),
  data_jogo: z.date({
    required_error: "Data do jogo é obrigatória",
  }),
  rota: z.string({
    required_error: "Rota é obrigatória",
  }),
  status_viagem: z.string().default("Aberta"),
  logo_adversario: z.string().optional(),
  logo_flamengo: z.string().default("https://logodetimes.com/wp-content/uploads/flamengo.png"),
  valor_padrao: z.number().min(0, "O valor não pode ser negativo").optional(),
  setor_padrao: z.string().optional(),
});

type ViagemFormValues = z.infer<typeof viagemFormSchema>;

const EditarViagem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFlamengoUrl, setLogoFlamengoUrl] = useState<string>("https://logodetimes.com/wp-content/uploads/flamengo.png");
  const [logoFlamengoDialogOpen, setLogoFlamengoDialogOpen] = useState(false);
  const [onibusArray, setOnibusArray] = useState<ViagemOnibus[]>([]);
  
  // Valores padrão para o formulário
  const defaultValues: Partial<ViagemFormValues> = {
    status_viagem: "Aberta",
    logo_adversario: "",
    logo_flamengo: "https://logodetimes.com/wp-content/uploads/flamengo.png",
    valor_padrao: 0,
    setor_padrao: "Norte",
  };

  const form = useForm<ViagemFormValues>({
    resolver: zodResolver(viagemFormSchema),
    defaultValues,
  });

  const watchAdversario = form.watch("adversario");
  
  // Carrega dados da viagem quando o componente é montado
  useEffect(() => {
    const fetchViagem = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Buscar dados da viagem
        const { data: viagemData, error: viagemError } = await supabase
          .from("viagens")
          .select("*")
          .eq("id", id)
          .single();
        
        if (viagemError) {
          throw viagemError;
        }
        
        // Buscar ônibus relacionados à viagem
        const { data: onibusData, error: onibusError } = await supabase
          .from("viagem_onibus")
          .select("*")
          .eq("viagem_id", id);
        
        if (onibusError) {
          throw onibusError;
        }
        
        setOnibusArray(onibusData || []);
        
        // Se não houver ônibus, criar um padrão
        if (!onibusData || onibusData.length === 0) {
          setOnibusArray([{
            viagem_id: id,
            tipo_onibus: "43 Leitos Totais",
            empresa: "Bertoldo",
            capacidade_onibus: 43,
            numero_identificacao: "Ônibus 1"
          }]);
        }
        
        // Formatar data e preencher o formulário
        if (viagemData) {
          const dataJogo = new Date(viagemData.data_jogo);
          
          form.reset({
            adversario: viagemData.adversario,
            data_jogo: dataJogo,
            rota: viagemData.rota,
            status_viagem: viagemData.status_viagem,
            logo_adversario: viagemData.logo_adversario || "",
            logo_flamengo: viagemData.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png",
            valor_padrao: viagemData.valor_padrao || 0,
            setor_padrao: viagemData.setor_padrao || "Norte",
          });
          
          setLogoUrl(viagemData.logo_adversario || "");
          setLogoFlamengoUrl(viagemData.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png");
        }
      } catch (err) {
        console.error("Erro ao buscar dados da viagem:", err);
        toast.error("Erro ao carregar dados da viagem");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchViagem();
  }, [id, form]);

  const onSubmit = async (data: ViagemFormValues) => {
    if (!id || onibusArray.length === 0) {
      if (onibusArray.length === 0) {
        toast.error("Adicione pelo menos um ônibus para a viagem");
      }
      return;
    }
    
    setIsLoading(true);
    try {
      // Ajuste para garantir que a data está no formato correto
      const dataJogo = new Date(data.data_jogo);
      dataJogo.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
      
      // Atualizar viagem
      const { error: viagemError } = await supabase
        .from("viagens")
        .update({
          adversario: data.adversario,
          data_jogo: dataJogo.toISOString(),
          rota: data.rota,
          status_viagem: data.status_viagem,
          logo_adversario: data.logo_adversario || null,
          logo_flamengo: data.logo_flamengo || "https://logodetimes.com/wp-content/uploads/flamengo.png",
          valor_padrao: data.valor_padrao || null,
          setor_padrao: data.setor_padrao || null,
          capacidade_onibus: onibusArray.reduce((total, onibus) => total + onibus.capacidade_onibus, 0),
        })
        .eq("id", id);

      if (viagemError) {
        throw viagemError;
      }
      
      // Primeiro, buscar os IDs atuais para comparar e atualizar
      const { data: existingOnibusData, error: fetchError } = await supabase
        .from("viagem_onibus")
        .select("id")
        .eq("viagem_id", id);
        
      if (fetchError) throw fetchError;
      
      const existingIds = new Set((existingOnibusData || []).map(o => o.id));
      const currentIds = new Set(onibusArray.filter(o => o.id).map(o => o.id));
      
      // IDs para excluir (estão no banco mas não no formulário atual)
      const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));
      
      // Excluir ônibus que foram removidos
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("viagem_onibus")
          .delete()
          .in("id", idsToDelete);
        
        if (deleteError) throw deleteError;
      }
      
      // Atualizar ônibus existentes e adicionar novos
      for (const onibus of onibusArray) {
        if (onibus.id) {
          // Atualizar existente
          const { error: updateError } = await supabase
            .from("viagem_onibus")
            .update({
              tipo_onibus: onibus.tipo_onibus,
              empresa: onibus.empresa,
              capacidade_onibus: onibus.capacidade_onibus,
              numero_identificacao: onibus.numero_identificacao
            })
            .eq("id", onibus.id);
          
          if (updateError) throw updateError;
        } else {
          // Inserir novo
          const { error: insertError } = await supabase
            .from("viagem_onibus")
            .insert({
              viagem_id: id,
              tipo_onibus: onibus.tipo_onibus,
              empresa: onibus.empresa,
              capacidade_onibus: onibus.capacidade_onibus,
              numero_identificacao: onibus.numero_identificacao
            });
          
          if (insertError) throw insertError;
        }
      }

      toast.success("Viagem atualizada com sucesso!");
      navigate(`/dashboard/viagem/${id}`); // Redireciona para a página de detalhes da viagem
    } catch (error) {
      console.error("Erro ao atualizar viagem:", error);
      toast.error("Erro ao atualizar viagem. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (url: string) => {
    form.setValue("logo_adversario", url);
    setLogoUrl(url);
    setLogoDialogOpen(false);
  };

  const handleLogoFlamengoSelect = (url: string) => {
    form.setValue("logo_flamengo", url);
    setLogoFlamengoUrl(url);
    setLogoFlamengoDialogOpen(false);
  };

  const clearLogo = () => {
    form.setValue("logo_adversario", "");
    setLogoUrl("");
  };

  const clearLogoFlamengo = () => {
    // Reset to default Flamengo logo
    const defaultLogo = "https://logodetimes.com/wp-content/uploads/flamengo.png";
    form.setValue("logo_flamengo", defaultLogo);
    setLogoFlamengoUrl(defaultLogo);
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6 flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/dashboard/viagem/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Editar Viagem</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Viagem</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="adversario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adversário</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do adversário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo_adversario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo do Adversário</FormLabel>
                      <div className="flex flex-col space-y-2">
                        {logoUrl && (
                          <div className="relative w-16 h-16 mb-2">
                            <img 
                              src={logoUrl} 
                              alt="Logo do time" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://via.placeholder.com/150?text=${watchAdversario?.substring(0, 3) || 'Time'}`;
                              }} 
                            />
                            <button
                              type="button"
                              onClick={clearLogo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLogoDialogOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            {logoUrl ? "Alterar Logo" : "Selecionar Logo"}
                          </Button>
                          <input 
                            type="hidden" 
                            {...field} 
                            value={logoUrl} 
                          />
                        </div>
                      </div>
                      <FormDescription>
                        Selecione um logo para o time adversário
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logo_flamengo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo do Flamengo</FormLabel>
                      <div className="flex flex-col space-y-2">
                        {logoFlamengoUrl && (
                          <div className="relative w-16 h-16 mb-2">
                            <img 
                              src={logoFlamengoUrl} 
                              alt="Logo do Flamengo" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = "https://logodetimes.com/wp-content/uploads/flamengo.png";
                              }} 
                            />
                            <button
                              type="button"
                              onClick={clearLogoFlamengo}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-5 h-5 flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setLogoFlamengoDialogOpen(true)}
                            className="flex items-center gap-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            {logoFlamengoUrl ? "Alterar Logo" : "Selecionar Logo"}
                          </Button>
                          <input 
                            type="hidden" 
                            {...field} 
                            value={logoFlamengoUrl} 
                          />
                        </div>
                      </div>
                      <FormDescription>
                        Selecione o logo do Flamengo para esta viagem
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_jogo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Jogo</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                // Ajustar para meio-dia para evitar problemas de fuso horário
                                const adjustedDate = new Date(date);
                                adjustedDate.setHours(12, 0, 0, 0);
                                field.onChange(adjustedDate);
                              }
                            }}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rota da Viagem</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a rota" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Rio de Janeiro - Maracanã">Rio de Janeiro - Maracanã</SelectItem>
                          <SelectItem value="São Paulo - Morumbi">São Paulo - Morumbi</SelectItem>
                          <SelectItem value="Belo Horizonte - Mineirão">Belo Horizonte - Mineirão</SelectItem>
                          <SelectItem value="Porto Alegre - Beira-Rio">Porto Alegre - Beira-Rio</SelectItem>
                          <SelectItem value="Brasília - Mané Garrincha">Brasília - Mané Garrincha</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Trajeto que o ônibus irá percorrer para o estádio do jogo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_viagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status da Viagem</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                          <SelectItem value="Finalizada">Finalizada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="valor_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Padrão da Viagem</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                          className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </FormControl>
                      <FormDescription>
                        Este valor será aplicado como padrão para todos os novos passageiros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="setor_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor Padrão do Maracanã</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        value={field.value || "Norte"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor padrão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Norte">Norte</SelectItem>
                          <SelectItem value="Sul">Sul</SelectItem>
                          <SelectItem value="Leste">Leste</SelectItem>
                          <SelectItem value="Oeste">Oeste</SelectItem>
                          <SelectItem value="Maracanã Mais">Maracanã Mais</SelectItem>
                          <SelectItem value="Sem ingresso">Sem ingresso</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Este setor será aplicado como padrão para todos os novos passageiros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <OnibusForm 
                onibusArray={onibusArray} 
                onChange={setOnibusArray}
                viagemId={id}
              />

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/dashboard/viagem/${id}`)} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Dialog para buscar e selecionar logos */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Logo do Time Adversário</DialogTitle>
            <DialogDescription>
              Digite o nome do time para buscar ou cole a URL de uma imagem
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                type="text" 
                placeholder="Cole a URL da imagem" 
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleLogoSelect(logoUrl)}
                disabled={!logoUrl}
              >
                Usar URL
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Ou navegue para escolher um logo:</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://logodetimes.com/', '_blank')}
                    className="w-full"
                  >
                    Abrir LogoDeTimes.com em nova janela
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Navegue até o logo desejado, clique com o botão direito na imagem e selecione "Copiar endereço da imagem".
                    Depois, cole o endereço no campo URL acima.
                  </p>
                </div>
              </div>
              
              {watchAdversario && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Sugestão de busca:</h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`https://logodetimes.com/?s=${encodeURIComponent(watchAdversario)}`, '_blank')}
                      className="w-full"
                    >
                      Buscar "{watchAdversario}" no LogoDeTimes.com
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para buscar e selecionar logos do Flamengo */}
      <Dialog open={logoFlamengoDialogOpen} onOpenChange={setLogoFlamengoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Selecionar Logo do Flamengo</DialogTitle>
            <DialogDescription>
              Cole a URL de uma imagem ou use o logo padrão
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                type="text" 
                placeholder="Cole a URL da imagem" 
                value={logoFlamengoUrl}
                onChange={e => setLogoFlamengoUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleLogoFlamengoSelect(logoFlamengoUrl)}
                disabled={!logoFlamengoUrl}
              >
                Usar URL
              </Button>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Logo Padrão:</h3>
                <div className="flex items-center gap-4 p-4 border rounded-md">
                  <img 
                    src="https://logodetimes.com/wp-content/uploads/flamengo.png" 
                    alt="Logo do Flamengo" 
                    className="h-16 w-auto" 
                  />
                  <Button
                    onClick={() => handleLogoFlamengoSelect("https://logodetimes.com/wp-content/uploads/flamengo.png")}
                  >
                    Usar Logo Padrão
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Ou navegue para escolher um logo:</h3>
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://logodetimes.com/?s=flamengo', '_blank')}
                    className="w-full"
                  >
                    Buscar Logos do Flamengo
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Navegue até o logo desejado, clique com o botão direito na imagem e selecione "Copiar endereço da imagem".
                    Depois, cole o endereço no campo URL acima.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditarViagem;
