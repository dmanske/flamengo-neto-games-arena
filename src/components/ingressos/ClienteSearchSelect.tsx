import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Phone, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Cliente } from '@/types/ingressos';
import { formatarNomeComPreposicoes } from '@/utils/formatters';

interface ClienteSearchSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function ClienteSearchSelect({ 
  value, 
  onValueChange, 
  placeholder = "Selecione um cliente..." 
}: ClienteSearchSelectProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Buscar clientes
  useEffect(() => {
    fetchClientes();
  }, []);

  // Filtrar clientes baseado na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.telefone?.includes(searchTerm) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  // Encontrar cliente selecionado
  useEffect(() => {
    if (value && clientes.length > 0) {
      const cliente = clientes.find(c => c.id === value);
      setSelectedCliente(cliente || null);
    } else {
      setSelectedCliente(null);
    }
  }, [value, clientes]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("id, nome, telefone, email")
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

  const handleSelectCliente = (cliente: Cliente) => {
    onValueChange(cliente.id);
    setSelectedCliente(cliente);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = () => {
    onValueChange("");
    setSelectedCliente(null);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão principal */}
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between text-left font-normal"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {selectedCliente ? (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate">{formatarNomeComPreposicoes(selectedCliente.nome)}</span>
              {selectedCliente.telefone && (
                <span className="text-xs text-muted-foreground truncate">
                  {selectedCliente.telefone}
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* Header com busca */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                ref={inputRef}
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-500">
                {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente' : 'clientes'}
              </span>
              {selectedCliente && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Lista de clientes */}
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-[280px]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredClientes.length > 0 ? (
              <div className="p-2">
                {filteredClientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCliente?.id === cliente.id
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {formatarNomeComPreposicoes(cliente.nome)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          {cliente.telefone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{cliente.telefone}</span>
                            </div>
                          )}
                          {cliente.email && (
                            <div className="flex items-center gap-1 truncate">
                              <span>@</span>
                              <span className="truncate">{cliente.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() !== "" ? (
              <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
                <Search className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-center">Nenhum cliente encontrado</p>
                <p className="text-center text-sm">para "{searchTerm}"</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-gray-500">
                <User className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-center">Nenhum cliente cadastrado</p>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}