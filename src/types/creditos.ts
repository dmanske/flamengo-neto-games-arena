export type StatusCredito = 'disponivel' | 'utilizado' | 'parcial' | 'reembolsado';
export type TipoMovimentacaoCredito = 'criacao' | 'utilizacao' | 'reembolso' | 'ajuste';
export type StatusCalculoCredito = 'completo' | 'sobra' | 'falta';

// ✅ NOVO: Interface para ônibus com informações de vagas
export interface OnibusComVagas {
  id: string;
  nome: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_total: number;
  passageiros_alocados: number;
  vagas_disponiveis: number;
  tem_vagas: boolean;
}

export interface Credito {
  id: string;
  cliente_id: string;
  valor_credito: number;
  data_pagamento: string;
  forma_pagamento?: string;
  observacoes?: string;
  status: StatusCredito;
  saldo_disponivel: number;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
  vinculacoes?: CreditoVinculacao[];
  historico?: CreditoHistorico[];
}

export interface CreditoVinculacao {
  id: string;
  credito_id: string;
  viagem_id: string;
  valor_utilizado: number;
  data_vinculacao: string;
  observacoes?: string;
  created_at: string;
  
  // Relacionamentos
  credito?: Credito;
  viagem?: {
    id: string;
    adversario: string;
    data_jogo: string;
    valor_padrao: number;
    local_jogo: string;
  };
}

export interface CreditoHistorico {
  id: string;
  credito_id: string;
  tipo_movimentacao: TipoMovimentacaoCredito;
  valor_anterior?: number;
  valor_movimentado: number;
  valor_posterior?: number;
  descricao?: string;
  viagem_id?: string;
  created_at: string;
  
  // Relacionamentos
  credito?: Credito;
  viagem?: {
    id: string;
    adversario: string;
    data_jogo: string;
  };
}

export interface CalculoCredito {
  valorViagem: number;
  creditoDisponivel: number;
  valorUtilizado: number;
  sobra: number;
  falta: number;
  statusResultado: StatusCalculoCredito;
  podeVincular: boolean;
  mensagem: string;
}

export interface ResumoCreditos {
  total_creditos: number;
  valor_total: number;
  valor_disponivel: number;
  valor_utilizado: number;
  valor_reembolsado: number;
  creditos_por_status: {
    disponivel: number;
    utilizado: number;
    parcial: number;
    reembolsado: number;
  };
}

export interface FiltrosCreditos {
  cliente_id?: string;
  status?: StatusCredito;
  data_inicio?: string;
  data_fim?: string;
  valor_minimo?: number;
  valor_maximo?: number;
}

// Tipos para formulários
export interface CreditoFormData {
  cliente_id: string;
  valor_credito: number;
  data_pagamento: string;
  forma_pagamento?: string;
  observacoes?: string;
}

export interface VincularCreditoFormData {
  credito_id: string;
  viagem_id: string;
  valor_utilizado: number;
  observacoes?: string;
}

export interface ReembolsoCreditoFormData {
  credito_id: string;
  valor_reembolso: number;
  motivo: string;
  observacoes?: string;
}

// Tipos para agrupamento por mês (similar ao sistema de ingressos)
export interface CreditosPorMes {
  chave: string; // YYYY-MM
  nome: string; // "Janeiro 2024"
  creditos: Credito[];
  resumo: {
    total: number;
    valorTotal: number;
    valorDisponivel: number;
    valorUtilizado: number;
    disponivel: number;
    utilizado: number;
    parcial: number;
    reembolsado: number;
  };
}

// Estados para hooks
export interface EstadosCreditos {
  carregando: boolean;
  erro: string | null;
  salvando: boolean;
  deletando: boolean;
}

// Opções para seleção
export const STATUS_CREDITO_OPTIONS = [
  { value: 'disponivel', label: '✅ Disponível' },
  { value: 'parcial', label: '🟡 Parcialmente Usado' },
  { value: 'utilizado', label: '🔴 Totalmente Usado' },
  { value: 'reembolsado', label: '💸 Reembolsado' },
] as const;

export const FORMAS_PAGAMENTO_CREDITO = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
  'Outros',
] as const;