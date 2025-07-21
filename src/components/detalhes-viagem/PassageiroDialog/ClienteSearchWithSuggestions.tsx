import React, { useState, useEffect, useRef } from "react";
import { Search, Check, User, Phone, Mail, MapPin, UserPlus, X, Clock, Info } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ClienteSearchWithSuggestionsProps {
  control: any;
}

export function ClienteSearchWithSuggestions({ control }: ClienteSearchWithSuggestionsProps) {
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteOption[]>([]);
  const [recentClientes, setRecentClientes] = useState<ClienteOption[]>([]);
  const [clienteSearchTerm, setClienteSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("busca");
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (clienteSearchTerm.trim() === "") {
      setFilteredClientes([]);
      if (!showSuggestions) {
        setShowSuggestions(true);
        setActiveTab("recentes");
      }
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.telefone.includes(clienteSearchTerm) ||
        cliente.email.toLowerCase().includes(clienteSearchTerm.toLowerCase()) ||
        cliente.cidade.toLowerCase().includes(clienteSearchTerm.toLowerCase())
      ).slice(0, 15); // Aumentamos o limite para 15 sugestões
      setFilteredClientes(filtered);
      setShowSuggestions(true);
      setActiveTab("busca");
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

  // Carregar clientes recentes
  useEffect(() => {
    const fetchRecentClientes = async () => {
      try {
        const { data, error } = await supabase
          .from("viagem_passageiros")
          .select("cliente_id")
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) throw error;
        
        if (data && data.length > 0) {
          // Extrair IDs únicos
          const uniqueIds = [...new Set(data.map(item => item.cliente_id))].slice(0, 10);
          
          // Buscar detalhes dos clientes
          const { data: clientesData, error: clientesError } = await supabase
            .from("clientes")
            .select("id, nome, telefone, email, cidade")
            .in("id", uniqueIds);
            
          if (clientesError) throw clientesError;
          setRecentClientes(clientesData || []);
        }
      } catch (error) {
        console.error("Erro ao buscar clientes recentes:", error);
      }
    };
    
    fetchRecentClientes();
  }, []);

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
      // Mantemos as sugestões abertas para facilitar múltiplas seleções
      setActiveTab("recentes");
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

  const renderClienteCard = (cliente: ClienteOption, selectedIds: string[], onChange: (value: string[]) => void) => (
    <div
      key={cliente.id}
      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer flex flex-col gap-2"
      onClick={() => handleSelectCliente(cliente, selectedIds, onChange)}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-900 flex items-center gap-2">
          <User className="h-4 w-4 text-blue-500" />
          {formatarNomeComPreposicoes(cliente.nome)}
        </div>
        {selectedIds.includes(cliente.id) && (
          <Badge className="bg-green-500 text-white">
            <Check className="h-3 w-3 mr-1" /> Selecionado
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin className="h-3 w-3 text-gray-400" />
        {cliente.cidade}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Phone className="h-3 w-3 text-gray-400" />
        {cliente.telefone}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Mail className="h-3 w-3 text-gray-400" />
        {cliente.email}
      </div>
    </div>
  );

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
                        if (clienteSearchTerm.trim() === "") {
                          setActiveTab("recentes");
                        }
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
                  {showSuggestions ? "Fechar" : "Buscar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => {
                    // Aqui você pode adicionar a navegação para a página de cadastro de cliente
                    // ou abrir um modal para cadastro rápido
                    toast.info("Funcionalidade de cadastro rápido será implementada em breve!");
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              </div>
            </div>
            
            {/* Painel de seleção avançada */}
            {showSuggestions && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-gray-200 px-4 py-2">
                    <TabsList className="grid grid-cols-2 bg-gray-100">
                      <TabsTrigger value="busca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Search className="h-4 w-4 mr-2" />
                        Resultados da Busca
                      </TabsTrigger>
                      <TabsTrigger value="recentes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                        <Clock className="h-4 w-4 mr-2" />
                        Clientes Recentes
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <ScrollArea className="h-[320px] p-4">
                    <TabsContent value="busca" className="mt-0 p-0">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-[280px]">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : filteredClientes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredClientes.map((cliente) => renderClienteCard(cliente, field.value || [], field.onChange))}
                        </div>
                      ) : clienteSearchTerm.trim() !== "" ? (
                        <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
                          <Search className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-center mb-2">Nenhum cliente encontrado para "{clienteSearchTerm}"</p>
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={() => {
                              // Aqui você pode adicionar a navegação para a página de cadastro de cliente
                              toast.info("Funcionalidade de cadastro rápido será implementada em breve!");
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Cadastrar Novo Cliente
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
                          <Search className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-center">Digite algo para buscar clientes</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="recentes" className="mt-0 p-0">
                      {recentClientes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {recentClientes.map((cliente) => renderClienteCard(cliente, field.value || [], field.onChange))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
                          <Clock className="h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-center">Nenhum cliente recente encontrado</p>
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
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
