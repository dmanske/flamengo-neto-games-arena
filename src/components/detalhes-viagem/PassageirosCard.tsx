
import React from "react";
import { Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PassageirosList } from "./PassageirosList";
import { FormaPagamento } from "@/types/entities";

interface PassageiroDisplay {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: string;
  cliente_id: string;
  viagem_passageiro_id: string;
  valor: number | null;
  desconto: number | null;
  onibus_id?: string | null;
  viagem_id: string;
}

interface Onibus {
  id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
}

interface PassageirosCardProps {
  passageirosAtuais: PassageiroDisplay[];
  passageiros: PassageiroDisplay[];
  onibusAtual: Onibus | null;
  selectedOnibusId: string | null;
  totalPassageirosNaoAlocados: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAddPassageiroOpen: (open: boolean) => void;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
}

export function PassageirosCard({
  passageirosAtuais,
  passageiros,
  onibusAtual,
  selectedOnibusId,
  totalPassageirosNaoAlocados,
  searchTerm,
  setSearchTerm,
  setAddPassageiroOpen,
  onEditPassageiro,
  onDeletePassageiro
}: PassageirosCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            {selectedOnibusId === null ? (
              <>Passageiros Não Alocados <Badge variant="outline" className="ml-2">{totalPassageirosNaoAlocados}</Badge></>
            ) : (
              <>
                Passageiros do {onibusAtual?.numero_identificacao || `Ônibus ${onibusAtual?.tipo_onibus}`}
                <Badge variant="outline" className="ml-2">{passageirosAtuais.length}</Badge>
              </>
            )}
          </CardTitle>
          <CardDescription>
            {selectedOnibusId !== null ? (
              `${passageirosAtuais.length} de ${onibusAtual?.capacidade_onibus || 0} lugares ocupados (${Math.round((passageirosAtuais.length / (onibusAtual?.capacidade_onibus || 1)) * 100)}%)`
            ) : (
              `${totalPassageirosNaoAlocados} passageiros sem alocação de ônibus`
            )}
          </CardDescription>
        </div>
        <Button onClick={() => setAddPassageiroOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Adicionar Passageiro
        </Button>
      </CardHeader>
      <CardContent>
        {passageiros.length > 0 ? (
          <PassageirosList
            passageirosAtuais={passageirosAtuais}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onEdit={onEditPassageiro}
            onDelete={onDeletePassageiro}
            selectedOnibusId={selectedOnibusId}
            onibusAtual={onibusAtual}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mb-2 text-muted-foreground/50" />
            <p>Nenhum passageiro cadastrado para esta viagem</p>
            <p className="text-sm">Cadastre passageiros para esta viagem</p>
            <Button className="mt-4" onClick={() => setAddPassageiroOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Passageiro
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {passageiros.length > 0 && (
            <>
              {selectedOnibusId !== null ? (
                `Ocupação: ${passageirosAtuais.length} de ${onibusAtual?.capacidade_onibus || 0} lugares (${Math.round((passageirosAtuais.length / (onibusAtual?.capacidade_onibus || 1)) * 100)}%)`
              ) : (
                `${totalPassageirosNaoAlocados} passageiros não alocados`
              )}
            </>
          )}
        </div>
        <Button variant="outline">Exportar Lista</Button>
      </CardFooter>
    </Card>
  );
}
