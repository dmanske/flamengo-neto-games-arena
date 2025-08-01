
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
import { Checkbox } from "@/components/ui/checkbox";
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
// ParcelasEditManager removido - usando apenas sistema avançado
import { PasseiosEditSectionSimples } from "./PasseiosEditSectionSimples";
import { SecaoFinanceiraAvancada } from "./SecaoFinanceiraAvancada";
import { getSetorLabel, getSetorOptions } from "@/data/estadios";

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  viagem,
  onSuccess,
}: PassageiroEditDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

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
      gratuito: false,
    },
  });

  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  const gratuito = form.watch("gratuito");

  useEffect(() => {
    const loadPassageiroData = async () => {
      if (passageiro) {
        // Carregar dados básicos
        form.reset({
          setor_maracana: passageiro.setor_maracana || "",
          status_pagamento: passageiro.status_pagamento || "Pendente",
          forma_pagamento: passageiro.forma_pagamento || "",
          valor: passageiro.valor || 0,
          desconto: passageiro.desconto || 0,
          onibus_id: passageiro.onibus_id?.toString() || "",
          cidade_embarque: passageiro.cidade_embarque || "",
          observacoes: passageiro.observacoes || "",
          passeios_selecionados: [],
          gratuito: passageiro.gratuito || false
        });

        // Carregar passeios selecionados convertendo nomes para IDs
        if (passageiro.passeios && passageiro.passeios.length > 0) {
          try {
            const nomesPasseios = passageiro.passeios.map(p => p.passeio_nome);
            
            const { data: passeiosInfo, error } = await supabase
              .from('passeios')
              .select('id, nome')
              .in('nome', nomesPasseios);

            if (!error && passeiosInfo) {
              const idsPasseios = passeiosInfo.map(p => p.id);
              form.setValue('passeios_selecionados', idsPasseios);
            }
          } catch (error) {
            console.error('Erro ao carregar passeios selecionados:', error);
          }
        }
      }
    };

    loadPassageiroData();
  }, [passageiro, form]);

  // Lógica de gratuidade - quando marcado como gratuito, zerar valores
  useEffect(() => {
    if (gratuito) {
      console.log('🎁 Passageiro marcado como gratuito - zerando valores');
      // Zerar valor da viagem (mas manter o valor original para referência)
      form.setValue("valor", 0);
      form.setValue("desconto", 0);
      form.setValue("status_pagamento", "Pago"); // Se gratuito, marcar como pago
      // Os passeios serão tratados como gratuitos no salvamento
    } else if (passageiro) {
      // Restaurar valores originais quando desmarcar
      form.setValue("valor", passageiro.valor || 0);
      form.setValue("desconto", passageiro.desconto || 0);
      form.setValue("status_pagamento", passageiro.status_pagamento || "Pendente");
    }
  }, [gratuito, passageiro, form]);

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
      if (values.passeios_selecionados) {
        // Primeiro, remover todos os passeios existentes
        const { error: deleteError } = await supabase
          .from("passageiro_passeios")
          .delete()
          .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id);
        if (deleteError) throw deleteError;

        // Depois, inserir os novos passeios selecionados
        if (values.passeios_selecionados.length > 0) {
          // Buscar os nomes e valores dos passeios pelos IDs
          const { data: passeiosInfo, error: passeiosInfoError } = await supabase
            .from('passeios')
            .select('id, nome, valor')
            .in('id', values.passeios_selecionados);

          if (passeiosInfoError) throw passeiosInfoError;

          const passeiosData = values.passeios_selecionados.map(passeioId => {
            const passeioInfo = passeiosInfo?.find(p => p.id === passeioId);
            return {
              viagem_passageiro_id: passageiro.viagem_passageiro_id,
              passeio_id: passeioId,
              passeio_nome: passeioInfo?.nome || 'Passeio',
              valor_cobrado: values.gratuito ? 0 : (passeioInfo?.valor || 0),
              status: 'confirmado'
            };
          });

          const { error: passeiosError } = await supabase
            .from("passageiro_passeios")
            .insert(passeiosData);
          if (passeiosError) throw passeiosError;
        }
      }

      // Atualizar passageiro normalmente
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({
          setor_maracana: values.setor_maracana,
          status_pagamento: values.gratuito ? "Pago" : values.status_pagamento,
          forma_pagamento: values.forma_pagamento,
          valor: values.gratuito ? 0 : values.valor,
          desconto: values.desconto,
          onibus_id: values.onibus_id,
          cidade_embarque: values.cidade_embarque,
          observacoes: values.observacoes,
          gratuito: values.gratuito,
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
                        <FormLabel className="text-gray-700">
                          {getSetorLabel(viagem?.local_jogo || "Rio de Janeiro", viagem?.nome_estadio)}
                        </FormLabel>
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
                            {getSetorOptions(viagem?.local_jogo || "Rio de Janeiro").map((setor) => (
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

                {/* Campo de Gratuidade */}
                <FormField
                  control={form.control}
                  name="gratuito"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700 font-medium">
                          🎁 Passageiro Gratuito
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Marque esta opção se o passageiro não deve ser cobrado. 
                          Passageiros gratuitos não contam nas receitas da viagem.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

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
                {/* Seção de Passeios Atualizada */}
                <PasseiosEditSectionSimples 
                  form={form} 
                  viagemId={passageiro?.viagem_id || ''} 
                  passageiroId={passageiro?.viagem_passageiro_id || passageiro?.id}
                  onPasseiosChange={() => {
                    // Forçar refresh da seção financeira
                    console.log('🔄 Passeios alterados, atualizando seção financeira...');
                    setRefreshKey(prev => prev + 1);
                  }}
                />
              </div>

              {/* Coluna da Direita */}
              <div className="space-y-6">
                {/* Campos do sistema antigo removidos - usando apenas Situação Financeira */}

                {/* Sistema Financeiro Avançado */}
                <SecaoFinanceiraAvancada
                  key={refreshKey}
                  passageiroId={passageiro.viagem_passageiro_id?.toString() || passageiro.id?.toString() || ''}
                  nomePassageiro={passageiro.nome}
                  onPagamentoRealizado={() => {
                    // Recarregar dados se necessário
                    console.log('Pagamento realizado, dados atualizados');
                  }}
                />
                
                {/* Sistema de Parcelas Legado removido - usando apenas Situação Financeira Avançada */}
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
