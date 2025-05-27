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
import { ParcelasManager } from "./ParcelasManager";
import { formSchema, FormData } from "./formSchema";
import { PassageiroDialogProps, Parcela } from "./types";

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
  const [parcelas, setParcelas] = useState<Parcela[]>([]);

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
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);

  const onSubmit = async (values: FormData) => {
    if (!viagemId) return;
    setIsLoading(true);
    let algumErro = false;
    let algumSucesso = false;
    for (const clienteId of values.cliente_id) {
      try {
        const { data: existingPassageiro } = await supabase
          .from("viagem_passageiros")
          .select("id")
          .eq("viagem_id", viagemId)
          .eq("cliente_id", clienteId)
          .single();
        if (existingPassageiro) {
          toast.error(`O cliente já está cadastrado nesta viagem.`);
          algumErro = true;
          continue;
        }
        const { error: passageiroError } = await supabase
          .from("viagem_passageiros")
          .insert({
            viagem_id: viagemId,
            cliente_id: clienteId,
            setor_maracana: values.setor_maracana,
            status_pagamento: values.status_pagamento,
            forma_pagamento: values.forma_pagamento,
            valor: values.valor,
            desconto: values.desconto,
            onibus_id: values.onibus_id,
          });
        if (passageiroError) throw passageiroError;
        algumSucesso = true;
      } catch (error) {
        console.error("Erro ao adicionar passageiro:", error);
        algumErro = true;
      }
    }
    if (algumSucesso) {
      toast.success("Passageiro(s) adicionado(s) com sucesso!");
      onSuccess();
      onOpenChange(false);
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
    } else if (algumErro) {
      toast.error("Nenhum passageiro foi adicionado.");
    }
    setIsLoading(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Adicionar Passageiro</DialogTitle>
            <DialogDescription className="text-gray-600">
              Adicione um passageiro à esta viagem.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ClienteSearchWithSuggestions control={form.control} />

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
                    <FormLabel className="text-gray-700">Cidade de Embarque</FormLabel>
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
                        <SelectItem value="Blumenau" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Blumenau</SelectItem>
                        <SelectItem value="Gaspar" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Gaspar</SelectItem>
                        <SelectItem value="Indaial" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Indaial</SelectItem>
                        <SelectItem value="Timbó" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Timbó</SelectItem>
                        <SelectItem value="Pomerode" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Pomerode</SelectItem>
                        <SelectItem value="Brusque" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Brusque</SelectItem>
                        <SelectItem value="Itajaí" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Itajaí</SelectItem>
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
                    <FormLabel className="text-gray-700">Setor do Maracanã</FormLabel>
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
                      <FormLabel className="text-gray-700">Valor (R$)</FormLabel>
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
                      <FormLabel className="text-gray-700">Desconto (R$) - Opcional</FormLabel>
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
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Salvando..." : "Salvar Passageiro"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
