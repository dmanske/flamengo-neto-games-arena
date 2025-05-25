
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  FormControl,
  FormDescription,
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
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ClienteOption } from "./types";

interface ClienteSearchFieldProps {
  control: any;
}

export function ClienteSearchField({ control }: ClienteSearchFieldProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteOption[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");

  useEffect(() => {
    fetchClientes();
  }, []);

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

  return (
    <FormField
      control={control}
      name="cliente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">Cliente</FormLabel>
          
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
  );
}
