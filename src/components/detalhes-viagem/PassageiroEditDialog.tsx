
import React, { useState, useEffect } from "react";
import { z } from "zod";
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
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, DollarSign } from "lucide-react";

// Define the form schema
const formSchema = z.object({
  setor_maracana: z.string().min(1, "Selecione um setor"),
  status_pagamento: z.string().min(1, "Selecione um status"),
  forma_pagamento: z.string().optional(),
  valor: z.coerce.number().min(0, "Valor deve ser maior ou igual a zero"),
  desconto: z.coerce.number().min(0, "Desconto deve ser maior ou igual a zero"),
  onibus_id: z.string().min(1, "Selecione um ônibus"),
});

interface PassageiroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: any;
  onSuccess: () => void;
}

interface OnibusOption {
  id: string;
  numero_identificacao: string | null;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  passageiros_count?: number;
  disponivel?: boolean;
}

interface Parcela {
  id: string;
  valor_parcela: number;
  forma_pagamento: string;
  observacoes?: string;
  data_pagamento?: string;
}

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
}: PassageiroEditDialogProps) {
  const [onibusList, setOnibusList] = useState<OnibusOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [novaParcela, setNovaParcela] = useState({
    valor_parcela: 0,
    forma_pagamento: "Pix",
    observacoes: ""
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
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

  // Watch status de pagamento para mostrar/ocultar seção de parcelas
  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  
  // Calcular valores
  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
  const saldoRestante = valorLiquido - totalPago;

  // Load data when dialog opens or passageiro changes
  useEffect(() => {
    if (open && passageiro) {
      // Set form values
      form.setValue("setor_maracana", passageiro.setor_maracana || "");
      form.setValue("status_pagamento", passageiro.status_pagamento || "");
      form.setValue("forma_pagamento", passageiro.forma_pagamento || "");
      form.setValue("valor", passageiro.valor || 0);
      form.setValue("desconto", passageiro.desconto || 0);
      form.setValue("onibus_id", passageiro.onibus_id || "");
      
      fetchOnibus();
      fetchParcelas();
    }
  }, [open, passageiro, form]);

  // Fetch buses associated with this trip
  const fetchOnibus = async () => {
    if (!passageiro?.viagem_id) return;
    
    try {
      const { data: onibusData, error: onibusError } = await supabase
        .from("viagem_onibus")
        .select("id, numero_identificacao, tipo_onibus, empresa, capacidade_onibus")
        .eq("viagem_id", passageiro.viagem_id)
        .order("created_at");

      if (onibusError) throw onibusError;
      
      if (!onibusData || onibusData.length === 0) {
        return;
      }
      
      // Para cada ônibus, contar quantos passageiros já estão alocados
      const onibusWithCounts: OnibusOption[] = [];
      
      for (const onibus of onibusData) {
        const { data: passageirosData, error: passageirosError } = await supabase
          .from('viagem_passageiros')
          .select('id')
          .eq('onibus_id', onibus.id);
          
        if (passageirosError) throw passageirosError;
        
        const passageirosCount = passageirosData ? passageirosData.length : 0;
        const disponivel = passageirosCount < onibus.capacidade_onibus;
        
        onibusWithCounts.push({
          ...onibus,
          passageiros_count: passageirosCount,
          disponivel: disponivel
        });
      }
      
      setOnibusList(onibusWithCounts);
    } catch (error) {
      console.error("Erro ao buscar ônibus:", error);
      toast.error("Erro ao carregar a lista de ônibus");
    }
  };

  // Fetch existing parcelas
  const fetchParcelas = async () => {
    if (!passageiro?.viagem_passageiro_id) return;
    
    try {
      const { data, error } = await supabase
        .from("viagem_passageiros_parcelas")
        .select("*")
        .eq("viagem_passageiro_id", passageiro.viagem_passageiro_id)
        .order("created_at");

      if (error) throw error;
      setParcelas(data || []);
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error);
      toast.error("Erro ao carregar parcelas");
    }
  };

  // Adicionar nova parcela
  const adicionarParcela = async () => {
    if (novaParcela.valor_parcela <= 0) {
      toast.error("Valor da parcela deve ser maior que zero");
      return;
    }
    
    if (totalPago + novaParcela.valor_parcela > valorLiquido) {
      toast.error("O valor total das parcelas não pode exceder o valor líquido");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("viagem_passageiros_parcelas")
        .insert({
          viagem_passageiro_id: passageiro.viagem_passageiro_id,
          valor_parcela: novaParcela.valor_parcela,
          forma_pagamento: novaParcela.forma_pagamento,
          observacoes: novaParcela.observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      setParcelas([...parcelas, data]);
      setNovaParcela({
        valor_parcela: 0,
        forma_pagamento: "Pix",
        observacoes: ""
      });
      
      toast.success("Parcela adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar parcela:", error);
      toast.error("Erro ao adicionar parcela");
    }
  };

  // Remover parcela
  const removerParcela = async (parcelaId: string) => {
    try {
      const { error } = await supabase
        .from("viagem_passageiros_parcelas")
        .delete()
        .eq("id", parcelaId);

      if (error) throw error;

      setParcelas(parcelas.filter(p => p.id !== parcelaId));
      toast.success("Parcela removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover parcela:", error);
      toast.error("Erro ao remover parcela");
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
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
            <FormField
              control={form.control}
              name="onibus_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Ônibus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue placeholder="Selecione um ônibus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200">
                      {onibusList.map((onibus) => (
                        <SelectItem 
                          key={onibus.id} 
                          value={onibus.id}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>
                              {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`} ({onibus.empresa})
                            </span>
                            <span className="text-xs text-gray-600">
                              {onibus.passageiros_count || 0}/{onibus.capacidade_onibus}
                            </span>
                          </div>
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
              name="setor_maracana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Setor do Maracanã</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
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

            {/* Seção de Parcelas - aparece apenas quando status é Pendente */}
            {statusPagamento === "Pendente" && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Sistema de Parcelas
                  </CardTitle>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Valor Total:</span>
                      <p className="font-semibold text-blue-600">{formatCurrency(valorTotal)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Valor Pago:</span>
                      <p className="font-semibold text-green-600">{formatCurrency(totalPago)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Saldo Restante:</span>
                      <p className="font-semibold text-orange-600">{formatCurrency(saldoRestante)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Lista de parcelas existentes */}
                  {parcelas.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Parcelas Pagas:</h4>
                      {parcelas.map((parcela) => (
                        <div key={parcela.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{formatCurrency(parcela.valor_parcela)}</span>
                            <span className="text-xs text-gray-500 ml-2">({parcela.forma_pagamento})</span>
                            {parcela.observacoes && (
                              <p className="text-xs text-gray-600 mt-1">{parcela.observacoes}</p>
                            )}
                            {parcela.data_pagamento && (
                              <p className="text-xs text-gray-500">
                                {new Date(parcela.data_pagamento).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerParcela(parcela.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulário para adicionar nova parcela */}
                  {saldoRestante > 0 && (
                    <>
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Adicionar Nova Parcela:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Valor da Parcela</label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0,00"
                              value={novaParcela.valor_parcela || ""}
                              onChange={(e) => setNovaParcela({
                                ...novaParcela,
                                valor_parcela: parseFloat(e.target.value) || 0
                              })}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-700">Forma de Pagamento</label>
                            <Select 
                              value={novaParcela.forma_pagamento}
                              onValueChange={(value) => setNovaParcela({
                                ...novaParcela,
                                forma_pagamento: value
                              })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pix">Pix</SelectItem>
                                <SelectItem value="Cartão">Cartão</SelectItem>
                                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                                <SelectItem value="Boleto">Boleto</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-700">Observações</label>
                            <Input
                              placeholder="Observações (opcional)"
                              value={novaParcela.observacoes || ""}
                              onChange={(e) => setNovaParcela({
                                ...novaParcela,
                                observacoes: e.target.value
                              })}
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={adicionarParcela}
                          className="w-full mt-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                          disabled={novaParcela.valor_parcela <= 0 || totalPago + novaParcela.valor_parcela > valorLiquido}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Parcela
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
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
