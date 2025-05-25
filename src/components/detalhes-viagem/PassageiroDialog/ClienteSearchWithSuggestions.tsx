
import React, { useState, useEffect, useRef } from "react";
import { Search, Check } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ClienteOption } from "./types";

interface ClienteSearchWithSuggestionsProps {
  control: any;
}

export function ClienteSearchWithSuggestions({ control }: ClienteSearchWithSuggestionsProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteOption[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClienteId, setSelectedClienteId] = useState("");
  const [selectedClienteName, setSelectedClienteName] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (clienteSearchTerm.trim() === "") {
      setFilteredClientes([]);
      setShowSuggestions(false);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.telefone.includes(clienteSearchTerm) ||
        cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.cidade.toLowerCase().includes(clienteSearchTerm.toLowerCase())
      ).slice(0, 8); // Limitar a 8 sugestões
      setFilteredClientes(filtered);
      setShowSuggestions(true);
    }
  }, [clienteSearchTerm, clientes]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleSelectCliente = (cliente: ClienteOption, onChange: (value: string) => void) => {
    setSelectedClienteId(cliente.id);
    setSelectedClienteName(cliente.nome);
    setClienteSearchTerm(cliente.nome);
    setShowSuggestions(false);
    onChange(cliente.id);
  };

  return (
    <FormField
      control={control}
      name="cliente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700">Cliente</FormLabel>
          
          <div className="relative" ref={containerRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <FormControl>
                <Input
                  placeholder="Buscar cliente por nome, telefone, email ou cidade..."
                  value={clienteSearchTerm}
                  onChange={(e) => {
                    setClienteSearchTerm(e.target.value);
                    if (e.target.value === "") {
                      field.onChange("");
                      setSelectedClienteId("");
                      setSelectedClienteName("");
                    }
                  }}
                  onFocus={() => {
                    if (filteredClientes.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormControl>
              {selectedClienteId && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-4 w-4" />
              )}
            </div>
            
            {/* Lista de sugestões */}
            {showSuggestions && filteredClientes.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {filteredClientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSelectCliente(cliente, field.onChange)}
                  >
                    <div className="font-medium text-gray-900">{cliente.nome}</div>
                    <div className="text-sm text-gray-500">
                      {cliente.cidade} • {cliente.telefone}
                    </div>
                    <div className="text-xs text-gray-400">{cliente.email}</div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Mensagem quando não encontrar resultados */}
            {showSuggestions && clienteSearchTerm.length > 0 && filteredClientes.length === 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4">
                <div className="text-gray-500 text-center">
                  Nenhum cliente encontrado para "{clienteSearchTerm}"
                </div>
              </div>
            )}
          </div>
          
          <FormDescription className="text-gray-600">
            Digite para buscar e selecionar um cliente
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
