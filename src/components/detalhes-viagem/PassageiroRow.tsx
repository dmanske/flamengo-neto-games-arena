// Componente para uma linha de passageiro com valores calculados corretamente
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Eye } from "lucide-react";
import { formatBirthDate, formatarNomeComPreposicoes, formatCPF, formatPhone } from "@/utils/formatters";
import { StatusBadgeAvancado, BreakdownVisual } from "./StatusBadgeAvancado";
import { BotoesAcaoRapida } from "./BotoesAcaoRapida";
import { PasseiosSimples } from "./PasseiosSimples";
import { SetorBadge } from "@/components/ui/SetorBadge";
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado } from "@/types/pagamentos-separados";

interface PassageiroRowProps {
  passageiro: any;
  index: number;
  onViewDetails?: (passageiro: any) => void;
  onEditPassageiro: (passageiro: any) => void;
  onDeletePassageiro: (passageiro: any) => void;
  handlePagamento: (passageiroId: string, categoria: string, valor: number, formaPagamento?: string, observacoes?: string) => Promise<boolean>;
}

export const PassageiroRow: React.FC<PassageiroRowProps> = ({
  passageiro,
  index,
  onViewDetails,
  onEditPassageiro,
  onDeletePassageiro,
  handlePagamento
}) => {
  // USAR MESMO SISTEMA DO MODAL DE EDIÇÃO
  const {
    breakdown,
    historicoPagamentos,
    loading: loadingPagamentos,
    error: errorPagamentos,
    obterStatusAtual
  } = usePagamentosSeparados(passageiro.viagem_passageiro_id || passageiro.id);

  // Se ainda carregando ou erro, mostrar dados básicos
  if (loadingPagamentos || !breakdown || errorPagamentos) {
    // Debug para identificar problemas
    if (errorPagamentos) {
      console.warn(`⚠️ Erro ao carregar dados do passageiro ${passageiro.nome}:`, {
        error: errorPagamentos,
        passageiroId: passageiro.id,
        viagemPassageiroId: passageiro.viagem_passageiro_id,
        usedId: passageiro.viagem_passageiro_id || passageiro.id
      });
    }
    
    const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
    const valorPasseios = 0; // Placeholder enquanto carrega
    const statusAvancado: StatusPagamentoAvancado = passageiro.gratuito === true ? 'Brinde' : 'Pendente';
    
    return (
      <TableRow key={passageiro.id}>
        <TableCell className="text-center">{index + 1}</TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-rome-navy">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {(passageiro.clientes?.nome || passageiro.nome).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {onViewDetails ? (
              <button
                onClick={() => onViewDetails(passageiro)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}
              </button>
            ) : (
              formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)
            )}
          </div>
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap px-2">
          {formatCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap px-2">
          {formatPhone(passageiro.clientes?.telefone || passageiro.telefone)}
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black px-2">
          {formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento)}
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black px-2">
          {passageiro.cidade_embarque || 'Blumenau'}
        </TableCell>
        <TableCell className="text-center px-2">
          <SetorBadge setor={passageiro.setor_maracana || "Não informado"} />
        </TableCell>
        <TableCell className="text-center px-2">
          <StatusBadgeAvancado status={statusAvancado} size="sm" />
        </TableCell>
        <TableCell className="text-center px-2">
          <div className="text-xs text-gray-500">Carregando...</div>
        </TableCell>
        <TableCell className="text-center px-2">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEditPassageiro(passageiro)} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDeletePassageiro(passageiro)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  // DADOS CARREGADOS - USAR BREAKDOWN DO HOOK (MESMO SISTEMA DO MODAL)
  const valorViagem = breakdown.valor_viagem;
  const valorPasseios = breakdown.valor_passeios;
  const pagoViagem = breakdown.pago_viagem;
  const pagoPasseios = breakdown.pago_passeios;
  const statusAvancado = obterStatusAtual();

  return (
    <TableRow key={passageiro.id}>
      <TableCell className="text-center">{index + 1}</TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-rome-navy">
        <div className="flex items-center gap-2">
          {passageiro.foto ? (
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarImage 
                src={passageiro.clientes?.foto || passageiro.foto} 
                alt={passageiro.clientes?.nome || passageiro.nome}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {(passageiro.clientes?.nome || passageiro.nome).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-8 w-8 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {(passageiro.clientes?.nome || passageiro.nome).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
          {onViewDetails ? (
            <button
              onClick={() => onViewDetails(passageiro)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              {formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}
            </button>
          ) : (
            formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)
          )}
        </div>
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">
        {formatCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">
        {formatPhone(passageiro.clientes?.telefone || passageiro.telefone)}
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black">
        {formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento)}
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black">
        {passageiro.cidade_embarque || 'Blumenau'}
      </TableCell>
      <TableCell className="text-center">
        <SetorBadge setor={passageiro.setor_maracana || "Não informado"} />
      </TableCell>
      <TableCell className="text-center">
        <StatusBadgeAvancado 
          status={statusAvancado}
          size="sm"
        />
      </TableCell>
      <TableCell className="text-center px-2">
        <PasseiosSimples passeios={(() => {
          const passeiosData = passageiro.passeios?.map(pp => ({
            nome: pp.passeio_nome,
            valor: passageiro.gratuito === true ? 0 : (pp.valor_cobrado || 0),
            gratuito: passageiro.gratuito === true
          })) || [];
          
          // Debug SEMPRE para investigar
          console.log(`🔍 DEBUG PassageiroRow - ${passageiro.nome}:`, {
            raw: passageiro.passeios,
            rawOld: passageiro.passageiro_passeios,
            processed: passeiosData,
            gratuito: passageiro.gratuito,
            rawLength: passageiro.passeios?.length || 0,
            rawType: typeof passageiro.passeios,
            rawIsArray: Array.isArray(passageiro.passeios)
          });
          
          return passeiosData;
        })()} />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditPassageiro(passageiro)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeletePassageiro(passageiro)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};