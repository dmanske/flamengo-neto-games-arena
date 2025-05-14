import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { FormaPagamento } from "@/types/entities";

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

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
}

interface PassageiroDisplay {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: FormaPagamento;
  cpf: string;
  cliente_id: string;
  viagem_passageiro_id: string;
  onibus_id?: string | null;
  valor?: number | null;
  desconto?: number | null;
  viagem_id: string; // Added the missing property
}

interface PassageiroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: PassageiroDisplay | null;
  onSuccess: () => void;
}

export function PassageiroEditDialog({
  open,
  onOpenChange,
  passageiro,
  onSuccess,
}: PassageiroEditDialogProps) {
  const [setor, setSetor] = useState<string>(passageiro?.setor_maracana || "Sem ingresso");
  const [statusPagamento, setStatusPagamento] = useState<string>(passageiro?.status_pagamento || "Pendente");
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>(passageiro?.forma_pagamento || "Pix");
  const [valor, setValor] = useState<number>(passageiro?.valor || 0);
  const [desconto, setDesconto] = useState<number>(passageiro?.desconto || 0);
  const [onibusId, setOnibusId] = useState<string>(passageiro?.onibus_id || "");
  const [onibusList, setOnibusList] = useState<Onibus[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar ônibus da viagem
  useEffect(() => {
    const fetchOnibus = async () => {
      if (passageiro) {
        try {
          const { data, error } = await supabase
            .from("viagem_onibus")
            .select("*")
            .eq("viagem_id", passageiro.viagem_id);
            
          if (error) throw error;
          setOnibusList(data || []);
        } catch (err) {
          console.error("Erro ao buscar ônibus:", err);
          toast.error("Erro ao carregar informações dos ônibus");
        }
      }
    };
    
    if (open && passageiro) {
      fetchOnibus();
    }
  }, [open, passageiro]);

  // Atualizar os valores quando o passageiro é selecionado
  useEffect(() => {
    if (passageiro) {
      setSetor(passageiro.setor_maracana);
      setStatusPagamento(passageiro.status_pagamento);
      setFormaPagamento(passageiro.forma_pagamento || "Pix");
      setValor(passageiro.valor || 0);
      setDesconto(passageiro.desconto || 0);
      setOnibusId(passageiro.onibus_id || "");
    }
  }, [passageiro]);

  const handleEditPassageiro = async () => {
    if (!passageiro || !onibusId) {
      if (!onibusId) {
        toast.error("Selecione um ônibus para o passageiro");
      }
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({
          setor_maracana: setor,
          status_pagamento: statusPagamento,
          forma_pagamento: formaPagamento,
          valor: valor,
          desconto: desconto,
          onibus_id: onibusId
        })
        .eq("id", passageiro.viagem_passageiro_id);
      
      if (error) throw error;
      
      toast.success("Dados do passageiro atualizados com sucesso");
      onOpenChange(false);
      onSuccess();
      
    } catch (err) {
      console.error("Erro ao atualizar dados do passageiro:", err);
      toast.error("Erro ao atualizar dados do passageiro");
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar valor para exibição em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar identificação do ônibus
  const formatOnibusLabel = (onibus: Onibus) => {
    return `${onibus.numero_identificacao || onibus.tipo_onibus} (${onibus.empresa})`;
  };

  // Calcular valor final após descontos
  const valorFinal = valor - desconto;

  if (!passageiro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Passageiro</DialogTitle>
          <DialogDescription>
            Edite as informações do passageiro para esta viagem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <div className="mb-4">
            <p className="text-lg font-medium">{passageiro.nome}</p>
            <p className="text-sm text-muted-foreground">CPF: {passageiro.cpf}</p>
            <p className="text-sm text-muted-foreground">Telefone: {passageiro.telefone}</p>
          </div>
          
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-onibus">Ônibus</Label>
              <Select value={onibusId} onValueChange={setOnibusId}>
                <SelectTrigger id="edit-onibus">
                  <SelectValue placeholder="Selecione o ônibus" />
                </SelectTrigger>
                <SelectContent>
                  {onibusList.map((onibus) => (
                    <SelectItem key={onibus.id} value={onibus.id}>
                      {formatOnibusLabel(onibus)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-setor">Setor do Maracanã</Label>
              <Select value={setor} onValueChange={setSetor}>
                <SelectTrigger id="edit-setor">
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
                  <RadioGroupItem value="Pendente" id="edit-pendente" />
                  <Label htmlFor="edit-pendente">Pendente</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Pago" id="edit-pago" />
                  <Label htmlFor="edit-pago">Pago</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-valor">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input 
                    id="edit-valor" 
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
                <Label htmlFor="edit-desconto">Desconto</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <Input 
                    id="edit-desconto" 
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
                <Label htmlFor="edit-forma-pagamento">Forma de Pagamento</Label>
                <Select 
                  value={formaPagamento} 
                  onValueChange={(value) => setFormaPagamento(value as FormaPagamento)}
                >
                  <SelectTrigger id="edit-forma-pagamento">
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleEditPassageiro} disabled={isLoading || !onibusId}>
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
