// Types para sistema de pagamentos separados
// Task 19.1: Estrutura de dados para pagamentos categorizados

export type CategoriaPagamento = 'viagem' | 'passeios' | 'ambos';

export type StatusPagamentoAvancado =
  | 'Pago Completo'    // ✅ Viagem + Passeios pagos
  | 'Viagem Paga'      // 🟡 Só viagem paga
  | 'Passeios Pagos'   // 🟡 Só passeios pagos  
  | 'Pendente'         // 🔴 Nada pago
  | 'Brinde'           // 🎁 Cortesia
  | 'Cancelado';       // ❌ Cancelado

export interface HistoricoPagamentoCategorizado {
  id: string;
  viagem_passageiro_id: string;
  categoria: CategoriaPagamento;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreditoVinculado {
  id: string;
  valor_utilizado: number;
  data_vinculacao: string;
  observacoes?: string;
  credito?: {
    id: string;
    cliente_id: string;
    valor_credito: number;
  };
}

export interface ViagemPassageiroComPagamentos {
  id: string;
  cliente_id: string;
  viagem_id: string;
  valor: number;
  desconto: number;
  status_pagamento: StatusPagamentoAvancado;
  viagem_paga: boolean;
  passeios_pagos: boolean;
  gratuito?: boolean;
  // ... outros campos existentes
  historico_pagamentos?: HistoricoPagamentoCategorizado[];
  valor_total_passeios?: number;
  valor_liquido_viagem?: number;
  // ✅ NOVO: Créditos vinculados
  creditos_vinculados?: CreditoVinculado[];
}

export interface BreakdownPagamento {
  valor_viagem: number;
  valor_passeios: number;
  valor_total: number;
  pago_viagem: number;
  pago_passeios: number;
  pago_total: number;
  pendente_viagem: number;
  pendente_passeios: number;
  pendente_total: number;
  percentual_pago: number;
}

export interface RegistroPagamentoRequest {
  viagem_passageiro_id: string;
  categoria: CategoriaPagamento;
  valor_pago: number;
  forma_pagamento?: string;
  observacoes?: string;
  data_pagamento?: string;
}

export interface StatusBadgeConfig {
  status: StatusPagamentoAvancado;
  label: string;
  color: string;
  icon: string;
  description: string;
}

// Configuração dos badges de status
export const STATUS_BADGES: Record<StatusPagamentoAvancado, StatusBadgeConfig> = {
  'Pago Completo': {
    status: 'Pago Completo',
    label: 'Pago Completo',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '✅',
    description: 'Viagem e passeios pagos'
  },
  'Viagem Paga': {
    status: 'Viagem Paga',
    label: 'Viagem Paga',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '🟡',
    description: 'Apenas viagem paga'
  },
  'Passeios Pagos': {
    status: 'Passeios Pagos',
    label: 'Passeios Pagos',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '🟡',
    description: 'Apenas passeios pagos'
  },
  'Pendente': {
    status: 'Pendente',
    label: 'Pendente',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '🔴',
    description: 'Pagamento pendente'
  },
  'Brinde': {
    status: 'Brinde',
    label: 'Brinde',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: '🎁',
    description: 'Cortesia'
  },
  'Cancelado': {
    status: 'Cancelado',
    label: 'Cancelado',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '❌',
    description: 'Cancelado'
  }
};

// Utilitários para cálculos
export const calcularBreakdownPagamento = (
  passageiro: ViagemPassageiroComPagamentos
): BreakdownPagamento => {
  const valor_viagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
  // Se passageiro é gratuito, passeios têm valor 0
  const valor_passeios = passageiro.gratuito === true ? 0 : (passageiro.valor_total_passeios || 0);
  const valor_total = valor_viagem + valor_passeios;

  // Calcular valores pagos por categoria
  const pagamentos = passageiro.historico_pagamentos || [];
  const pago_viagem_parcelas = pagamentos
    .filter(p => p.categoria === 'viagem' || p.categoria === 'ambos')
    .reduce((sum, p) => sum + p.valor_pago, 0);

  const pago_passeios_parcelas = pagamentos
    .filter(p => p.categoria === 'passeios' || p.categoria === 'ambos')
    .reduce((sum, p) => sum + p.valor_pago, 0);

  // ✅ NOVO: Incluir créditos no cálculo
  const creditos = passageiro.creditos_vinculados || [];
  const pago_creditos = creditos.reduce((sum, c) => sum + c.valor_utilizado, 0);

  // Total pago = parcelas + créditos
  const pago_viagem = pago_viagem_parcelas + pago_creditos; // Crédito paga a viagem primeiro
  const pago_passeios = pago_passeios_parcelas; // Passeios só com parcelas por enquanto

  // Calcular total sem duplicar pagamentos "ambos"
  const pago_total = pagamentos.reduce((sum, p) => sum + p.valor_pago, 0) + pago_creditos;
  const pendente_viagem = Math.max(0, valor_viagem - pago_viagem);
  const pendente_passeios = Math.max(0, valor_passeios - pago_passeios);
  const pendente_total = pendente_viagem + pendente_passeios;
  const percentual_pago = valor_total > 0 ? (pago_total / valor_total) * 100 : 0;

  return {
    valor_viagem,
    valor_passeios,
    valor_total,
    pago_viagem,
    pago_passeios,
    pago_total,
    pendente_viagem,
    pendente_passeios,
    pendente_total,
    percentual_pago
  };
};

export const determinarStatusPagamento = (
  breakdown: BreakdownPagamento,
  passageiro?: ViagemPassageiroComPagamentos
): StatusPagamentoAvancado => {
  // PRIORIDADE 1: Verificar se é passageiro gratuito
  if (passageiro?.gratuito === true) {
    return 'Brinde';
  }

  const { valor_viagem, valor_passeios, pago_viagem, pago_passeios } = breakdown;

  const viagem_paga = pago_viagem >= valor_viagem;
  const passeios_pagos = pago_passeios >= valor_passeios || valor_passeios === 0;

  if (viagem_paga && passeios_pagos) {
    return 'Pago Completo';
  } else if (viagem_paga && valor_passeios === 0) {
    return 'Pago Completo';
  } else if (viagem_paga) {
    return 'Viagem Paga';
  } else if (passeios_pagos && valor_passeios > 0) {
    return 'Passeios Pagos';
  } else {
    return 'Pendente';
  }
};