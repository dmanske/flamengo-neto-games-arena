import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, MapPin, Users, Save, ArrowLeft, Loader2 } from "lucide-react";
import { OnibusForm } from "@/components/viagem/OnibusForm";
import { ViagemOnibus } from "@/types/entities";
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
  cidade_embarque: z.string().default("Blumenau"),
  logo_adversario: z.string().optional(),
  logo_flamengo: z.string().optional(),
  tipo_onibus: z.string().optional(),
  empresa: z.string().optional(),
  passeios_pagos: z.array(z.string()).default([]),
  outro_passeio: z.string().optional(),
});

type ViagemFormData = z.infer<typeof viagemSchema>;

const passeiosDisponiveis = [
  "Cristo Redentor",
  "Pão de Açúcar",
  "Centro Histórico",
  "Copacabana",
  "Ipanema",
  "AquaRio"
];

export default function EditarViagem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [viagem, setViagem] = useState<any>(null);
  const [onibusArray, setOnibusArray] = useState<ViagemOnibus[]>([]);

  // Opções para selects
  const cidadesEmbarque = ["Blumenau", "Joinville", "Florianópolis", "Itajaí", "Balneário Camboriú"];
  const cidadesJogo = ["Rio de Janeiro", "São Paulo", "Belo Horizonte", "Porto Alegre", "Porto Alegre - RS", "Brasília"];
  const setoresEstadio = ["Norte", "Sul", "Leste", "Oeste", "Maracanã Mais", "Setor padrão do estádio visitante", "Sem ingresso", "A definir"];
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
      cidade_embarque: "Blumenau",
      logo_adversario: "",
      logo_flamengo: "",
      tipo_onibus: "",
      empresa: "",
      passeios_pagos: [],
      outro_passeio: "",
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

        if (data) {
          setViagem(data);

          // Preencher o formulário com os dados existentes
          form.reset({
            adversario: data.adversario || "",
            data_jogo: data.data_jogo ? formatDateOnlyForInput(data.data_jogo) : "",
            data_saida: data.data_saida ? formatDateForInput(data.data_saida) : "",
            local_jogo: data.local_jogo || "Rio de Janeiro",
            valor_padrao: data.valor_padrao?.toString() || "",

            status_viagem: data.status_viagem || "Aberta",
            setor_padrao: data.setor_padrao || "Norte",
            cidade_embarque: data.cidade_embarque || "Blumenau",
            logo_adversario: data.logo_adversario || "",
            logo_flamengo: data.logo_flamengo || "",
            tipo_onibus: data.tipo_onibus || "",
            empresa: data.empresa || "",
            passeios_pagos: data.passeios_pagos || [],
            outro_passeio: data.outro_passeio || "",
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
        cidade_embarque: data.cidade_embarque,
        logo_adversario: data.logo_adversario,
        logo_flamengo: data.logo_flamengo,
        tipo_onibus: onibusArray[0]?.tipo_onibus || data.tipo_onibus,
        empresa: onibusArray[0]?.empresa || data.empresa,
        passeios_pagos: data.passeios_pagos,
        outro_passeio: data.outro_passeio,
      };

      // Atualizar viagem
      const { error: viagemError } = await supabase
        .from("viagens")
        .update(updateData)
        .eq("id", id);

      if (viagemError) throw viagemError;

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
                          <FormLabel className="text-slate-700 font-medium">Data do Jogo</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-slate-200 focus:border-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cidadesEmbarque.map((cidade) => (
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
                              {setoresEstadio.map((setor) => (
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
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Users className="h-5 w-5 text-purple-600" />
                  Passeios Inclusos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="passeios_pagos"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {passeiosDisponiveis.map((passeio) => (
                          <FormField
                            key={passeio}
                            control={form.control}
                            name="passeios_pagos"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={passeio}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(passeio)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, passeio])
                                          : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== passeio
                                            )
                                          )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {passeio}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outro_passeio"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel className="text-slate-700 font-medium">Outro Passeio (personalizado)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite um passeio personalizado..."
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