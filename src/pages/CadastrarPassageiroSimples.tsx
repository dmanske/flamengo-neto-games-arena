import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { getSetorLabel, getSetorOptions } from "@/data/estadios";
import { formatCurrency } from "@/lib/utils";

// Schema de validação do formulário
const formSchema = z.object({
  nome: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  telefone: z
    .string()
    .min(10, { message: "O telefone deve ter pelo menos 10 dígitos" })
    .regex(/^[0-9]+$/, { message: "O telefone deve conter apenas números" }),
  email: z.string().email({ message: "Email inválido" }),
  cidade_embarque: z.string().min(2, { message: "Cidade de embarque é obrigatória" }),
  setor_maracana: z.string().min(2, { message: "Setor do Maracanã é obrigatório" }),
  numero_onibus: z.string().min(1, { message: "Número do ônibus é obrigatório" }),
  viagem_id: z.string().min(1, { message: "Selecione uma viagem" }),
  valor: z.number().min(1, { message: "Valor deve ser maior que zero" }),
  desconto: z.number().min(0, { message: "Desconto não pode ser negativo" }),
  status_pagamento: z.enum(["Pendente", "Pago", "Cancelado"] as const),
});

type FormValues = z.infer<typeof formSchema>;

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  valor_padrao?: number;
  local_jogo?: string;
  nome_estadio?: string;
}

const CadastrarPassageiroSimples = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const navigate = useNavigate();

  // Configurar formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      email: "",
      cidade_embarque: "",
      setor_maracana: "",
      numero_onibus: "",
      viagem_id: "",
      valor: 800, // Valor padrão
      desconto: 0,
      status_pagamento: "Pendente",
    },
  });

  // Carregar viagens disponíveis
  useEffect(() => {
    const carregarViagens = async () => {
      try {
        const { data, error } = await supabase
          .from('viagens')
          .select('id, adversario, data_jogo, valor_padrao, local_jogo, nome_estadio')
          .gte('data_jogo', new Date().toISOString().split('T')[0])
          .order('data_jogo', { ascending: true });

        if (error) throw error;
        setViagens(data || []);
      } catch (error) {
        console.error('Erro ao carregar viagens:', error);
        toast.error('Erro ao carregar viagens disponíveis');
      }
    };

    carregarViagens();
  }, []);

  // Atualizar valor quando viagem mudar
  const handleViagemChange = (viagemId: string) => {
    const viagem = viagens.find(v => v.id === viagemId);
    if (viagem) {
      setViagemSelecionada(viagem);
      form.setValue('viagem_id', viagemId);
      if (viagem.valor_padrao) {
        form.setValue('valor', viagem.valor_padrao);
      }
    }
  };

  // Calcular valor final
  const valor = form.watch('valor');
  const desconto = form.watch('desconto');
  const valorFinal = valor - desconto;

  // Submeter formulário
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // 1. Criar cliente
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .insert({
          nome: values.nome,
          telefone: values.telefone,
          email: values.email,
          cidade: values.cidade_embarque,
          cpf: "",
          data_nascimento: new Date().toISOString(),
          cep: "",
          bairro: "",
          endereco: "",
          estado: "",
          como_conheceu: "Cadastro pelo app"
        })
        .select('id')
        .single();

      if (clienteError) throw clienteError;

      // 2. Criar passageiro da viagem
      const { data: passageiroData, error: passageiroError } = await supabase
        .from("viagem_passageiros")
        .insert({
          viagem_id: values.viagem_id,
          cliente_id: clienteData.id,
          valor: values.valor,
          desconto: values.desconto,
          setor_maracana: values.setor_maracana,
          numero_onibus: values.numero_onibus,
          status_pagamento: values.status_pagamento
        })
        .select('id')
        .single();

      if (passageiroError) throw passageiroError;

      toast.success("Passageiro cadastrado com sucesso!");
      
      // Reset e redirect
      form.reset();
      navigate("/dashboard/viagens", { replace: true });

    } catch (error: any) {
      console.error("Erro ao cadastrar passageiro:", error);
      toast.error("Erro ao cadastrar passageiro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cadastrar Passageiro</h1>
          <p className="text-gray-600">Sistema simples de cadastro</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>

      <div className="space-y-6">
        {/* Dados do Passageiro */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Passageiro</CardTitle>
            <CardDescription>
              Informações pessoais e de embarque
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
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
                        <FormLabel>Telefone (WhatsApp)</FormLabel>
                        <FormControl>
                          <Input placeholder="11999999999" {...field} />
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
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
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
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="setor_maracana"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {getSetorLabel(viagemSelecionada?.local_jogo || "Rio de Janeiro", viagemSelecionada?.nome_estadio)}
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {getSetorOptions(viagemSelecionada?.local_jogo || "Rio de Janeiro").map((setor) => (
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

                  <FormField
                    control={form.control}
                    name="numero_onibus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Ônibus</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Seleção de Viagem e Valores */}
        <Card>
          <CardHeader>
            <CardTitle>Viagem e Valores</CardTitle>
            <CardDescription>
              Selecione a viagem e configure os valores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="viagem_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Viagem</FormLabel>
                      <Select onValueChange={handleViagemChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma viagem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {viagens.map((viagem) => (
                            <SelectItem key={viagem.id} value={viagem.id}>
                              Flamengo x {viagem.adversario} - {new Date(viagem.data_jogo).toLocaleDateString('pt-BR')}
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
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Viagem</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desconto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desconto</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status de Pagamento</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Pago">Pago</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Valor Final:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatCurrency(valorFinal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Final */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Resumo do Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Passageiro:</span>
                  <span className="font-medium ml-2">{form.watch('nome') || 'Nome não informado'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Viagem:</span>
                  <span className="font-medium ml-2">
                    {viagemSelecionada ? `Flamengo x ${viagemSelecionada.adversario}` : 'Não selecionada'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Valor Total:</span>
                  <span className="font-medium ml-2">{formatCurrency(valorFinal)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium ml-2">{form.watch('status_pagamento')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !viagemSelecionada}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar Passageiro"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CadastrarPassageiroSimples;