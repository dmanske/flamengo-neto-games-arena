import React from "react";
import { Pencil, Trash2, ArrowRightLeft } from "lucide-react";
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
import { GrupoPassageiros } from "./GrupoPassageiros";
import { useGruposPassageiros } from "@/hooks/useGruposPassageiros";

interface PassageirosListProps {
  passageiros: PassageiroDisplay[];
  viagemId: string;
  onEdit: (passageiro: PassageiroDisplay) => void;
  onDelete: (passageiro: PassageiroDisplay) => void;
  onTrocarOnibus?: (passageiro: PassageiroDisplay) => void;
}

export function PassageirosList({
  passageiros,
  viagemId,
  onEdit,
  onDelete,
  onTrocarOnibus,
}: PassageirosListProps) {
  const { agruparPassageiros } = useGruposPassageiros(viagemId);
  
  // Agrupar passageiros por grupo
  const { grupos, semGrupo } = agruparPassageiros(passageiros);
  
  // Função placeholder para handlePagamento (necessária para PassageiroRow)
  const handlePagamento = async () => {
    return false;
  };
  if (passageiros.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhum passageiro encontrado.</p>
      </div>
    );
  }

  let currentIndex = 1;

  return (
    <div className="space-y-6">
      {/* Renderizar Grupos */}
      {grupos.map((grupo) => {
        const startIndex = currentIndex;
        currentIndex += grupo.total_membros;
        
        return (
          <GrupoPassageiros
            key={`${grupo.nome}-${grupo.cor}`}
            grupo={grupo}
            index={startIndex}
            onEditPassageiro={onEdit}
            onDeletePassageiro={onDelete}
            onTrocarOnibus={onTrocarOnibus}
            handlePagamento={handlePagamento}
          />
        );
      })}

      {/* Renderizar Passageiros Sem Grupo */}
      {semGrupo.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          {/* Cabeçalho para passageiros sem grupo */}
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
              Passageiros Individuais
              <Badge variant="secondary" className="text-xs">
                {semGrupo.length} {semGrupo.length === 1 ? 'passageiro' : 'passageiros'}
              </Badge>
            </h3>
          </div>

          {/* Tabela para passageiros sem grupo */}
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
                {semGrupo.map((passageiro, index) => (
                  <TableRow key={passageiro.viagem_passageiro_id}>
                    <TableCell className="text-center">{currentIndex + index}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span>{passageiro.nome}</span>
                        {/* Indicador visual de que não tem grupo */}
                        <Badge variant="outline" className="text-xs w-fit text-gray-500">
                          Individual
                        </Badge>
                      </div>
                    </TableCell>
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
                        {onTrocarOnibus && (
                          <Button 
                            size="icon" 
                            variant="outline" 
                            className="h-7 w-7 p-0 flex items-center justify-center text-blue-600 hover:text-blue-700"
                            onClick={() => onTrocarOnibus(passageiro)}
                            title="Trocar de ônibus"
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                          </Button>
                        )}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
