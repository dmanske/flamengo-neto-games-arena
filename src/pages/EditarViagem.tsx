import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PasseiosSection } from "@/components/viagem/PasseiosSection";
import { OutroPasseioSection } from "@/components/viagem/OutroPasseioSection";
import { TipoPagamentoSection } from "@/components/viagem/TipoPagamentoSection";
import type { ViagemFormData } from "@/types/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, MapPin, Users, Save, ArrowLeft, Loader2 } from "lucide-react";
import { OnibusForm } from "@/components/viagem/OnibusForm";
import { ViagemOnibus } from "@/types/entities";
import { getEstadioByAdversario, getSetorOptions, shouldShowNomeEstadio } from "@/data/estadios";
import { CIDADES_EMBARQUE_COMPLETA, isCidadeOutra, isCidadePredefinida } from "@/data/cidades";
import { formatDateOnlyForInput, formatDateForInput, formatInputDateToISO } from "@/lib/date-utils";

// Schema de validação
const viagemSchema = z.object({
  adversario: z.string().min(1, "Adversário é obrigatório"),
  data_jogo: z.string().min(1, "Data do jogo é obrigatória"),
  data_saida: z.string().min(1, "Data e hora da saída é obrigatória"),
  local_jogo: z.string().default("Rio de Janeiro"),
  valor_padrao: z.string().optional(),
  status_viagem: z.string().default("Aberta"),
  setor_padrao: z.string().optional(),
  nome_estadio: z.string().optional(),
  cidade_embarque: z.string().default("Blumenau"),
  logo_adversario: z.string().optional(),
  logo_flamengo: z.string().optional(),
  tipo_onibus: z.string().optional(),
  empresa: z.string().optional(),
  passeios_selecionados: z.array(z.string()).default([]),
  outro_passeio: z.string().optional(),
  // Novos campos para sistema avançado de pagamento
  tipo_pagamento: z.enum(['livre', 'parcelado_flexivel', 'parcelado_obrigatorio']).default('livre'),
  exige_pagamento_completo: z.boolean().default(false),
  dias_antecedencia: z.number().min(1).max(30).default(5),
  permite_viagem_com_pendencia: z.boolean().default(true),
});

// Using ViagemFormData from types/entities.ts

// Removido: passeiosDisponiveis - agora vem do banco de dados

