
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Search, UserPlus, X } from "lucide-react";
import { FormaPagamento } from "@/types/entities";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  email: string;
}

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  lugares_extras?: number | null;
}

interface PassageiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSuccess: () => void;
  valorPadrao: number | null;
  setorPadrao: string | null;
  defaultOnibusId?: string;
}

export function PassageiroDialog({
  open,
  onOpenChange,
  viagemId,
  onSuccess,
  valorPadrao,
  setorPadrao,
  defaultOnibusId
}: PassageiroDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [setor, setSetor] = useState<string>(setorPadrao || "Norte");
  const [statusPagamento, setStatusPagamento] = useState<string>("Pendente");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Pix");
  const [valor, setValor] = useState<number>(valorPadrao || 0);
  const [desconto, setDesconto] = useState<number>(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [onibusList, setOnibusList] = useState<Onibus[]>([]);
  const [onibusCapacidades, setOnibusCapacidades] = useState<Record<string, number>>({});
  const [onibusId, setOnibusId] = useState<string>("");
  
  // Initialize with default onibus if provided
  useEffect(() => {
    if (defaultOnibusId) {
      setOnibusId(defaultOnibusId);
    }
  }, [defaultOnibusId]);
  
  // Load onibus list and capacities when modal opens
  useEffect(() => {
    if (!open || !viagemId) return;
    
    const fetchOnibus = async () => {
      try {
        // Fetch buses for the trip
        const { data, error } = await supabase
          .from("viagem_onibus")
          .select("*")
          .eq("viagem_id", viagemId);
          
        if (error) throw error;
        setOnibusList(data || []);
        
        // Count passengers for each bus to check capacity
        const capacidades: Record<string, number> = {};
        
        await Promise.all((data || []).map(async (onibus) => {
          const { count, error: countError } = await supabase
            .from("viagem_passageiros")
            .select("*", { count: "exact", head: true })
            .eq("onibus_id", onibus.id);
            
          if (countError) throw countError;
          capacidades[onibus.id] = count || 0;
        }));
        
        setOnibusCapacidades(capacidades);
        
        // Set first available bus if none selected
        if (!onibusId && data && data.length > 0) {
          setOnibusId(data[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar ônibus:", err);
        toast.error("Erro ao carregar opções de ônibus");
      }
    };
    
    fetchOnibus();
  }, [open, viagemId]);

  // Search for existing clients
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase
        .from("clientes")
        .select("id, nome, telefone, cidade, cpf, email")
        .order("nome");

      // Check if search term is a CPF
      if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(searchTerm)) {
        query = query.eq("cpf", searchTerm);
      } else {
        query = query.ilike("nome", `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      toast.error("Erro ao buscar clientes");
    } finally {
      setIsSearching(false);
    }
  };

  // Add passenger to trip
  const handleAddPassageiro = async () => {
    if (!selectedCliente) {
      toast.error("Selecione um cliente primeiro");
      return;
    }
    
    if (!onibusId) {
      toast.error("Selecione um ônibus para o passageiro");
      return;
    }
    
    // Check if the selected bus has available capacity
    const selectedBus = onibusList.find(bus => bus.id === onibusId);
    if (selectedBus) {
      const totalCapacity = selectedBus.capacidade_onibus + (selectedBus.lugares_extras || 0);
      const currentPassengers = onibusCapacidades[onibusId] || 0;
      
      if (currentPassengers >= totalCapacity) {
        toast.error(`Este ônibus já está na capacidade máxima (${totalCapacity} passageiros)`);
        return;
      }
    }

    setIsLoading(true);
    try {
      // Check if the passenger already exists in the trip
      const { data: existingPassageiro, error: checkError } = await supabase
        .from("viagem_passageiros")
        .select("id")
        .eq("viagem_id", viagemId)
        .eq("cliente_id", selectedCliente.id)
        .single();

      if (existingPassageiro) {
        toast.error("Este passageiro já está cadastrado nesta viagem");
        setIsLoading(false);
        return;
      }

      if (checkError && checkError.code !== "PGRST116") {
        // If error is not "No rows found", throw it
        throw checkError;
      }
      
      // Add passenger to the trip
      const { error } = await supabase
        .from("viagem_passageiros")
        .insert([
          {
            viagem_id: viagemId,
            cliente_id: selectedCliente.id,
            setor_maracana: setor,
            status_pagamento: statusPagamento,
            forma_pagamento: formaPagamento,
            valor: valor,
            desconto: desconto,
            onibus_id: onibusId
          }
        ]);

      if (error) throw error;
      
      toast.success(`${selectedCliente.nome} adicionado como passageiro`);
      
      // Update the capacity count for the selected bus
      setOnibusCapacidades({
        ...onibusCapacidades,
        [onibusId]: (onibusCapacidades[onibusId] || 0) + 1
      });
      
      resetForm();
      onSuccess();
    } catch (err) {
      console.error("Erro ao adicionar passageiro:", err);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form values
  const resetForm = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSelectedCliente(null);
    setSetor(setorPadrao || "Norte");
    setStatusPagamento("Pendente");
    setFormaPagamento("Pix");
    setValor(valorPadrao || 0);
    setDesconto(0);
  };

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format bus label with capacity info
  const formatOnibusLabel = (onibus: Onibus) => {
    const totalCapacidade = (onibus.capacidade_onibus || 0) + (onibus.lugares_extras || 0);
    const passageirosAtuais = onibusCapacidades[onibus.id] || 0;
    const lotacao = passageirosAtuais >= totalCapacidade ? " (LOTADO)" : 
                   passageirosAtuais >= totalCapacidade * 0.9 ? " (QUASE CHEIO)" : "";
    
    return `${onibus.numero_identificacao || onibus.tipo_onibus} (${passageirosAtuais}/${totalCapacidade})${lotacao}`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Adicionar Passageiro</DialogTitle>
          <DialogDescription>
            Busque um cliente existente para adicionar como passageiro na viagem.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="search">
          <TabsList>
            <TabsTrigger value="search">Buscar Cliente</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedCliente}>
              {selectedCliente ? "Dados do Passageiro" : "Selecione um Cliente"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label htmlFor="search-term" className="sr-only">Buscar Cliente</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-term"
                    placeholder="Digite nome ou CPF do cliente"
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Buscando..." : "Buscar"}
              </Button>
            </div>
            
            {searchResults.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {searchResults.map((cliente) => (
                    <div 
                      key={cliente.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedCliente?.id === cliente.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSelectedCliente(cliente)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{cliente.nome}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>CPF: {cliente.cpf}</p>
                            <p>Telefone: {cliente.telefone}</p>
                            <p>Cidade: {cliente.cidade}</p>
                          </div>
                        </div>
                        {selectedCliente?.id === cliente.id && (
                          <div className="bg-primary text-primary-foreground p-1 rounded-full">
                            <UserPlus className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center p-4 border rounded-lg bg-muted/30">
                {isSearching ? (
                  <p>Buscando clientes...</p>
                ) : searchTerm ? (
                  <p>Nenhum cliente encontrado com esse nome ou CPF.</p>
                ) : (
                  <p>Digite um nome ou CPF para buscar um cliente cadastrado.</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 py-4">
            {selectedCliente && (
              <>
                <div className="bg-muted/30 p-3 rounded-lg mb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{selectedCliente.nome}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>CPF: {selectedCliente.cpf}</p>
                        <p>Telefone: {selectedCliente.telefone}</p>
                        <p>Cidade: {selectedCliente.cidade}</p>
                        <p>Email: {selectedCliente.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedCliente(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remover seleção</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="onibus">Ônibus</Label>
                    <Select value={onibusId} onValueChange={setOnibusId}>
                      <SelectTrigger id="onibus">
                        <SelectValue placeholder="Selecione o ônibus" />
                      </SelectTrigger>
                      <SelectContent>
                        {onibusList.map((onibus) => {
                          const currentPassengers = onibusCapacidades[onibus.id] || 0;
                          const totalCapacity = (onibus.capacidade_onibus || 0) + (onibus.lugares_extras || 0);
                          const isFull = currentPassengers >= totalCapacity;
                          
                          return (
                            <SelectItem 
                              key={onibus.id} 
                              value={onibus.id}
                              disabled={isFull}
                            >
                              {formatOnibusLabel(onibus)}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="setor">Setor do Maracanã</Label>
                    <Select value={setor} onValueChange={setSetor}>
                      <SelectTrigger id="setor">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sem ingresso">Sem ingresso</SelectItem>
                        <SelectItem value="Norte">Norte</SelectItem>
                        <SelectItem value="Sul">Sul</SelectItem>
                        <SelectItem value="Leste">Leste</SelectItem>
                        <SelectItem value="Oeste">Oeste</SelectItem>
                        <SelectItem value="Maracanã Mais">Maracanã Mais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status do Pagamento</Label>
                    <RadioGroup value={statusPagamento} onValueChange={setStatusPagamento}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pendente" id="pendente" />
                        <Label htmlFor="pendente">Pendente</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Pago" id="pago" />
                        <Label htmlFor="pago">Pago</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor">Valor</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <Input 
                          id="valor" 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          value={valor} 
                          onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                          className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="desconto">Desconto</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                        <Input 
                          id="desconto" 
                          type="number" 
                          min="0" 
                          max={valor} 
                          step="0.01" 
                          value={desconto} 
                          onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                          className="pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="forma-pagamento">Forma de Pagamento</Label>
                      <Select 
                        value={formaPagamento} 
                        onValueChange={(value) => setFormaPagamento(value as FormaPagamento)}
                      >
                        <SelectTrigger id="forma-pagamento">
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pix">Pix</SelectItem>
                          <SelectItem value="Cartão">Cartão</SelectItem>
                          <SelectItem value="Boleto">Boleto</SelectItem>
                          <SelectItem value="Paypal">Paypal</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 border rounded-md p-3 bg-gray-50">
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Valor:</span>
                          <span>{formatCurrency(valor)}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Desconto:</span>
                          <span>-{formatCurrency(desconto)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-1 border-t mt-1">
                          <span>Total:</span>
                          <span>{formatCurrency(valor - desconto)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            resetForm();
            onOpenChange(false);
          }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddPassageiro} 
            disabled={!selectedCliente || isLoading || !onibusId}
          >
            {isLoading ? "Adicionando..." : "Adicionar Passageiro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
