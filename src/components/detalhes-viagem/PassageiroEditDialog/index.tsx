
import React, { useEffect } from "react";
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
import { formSchema, FormData } from "./formSchema";
import { PassageiroEditDialogProps } from "./types";
import { OnibusSelectField } from "./OnibusSelectField";
import { SetorSelectField } from "./SetorSelectField";
import { ParcelasEditManager } from "./ParcelasEditManager";

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
}: PassageiroEditDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      setor_maracana: "",
      status_pagamento: "",
      forma_pagamento: "",
      valor: 0,
      desconto: 0,
      onibus_id: "",
    },
  });

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");

  useEffect(() => {
    if (open && passageiro) {
      form.setValue("setor_maracana", passageiro.setor_maracana || "");
      form.setValue("status_pagamento", passageiro.status_pagamento || "");
      form.setValue("forma_pagamento", passageiro.forma_pagamento || "");
      form.setValue("valor", passageiro.valor || 0);
      form.setValue("desconto", passageiro.desconto || 0);
      form.setValue("onibus_id", passageiro.onibus_id || "");
    }
  }, [open, passageiro, form]);

  const onSubmit = async (values: FormData) => {
    if (!passageiro?.viagem_passageiro_id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({
          setor_maracana: values.setor_maracana,
          status_pagamento: values.status_pagamento,
          forma_pagamento: values.forma_pagamento,
          valor: values.valor,
          desconto: values.desconto,
          onibus_id: values.onibus_id,
        })
        .eq("id", passageiro.viagem_passageiro_id);

      if (error) throw error;

      toast.success("Passageiro atualizado com sucesso!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar passageiro:", error);
      toast.error("Erro ao atualizar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  if (!passageiro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white border-gray-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Editar Passageiro</DialogTitle>
          <DialogDescription className="text-gray-600">
            Editando: <strong>{passageiro.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <OnibusSelectField
              control={form.control}
              form={form}
              viagemId={passageiro.viagem_id}
              currentOnibusId={passageiro.onibus_id}
            />

            <SetorSelectField control={form.control} />

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
                      value={field.value}
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
                      value={field.value}
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
              <ParcelasEditManager
                passageiroId={passageiro.viagem_passageiro_id}
                valorTotal={valorTotal}
                desconto={desconto}
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
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
