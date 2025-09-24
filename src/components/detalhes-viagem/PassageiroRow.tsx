// Componente para uma linha de passageiro com valores calculados corretamente
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, Eye, CreditCard, Copy, ArrowRightLeft } from "lucide-react";
import { formatBirthDate, formatarNomeComPreposicoes, formatCPF, formatPhone } from "@/utils/formatters";
import { copyNome, copyCPF, copyDataNascimento } from "@/utils/clipboard";
import { StatusBadgeAvancado, BreakdownVisual } from "./StatusBadgeAvancado";
import { BotoesAcaoRapida } from "./BotoesAcaoRapida";
import { PasseiosSimples } from "./PasseiosSimples";
import { SetorBadge } from "@/components/ui/SetorBadge";
import { CreditoBadge, useCreditoBadgeType } from "./CreditoBadge";
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado } from "@/types/pagamentos-separados";

interface PassageiroRowProps {
  passageiro: any;
  index: number;
  onViewDetails?: (passageiro: any) => void;
  onEditPassageiro: (passageiro: any) => void;
  onDeletePassageiro: (passageiro: any) => void;
  onDesvincularCredito?: (passageiro: any) => void;
  onTrocarOnibus?: (passageiro: any) => void;
  handlePagamento: (passageiroId: string, categoria: string, valor: number, formaPagamento?: string, observacoes?: string, dataPagamento?: string) => Promise<boolean>;
}

