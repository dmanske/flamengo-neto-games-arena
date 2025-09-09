import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PasseiosSection } from "@/components/viagem/PasseiosSection";
import { TipoPagamentoSection } from "@/components/viagem/TipoPagamentoSection";
import type { ViagemFormData } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Users, Plus, Trash2 } from "lucide-react";
import { formatInputDateToISO } from "@/lib/date-utils";
import { getEstadioByAdversario, getSetorOptions, shouldShowNomeEstadio } from "@/data/estadios";
import { CIDADES_EMBARQUE_COMPLETA, isCidadeOutra, isCidadePredefinida } from "@/data/cidades";

// Removido: passeiosDisponiveis - agora vem do banco de dados

// Logo padrão do Flamengo
const LOGO_FLAMENGO_PADRAO = "https://logodetimes.com/times/flamengo/logo-flamengo-256.png";

// Definir o schema de validação
const viagemSchema = z.object({
  adversario: z.string().min(1, "Adversário é obrigatório"),
  data_jogo: z.string().min(1, "Data do jogo é obrigatória"),
  data_saida: z.string().min(1, "Data e hora da saída é obrigatória"),
  local_jogo: z.string().default("Rio de Janeiro"),
  valor_padrao: z.string().optional(),
  capacidade_onibus: z.string().min(1, "Capacidade do ônibus é obrigatória"),
  status_viagem: z.string().default("Aberta"),
  setor_padrao: z.string().optional(),
  nome_estadio: z.string().optional(),
  cidade_embarque: z.string().default("Blumenau"),
  logo_adversario: z.string().optional(),
  logo_flamengo: z.string().default(LOGO_FLAMENGO_PADRAO),
  passeios_selecionados: z.array(z.string()).default([]),

  tipo_pagamento: z.enum(['livre', 'parcelado_flexivel', 'parcelado_obrigatorio']).default('livre'),
  exige_pagamento_completo: z.boolean().default(false),
  dias_antecedencia: z.number().min(1).max(30).default(5),
  permite_viagem_com_pendencia: z.boolean().default(true),
});

// Using ViagemFormData from types/entities.ts

