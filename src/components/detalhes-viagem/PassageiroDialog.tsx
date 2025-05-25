
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
  FormDescription,
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
import { AlertCircle, Search, Plus, Trash2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  cliente_id: z.string().min(1, "Selecione um cliente"),
  setor_maracana: z.string().min(1, "Selecione um setor"),
  status_pagamento: z.string().min(1, "Selecione um status"),
  forma_pagamento: z.string().optional(),
  valor: z.coerce.number().min(0, "Valor deve ser maior ou igual a zero"),
  desconto: z.coerce.number().min(0, "Desconto deve ser maior ou igual a zero"),
  onibus_id: z.string().min(1, "Selecione um ônibus"),
});

// Define the component props
interface PassageiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSuccess: () => void;
  valorPadrao?: number | null;
  setorPadrao?: string | null;
  defaultOnibusId?: string | null;
}

interface ClienteOption {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
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
  id?: string;
  valor_parcela: number;
  forma_pagamento: string;
  observacoes?: string;
}

export function PassageiroDialog({
  open,
  onOpenChange,
  viagemId,
  onSuccess,
  valorPadrao,
  setorPadrao,
  defaultOnibusId,
}: PassageiroDialogProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteOption[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [onibusList, setOnibusList] = useState<OnibusOption[]>([]);
  const [onibusLotados, setOnibusLotados] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [novaParcela, setNovaParcela] = useState<Omit<Parcela, 'id'>>({
    valor_parcela: 0,
    forma_pagamento: "Pix",
    observacoes: ""
  });

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
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

  // Watch status de pagamento para mostrar/ocultar seção de parcelas
  const statusPagamento = form.watch("status_pagamento");
  const valorTotal = form.watch("valor");
  const desconto = form.watch("desconto");
  
  // Calcular valores
  const valorLiquido = valorTotal - desconto;
  const totalPago = parcelas.reduce((sum, p) => sum + p.valor_parcela, 0);
  const saldoRestante = valorLiquido - totalPago;

  // Fetch clients and buses on component mount
  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchOnibus().then(() => {
        if (defaultOnibusId && form.getValues("onibus_id") !== defaultOnibusId) {
          const onibusExiste = onibusList.some(o => o.id === defaultOnibusId);
          if (onibusExiste) {
            form.setValue("onibus_id", defaultOnibusId);
          }
        } else if (!defaultOnibusId && onibusList.length === 1 && !form.getValues("onibus_id")){
          form.setValue("onibus_id", onibusList[0].id);
        }
      });
    }
  }, [open, defaultOnibusId]);

  // Filter clients based on search term
  useEffect(() => {
    if (clienteSearchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.telefone.includes(clienteSearchTerm) ||
        cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.cidade.toLowerCase().includes(clienteSearchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [clienteSearchTerm, clientes]);

  // Fetch clients from the database
  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, email, cidade")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
      setFilteredClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar a lista de clientes");
    }
  };

  // Fetch buses associated with this trip and check their capacity
  const fetchOnibus = async () => {
    try {
      // Buscar ônibus da viagem
      const { data: onibusData, error: onibusError } = await supabase
        .from("viagem_onibus")
        .select("id, numero_identificacao, tipo_onibus, empresa, capacidade_onibus")
        .eq("viagem_id", viagemId)
        .order("created_at");

      if (onibusError) throw onibusError;
      
      if (!onibusData || onibusData.length === 0) {
        return;
      }
      
      // Para cada ônibus, contar quantos passageiros já estão alocados
      const onibusWithCounts: OnibusOption[] = [];
      const lotadosMap: Record<string, boolean> = {};
      
      for (const onibus of onibusData) {
        // Buscar contagem de passageiros para este ônibus
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
        
        lotadosMap[onibus.id] = !disponivel;
      }
      
      setOnibusList(onibusWithCounts);
      setOnibusLotados(lotadosMap);
      
      if (onibusWithCounts.length === 1) {
        form.setValue("onibus_id", onibusWithCounts[0].id);
      }
      
    } catch (error) {
      console.error("Erro ao buscar ônibus:", error);
      toast.error("Erro ao carregar a lista de ônibus");
    }
  };

  // Adicionar nova parcela
  const adicionarParcela = () => {
    if (novaParcela.valor_parcela <= 0) {
      toast.error("Valor da parcela deve ser maior que zero");
      return;
    }
    
    if (totalPago + novaParcela.valor_parcela > valorLiquido) {
      toast.error("O valor total das parcelas não pode exceder o valor líquido");
      return;
    }
    
    setParcelas([...parcelas, { ...novaParcela }]);
    setNovaParcela({
      valor_parcela: 0,
      forma_pagamento: "Pix",
      observacoes: ""
    });
  };

  // Remover parcela
  const removerParcela = (index: number) => {
    const novasParcelas = parcelas.filter((_, i) => i !== index);
    setParcelas(novasParcelas);
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!viagemId) return;
    
    // Verificar se o ônibus está lotado
    if (onibusLotados[values.onibus_id]) {
      toast.error("Este ônibus já está lotado. Por favor, escolha outro ônibus.");
      return;
    }
    
    // Se status é Pendente e há parcelas, verificar se está tudo correto
    if (values.status_pagamento === "Pendente" && parcelas.length > 0) {
      if (totalPago > valorLiquido) {
        toast.error("O valor total das parcelas não pode exceder o valor líquido");
        return;
      }
    }
    
    setIsLoading(true);
    try {
      // Check if the cliente is already added to this trip
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

      // Add the passenger to the trip
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

      // Se há parcelas para salvar
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
      
      // Atualizar a capacidade dos ônibus após adicionar o passageiro
      await fetchOnibus();
      
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
      setClienteSearchTerm("");
    } catch (error) {
      console.error("Erro ao adicionar passageiro:", error);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  // Obter informações de ocupação do ônibus selecionado
  const selectedOnibus = form.watch('onibus_id') 
    ? onibusList.find(o => o.id === form.watch('onibus_id')) 
    : null;

  const ocupacaoInfo = selectedOnibus ? {
    atual: selectedOnibus.passageiros_count || 0,
    total: selectedOnibus.capacidade_onibus,
    disponivel: selectedOnibus.disponivel
  } : null;

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
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Cliente</FormLabel>
                    
                    {/* Barra de busca de clientes */}
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar cliente por nome, telefone, email ou cidade..."
                        value={clienteSearchTerm}
                        onChange={(e) => setClienteSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Selecione um cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200 max-h-60">
                        {filteredClientes.map((cliente) => (
                          <SelectItem key={cliente.id} value={cliente.id}>
                            {cliente.nome} - {cliente.cidade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <FormDescription className="text-gray-600">
                      Use a busca acima para encontrar o cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="onibus_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      Ônibus
                      {ocupacaoInfo && !ocupacaoInfo.disponivel && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Este ônibus está lotado</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={onibusList.length === 1}
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
                            disabled={!onibus.disponivel}
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>
                                {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`} ({onibus.empresa})
                              </span>
                              <span className={`text-xs ${!onibus.disponivel ? 'text-red-500' : 'text-green-600'}`}>
                                {onibus.passageiros_count || 0}/{onibus.capacidade_onibus}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-gray-600">
                      {ocupacaoInfo 
                        ? `Ocupação atual: ${ocupacaoInfo.atual}/${ocupacaoInfo.total} passageiros` 
                        : "Selecione o ônibus para o passageiro"}
                    </FormDescription>
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

              {/* Seção de Parcelas - aparece apenas quando status é Pendente */}
              {statusPagamento === "Pendente" && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Sistema de Parcelas</CardTitle>
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
                    {/* Lista de parcelas adicionadas */}
                    {parcelas.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Parcelas Adicionadas:</h4>
                        {parcelas.map((parcela, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{formatCurrency(parcela.valor_parcela)}</span>
                              <span className="text-xs text-gray-500 ml-2">({parcela.forma_pagamento})</span>
                              {parcela.observacoes && (
                                <p className="text-xs text-gray-600 mt-1">{parcela.observacoes}</p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerParcela(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulário para adicionar nova parcela */}
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
                      className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                      disabled={novaParcela.valor_parcela <= 0 || totalPago + novaParcela.valor_parcela > valorLiquido}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Parcela
                    </Button>
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
                  disabled={isLoading || (selectedOnibus && !selectedOnibus.disponivel)}
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
