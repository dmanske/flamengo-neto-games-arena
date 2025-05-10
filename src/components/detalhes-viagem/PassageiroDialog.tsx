
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
import { FormaPagamento, SetorMaracana, StatusPagamento } from "@/types/entities";
import { formatCurrency } from "@/lib/utils";

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
}

export function PassageiroDialog({
  open,
  onOpenChange,
  viagemId,
  onSuccess,
  valorPadrao,
  setorPadrao,
}: PassageiroDialogProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [onibusList, setOnibusList] = useState<OnibusOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_id: "",
      setor_maracana: setorPadrao || "",
      status_pagamento: "Pendente",
      forma_pagamento: "Pix",
      valor: valorPadrao || 0,
      desconto: 0,
      onibus_id: "",
    },
  });

  // Fetch clients and buses on component mount
  useEffect(() => {
    if (open) {
      fetchClientes();
      fetchOnibus();
    }
  }, [open]);

  // Fetch clients from the database
  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, email, cidade")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar a lista de clientes");
    }
  };

  // Fetch buses associated with this trip
  const fetchOnibus = async () => {
    try {
      const { data, error } = await supabase
        .from("viagem_onibus")
        .select("id, numero_identificacao, tipo_onibus, empresa")
        .eq("viagem_id", viagemId)
        .order("created_at");

      if (error) throw error;
      setOnibusList(data || []);
      
      // Set the first bus as default if it's the only one available
      if (data && data.length === 1) {
        form.setValue("onibus_id", data[0].id);
      }
    } catch (error) {
      console.error("Erro ao buscar ônibus:", error);
      toast.error("Erro ao carregar a lista de ônibus");
    }
  };

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!viagemId) return;
    
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
      const { error } = await supabase.from("viagem_passageiros").insert({
        viagem_id: viagemId,
        cliente_id: values.cliente_id,
        setor_maracana: values.setor_maracana,
        status_pagamento: values.status_pagamento,
        forma_pagamento: values.forma_pagamento,
        valor: values.valor,
        desconto: values.desconto,
        onibus_id: values.onibus_id,
      });

      if (error) throw error;

      toast.success("Passageiro adicionado com sucesso!");
      onSuccess();
      onOpenChange(false);
      form.reset({
        cliente_id: "",
        setor_maracana: setorPadrao || "",
        status_pagamento: "Pendente",
        forma_pagamento: "Pix",
        valor: valorPadrao || 0,
        desconto: 0,
        onibus_id: onibusList.length === 1 ? onibusList[0].id : "",
      });
    } catch (error) {
      console.error("Erro ao adicionar passageiro:", error);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Adicionar Passageiro</DialogTitle>
          <DialogDescription>
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
                  <FormLabel>Cliente</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o cliente para esta viagem
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
                  <FormLabel>Ônibus</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um ônibus" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {onibusList.map((onibus) => (
                        <SelectItem key={onibus.id} value={onibus.id}>
                          {onibus.numero_identificacao || `Ônibus ${onibus.tipo_onibus}`} ({onibus.empresa})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione o ônibus para o passageiro
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
                  <FormLabel>Setor do Maracanã</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um setor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Norte">Norte</SelectItem>
                      <SelectItem value="Sul">Sul</SelectItem>
                      <SelectItem value="Leste">Leste</SelectItem>
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
                    <FormLabel>Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                    <FormLabel>Desconto (R$)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormLabel>Status do Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
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

              <FormField
                control={form.control}
                name="forma_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "Pix"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma forma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Passageiro"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
