import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClienteSearchWithSuggestions } from "./ClienteSearchWithSuggestions";
import { OnibusSelectField } from "./OnibusSelectField";
import { formSchema, FormData } from "./formSchema";
import { PassageiroDialogProps } from "./types";
import { Users, MapPin, CreditCard, Ticket, Bus, Home } from "lucide-react";

export function PassageiroDialog({
  open,
  onOpenChange,
  viagemId,
  onSuccess,
  valorPadrao,
  setorPadrao,
  defaultOnibusId,
}: PassageiroDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: [],
      setor_maracana: setorPadrao || "A definir",
      status_pagamento: "Pendente",
      forma_pagamento: "Pix",
      valor: valorPadrao || 0,
      desconto: 0,
      onibus_id: defaultOnibusId || "",
      cidade_embarque: "Blumenau",
    },
  });

  useEffect(() => {
    if (valorPadrao) {
      form.setValue("valor", valorPadrao);
    }
  }, [valorPadrao, form]);

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  
  const valorLiquido = valorTotal - desconto;

  const onSubmit = async (values: FormData) => {
    if (!viagemId || !Array.isArray(values.cliente_id) || values.cliente_id.length === 0) {
      toast.error("Selecione pelo menos um passageiro");
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();
    let hasError = false;

    try {
      // Verificar capacidade do ônibus em batch
      if (values.onibus_id) {
        const [onibusResponse, passageirosResponse] = await Promise.all([
          supabase
            .from("viagem_onibus")
            .select("capacidade_onibus, lugares_extras")
            .eq("id", values.onibus_id)
            .abortSignal(controller.signal)
            .single(),
          supabase
            .from("viagem_passageiros")
            .select("id")
            .eq("onibus_id", values.onibus_id)
            .abortSignal(controller.signal)
        ]);

        if (onibusResponse.error) throw onibusResponse.error;
        if (passageirosResponse.error) throw passageirosResponse.error;

        const capacidadeTotal = onibusResponse.data.capacidade_onibus + (onibusResponse.data.lugares_extras || 0);
        const passageirosAtuaisCount = passageirosResponse.data?.length || 0;
        const novosPassageiros = values.cliente_id.length;
        
        if (passageirosAtuaisCount + novosPassageiros > capacidadeTotal) {
          const vagasDisponiveis = capacidadeTotal - passageirosAtuaisCount;
          toast.error(
            `Capacidade insuficiente! O ônibus tem ${capacidadeTotal} lugares, ${passageirosAtuaisCount} ocupados. ` +
            `Restam apenas ${vagasDisponiveis} vaga(s) disponível(is), mas você está tentando adicionar ${novosPassageiros} passageiro(s).`
          );
          return;
        }
      }

      // Verificar em lote se clientes já estão na viagem
      const { data: clientesExistentes } = await supabase
        .from("viagem_passageiros")
        .select("cliente_id, clientes(nome)")
        .eq("viagem_id", viagemId)
        .in("cliente_id", values.cliente_id)
        .abortSignal(controller.signal);

      if (clientesExistentes && clientesExistentes.length > 0) {
        const cliente = clientesExistentes[0];
        const nomeCliente = (cliente as any)?.clientes?.nome || 'Desconhecido';
        toast.error(`O cliente ${nomeCliente} já está cadastrado nesta viagem.`);
        return;
      }

      // Inserir passageiros em lote
      const passageirosParaInserir = values.cliente_id.map((clienteId: string) => ({
        viagem_id: viagemId,
        cliente_id: clienteId,
        setor_maracana: values.setor_maracana,
        status_pagamento: "Pendente",
        forma_pagamento: values.forma_pagamento,
        valor: values.valor,
        desconto: values.desconto,
        onibus_id: values.onibus_id,
        cidade_embarque: values.cidade_embarque || null,
      }));

      const { data: novosPassageirosData, error: insertError } = await supabase
        .from("viagem_passageiros")
        .insert(passageirosParaInserir)
        .select('id')
        .abortSignal(controller.signal);

      if (insertError) throw insertError;

      console.log("Passageiros inseridos:", novosPassageirosData);
      
      // Aguardar processamento completo antes de continuar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      toast.success(`${values.cliente_id.length} passageiro${values.cliente_id.length > 1 ? 's adicionados' : ' adicionado'} com sucesso!`);
      
      // Reset e fechamento usando microtasks para evitar conflitos de estado
      setTimeout(() => {
        if (!hasError && !controller.signal.aborted) {
          form.reset({
            cliente_id: [],
            setor_maracana: setorPadrao || "A definir",
            status_pagamento: "Pendente",
            forma_pagamento: "Pix",
            valor: valorPadrao || 0,
            desconto: 0,
            onibus_id: defaultOnibusId || "",
            cidade_embarque: "Blumenau",
          });
          onSuccess();
          
          // Delay adicional antes de fechar o dialog para evitar tela branca
          setTimeout(() => {
            if (!controller.signal.aborted) {
              onOpenChange(false);
            }
          }, 50);
        }
      }, 0);
      
    } catch (error) {
      hasError = true;
      console.error("Erro detalhado ao adicionar passageiros:", error);
      
      if (!controller.signal.aborted) {
        toast.error("Erro ao adicionar passageiros. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }

    // Cleanup function para abortar requests pendentes
    return () => {
      controller.abort();
    };
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Adicionar Passageiro
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Adicione um ou mais passageiros à esta viagem.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ClienteSearchWithSuggestions control={form.control} viagemId={viagemId} />

              <OnibusSelectField 
                control={form.control} 
                form={form}
                viagemId={viagemId}
                defaultOnibusId={defaultOnibusId}
              />

              <FormField
                control={form.control}
                name="cidade_embarque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      Cidade de Embarque
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                        <SelectItem value="Agrolandia" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Agrolandia</SelectItem>
                        <SelectItem value="Agronomica" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Agronomica</SelectItem>
                        <SelectItem value="Apiuna" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Apiuna</SelectItem>
                        <SelectItem value="Barra Velha" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Barra Velha</SelectItem>
                        <SelectItem value="Blumenau" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Blumenau</SelectItem>
                        <SelectItem value="Curitiba" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Curitiba</SelectItem>
                        <SelectItem value="Gaspar" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Gaspar</SelectItem>
                        <SelectItem value="Ibirama" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Ibirama</SelectItem>
                        <SelectItem value="Ilhota" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Ilhota</SelectItem>
                        <SelectItem value="Indaial" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Indaial</SelectItem>
                        <SelectItem value="Itajai" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Itajai</SelectItem>
                        <SelectItem value="Ituporanga" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Ituporanga</SelectItem>
                        <SelectItem value="Joinville" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Joinville</SelectItem>
                        <SelectItem value="Lontras" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Lontras</SelectItem>
                        <SelectItem value="Navegantes" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Navegantes</SelectItem>
                        <SelectItem value="Piçarras" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Piçarras</SelectItem>
                        <SelectItem value="Presidente Getulio" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Presidente Getulio</SelectItem>
                        <SelectItem value="Rio do Sul" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Rio do Sul</SelectItem>
                        <SelectItem value="Rodeio" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Rodeio</SelectItem>
                        <SelectItem value="Trombudo Central" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Trombudo Central</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="setor_maracana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-blue-600" />
                      Setor do Maracanã
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white">
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                        <SelectItem value="A definir" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">A definir</SelectItem>
                        <SelectItem value="Norte" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Norte</SelectItem>
                        <SelectItem value="Sul" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Sul</SelectItem>
                        <SelectItem value="Leste Inferior" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Leste Inferior</SelectItem>
                        <SelectItem value="Leste Superior" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Leste Superior</SelectItem>
                        <SelectItem value="Oeste" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Oeste</SelectItem>
                        <SelectItem value="Maracanã Mais" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Maracanã Mais</SelectItem>
                        <SelectItem value="Sem ingresso" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Sem ingresso</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        Valor (R$)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={valorPadrao || 0}
                          disabled
                          className="bg-gray-100 text-gray-900 border-gray-300"
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
                      <FormLabel className="text-gray-700 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-green-600" />
                        Desconto (R$) - Opcional
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-white text-gray-900 border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Sistema de parcelamento removido - cadastro simples */}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.watch("cliente_id") || form.watch("cliente_id").length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      <span>
                        {form.watch("cliente_id") && form.watch("cliente_id").length > 1 
                          ? `Salvar ${form.watch("cliente_id").length} Passageiros` 
                          : "Salvar Passageiro"}
                      </span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
