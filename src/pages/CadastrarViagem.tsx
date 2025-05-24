import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Image as ImageIcon, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
import { supabase } from "@/lib/supabase";
import { OnibusForm } from "@/components/viagem/OnibusForm";
import { ViagemOnibus, TipoOnibus, EmpresaOnibus } from "@/types/entities";

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

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [onibusArray, setOnibusArray] = useState<ViagemOnibus[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Valores padrão para o formulário
  const defaultValues: Partial<ViagemFormValues> = {
    adversario: "",
    data_jogo: null,
    rota: "",
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

  const handlePrimaryBusChange = (tipo: TipoOnibus, empresa: EmpresaOnibus) => {
    // Esta função é passada para o OnibusForm para informar a mudança no ônibus principal
  };

  const onSubmit = async (data: ViagemFormValues) => {
    if (onibusArray.length === 0) {
      toast.error("Adicione pelo menos um ônibus para a viagem");
      return;
    }
    
    setIsLoading(true);
    try {
      // Ajuste para garantir que a data está no formato correto
      const dataJogo = new Date(data.data_jogo);
      dataJogo.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso horário
      
      // Obter o tipo e empresa do primeiro ônibus para a viagem
      const primaryBus = onibusArray[0];
      
      // Primeiro, criamos a viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .insert({
          adversario: data.adversario,
          data_jogo: dataJogo.toISOString(),
          rota: data.rota,
          status_viagem: data.status_viagem,
          logo_adversario: data.logo_adversario || null,
          logo_flamengo: data.logo_flamengo,
          valor_padrao: data.valor_padrao || null,
          setor_padrao: data.setor_padrao || null,
          // Preenchendo os campos obrigatórios com os dados do primeiro ônibus
          tipo_onibus: primaryBus.tipo_onibus,
          empresa: primaryBus.empresa,
          // Calculamos a capacidade total somando todos os ônibus
          capacidade_onibus: onibusArray.reduce((total, onibus) => total + onibus.capacidade_onibus, 0),
        })
        .select("id")
        .single();

      if (viagemError) throw viagemError;
      
      // Em seguida, inserimos os ônibus relacionados à viagem
      const viagemId = viagemData.id;
      
      const onibusWithViagemId = onibusArray.map(onibus => ({
        ...onibus,
        viagem_id: viagemId
      }));
      
      const { error: onibusError } = await supabase
        .from("viagem_onibus")
        .insert(onibusWithViagemId);
        
      if (onibusError) throw onibusError;

      toast.success("Viagem cadastrada com sucesso!");
      
      navigate("/dashboard/viagens"); // Redireciona para a lista de viagens
    } catch (error: any) {
      console.error("Erro ao cadastrar viagem:", error);
      toast.error(`Erro ao cadastrar viagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoSelect = (url: string) => {
    form.setValue("logo_adversario", url);
    setLogoUrl(url);
    setLogoDialogOpen(false);
  };

  const clearLogo = () => {
    form.setValue("logo_adversario", "");
    setLogoUrl("");
  };

  registerLocale("pt-BR", ptBR);

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Cadastrar Nova Viagem</h1>

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
                  name="data_jogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Jogo</FormLabel>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: 240 }}>
                        <DatePicker
                            selected={field.value}
                          onChange={(date: Date | null) => {
                            field.onChange(date);
                            setOpen(false);
                          }}
                          dateFormat="dd/MM/yyyy"
                          locale="pt-BR"
                          placeholderText="DD/MM/AAAA"
                          className="input w-full pr-12"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          minDate={new Date()}
                          customInput={<Input style={{ paddingRight: 36 }} />}
                          preventOpenOnFocus={true}
                          open={open}
                          onClickOutside={() => setOpen(false)}
                        />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon
                            size={20}
                            onClick={e => {
                              e.preventDefault();
                              setOpen(true);
                            }}
                          />
                        </span>
                      </div>
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
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                        Este valor será aplicado como padrão para todos os passageiros
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
                        defaultValue={field.value}
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
                        Este setor será aplicado como padrão para todos os passageiros
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <OnibusForm 
                onibusArray={onibusArray} 
                onChange={setOnibusArray}
                onPrimaryBusChange={handlePrimaryBusChange}
              />

              <div className="flex justify-end gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard/viagens")} 
                  type="button"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar Viagem"}
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
            <DialogTitle>Selecionar Logo do Time</DialogTitle>
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
    </div>
  );
};

export default CadastrarViagem;
