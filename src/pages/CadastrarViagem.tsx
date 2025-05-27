
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, MapPin, Users, DollarSign, Plus, Trash2 } from "lucide-react";

const passeiosDisponiveis = [
  "Cristo Redentor",
  "Pão de Açúcar",
  "Centro Histórico",
  "Copacabana",
  "Ipanema"
];

const viagemSchema = z.object({
  adversario: z.string().min(1, "Adversário é obrigatório"),
  data_jogo: z.string().min(1, "Data do jogo é obrigatória"),
  rota: z.string().min(1, "Rota é obrigatória"),
  valor_padrao: z.string().min(1, "Valor padrão é obrigatório"),
  capacidade_onibus: z.string().min(1, "Capacidade do ônibus é obrigatória"),
  status_viagem: z.string().default("Aberta"),
  setor_padrao: z.string().optional(),
  cidade_embarque: z.string().default("Blumenau"),
  logo_adversario: z.string().optional(),
  passeios_pagos: z.array(z.string()).default([]),
  outro_passeio: z.string().optional(),
});

type ViagemFormData = z.infer<typeof viagemSchema>;

interface OnibusFormData {
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: string;
  lugares_extras: string;
  numero_identificacao: string;
}

const CadastrarViagem = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [onibusItems, setOnibusItems] = useState<OnibusFormData[]>([{
    tipo_onibus: "",
    empresa: "",
    capacidade_onibus: "",
    lugares_extras: "0",
    numero_identificacao: ""
  }]);

  const form = useForm<ViagemFormData>({
    resolver: zodResolver(viagemSchema),
    defaultValues: {
      adversario: "",
      data_jogo: "",
      rota: "",
      valor_padrao: "",
      capacidade_onibus: "",
      status_viagem: "Aberta",
      setor_padrao: "",
      cidade_embarque: "Blumenau",
      logo_adversario: "",
      passeios_pagos: [],
      outro_passeio: "",
    },
  });

  const addOnibusItem = () => {
    setOnibusItems([...onibusItems, {
      tipo_onibus: "",
      empresa: "",
      capacidade_onibus: "",
      lugares_extras: "0",
      numero_identificacao: ""
    }]);
  };

  const removeOnibusItem = (index: number) => {
    if (onibusItems.length > 1) {
      setOnibusItems(onibusItems.filter((_, i) => i !== index));
    }
  };

  const updateOnibusItem = (index: number, field: keyof OnibusFormData, value: string) => {
    const updated = [...onibusItems];
    updated[index] = { ...updated[index], [field]: value };
    setOnibusItems(updated);
  };

  useEffect(() => {
    const totalCapacidade = onibusItems.reduce((total, onibus) => {
      const capacidade = parseInt(onibus.capacidade_onibus) || 0;
      const extras = parseInt(onibus.lugares_extras) || 0;
      return total + capacidade + extras;
    }, 0);
    
    form.setValue("capacidade_onibus", totalCapacidade.toString());
  }, [onibusItems, form]);

  const onSubmit = async (data: ViagemFormData) => {
    try {
      setIsLoading(true);

      // Validate onibus data
      for (const onibus of onibusItems) {
        if (!onibus.tipo_onibus || !onibus.empresa || !onibus.capacidade_onibus) {
          toast.error("Todos os campos de ônibus são obrigatórios");
          return;
        }
      }

      const dataJogoFormatted = new Date(data.data_jogo).toISOString();
      
      // Create viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .insert({
          adversario: data.adversario,
          data_jogo: dataJogoFormatted,
          rota: data.rota,
          valor_padrao: parseFloat(data.valor_padrao),
          capacidade_onibus: parseInt(data.capacidade_onibus),
          status_viagem: data.status_viagem,
          setor_padrao: data.setor_padrao,
          cidade_embarque: data.cidade_embarque,
          logo_adversario: data.logo_adversario,
          passeios_pagos: data.passeios_pagos,
          outro_passeio: data.outro_passeio,
          tipo_onibus: onibusItems[0]?.tipo_onibus || "",
          empresa: onibusItems[0]?.empresa || "",
        })
        .select()
        .single();

      if (viagemError) throw viagemError;

      // Create onibus entries
      for (const onibus of onibusItems) {
        const { error: onibusError } = await supabase
          .from("viagem_onibus")
          .insert({
            viagem_id: viagemData.id,
            tipo_onibus: onibus.tipo_onibus,
            empresa: onibus.empresa,
            capacidade_onibus: parseInt(onibus.capacidade_onibus),
            lugares_extras: parseInt(onibus.lugares_extras),
            numero_identificacao: onibus.numero_identificacao,
          });

        if (onibusError) throw onibusError;
      }

      toast.success("Viagem cadastrada com sucesso!");
      navigate("/dashboard/viagens");
    } catch (error: any) {
      console.error("Erro ao cadastrar viagem:", error);
      toast.error("Erro ao cadastrar viagem: " + error.message);
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
                      <FormControl>
                        <Input placeholder="Ex: Santos" {...field} />
                      </FormControl>
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
                  name="rota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rota</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Rio de Janeiro - Maracanã" {...field} />
                      </FormControl>
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
                  name="setor_padrao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor Padrão do Estádio</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Norte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cidade_embarque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade de Embarque</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Blumenau" {...field} />
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
                      <FormLabel>URL do Logo do Adversário</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/logo.png" {...field} />
                      </FormControl>
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
                          <SelectItem value="Cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Passeios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Passeios Inclusos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="passeios_pagos"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Passeios Pagos Inclusos</FormLabel>
                      </div>
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
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, passeio])
                                        : field.onChange(
                                            currentValue?.filter(
                                              (value) => value !== passeio
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {passeio}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="outro_passeio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outro Passeio (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Descreva outro passeio incluso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`tipo_onibus_${index}`}>Tipo de Ônibus</Label>
                        <Input
                          id={`tipo_onibus_${index}`}
                          value={onibus.tipo_onibus}
                          onChange={(e) => updateOnibusItem(index, 'tipo_onibus', e.target.value)}
                          placeholder="Ex: Executivo"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`empresa_${index}`}>Empresa</Label>
                        <Input
                          id={`empresa_${index}`}
                          value={onibus.empresa}
                          onChange={(e) => updateOnibusItem(index, 'empresa', e.target.value)}
                          placeholder="Ex: Auto Viação"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`capacidade_${index}`}>Capacidade</Label>
                        <Input
                          id={`capacidade_${index}`}
                          type="number"
                          value={onibus.capacidade_onibus}
                          onChange={(e) => updateOnibusItem(index, 'capacidade_onibus', e.target.value)}
                          placeholder="40"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`lugares_extras_${index}`}>Lugares Extras</Label>
                        <Input
                          id={`lugares_extras_${index}`}
                          type="number"
                          value={onibus.lugares_extras}
                          onChange={(e) => updateOnibusItem(index, 'lugares_extras', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <Label htmlFor={`numero_identificacao_${index}`}>Número de Identificação</Label>
                        <Input
                          id={`numero_identificacao_${index}`}
                          value={onibus.numero_identificacao}
                          onChange={(e) => updateOnibusItem(index, 'numero_identificacao', e.target.value)}
                          placeholder="Ex: Ônibus 001"
                        />
                      </div>
                    </div>
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
                      const capacidade = parseInt(onibus.capacidade_onibus) || 0;
                      const extras = parseInt(onibus.lugares_extras) || 0;
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
