import React, { useState, useEffect, useRef } from "react";
import { Search, Check, User, Phone, Mail, MapPin, X, Info } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ClienteOption } from "./types";
import { formatarNomeComPreposicoes } from "@/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClienteSearchWithSuggestionsProps {
  control: any;
  viagemId?: string;
}

export function ClienteSearchWithSuggestions({ control, viagemId }: ClienteSearchWithSuggestionsProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteOption[]>([]);
  const [clientesJaAdicionados, setClientesJaAdicionados] = useState<string[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClientes();
    if (viagemId) {
      fetchClientesJaAdicionados();
    }
  }, [viagemId]);

  useEffect(() => {
    if (clienteSearchTerm.trim() === "") {
      // Mostrar todos os clientes disponíveis quando não há busca
      const clientesDisponiveis = clientes.filter(cliente => 
        !clientesJaAdicionados.includes(cliente.id)
      );
      setFilteredClientes(clientesDisponiveis);
    } else {
      // Filtrar clientes baseado na busca, excluindo os já adicionados
      const filtered = clientes.filter(cliente =>
        !clientesJaAdicionados.includes(cliente.id) &&
        (cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.telefone.includes(clienteSearchTerm) ||
        cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.cidade.toLowerCase().includes(clienteSearchTerm.toLowerCase()))
      );
      setFilteredClientes(filtered);
    }
  }, [clienteSearchTerm, clientes, clientesJaAdicionados]);

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  // Buscar clientes já adicionados nesta viagem
  const fetchClientesJaAdicionados = async () => {
    if (!viagemId) return;
    
    try {
      const { data, error } = await supabase
        .from("viagem_passageiros")
        .select("cliente_id")
        .eq("viagem_id", viagemId);

      if (error) throw error;
      
      const idsAdicionados = data?.map(item => item.cliente_id) || [];
      setClientesJaAdicionados(idsAdicionados);
    } catch (error) {
      console.error("Erro ao buscar clientes já adicionados:", error);
    }
  };

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, email, cidade")
        .order("nome");

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast.error("Erro ao carregar a lista de clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCliente = (cliente: ClienteOption, selectedIds: string[], onChange: (value: string[]) => void) => {
    if (!selectedIds.includes(cliente.id)) {
      const novos = [...selectedIds, cliente.id];
      onChange(novos);
      setClienteSearchTerm("");
      // Foco de volta no input para continuar a busca
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleRemoveCliente = (id: string, selectedIds: string[], onChange: (value: string[]) => void) => {
    const novos = selectedIds.filter(cid => cid !== id);
    onChange(novos);
  };

  const renderClienteCard = (cliente: ClienteOption, selectedIds: string[], onChange: (value: string[]) => void) => {
    const isSelected = selectedIds.includes(cliente.id);
    const isJaAdicionado = clientesJaAdicionados.includes(cliente.id);
    
    return (
      <div
        key={cliente.id}
        className={`p-3 border rounded-lg transition-all cursor-pointer flex flex-col gap-2 ${
          isJaAdicionado 
            ? "bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed" 
            : isSelected
            ? "bg-green-50 border-green-300"
            : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50"
        }`}
        onClick={() => {
          if (!isJaAdicionado) {
            handleSelectCliente(cliente, selectedIds, onChange);
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            <User className={`h-4 w-4 ${isJaAdicionado ? 'text-gray-400' : 'text-blue-500'}`} />
            {formatarNomeComPreposicoes(cliente.nome)}
          </div>
          {isJaAdicionado ? (
            <Badge className="bg-gray-500 text-white text-xs">
              Já na viagem
            </Badge>
          ) : isSelected ? (
            <Badge className="bg-green-500 text-white text-xs">
              <Check className="h-3 w-3 mr-1" /> Selecionado
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3 text-gray-400" />
            {cliente.telefone}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-400" />
            {cliente.cidade}
          </div>
        </div>
        {cliente.email && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Mail className="h-3 w-3 text-gray-400" />
            {cliente.email}
          </div>
        )}
      </div>
    );
  };

  return (
    <FormField
      control={control}
      name="cliente_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-gray-700 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Passageiros
          </FormLabel>
          <div className="relative" ref={containerRef}>
            {/* Chips dos clientes selecionados */}
            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-lg border border-gray-200 min-h-[60px]">
              {Array.isArray(field.value) && field.value.length > 0 ? (
                field.value.map((id: string) => {
                  const cliente = clientes.find(c => c.id === id);
                  if (!cliente) return null;
                  return (
                    <div key={id} className="flex items-center bg-blue-100 text-blue-800 rounded-lg px-3 py-2 text-sm">
                      <User className="h-3 w-3 mr-2 text-blue-600" />
                      <span className="font-medium">{formatarNomeComPreposicoes(cliente.nome)}</span>
                      <button
                        type="button"
                        className="ml-2 p-1 rounded-full bg-blue-200 text-blue-700 hover:bg-red-200 hover:text-red-700 transition-colors"
                        onClick={() => handleRemoveCliente(id, field.value, field.onChange)}
                        aria-label="Remover cliente"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
                  Nenhum passageiro selecionado
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <FormControl>
                    <Input
                      ref={inputRef}
                      placeholder="Buscar cliente por nome, telefone, email ou cidade..."
                      value={clienteSearchTerm}
                      onChange={(e) => {
                        setClienteSearchTerm(e.target.value);
                      }}
                      onFocus={() => {
                        setShowSuggestions(true);
                      }}
                      className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => {
                    setShowSuggestions(!showSuggestions);
                    if (!showSuggestions && inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  {showSuggestions ? "Fechar" : "Mostrar Todos"}
                </Button>
              </div>
            </div>
            
            {/* Lista de clientes */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      {clienteSearchTerm.trim() ? `Resultados para "${clienteSearchTerm}"` : "Todos os Clientes"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
                    </span>
                  </div>
                </div>
                
                <ScrollArea className="h-[400px] p-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-[360px]">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : filteredClientes.length > 0 ? (
                    <div className="space-y-3">
                      {filteredClientes.map((cliente) => renderClienteCard(cliente, field.value || [], field.onChange))}
                    </div>
                  ) : clienteSearchTerm.trim() !== "" ? (
                    <div className="flex flex-col items-center justify-center h-[360px] text-gray-500">
                      <Search className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-center mb-2">Nenhum cliente encontrado para "{clienteSearchTerm}"</p>
                      <p className="text-center text-sm">Tente buscar por nome, telefone, email ou cidade</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[360px] text-gray-500">
                      <User className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-center">Digite algo para buscar clientes</p>
                      <p className="text-center text-sm mt-1">ou clique em "Mostrar Todos" para ver a lista completa</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
          <FormDescription className="text-gray-600 flex items-center gap-2 mt-2">
            <Info className="h-4 w-4 text-blue-500" />
            Selecione um ou mais passageiros para esta viagem
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
