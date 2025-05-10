
import React from "react";
import { Search, X, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { FormaPagamento } from "@/types/entities";

interface PassageiroDisplay {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: FormaPagamento;
  cliente_id: string;
  viagem_passageiro_id: string;
  valor: number | null;
  desconto: number | null;
  onibus_id?: string | null;
  viagem_id: string;
}

interface PassageirosListProps {
  passageirosAtuais: PassageiroDisplay[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (passageiro: PassageiroDisplay) => void;
  onDelete: (passageiro: PassageiroDisplay) => void;
  selectedOnibusId: string | null;
  onibusAtual?: { 
    id: string; 
    tipo_onibus: string; 
    empresa: string;
    capacidade_onibus: number;
    numero_identificacao: string | null;
  } | null;
}

export function PassageirosList({
  passageirosAtuais,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  selectedOnibusId,
  onibusAtual
}: PassageirosListProps) {
  return (
    <div>
      <div className="mb-4 relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar passageiro por nome, CPF, telefone..."
          className="pl-8 pr-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button 
            className="absolute right-2 top-1/2 -translate-y-1/2" 
            onClick={() => setSearchTerm("")}
            type="button"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Pgto.</TableHead>
              <TableHead>Forma</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passageirosAtuais.length > 0 ? (
              passageirosAtuais.map((passageiro) => (
                <TableRow key={passageiro.viagem_passageiro_id}>
                  <TableCell>{passageiro.nome}</TableCell>
                  <TableCell>{passageiro.telefone}</TableCell>
                  <TableCell>{passageiro.cidade}</TableCell>
                  <TableCell>{passageiro.cpf}</TableCell>
                  <TableCell>{passageiro.setor_maracana}</TableCell>
                  <TableCell>{formatCurrency(passageiro.valor || 0)}</TableCell>
                  <TableCell>
                    {passageiro.desconto && passageiro.desconto > 0 ? (
                      <span className="text-red-600">
                        -{formatCurrency(passageiro.desconto)}
                      </span>
                    ) : (
                      <span>R$ 0,00</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatCurrency((passageiro.valor || 0) - (passageiro.desconto || 0))}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        passageiro.status_pagamento === "Pago" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                      }
                    >
                      {passageiro.status_pagamento}
                    </Badge>
                  </TableCell>
                  <TableCell>{passageiro.forma_pagamento}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onEdit(passageiro)}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive" 
                        onClick={() => onDelete(passageiro)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4">
                  {searchTerm ? (
                    "Nenhum passageiro encontrado com esse termo de busca."
                  ) : selectedOnibusId === null ? (
                    "Não há passageiros sem alocação de ônibus."
                  ) : (
                    "Não há passageiros alocados neste ônibus."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