// Interface para os dados do ônibus
interface OnibusFormData {
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: string;
  lugares_extras: string;
  numero_identificacao: string;
  onibus_id: string;
  cor_onibus?: string;
  image_path?: string;
}

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para os ônibus
  const [onibusItems, setOnibusItems] = useState<OnibusFormData[]>([{
    tipo_onibus: "",
    empresa: "",
    capacidade_onibus: "",
    lugares_extras: "0",
    numero_identificacao: "",
    onibus_id: "",
    cor_onibus: "",
    image_path: ""
  }]);
  
  // Estado para os ônibus cadastrados
  const [onibusCadastrados, setOnibusCadastrados] = useState<any[]>([]);
  
  // Estado para os adversários
  const [adversarios, setAdversarios] = useState<any[]>([]);
  const [isLoadingAdversarios, setIsLoadingAdversarios] = useState(true);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");

  // Estados para cidade de embarque
  const [cidadeEmbarqueCustom, setCidadeEmbarqueCustom] = useState("");
  const cidadesJogo = ["Rio de Janeiro", "São Paulo", "Belo Horizonte", "Porto Alegre", "Brasília", "Salvador", "Recife", "Fortaleza"];
  // Função para obter setores dinamicamente baseado no local do jogo
  const getSetoresDisponiveis = () => {
    const localJogo = form.watch("local_jogo");
    return getSetorOptions(localJogo);
  };

  // Inicializar o formulário
  const form = useForm<ViagemFormData>({
    resolver: zodResolver(viagemSchema),
    defaultValues: {
      adversario: "",
      data_jogo: "",
      data_saida: "",
      local_jogo: "Rio de Janeiro",
      valor_padrao: "",
      capacidade_onibus: "46",
      status_viagem: "Aberta",
      setor_padrao: "Norte",
      nome_estadio: "",
      cidade_embarque: "Blumenau",
      logo_adversario: "",
      logo_flamengo: LOGO_FLAMENGO_PADRAO,
      passeios_selecionados: [],
  
      // Novos campos para sistema avançado de pagamento
      tipo_pagamento: 'livre',
      exige_pagamento_completo: false,
      dias_antecedencia: 5,
      permite_viagem_com_pendencia: true,
      _isCustomAdversario: false,
      _isCustomLocal: false,
    },
  });

  // Sincronizar logoUrl com o campo do formulário
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'logo_adversario') {
        setLogoUrl(value.logo_adversario || '');
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Carregar adversários
  useEffect(() => {
    const fetchAdversarios = async () => {
      try {
        setIsLoadingAdversarios(true);
        console.log("Iniciando carregamento de adversários...");
        
        // Usar uma consulta mais simples para testar
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
  
  // Carregar ônibus cadastrados
  useEffect(() => {
    const fetchOnibus = async () => {
      const { data, error } = await supabase
        .from('onibus')
        .select('*')
        .order('tipo_onibus');
      
      if (!error && data) {
        setOnibusCadastrados(data);
      }
    };
    
    fetchOnibus();
  }, []);

  // Atualizar a capacidade total quando os ônibus mudam
  useEffect(() => {
    const totalCapacidade = onibusItems.reduce((total, onibus) => {
      const capacidade = parseInt(onibus.capacidade_onibus) || 0;
      const extras = parseInt(onibus.lugares_extras) || 0;
      return total + capacidade + extras;
    }, 0);
    
    form.setValue("capacidade_onibus", totalCapacidade.toString());
  }, [onibusItems, form]);

  // Atualizar setor padrão e nome do estádio baseado no adversário e local do jogo
  useEffect(() => {
    const adversario = form.watch("adversario");
    const localJogo = form.watch("local_jogo");
    
    // Auto-preencher nome do estádio baseado no adversário
    if (adversario && localJogo !== "Rio de Janeiro") {
      const estadio = getEstadioByAdversario(adversario);
      form.setValue("nome_estadio", estadio);
    } else {
      form.setValue("nome_estadio", "");
    }
    
    // Atualizar opções de setor baseado no local do jogo
    const setorAtual = form.watch("setor_padrao");
    const setoresDisponiveis = getSetorOptions(localJogo);
    
    // Se o setor atual não está mais disponível para o novo local, resetar para o primeiro disponível
    if (setorAtual && !setoresDisponiveis.includes(setorAtual)) {
      const novoSetor = localJogo === "Rio de Janeiro" ? "Norte" : "Setor Visitante";
      form.setValue("setor_padrao", novoSetor);
    }
  }, [form.watch("adversario"), form.watch("local_jogo"), form]);

  // Adicionar um novo ônibus
  const addOnibusItem = () => {
    setOnibusItems([...onibusItems, {
      tipo_onibus: "",
      empresa: "",
      capacidade_onibus: "",
      lugares_extras: "0",
      numero_identificacao: "",
      onibus_id: "",
      cor_onibus: "",
      image_path: ""
    }]);
  };

  // Remover um ônibus
  const removeOnibusItem = (index: number) => {
    if (onibusItems.length > 1) {
      setOnibusItems(onibusItems.filter((_, i) => i !== index));
    }
  };

  // Atualizar um ônibus
  const updateOnibusItem = (index: number, field: keyof OnibusFormData, value: string) => {
    const updated = [...onibusItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Se selecionou um ônibus existente, preencher os outros campos automaticamente
    if (field === 'onibus_id' && value) {
      const onibusSelected = onibusCadastrados.find(o => o.id === value);
      if (onibusSelected) {
        updated[index] = {
          ...updated[index],
          onibus_id: value,
          tipo_onibus: onibusSelected.tipo_onibus,
          empresa: onibusSelected.empresa,
          capacidade_onibus: onibusSelected.capacidade.toString(),
          numero_identificacao: onibusSelected.numero_identificacao || "",
          cor_onibus: onibusSelected.cor || "",
          image_path: onibusSelected.image_path || ""
        };
      }
    }
    
    setOnibusItems(updated);
  };

  // Enviar o formulário
  const onSubmit = async (data: ViagemFormData) => {
    try {
      setIsLoading(true);
      
      console.log("Dados do formulário:", data);
      console.log("Passeios selecionados:", data.passeios_selecionados);

      // Validar dados dos ônibus
      for (const onibus of onibusItems) {
        if (!onibus.onibus_id) {
          toast.error("Selecione um ônibus para cada item");
          setIsLoading(false);
          return;
        }
      }

      const dataJogoFormatted = formatInputDateToISO(data.data_jogo);
      
      // Criar a viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .insert({
          adversario: data.adversario,
          data_jogo: dataJogoFormatted,
          data_saida: formatInputDateToISO(data.data_saida),
          local_jogo: data.local_jogo,
          valor_padrao: data.valor_padrao ? parseFloat(data.valor_padrao) : null,
          capacidade_onibus: parseInt(data.capacidade_onibus),
          status_viagem: data.status_viagem,
          setor_padrao: data.setor_padrao,
          nome_estadio: data.nome_estadio || null,
          cidade_embarque: data.cidade_embarque,
          logo_adversario: data.logo_adversario,
          logo_flamengo: data.logo_flamengo || LOGO_FLAMENGO_PADRAO,
          passeios_pagos: [], // Manter compatibilidade, mas usar nova estrutura

          tipo_onibus: onibusItems[0]?.tipo_onibus || "",
          empresa: onibusItems[0]?.empresa || "",
          // Novos campos para sistema avançado de pagamento
          tipo_pagamento: data.tipo_pagamento,
          exige_pagamento_completo: data.exige_pagamento_completo,
          dias_antecedencia: data.dias_antecedencia,
          permite_viagem_com_pendencia: data.permite_viagem_com_pendencia,
        })
        .select()
        .single();

      if (viagemError) throw viagemError;

      // Criar entradas de ônibus
      for (const onibus of onibusItems) {
        const { error: onibusError } = await supabase
          .from("viagem_onibus")
          .insert({
            viagem_id: viagemData.id,
            tipo_onibus: onibus.tipo_onibus,
            empresa: onibus.empresa,
            capacidade_onibus: parseInt(onibus.capacidade_onibus),
            lugares_extras: parseInt(onibus.lugares_extras) || 0,
            numero_identificacao: onibus.numero_identificacao,
          });

        if (onibusError) throw onibusError;
      }

      // Salvar relacionamentos de passeios selecionados
      if (data.passeios_selecionados && data.passeios_selecionados.length > 0) {
        // Buscar os passeios para obter os valores atuais
        const { data: passeiosData, error: passeiosError } = await supabase
          .from('passeios')
          .select('id, valor')
          .in('id', data.passeios_selecionados);

        if (passeiosError) throw passeiosError;

        // Criar relacionamentos viagem-passeios
        const viagemPasseios = passeiosData.map(passeio => ({
          viagem_id: viagemData.id,
          passeio_id: passeio.id,
          valor_cobrado: passeio.valor
        }));

        const { error: viagemPasseiosError } = await supabase
          .from('viagem_passeios')
          .insert(viagemPasseios);

        if (viagemPasseiosError) throw viagemPasseiosError;
      }

      toast.success("Viagem cadastrada com sucesso!");
      navigate(`/dashboard/viagem/${viagemData.id}`);
    } catch (error: any) {
      console.error("Erro ao cadastrar viagem:", error);
      toast.error(`Erro ao cadastrar viagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cadastrar Nova Viagem</h1>
        <p className="text-gray-600 mt-2">Preencha as informações da viagem e configure os ônibus</p>
      </div>
      
      {/* Diálogo para selecionar logo do adversário */}
      <Dialog open={logoDialogOpen} onOpenChange={setLogoDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <CardTitle>Selecionar Adversário e Logo</CardTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {isLoadingAdversarios ? (
              <div className="col-span-full text-center py-4">Carregando logos...</div>
            ) : (
              adversarios && adversarios.length > 0 ? (
                <>
                  <div className="col-span-full mb-4">
                    <h3 className="font-medium text-sm mb-1">Selecione um adversário para usar seu logo oficial</h3>
                    <p className="text-xs text-gray-500">Clique em um time para selecionar</p>
                  </div>
                  {adversarios.map((adv) => (
                    <div 
                      key={adv.id} 
                      className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => {
                        form.setValue("adversario", adv.nome);
                        form.setValue("logo_adversario", adv.logo_url);
                        setLogoUrl(adv.logo_url);
                        setLogoDialogOpen(false);
                      }}
                    >
                      <img 
                        src={adv.logo_url} 
                        alt={adv.nome} 
                        className="w-16 h-16 object-contain mb-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://via.placeholder.com/64?text=?";
                        }}
                      />
                      <span className="text-xs text-center font-medium">{adv.nome}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="col-span-full text-center py-4">Nenhum adversário encontrado</div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações da Viagem */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Informações da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="adversario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adversário</FormLabel>
                      <div className="space-y-4">
                        {!form.watch("_isCustomAdversario") ? (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  if (value === "outro") {
                                    // Marcar um estado especial para indicar entrada manual
                                    field.onChange(""); // Limpar o campo para permitir entrada manual
                                    form.setValue("_isCustomAdversario", true); // Campo auxiliar para controlar o estado
                                  } else {
                                    field.onChange(value);
                                    form.setValue("_isCustomAdversario", false);
                                    // Encontrar o logo do adversário selecionado
                                    const adversario = adversarios.find(a => a.nome === value);
                                    if (adversario && adversario.logo_url) {
                                      setLogoUrl(adversario.logo_url);
                                      form.setValue("logo_adversario", adversario.logo_url);
                                    }
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o adversário" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="outro">Outro (digitar manualmente)</SelectItem>
                                  {adversarios && adversarios.length > 0 ? (
                                    adversarios.map((adv) => (
                                      <SelectItem key={adv.id} value={adv.nome}>
                                        <div className="flex items-center gap-2">
                                          {adv.logo_url && (
                                            <img 
                                              src={adv.logo_url} 
                                              alt={adv.nome} 
                                              className="w-5 h-5 object-contain"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.onerror = null;
                                                target.src = "https://via.placeholder.com/20?text=?";
                                              }}
                                            />
                                          )}
                                          {adv.nome}
                                        </div>
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="carregando" disabled>Carregando adversários...</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setLogoDialogOpen(true)}
                              className="flex-shrink-0"
                            >
                              Ver Logos
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <FormLabel>Nome do Adversário</FormLabel>
                                <Input 
                                  placeholder="Digite o nome do adversário" 
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  form.setValue("_isCustomAdversario", false);
                                  field.onChange("");
                                }}
                                className="flex-shrink-0 mt-6"
                              >
                                Voltar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_jogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora do Jogo</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_saida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data e Hora da Saída</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="local_jogo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local do Jogo</FormLabel>
                      <div className="space-y-4">
                        {!form.watch("_isCustomLocal") ? (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <Select
                                value={field.value}
                                onValueChange={(value) => {
                                  if (value === "outro") {
                                    field.onChange("");
                                    form.setValue("_isCustomLocal", true);
                                  } else {
                                    field.onChange(value);
                                    form.setValue("_isCustomLocal", false);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a cidade do jogo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="outro">Outra cidade (digitar manualmente)</SelectItem>
                                  {cidadesJogo.map((cidade) => (
                                    <SelectItem key={cidade} value={cidade}>
                                      {cidade}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <FormLabel>Nome da Cidade</FormLabel>
                                <Input 
                                  placeholder="Digite a cidade do jogo" 
                                  value={field.value}
                                  onChange={(e) => field.onChange(e.target.value)}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  form.setValue("_isCustomLocal", false);
                                  field.onChange("Rio de Janeiro");
                                }}
                                className="flex-shrink-0 mt-6"
                              >
                                Voltar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Padrão (R$)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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

                <FormField
                  control={form.control}
                  name="status_viagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status da Viagem</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aberta">Aberta</SelectItem>
                          <SelectItem value="Fechada">Fechada</SelectItem>
                          <SelectItem value="Em andamento">Em andamento</SelectItem>
                          <SelectItem value="Concluída">Concluída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="setor_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor Padrão do Estádio</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o setor padrão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getSetoresDisponiveis().map((setor) => (
                            <SelectItem key={setor} value={setor}>
                              {setor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-500 mt-1">
                        {form.watch("local_jogo") === "Rio de Janeiro" ? 
                          "Para jogos no Rio de Janeiro, use os setores do Maracanã" : 
                          "Para jogos fora do Rio, recomendamos 'Setor padrão do estádio visitante' ou 'Sem ingresso'"
                        }
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo Nome do Estádio - só aparece para jogos fora do Rio */}
                {shouldShowNomeEstadio(form.watch("local_jogo")) && (
                  <FormField
                    control={form.control}
                    name="nome_estadio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Estádio</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Arena do Grêmio, Estádio Beira-Rio"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500 mt-1">
                          Preenchido automaticamente para Grêmio e Internacional
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="cidade_embarque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de Embarque</FormLabel>
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (isCidadeOutra(value)) {
                              setCidadeEmbarqueCustom("");
                              field.onChange(""); // Limpar para permitir input manual
                            } else {
                              setCidadeEmbarqueCustom("");
                              field.onChange(value);
                            }
                          }} 
                          value={isCidadePredefinida(field.value) ? field.value : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a cidade de embarque" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CIDADES_EMBARQUE_COMPLETA.map((cidade) => (
                              <SelectItem key={cidade} value={cidade}>
                                {cidade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Campo manual quando "Outra" for selecionada ou valor não está na lista predefinida */}
                        {(field.value === "" || !isCidadePredefinida(field.value)) && (
                          <Input
                            placeholder="Digite o nome da cidade"
                            value={cidadeEmbarqueCustom || field.value}
                            onChange={(e) => {
                              const value = e.target.value;
                              setCidadeEmbarqueCustom(value);
                              field.onChange(value);
                            }}
                          />
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <PasseiosSection form={form} />



                {/* Seção de Tipo de Pagamento */}
                <TipoPagamentoSection
                  tipoPagamento={form.watch('tipo_pagamento')}
                  onTipoPagamentoChange={(tipo) => form.setValue('tipo_pagamento', tipo)}
                  exigePagamentoCompleto={form.watch('exige_pagamento_completo')}
                  onExigePagamentoCompletoChange={(exige) => form.setValue('exige_pagamento_completo', exige)}
                  diasAntecedencia={form.watch('dias_antecedencia')}
                  onDiasAntecedenciaChange={(dias) => form.setValue('dias_antecedencia', dias)}
                  permiteViagemComPendencia={form.watch('permite_viagem_com_pendencia')}
                  onPermiteViagemComPendenciaChange={(permite) => form.setValue('permite_viagem_com_pendencia', permite)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Ônibus */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Ônibus da Viagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {onibusItems.map((onibus, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Ônibus {index + 1}</h4>
                      {onibusItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeOnibusItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <FormLabel htmlFor={`onibus_id_${index}`}>Selecionar Ônibus</FormLabel>
                      <Select
                        value={onibus.onibus_id}
                        onValueChange={(value) => updateOnibusItem(index, 'onibus_id', value)}
                      >
                        <SelectTrigger id={`onibus_id_${index}`}>
                          <SelectValue placeholder="Selecione um ônibus cadastrado" />
                        </SelectTrigger>
                        <SelectContent>
                          {onibusCadastrados.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {o.tipo_onibus} - {o.empresa} {o.numero_identificacao ? `(${o.numero_identificacao})` : ''} 
                              {o.cor ? `- Cor: ${o.cor}` : ''} - {o.capacidade} passageiros
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {onibus.onibus_id && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-sm border" style={{ 
                          borderColor: onibus.cor_onibus ? onibus.cor_onibus : '#e5e7eb',
                          borderWidth: onibus.cor_onibus ? '2px' : '1px'
                        }}>
                          {onibus.image_path && (
                            <div className="mb-3 flex justify-center">
                              <img 
                                src={onibus.image_path} 
                                alt={`${onibus.tipo_onibus} - ${onibus.empresa}`} 
                                className="h-32 object-contain rounded-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.onerror = null;
                                  target.src = "https://via.placeholder.com/300x200?text=Sem+Imagem";
                                }}
                              />
                            </div>
                          )}
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-500">Tipo de Ônibus:</span>
                            <span className="ml-2 text-gray-900">{onibus.tipo_onibus}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-500">Empresa:</span>
                            <span className="ml-2 text-gray-900">{onibus.empresa}</span>
                          </div>
                          <div className="mb-2">
                            <span className="text-sm font-medium text-gray-500">Capacidade:</span>
                            <span className="ml-2 text-gray-900">{onibus.capacidade_onibus} lugares</span>
                          </div>
                          {onibus.numero_identificacao && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-500">Identificação:</span>
                              <span className="ml-2 text-gray-900">{onibus.numero_identificacao}</span>
                            </div>
                          )}
                          {onibus.cor_onibus && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-500">Cor:</span>
                              <span className="ml-2 text-gray-900">{onibus.cor_onibus}</span>
                              <div 
                                className="inline-block ml-2 w-4 h-4 rounded-full border border-gray-300" 
                                style={{ backgroundColor: onibus.cor_onibus }}
                              ></div>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <FormLabel htmlFor={`lugares_extras_${index}`}>Lugares Extras</FormLabel>
                          <Input
                            id={`lugares_extras_${index}`}
                            type="number"
                            value={onibus.lugares_extras}
                            onChange={(e) => updateOnibusItem(index, 'lugares_extras', e.target.value)}
                            placeholder="Ex: 0"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Capacidade total: {parseInt(onibus.capacidade_onibus || "0") + parseInt(onibus.lugares_extras || "0")} lugares
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOnibusItem}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Outro Ônibus
                </Button>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">
                    Capacidade Total: {onibusItems.reduce((total, onibus) => {
                      const capacidade = parseInt(onibus.capacidade_onibus || "0");
                      const extras = parseInt(onibus.lugares_extras || "0");
                      return total + capacidade + extras;
                    }, 0)} passageiros
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard/viagens")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Cadastrando..." : "Cadastrar Viagem"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CadastrarViagem;