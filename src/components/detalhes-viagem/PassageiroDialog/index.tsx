
import React, { useState } from "react";
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
import { ClienteSearchField } from "./ClienteSearchField";
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
      cliente_id: "",
      setor_maracana: setorPadrao || "A definir",
      status_pagamento: "Pendente",
      forma_pagamento: "Pix",
      valor: valorPadrao || 0,
      desconto: 0,
      onibus_id: defaultOnibusId || "",
    },
  });

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  
  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);

  const onSubmit = async (values: FormData) => {
    if (!viagemId) return;
    
    if (values.status_pagamento === "Pendente" && parcelas.length > 0) {
      if (totalPago > valorLiquido) {
        toast.error("O valor total das parcelas não pode exceder o valor líquido");
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const { data: existingPassageiro, error: checkError } = await supabase
        .from("viagem_passageiros")
        .select("id")
        .eq("viagem_id", viagemId)
        .eq("cliente_id", values.cliente_id)
        .single();

      if (existingPassageiro) {
        toast.error("Este cliente já está cadastrado nesta viagem");
        setIsLoading(false);
        return;
      }

      const { data: passageiroData, error: passageiroError } = await supabase
        .from("viagem_passageiros")
        .insert({
          viagem_id: viagemId,
          cliente_id: values.cliente_id,
          setor_maracana: values.setor_maracana,
          status_pagamento: values.status_pagamento,
          forma_pagamento: values.forma_pagamento,
          valor: values.valor,
          desconto: values.desconto,
          onibus_id: values.onibus_id,
        })
        .select('id')
        .single();

      if (passageiroError) throw passageiroError;

      if (parcelas.length > 0 && passageiroData) {
        const parcelasParaInserir = parcelas.map(parcela => ({
          viagem_passageiro_id: passageiroData.id,
          valor_parcela: parcela.valor_parcela,
          forma_pagamento: parcela.forma_pagamento,
          observacoes: parcela.observacoes || null
        }));

        const { error: parcelasError } = await supabase
          .from("viagem_passageiros_parcelas")
          .insert(parcelasParaInserir);

        if (parcelasError) throw parcelasError;
      }

      toast.success("Passageiro adicionado com sucesso!");
      onSuccess();
      onOpenChange(false);
      form.reset({
        cliente_id: "",
        setor_maracana: setorPadrao || "A definir",
        status_pagamento: "Pendente",
        forma_pagamento: "Pix",
        valor: valorPadrao || 0,
        desconto: 0,
        onibus_id: defaultOnibusId || "",
      });
      setParcelas([]);
    } catch (error) {
      console.error("Erro ao adicionar passageiro:", error);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
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
              <ClienteSearchField control={form.control} />

              <OnibusSelectField 
                control={form.control} 
                form={form}
                viagemId={viagemId}
                defaultOnibusId={defaultOnibusId}
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
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Selecione um setor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="A definir">A definir</SelectItem>
                        <SelectItem value="Norte">Norte</SelectItem>
                        <SelectItem value="Sul">Sul</SelectItem>
                        <SelectItem value="Leste Inferior">Leste Inferior</SelectItem>
                        <SelectItem value="Leste Superior">Leste Superior</SelectItem>
                        <SelectItem value="Oeste">Oeste</SelectItem>
                        <SelectItem value="Maracanã Mais">Maracanã Mais</SelectItem>
                        <SelectItem value="Sem ingresso">Sem ingresso</SelectItem>
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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      <FormLabel className="text-gray-700">Desconto (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Status do Pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Pendente" className="bg-white text-gray-900">Pendente</SelectItem>
                          <SelectItem value="Pago" className="bg-white text-gray-900">Pago</SelectItem>
                          <SelectItem value="Cancelado" className="bg-white text-gray-900">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="forma_pagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Forma de Pagamento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || "Pix"}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Selecione uma forma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-gray-200">
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Paypal">Paypal</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {statusPagamento === "Pendente" && (
                <ParcelasManager
                  valorTotal={valorTotal}
                  desconto={desconto}
                  parcelas={parcelas}
                  setParcelas={setParcelas}
                />
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
