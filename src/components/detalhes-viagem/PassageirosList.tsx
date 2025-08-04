import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { converterStatusParaInteligente } from "@/lib/status-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { formatPhone } from "@/utils/formatters";
import { PassageiroDisplay } from "@/hooks/useViagemDetails";
import { PasseiosCompactos } from "./PasseiosCompactos";
import { calcularValorFinalPassageiro } from "@/utils/passageiroCalculos";

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
            <TableHead>Valor Total</TableHead>
            <TableHead>Desconto</TableHead>
            <TableHead>Final</TableHead>
            <TableHead>Pgto.</TableHead>
            <TableHead>Forma</TableHead>
            <TableHead>Passeios</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {passageiros.length > 0 ? (
            passageiros.map((passageiro, index) => (
              <TableRow key={passageiro.viagem_passageiro_id}>
                <TableCell className="text-center">{index + 1}</TableCell>
                <TableCell>{passageiro.nome}</TableCell>
                <TableCell>{formatPhone(passageiro.telefone)}</TableCell>
                <TableCell>{passageiro.cidade}</TableCell>
                <TableCell>{passageiro.cpf}</TableCell>
                <TableCell>{passageiro.setor_maracana}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatCurrency(passageiro.valor || 0)}</span>
                    {passageiro.passeios && passageiro.passeios.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        (base + passeios)
                      </span>
                    )}
                  </div>
                </TableCell>
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
                  <span className="font-medium">
                    {formatCurrency(calcularValorFinalPassageiro(passageiro))}
                  </span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const statusInteligente = converterStatusParaInteligente({
                      valor: passageiro.valor || 0,
                      desconto: passageiro.desconto || 0,
                      parcelas: passageiro.parcelas,
                      status_pagamento: passageiro.status_pagamento
                    });
                    
                    return (
                      <Badge className={statusInteligente.cor} title={statusInteligente.descricao}>
                        {statusInteligente.status}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>{passageiro.forma_pagamento}</TableCell>
                <TableCell>
                  <PasseiosCompactos passeios={passageiro.passeios} />
                </TableCell>
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
              <TableCell colSpan={13} className="text-center py-4">
                Nenhum passageiro encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
