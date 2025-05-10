
import React, { useState } from "react";
import { toast } from "sonner";
import { X, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormaPagamento } from "@/types/entities";

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  email: string;
}

interface PassageiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSuccess: () => void;
  valorPadrao?: number | null;
  setorPadrao?: string | null;
}

export function PassageiroDialog({
  open,
  onOpenChange,
  viagemId,
  onSuccess,
  valorPadrao = 0,
  setorPadrao = "Sem ingresso"
}: PassageiroDialogProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState<string>("");
  const [setor, setSetor] = useState<string>(setorPadrao || "Sem ingresso");
  const [statusPagamento, setStatusPagamento] = useState<string>("Pendente");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>("Pix");
  const [valor, setValor] = useState<number>(valorPadrao || 0);
  const [desconto, setDesconto] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar clientes ao abrir o modal
  React.useEffect(() => {
    const fetchClientes = async () => {
      if (open) {
        try {
          const { data: clientesData, error: clientesError } = await supabase
            .from("clientes")
            .select("id, nome, telefone, cidade, cpf, email");
            
          if (clientesError) throw clientesError;
          setClientes(clientesData || []);
          setFilteredClientes(clientesData || []);
        } catch (err) {
          console.error("Erro ao buscar clientes:", err);
          toast.error("Erro ao carregar clientes");
        }
      }
    };
    
    fetchClientes();
    
    // Reset form state when dialog opens
    if (open) {
      setSearchTerm("");
      setSelectedClienteId("");
      setSetor(setorPadrao || "Sem ingresso");
      setStatusPagamento("Pendente");
      setFormaPagamento("Pix");
      setValor(valorPadrao || 0);
      setDesconto(0);
    }
  }, [open, setorPadrao, valorPadrao]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(
        cliente => 
          cliente.nome.toLowerCase().includes(value) ||
          cliente.cpf.toLowerCase().includes(value) ||
          cliente.telefone.toLowerCase().includes(value)
      );
      setFilteredClientes(filtered);
    }
  };

  const handleAddPassageiro = async () => {
    if (!viagemId || !selectedClienteId) return;
    
    try {
      setIsLoading(true);
      
      // Verificar se já existe este passageiro na viagem
      const { data: existingPassageiro } = await supabase
        .from("viagem_passageiros")
        .select("*")
        .eq("viagem_id", viagemId)
        .eq("cliente_id", selectedClienteId)
        .single();
      
      if (existingPassageiro) {
        toast.error("Este cliente já está adicionado como passageiro nesta viagem");
        return;
      }
      
      // Adicionar o passageiro
      const { error } = await supabase
        .from("viagem_passageiros")
        .insert({
          viagem_id: viagemId,
          cliente_id: selectedClienteId,
          setor_maracana: setor,
          status_pagamento: statusPagamento,
          forma_pagamento: formaPagamento,
          valor: valor,
          desconto: desconto
        });
      
      if (error) throw error;
      
      toast.success("Passageiro adicionado com sucesso");
      onOpenChange(false);
      onSuccess();
      
    } catch (err) {
      console.error("Erro ao adicionar passageiro:", err);
      toast.error("Erro ao adicionar passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredClientes(clientes);
  };

  // Formatar valor para exibição em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular valor final após descontos
  const valorFinal = valor - desconto;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Adicionar Passageiro</DialogTitle>
          <DialogDescription>
            Selecione um cliente cadastrado para adicionar como passageiro nesta viagem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou telefone..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="absolute right-2 top-2.5" 
              onClick={clearSearch}
              type="button"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientes.length > 0 ? (
                filteredClientes.map((cliente) => (
                  <TableRow 
                    key={cliente.id} 
                    className={selectedClienteId === cliente.id ? "bg-muted" : ""}
                    onClick={() => setSelectedClienteId(cliente.id)}
                  >
                    <TableCell>
                      <input 
                        type="radio" 
                        checked={selectedClienteId === cliente.id}
                        onChange={() => setSelectedClienteId(cliente.id)}
                        className="rounded-full"
                      />
                    </TableCell>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.cpf}</TableCell>
                    <TableCell>{cliente.telefone}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="grid gap-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="setor">Setor do Maracanã</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger>
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
              <Select value={formaPagamento} onValueChange={(value) => setFormaPagamento(value as FormaPagamento)}>
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
                  <span>{formatCurrency(valorFinal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleAddPassageiro}
            disabled={!selectedClienteId || isLoading}
          >
            {isLoading ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
