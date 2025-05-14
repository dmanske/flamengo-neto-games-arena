
import React from "react";
import { Pencil, Trash2 } from "lucide-react";
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
import { PassageiroDisplay } from "@/hooks/useViagemDetails";

interface PassageirosListProps {
  passageiros: PassageiroDisplay[];
  onEdit: (passageiro: PassageiroDisplay) => void;
  onDelete: (passageiro: PassageiroDisplay) => void;
}

export function PassageirosList({
  passageiros,
  onEdit,
  onDelete,
}: PassageirosListProps) {
  return (
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
          {passageiros.length > 0 ? (
            passageiros.map((passageiro) => (
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
                Nenhum passageiro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
