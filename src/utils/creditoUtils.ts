import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Credito, 
  CalculoCredito, 
  StatusCredito, 
  StatusCalculoCredito,
  CreditosPorMes 
} from '@/types/creditos';

/**
 * Calcula a diferença entre crédito disponível e valor da viagem
 */
export const calcularCreditoVsViagem = (
  creditoDisponivel: number,
  valorViagem: number
): CalculoCredito => {
  const valorUtilizado = Math.min(creditoDisponivel, valorViagem);
  const sobra = Math.max(0, creditoDisponivel - valorViagem);
  const falta = Math.max(0, valorViagem - creditoDisponivel);
  
  let statusResultado: StatusCalculoCredito;
  let mensagem: string;
  
  if (falta > 0) {
    statusResultado = 'falta';
    mensagem = `Falta R$ ${falta.toFixed(2)} para completar o pagamento`;
  } else if (sobra > 0) {
    statusResultado = 'sobra';
    mensagem = `Sobrará R$ ${sobra.toFixed(2)} como crédito`;
  } else {
    statusResultado = 'completo';
    mensagem = 'Valor exato - pagamento completo';
  }
  
  return {
    valorViagem,
    creditoDisponivel,
    valorUtilizado,
    sobra,
    falta,
    statusResultado,
    podeVincular: creditoDisponivel > 0,
    mensagem,
  };
};

/**
 * Obtém a cor do badge baseado no status do crédito
 */
export const getStatusCreditoBadgeColor = (status: StatusCredito): string => {
  switch (status) {
    case 'disponivel':
      return 'bg-green-100 text-green-800';
    case 'parcial':
      return 'bg-yellow-100 text-yellow-800';
    case 'utilizado':
      return 'bg-gray-100 text-gray-800';
    case 'reembolsado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Obtém o texto do status do crédito
 */
export const getStatusCreditoText = (status: StatusCredito): string => {
  switch (status) {
    case 'disponivel':
      return '✅ Disponível';
    case 'parcial':
      return '🟡 Parcial';
    case 'utilizado':
      return '🔴 Utilizado';
    case 'reembolsado':
      return '💸 Reembolsado';
    default:
      return status;
  }
};



/**
 * Calcula o novo status do crédito baseado no saldo disponível
 */
export const calcularNovoStatusCredito = (
  valorOriginal: number,
  saldoDisponivel: number
): StatusCredito => {
  if (saldoDisponivel <= 0) {
    return 'utilizado';
  } else if (saldoDisponivel < valorOriginal) {
    return 'parcial';
  } else {
    return 'disponivel';
  }
};

/**
 * Agrupa créditos por mês (similar ao sistema de ingressos)
 */
export const agruparCreditosPorMes = (creditos: Credito[]): CreditosPorMes[] => {
  const grupos = creditos.reduce((acc, credito) => {
    const data = new Date(credito.data_pagamento);
    const chaveAnoMes = format(data, 'yyyy-MM');
    const nomeAnoMes = format(data, 'MMMM yyyy', { locale: ptBR });
    
    if (!acc[chaveAnoMes]) {
      acc[chaveAnoMes] = {
        nome: nomeAnoMes.charAt(0).toUpperCase() + nomeAnoMes.slice(1),
        creditos: [],
        resumo: {
          total: 0,
          valorTotal: 0,
          valorDisponivel: 0,
          valorUtilizado: 0,
          disponivel: 0,
          utilizado: 0,
          parcial: 0,
          reembolsado: 0,
        }
      };
    }
    
    acc[chaveAnoMes].creditos.push(credito);
    acc[chaveAnoMes].resumo.total++;
    acc[chaveAnoMes].resumo.valorTotal += credito.valor_credito;
    acc[chaveAnoMes].resumo.valorDisponivel += credito.saldo_disponivel;
    acc[chaveAnoMes].resumo.valorUtilizado += (credito.valor_credito - credito.saldo_disponivel);
    
    switch (credito.status) {
      case 'disponivel':
        acc[chaveAnoMes].resumo.disponivel++;
        break;
      case 'utilizado':
        acc[chaveAnoMes].resumo.utilizado++;
        break;
      case 'parcial':
        acc[chaveAnoMes].resumo.parcial++;
        break;
      case 'reembolsado':
        acc[chaveAnoMes].resumo.reembolsado++;
        break;
    }
    
    return acc;
  }, {} as Record<string, any>);

  // Ordenar por data (mais recente primeiro)
  return Object.entries(grupos)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([chave, dados]) => ({ chave, ...dados }));
};

/**
 * Formata valor monetário para exibição
 */
export const formatarValorCredito = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

/**
 * Formata data para exibição
 */
export const formatarDataCredito = (data: string): string => {
  return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR });
};

/**
 * Formata data e hora para exibição
 */
export const formatarDataHoraCredito = (data: string): string => {
  return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR });
};

/**
 * Valida se um crédito pode ser vinculado a uma viagem
 */
export const podeVincularCredito = (
  credito: Credito,
  valorViagem: number
): { pode: boolean; motivo?: string } => {
  // Verificar se crédito está disponível
  if (credito.status === 'reembolsado') {
    return { pode: false, motivo: 'Crédito foi reembolsado' };
  }
  
  if (credito.saldo_disponivel <= 0) {
    return { pode: false, motivo: 'Crédito não possui saldo disponível' };
  }
  
  return { pode: true };
};

/**
 * Gera descrição automática para histórico de movimentação
 */
export const gerarDescricaoHistorico = (
  tipo: string,
  valor: number,
  viagem?: { adversario: string; data_jogo: string }
): string => {
  const valorFormatado = formatarValorCredito(valor);
  
  switch (tipo) {
    case 'criacao':
      return `Crédito criado no valor de ${valorFormatado}`;
    case 'utilizacao':
      if (viagem) {
        return `Utilizado ${valorFormatado} na viagem ${viagem.adversario} (${formatarDataCredito(viagem.data_jogo)})`;
      }
      return `Utilizado ${valorFormatado}`;
    case 'reembolso':
      return `Reembolso de ${valorFormatado}`;
    case 'ajuste':
      return `Ajuste de ${valorFormatado}`;
    default:
      return `Movimentação de ${valorFormatado}`;
  }
};