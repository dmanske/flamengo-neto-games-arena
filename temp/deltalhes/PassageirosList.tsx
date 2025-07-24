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
            <TableHead className="w-[50px]">#</TableHead>
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
            <TableHead>Passeio</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passageiros.length > 0 ? (
            passageiros.map((passageiro, index) => (
              <TableRow key={passageiro.viagem_passageiro_id}>
                <TableCell className="text-center">{index + 1}</TableCell>
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
                <TableCell>{
                  passageiro.passeio_cristo === 'sim' ? (
                    <Badge className="bg-green-100 text-green-800">Sim</Badge>
                  ) : passageiro.passeio_cristo === 'nao' ? (
                    <Badge className="bg-red-100 text-red-700">Não</Badge>
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700">-</Badge>
                  )
                }</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-7 w-7 p-0 flex items-center justify-center"
                      onClick={() => onEdit(passageiro)}
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className="h-7 w-7 p-0 flex items-center justify-center text-destructive"
                      onClick={() => onDelete(passageiro)}
                      title="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">
                Nenhum passageiro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
