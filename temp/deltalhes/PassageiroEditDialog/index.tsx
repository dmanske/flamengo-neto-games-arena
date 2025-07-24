
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
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
  passeiosPagos,
  outroPasseio,
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
      cidade_embarque: "Blumenau",
      observacoes: "",
    },
  });

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");

  useEffect(() => {
    if (passageiro) {
      form.reset({
        setor_maracana: passageiro.setor_maracana || "",
        status_pagamento: passageiro.status_pagamento || "Pendente",
        forma_pagamento: passageiro.forma_pagamento || "",
        valor: passageiro.valor || 0,
        desconto: passageiro.desconto || 0,
        onibus_id: passageiro.onibus_id?.toString() || "",
        cidade_embarque: passageiro.cidade_embarque || "",
        observacoes: passageiro.observacoes || "",
        passeios: passageiro.passeios?.map(p => ({
          nome: p.passeio_nome,
          status: p.status
        })) || []
      });
    }
  }, [passageiro, form]);

  const onSubmit = async (values: FormData) => {
    if (!passageiro?.viagem_passageiro_id) return;
    setIsLoading(true);
    try {
      // Se o status for 'Pago', garantir quitação automática
      if (values.status_pagamento === "Pago") {
        // Buscar parcelas atuais do passageiro
        const { data: parcelas, error: parcelasError } = await supabase
          .from("viagem_passageiros_parcelas")
          .select("*")
          .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id);
        if (parcelasError) throw parcelasError;
        const valorPago = (parcelas || []).reduce((sum, p) => sum + (p.valor_parcela || 0), 0);
        const valorLiquido = (values.valor || 0) - (values.desconto || 0);
        const valorFalta = valorLiquido - valorPago;
        if (valorFalta > 0.009) { // margem para centavos
          // Criar parcela faltante
          const { error: parcelaInsertError } = await supabase
            .from("viagem_passageiros_parcelas")
            .insert({
              viagem_passageiro_id: passageiro.viagem_passageiro_id,
              valor_parcela: valorFalta,
              forma_pagamento: "Pix",
              data_pagamento: new Date().toISOString().slice(0, 10),
              observacoes: "Quitação automática ao marcar como Pago"
            });
          if (parcelaInsertError) throw parcelaInsertError;
        }
      }

      // Atualizar passeios do passageiro
      if (values.passeios) {
        // Primeiro, remover todos os passeios existentes
        const { error: deleteError } = await supabase
          .from("passageiro_passeios")
          .delete()
          .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id);
        if (deleteError) throw deleteError;

        // Depois, inserir os novos passeios
        const passeiosData = values.passeios.map(passeio => ({
          viagem_passageiro_id: passageiro.viagem_passageiro_id,
          passeio_nome: passeio.nome,
          status: passeio.status
        }));

        const { error: passeiosError } = await supabase
          .from("passageiro_passeios")
          .insert(passeiosData);
        if (passeiosError) throw passeiosError;
      }

      // Atualizar passageiro normalmente
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({
          setor_maracana: values.setor_maracana,
          status_pagamento: values.status_pagamento,
          forma_pagamento: values.forma_pagamento,
          valor: values.valor,
          desconto: values.desconto,
          onibus_id: values.onibus_id,
          cidade_embarque: values.cidade_embarque,
          observacoes: values.observacoes,
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
      <DialogContent className="sm:max-w-[1100px] w-full max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-900">Editar Passageiro</DialogTitle>
          <DialogDescription className="text-gray-600">
            Editando: <span className="font-semibold text-gray-900">{passageiro?.nome}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna da Esquerda */}
              <div className="space-y-6">
                {/* Ônibus e Setor */}
                <div className="space-y-4">
                  <OnibusSelectField
                    control={form.control}
                    form={form}
                    viagemId={passageiro?.viagem_id}
                    currentOnibusId={passageiro?.onibus_id}
                    className="bg-white text-gray-900 border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:bg-blue-50"
                    selectClassName="bg-white text-gray-900 border-gray-300 focus:ring-blue-200 focus:border-blue-400 hover:bg-blue-50"
                    optionClassName="bg-white text-gray-900 hover:bg-blue-50 focus:bg-blue-100"
                  />
                  <FormField
                    control={form.control}
                    name="cidade_embarque"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Cidade de Embarque</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
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
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
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
                </div>

                {/* Valores */}
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
                            className="bg-white text-gray-900 border-gray-300"
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
                            className="bg-white text-gray-900 border-gray-300"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Observações</FormLabel>
                      <Textarea
                        {...field}
                        placeholder="Observações (opcional)"
                        className="bg-white text-gray-900 border-gray-300 min-h-[120px]"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passeios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Passeios</FormLabel>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {passeiosPagos?.map((passeio) => (
                            <div key={passeio} className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                              <Checkbox
                                id={passeio}
                                checked={field.value?.some(p => p.nome === passeio)}
                                onCheckedChange={(checked) => {
                                  const currentPasseios = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...currentPasseios,
                                      { nome: passeio, status: 'Confirmado' }
                                    ]);
                                  } else {
                                    field.onChange(currentPasseios.filter(p => p.nome !== passeio));
                                  }
                                }}
                              />
                              <Label htmlFor={passeio} className="cursor-pointer">{passeio}</Label>
                            </div>
                          ))}
                          {outroPasseio && (
                            <div className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                              <Checkbox
                                id="outro"
                                checked={field.value?.some(p => p.nome === outroPasseio)}
                                onCheckedChange={(checked) => {
                                  const currentPasseios = field.value || [];
                                  if (checked) {
                                    field.onChange([
                                      ...currentPasseios,
                                      { nome: outroPasseio, status: 'Confirmado' }
                                    ]);
                                  } else {
                                    field.onChange(currentPasseios.filter(p => p.nome !== outroPasseio));
                                  }
                                }}
                              />
                              <Label htmlFor="outro" className="cursor-pointer">{outroPasseio}</Label>
                            </div>
                          )}
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Passeios Selecionados:</h4>
                            <div className="flex flex-wrap gap-2">
                              {field.value.map((passeio) => (
                                <Badge
                                  key={passeio.nome}
                                  variant={passeio.status === 'Confirmado' ? 'default' : 'secondary'}
                                  className="text-sm"
                                >
                                  {passeio.nome}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coluna da Direita */}
              <div className="space-y-6">
                {/* Status e Forma de Pagamento */}
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
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue placeholder="Selecione um status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                            <SelectItem value="Pendente" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Pendente</SelectItem>
                            <SelectItem value="Pago" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Pago</SelectItem>
                            <SelectItem value="Cancelado" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Cancelado</SelectItem>
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
                            <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                              <SelectValue placeholder="Selecione uma forma" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white border-gray-200 z-50 text-gray-900">
                            <SelectItem value="Pix" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Pix</SelectItem>
                            <SelectItem value="Cartão" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Cartão</SelectItem>
                            <SelectItem value="Boleto" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Boleto</SelectItem>
                            <SelectItem value="Paypal" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Paypal</SelectItem>
                            <SelectItem value="Outro" className="hover:bg-blue-50 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sistema de Parcelas */}
                <ParcelasEditManager
                  passageiroId={passageiro.viagem_passageiro_id.toString()}
                  valorTotal={valorTotal}
                  desconto={desconto}
                />
              </div>
            </div>

            <DialogFooter className="pt-6">
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
  );
}