export default function EditarViagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [viagem, setViagem] = useState<any>(null);
  const [onibusArray, setOnibusArray] = useState<ViagemOnibus[]>([]);

  // Estados para cidade de embarque
  const [cidadeEmbarqueCustom, setCidadeEmbarqueCustom] = useState("");
  const cidadesJogo = ["Rio de Janeiro", "São Paulo", "Belo Horizonte", "Porto Alegre", "Porto Alegre - RS", "Brasília"];
  // Função para obter setores dinamicamente baseado no local do jogo
  const getSetoresDisponiveis = () => {
    const localJogo = form.watch("local_jogo");
    return getSetorOptions(localJogo);
  };
  const statusOptions = ["Aberta", "Fechada", "Cancelada", "Finalizada", "Em andamento"];

  const form = useForm<ViagemFormData>({
    resolver: zodResolver(viagemSchema),
    defaultValues: {
      adversario: "",
      data_jogo: "",
      data_saida: "",
      local_jogo: "Rio de Janeiro",
      valor_padrao: "",
      status_viagem: "Aberta",
      setor_padrao: "Norte",
      nome_estadio: "",
      cidade_embarque: "Blumenau",
      logo_adversario: "",
      logo_flamengo: "",
      tipo_onibus: "",
      empresa: "",
      passeios_selecionados: [],
      outro_passeio: "",
      // Novos campos para sistema avançado de pagamento
      tipo_pagamento: 'livre',
      exige_pagamento_completo: false,
      dias_antecedencia: 5,
      permite_viagem_com_pendencia: true,
    }
  });

  // Carregar dados da viagem
  useEffect(() => {
    const carregarViagem = async () => {
      if (!id) return;

      try {
        setIsLoadingData(true);
        const { data, error } = await supabase
          .from("viagens")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        // Buscar ônibus relacionados à viagem
        const { data: onibusData, error: onibusError } = await supabase
          .from("viagem_onibus")
          .select("*")
          .eq("viagem_id", id);

        if (onibusError) throw onibusError;

        setOnibusArray(onibusData || []);

        // Buscar passeios relacionados à viagem
        const { data: viagemPasseiosData, error: viagemPasseiosError } = await supabase
          .from("viagem_passeios")
          .select("passeio_id")
          .eq("viagem_id", id);

        if (viagemPasseiosError) throw viagemPasseiosError;

        const passeiosSelecionados = viagemPasseiosData?.map(vp => vp.passeio_id) || [];

        if (data) {
          setViagem(data);

          // Preencher o formulário com os dados existentes
          form.reset({
            adversario: data.adversario || "",
            data_jogo: data.data_jogo ? formatDateForInput(data.data_jogo) : "",
            data_saida: data.data_saida ? formatDateForInput(data.data_saida) : "",
            local_jogo: data.local_jogo || "Rio de Janeiro",
            valor_padrao: data.valor_padrao?.toString() || "",
            status_viagem: data.status_viagem || "Aberta",
            setor_padrao: data.setor_padrao || "Norte",
            nome_estadio: data.nome_estadio || "",
            cidade_embarque: data.cidade_embarque || "Blumenau",
            logo_adversario: data.logo_adversario || "",
            logo_flamengo: data.logo_flamengo || "",
            tipo_onibus: data.tipo_onibus || "",
            empresa: data.empresa || "",
            passeios_selecionados: passeiosSelecionados,
            outro_passeio: data.outro_passeio || "",
            // Novos campos para sistema avançado de pagamento (com fallback para viagens antigas)
            tipo_pagamento: data.tipo_pagamento || 'livre',
            exige_pagamento_completo: data.exige_pagamento_completo || false,
            dias_antecedencia: data.dias_antecedencia || 5,
            permite_viagem_com_pendencia: data.permite_viagem_com_pendencia !== undefined ? data.permite_viagem_com_pendencia : true,
          });
        }
      } catch (error: any) {
        console.error("Erro ao carregar viagem:", error);
        toast.error("Erro ao carregar dados da viagem");
        navigate("/dashboard/viagens");
      } finally {
        setIsLoadingData(false);
      }
    };

    carregarViagem();
  }, [id, form, navigate]);

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
    const setoresRio = ["Norte", "Sul", "Leste", "Oeste", "Maracanã Mais"];
    const setoresVisitante = ["Setor Casa", "Setor Visitante"];
    
    if (localJogo === "Rio de Janeiro") {
      // Jogo no Rio - usar setores do Maracanã
      if (!setoresRio.includes(setorAtual) && setorAtual !== "Sem ingresso") {
        form.setValue("setor_padrao", "Norte");
      }
    } else {
      // Jogo fora do Rio - usar setores visitante
      if (!setoresVisitante.includes(setorAtual) && setorAtual !== "Sem ingresso") {
        form.setValue("setor_padrao", "Setor Visitante");
      }
    }
  }, [form.watch("adversario"), form.watch("local_jogo"), form]);

  const onSubmit = async (data: ViagemFormData) => {
    if (!id || onibusArray.length === 0) {
      if (onibusArray.length === 0) {
        toast.error("Adicione pelo menos um ônibus para a viagem");
      }
      return;
    }

    try {
      setIsLoading(true);

      // Calcular capacidade total dos ônibus
      const capacidadeTotal = onibusArray.reduce((total, onibus) =>
        total + onibus.capacidade_onibus + (onibus.lugares_extras || 0), 0
      );

      const updateData = {
        adversario: data.adversario,
        data_jogo: formatInputDateToISO(data.data_jogo),
        data_saida: formatInputDateToISO(data.data_saida),
        local_jogo: data.local_jogo,
        valor_padrao: data.valor_padrao ? parseFloat(data.valor_padrao) : null,
        capacidade_onibus: capacidadeTotal,
        status_viagem: data.status_viagem,
        setor_padrao: data.setor_padrao,
        nome_estadio: data.nome_estadio || null,
        cidade_embarque: data.cidade_embarque,
        logo_adversario: data.logo_adversario,
        logo_flamengo: data.logo_flamengo,
        tipo_onibus: onibusArray[0]?.tipo_onibus || data.tipo_onibus,
        empresa: onibusArray[0]?.empresa || data.empresa,
        passeios_pagos: [], // Manter compatibilidade
        outro_passeio: data.outro_passeio,
        // Novos campos para sistema avançado de pagamento
        tipo_pagamento: data.tipo_pagamento,
        exige_pagamento_completo: data.exige_pagamento_completo,
        dias_antecedencia: data.dias_antecedencia,
        permite_viagem_com_pendencia: data.permite_viagem_com_pendencia,
      };

      // Atualizar viagem
      const { error: viagemError } = await supabase
        .from("viagens")
        .update(updateData)
        .eq("id", id);

      if (viagemError) throw viagemError;

      // Atualizar relacionamentos de passeios
      // Primeiro, remover todos os passeios existentes
      const { error: deletePasseiosError } = await supabase
        .from('viagem_passeios')
        .delete()
        .eq('viagem_id', id);

      if (deletePasseiosError) throw deletePasseiosError;

      // Depois, adicionar os novos passeios selecionados
      if (data.passeios_selecionados && data.passeios_selecionados.length > 0) {
        // Buscar os passeios para obter os valores atuais
        const { data: passeiosData, error: passeiosError } = await supabase
          .from('passeios')
          .select('id, valor')
          .in('id', data.passeios_selecionados);

        if (passeiosError) throw passeiosError;

        // Criar novos relacionamentos viagem-passeios
        const viagemPasseios = passeiosData.map(passeio => ({
          viagem_id: id,
          passeio_id: passeio.id,
          valor_cobrado: passeio.valor
        }));

        const { error: viagemPasseiosError } = await supabase
          .from('viagem_passeios')
          .insert(viagemPasseios);

        if (viagemPasseiosError) throw viagemPasseiosError;
      }

      // Gerenciar ônibus - buscar IDs existentes
      const { data: existingOnibusData, error: fetchError } = await supabase
        .from("viagem_onibus")
        .select("id")
        .eq("viagem_id", id);

      if (fetchError) throw fetchError;

      const existingIds = new Set((existingOnibusData || []).map(o => o.id));
      const currentIds = new Set(onibusArray.filter(o => o.id && !o.id.startsWith('temp-')).map(o => o.id));

      // IDs para excluir (estão no banco mas não no formulário atual)
      const idsToDelete = [...existingIds].filter(id => !currentIds.has(id));

      // Verificar se há passageiros associados aos ônibus que serão excluídos
      if (idsToDelete.length > 0) {
        const { data: passageirosAssociados, error: checkPassageirosError } = await supabase
          .from("viagem_passageiros")
          .select("onibus_id")
          .in("onibus_id", idsToDelete);

        if (checkPassageirosError) throw checkPassageirosError;

        if (passageirosAssociados && passageirosAssociados.length > 0) {
          toast.error(`Não é possível excluir ônibus que têm passageiros associados. Por favor, realoque ou remova os passageiros primeiro.`);
          setIsLoading(false);
          return;
        }

        // Se não houver passageiros associados, então exclui os ônibus
        const { error: deleteError } = await supabase
          .from("viagem_onibus")
          .delete()
          .in("id", idsToDelete);

        if (deleteError) throw deleteError;
      }

      // Atualizar ônibus existentes e adicionar novos
      for (const onibus of onibusArray) {
        if (onibus.id && !onibus.id.startsWith('temp-')) {
          // Atualizar existente
          const { error: updateError } = await supabase
            .from("viagem_onibus")
            .update({
              capacidade_onibus: onibus.capacidade_onibus,
              numero_identificacao: onibus.numero_identificacao,
              lugares_extras: onibus.lugares_extras || 0
            })
            .eq("id", onibus.id);

          if (updateError) throw updateError;
        } else {
          // Inserir novo
          const { error: insertError } = await supabase
            .from("viagem_onibus")
            .insert({
              viagem_id: id,
              capacidade_onibus: onibus.capacidade_onibus,
              numero_identificacao: onibus.numero_identificacao,
              tipo_onibus: onibus.tipo_onibus,
              empresa: onibus.empresa,
              lugares_extras: onibus.lugares_extras || 0
            });

          if (insertError) throw insertError;
        }
      }

      toast.success("Viagem atualizada com sucesso!");
      navigate(`/dashboard/viagem/${id}`);
    } catch (error: any) {
      console.error("Erro ao atualizar viagem:", error);
      toast.error(`Erro ao atualizar viagem: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-slate-600">Carregando dados da viagem...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Viagem não encontrada</h1>
            <Button onClick={() => navigate("/dashboard/viagens")}>
              Voltar para Viagens
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/dashboard/viagem/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-700 bg-clip-text text-transparent">
                Editar Viagem
              </h1>
              <p className="text-slate-600 mt-1">
                {viagem.adversario} • {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações da Viagem */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                    Informações da Viagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <FormField
                    control={form.control}
                    name="adversario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Adversário</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Vasco, Botafogo, Palmeiras..."
                            {...field}
                            className="border-slate-200 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_jogo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Data e Hora do Jogo</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              className="border-slate-200 focus:border-blue-500"
                            />
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
                          <FormLabel className="text-slate-700 font-medium">Data e Hora da Saída</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              className="border-slate-200 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="local_jogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Local do Jogo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200 focus:border-blue-500">
                              <SelectValue placeholder="Selecione a cidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cidadesJogo.map((cidade) => (
                              <SelectItem key={cidade} value={cidade}>
                                {cidade}
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
                    name="status_viagem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Status da Viagem</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Configurações */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_padrao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Valor Padrão (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              className="border-slate-200 focus:border-blue-500"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cidade_embarque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Cidade de Embarque</FormLabel>
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
                                <SelectTrigger className="border-slate-200 focus:border-blue-500">
                                  <SelectValue />
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
                                className="border-slate-200 focus:border-blue-500"
                              />
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="setor_padrao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-medium">Setor Padrão</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500">
                                <SelectValue />
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
                            <FormLabel className="text-slate-700 font-medium">Nome do Estádio</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Arena do Grêmio, Estádio Beira-Rio"
                                className="border-slate-200 focus:border-blue-500"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="logo_adversario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Logo do Adversário (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://exemplo.com/logo.png"
                            {...field}
                            className="border-slate-200 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo_flamengo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-medium">Logo do Flamengo (URL)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://logodetimes.com/times/flamengo/logo-flamengo-256.png"
                            {...field}
                            className="border-slate-200 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                </CardContent>
              </Card>
            </div>

            {/* Passeios */}
            <PasseiosSection form={form} />

            <OutroPasseioSection form={form} />

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

            {/* Gerenciamento de Ônibus */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-orange-600" />
                  Ônibus da Viagem
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <OnibusForm
                  onibusArray={onibusArray}
                  onChange={setOnibusArray}
                />
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/dashboard/viagem/${id}`)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}