export const PassageiroRow: React.FC<PassageiroRowProps> = ({
  passageiro,
  index,
  onViewDetails,
  onEditPassageiro,
  onDeletePassageiro,
  onDesvincularCredito,
  onTrocarOnibus,
  handlePagamento
}) => {
  // Verificação de segurança para evitar erros
  if (!passageiro) {
    return (
      <TableRow>
        <TableCell colSpan={10} className="text-center text-gray-500">
          Dados do passageiro não disponíveis
        </TableCell>
      </TableRow>
    );
  }
  // ✅ CORREÇÃO: USAR MESMO SISTEMA DO MODAL DE EDIÇÃO - com verificação de segurança mais rigorosa
  const passageiroId = passageiro.viagem_passageiro_id || passageiro.id;
  
  // ✅ CORREÇÃO: Verificação mais rigorosa para evitar erro React #310
  const idValido = React.useMemo(() => {
    if (!passageiroId) return false;
    if (typeof passageiroId !== 'string') return false;
    if (passageiroId === 'undefined') return false;
    if (passageiroId === 'null') return false;
    if (passageiroId === 'fallback-id') return false;
    if (passageiroId.length < 10) return false; // IDs muito curtos são suspeitos
    return true;
  }, [passageiroId]);
  
  const {
    breakdown,
    historicoPagamentos,
    loading: loadingPagamentos,
    error: errorPagamentos,
    obterStatusAtual
  } = usePagamentosSeparados(idValido ? passageiroId : undefined);

  // ✅ NOVO: Determinar tipo de badge de crédito ANTES do if
  const creditoBadgeData = useCreditoBadgeType(passageiro);

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
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {onViewDetails ? (
                  <button
                    onClick={() => onViewDetails(passageiro)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}
                  </button>
                ) : (
                  <span>{formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}</span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyNome(passageiro.clientes?.nome || passageiro.nome)}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  title="Copiar nome"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {/* Badge do Grupo */}
              {passageiro.grupo_nome && passageiro.grupo_cor && (
                <Badge 
                  variant="secondary" 
                  className="text-xs w-fit"
                  style={{ 
                    backgroundColor: `${passageiro.grupo_cor}20`,
                    color: passageiro.grupo_cor,
                    borderColor: passageiro.grupo_cor
                  }}
                >
                  {passageiro.grupo_nome}
                </Badge>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap px-2">
          <div className="flex items-center justify-center gap-1">
            <span>{formatCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              title="Copiar CPF"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap px-2">
          {formatPhone(passageiro.clientes?.telefone || passageiro.telefone)}
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black px-2">
          <div className="flex items-center justify-center gap-1">
            <span>{formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyDataNascimento(formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento))}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
              title="Copiar data de nascimento"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </TableCell>
        <TableCell className="font-cinzel font-semibold text-center text-black px-2">
          {passageiro.cidade_embarque || 'Blumenau'}
        </TableCell>
        <TableCell className="text-center px-2">
          <SetorBadge setor={passageiro.setor_maracana || "Não informado"} />
        </TableCell>
        <TableCell className="text-center px-2">
          <div className="flex flex-col items-center gap-1">
            <StatusBadgeAvancado status={statusAvancado} size="sm" />
            {/* ✅ NOVO: Badge de crédito se aplicável */}
            {creditoBadgeData && (
              <CreditoBadge 
                tipo={creditoBadgeData.tipo}
                valorCredito={creditoBadgeData.valorCredito}
                valorTotal={creditoBadgeData.valorTotal}
                size="sm"
              />
            )}
          </div>
        </TableCell>
        <TableCell className="text-center px-2">
          <div className="text-xs text-gray-500">Carregando...</div>
        </TableCell>
        <TableCell className="text-center px-2">
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEditPassageiro(passageiro)} className="h-8 w-8 p-0">
              <Pencil className="h-4 w-4" />
            </Button>
            {/* Botão de trocar ônibus */}
            {onTrocarOnibus && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onTrocarOnibus(passageiro)} 
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Trocar de ônibus"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
            {/* Botão de desvincular crédito - só aparece para passageiros pagos por crédito */}
            {passageiro.pago_por_credito && passageiro.credito_origem_id && onDesvincularCredito && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDesvincularCredito(passageiro)} 
                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                title="Desvincular da viagem (manter crédito)"
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              {onViewDetails ? (
                <button
                  onClick={() => onViewDetails(passageiro)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  {formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}
                </button>
              ) : (
                <span>{formatarNomeComPreposicoes(passageiro.clientes?.nome || passageiro.nome)}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyNome(passageiro.clientes?.nome || passageiro.nome)}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                title="Copiar nome"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {/* Badge do Grupo */}
            {passageiro.grupo_nome && passageiro.grupo_cor && (
              <Badge 
                variant="secondary" 
                className="text-xs w-fit"
                style={{ 
                  backgroundColor: `${passageiro.grupo_cor}20`,
                  color: passageiro.grupo_cor,
                  borderColor: passageiro.grupo_cor
                }}
              >
                {passageiro.grupo_nome}
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">
        <div className="flex items-center justify-center gap-1">
          <span>{formatCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCPF(passageiro.clientes?.cpf || passageiro.cpf || '')}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            title="Copiar CPF"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black whitespace-nowrap">
        {formatPhone(passageiro.clientes?.telefone || passageiro.telefone)}
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black">
        <div className="flex items-center justify-center gap-1">
          <span>{formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyDataNascimento(formatBirthDate(passageiro.clientes?.data_nascimento || passageiro.data_nascimento))}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            title="Copiar data de nascimento"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="font-cinzel font-semibold text-center text-black">
        {passageiro.cidade_embarque || 'Blumenau'}
      </TableCell>
      <TableCell className="text-center">
        <SetorBadge setor={passageiro.setor_maracana || "Não informado"} />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col items-center gap-1">
          <StatusBadgeAvancado 
            status={statusAvancado}
            size="sm"
          />
          {/* ✅ NOVO: Badge de crédito se aplicável */}
          {creditoBadgeData && (
            <CreditoBadge 
              tipo={creditoBadgeData.tipo}
              valorCredito={creditoBadgeData.valorCredito}
              valorTotal={creditoBadgeData.valorTotal}
              size="sm"
            />
          )}
        </div>
      </TableCell>
      <TableCell className="text-center px-2">
        <PasseiosSimples passeios={(() => {
          // Verificar se os dados dos passeios são válidos
          if (!passageiro.passeios || !Array.isArray(passageiro.passeios)) {
            return [];
          }
          
          const passeiosData = passageiro.passeios.map(pp => ({
            nome: pp.passeio_nome,
            valor: passageiro.gratuito === true ? 0 : (pp.valor_cobrado || 0),
            gratuito: passageiro.gratuito === true
          }));
          
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
          {/* Botão de trocar ônibus */}
          {onTrocarOnibus && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onTrocarOnibus(passageiro)} 
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Trocar de ônibus"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}
          {/* Botão de desvincular crédito - só aparece para passageiros pagos por crédito */}
          {passageiro.pago_por_credito && passageiro.credito_origem_id && onDesvincularCredito && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onDesvincularCredito(passageiro)} 
              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              title="Desvincular da viagem (manter crédito)"
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          )}
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