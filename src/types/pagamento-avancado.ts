// Tipos para o sistema avançado de pagamento com passeios

export type TipoPagamento = 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';

export interface ConfiguracaoViagem {
  tipo_pagamento: TipoPagamento;
  exige_pagamento_completo: boolean;
  dias_antecedencia: number;
  permite_viagem_com_pendencia: boolean;
}

// ===== CENÁRIO 1: PAGAMENTO LIVRE =====
export interface PagamentoLivre {
  id: string;
  viagem_passageiro_id: string;
  valor: number;
  data_pagamento: string;
  forma_pagamento: string;
  observacoes?: string;
  created_at: string;
}

export interface SaldoDevedor {
  viagem_passageiro_id: string;
  valor_total: number;           // Base + Passeios
  valor_viagem: number;          // Transporte + Ingresso
  valor_passeios: number;        // Passeios selecionados
  valor_pago: number;            // Total já pago
  saldo_devedor: number;         // Total - Pago
  dias_em_aberto: number;        // Dias desde a criação
  categoria_inadimplencia: 'ok' | 'atencao' | 'critico'; // 0-30, 30-60, 60+
  historico_pagamentos: PagamentoLivre[];
}

// ===== CENÁRIO 2: PARCELAMENTO FLEXÍVEL =====
export interface ParcelamentoFlexivel {
  viagem_passageiro_id: string;
  parcelas_sugeridas: ParcelaSugerida[];
  pagamentos_extras: PagamentoLivre[];
  valor_parcelas_pagas: number;
  valor_pagamentos_extras: number;
  saldo_restante: number;
  permite_alteracao: boolean;
}

export interface ParcelaSugerida {
  id: string;
  numero_parcela: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'vencido';
  data_pagamento?: string;
  forma_pagamento?: string;
  tipo: 'sugerida' | 'fixa';
}

// ===== CENÁRIO 3: PARCELAMENTO OBRIGATÓRIO =====
export interface ParcelamentoObrigatorio {
  viagem_passageiro_id: string;
  parcelas_fixas: ParcelaFixa[];
  parcelas_pagas: number;
  parcelas_vencidas: number;
  parcelas_futuras: number;
  valor_total_parcelas: number;
  permite_alteracao: false; // Sempre false
}

export interface ParcelaFixa {
  id: string;
  numero_parcela: number;
  total_parcelas: number;
  valor_parcela: number;
  data_vencimento: string;
  status: 'pendente' | 'pago' | 'vencido';
  data_pagamento?: string;
  forma_pagamento?: string;
  dias_atraso?: number;
  tipo: 'fixa';
}

// ===== SISTEMA UNIFICADO =====
export interface ControleFinanceiroUnificado {
  viagem_passageiro_id: string;
  tipo_pagamento: TipoPagamento;
  
  // Valores base
  valor_viagem: number;          // Transporte + Ingresso
  valor_passeios: number;        // Passeios selecionados
  valor_total: number;           // Soma dos dois
  
  // Status geral
  valor_pago: number;
  saldo_devedor: number;
  status_pagamento: 'pago' | 'pendente' | 'vencido' | 'bloqueado';
  pode_viajar: boolean;
  
  // Dados específicos por cenário
  pagamento_livre?: SaldoDevedor;
  parcelamento_flexivel?: ParcelamentoFlexivel;
  parcelamento_obrigatorio?: ParcelamentoObrigatorio;
}

// ===== RELATÓRIOS FINANCEIROS =====
export interface ReceitasPorCenario {
  // Cenário 1: Livre
  receitas_confirmadas_livre: number;
  saldos_sem_prazo: number;
  
  // Cenário 2: Flexível
  receitas_parcelas_pagas: number;
  receitas_pagamentos_extras: number;
  parcelas_futuras_projetadas: number;
  saldos_flexiveis: number;
  
  // Cenário 3: Obrigatório
  parcelas_pagas_obrigatorio: number;
  parcelas_vencidas: number;
  parcelas_futuras: number;
}

export interface ResumoFinanceiroPorTipo {
  tipo_pagamento: TipoPagamento;
  total_passageiros: number;
  receita_confirmada: number;
  receita_projetada: number;
  saldos_devedores: number;
  inadimplencia_count: number;
  inadimplencia_valor: number;
}

export interface FluxoCaixaInteligente {
  data: string;
  receitas_confirmadas: number;    // Já pagas
  receitas_projetadas: number;     // Parcelas futuras (cenários 2 e 3)
  saldos_sem_prazo: number;        // Não entra no fluxo (cenário 1)
  tipo_entrada: 'confirmada' | 'projetada' | 'sem_prazo';
}

// ===== CONTROLE DE INADIMPLÊNCIA =====
export interface ControleInadimplencia {
  viagem_passageiro_id: string;
  cliente_nome: string;
  tipo_pagamento: TipoPagamento;
  valor_devido: number;
  dias_atraso: number;
  categoria: 'recente' | 'medio' | 'critico'; // 0-30, 30-60, 60+
  ultimo_contato?: string;
  proxima_acao: string;
}

// ===== INTERFACES PARA HOOKS =====
export interface UsePagamentoAvancadoReturn {
  // Dados
  controleFinanceiro: ControleFinanceiroUnificado | null;
  loading: boolean;
  error: string | null;
  
  // Ações por cenário
  registrarPagamentoLivre: (valor: number, formaPagamento: string, observacoes?: string) => Promise<boolean>;
  pagarParcela: (parcelaId: string, valor: number, formaPagamento: string) => Promise<boolean>;
  criarParcelamento: (parcelas: ParcelaSugerida[]) => Promise<boolean>;
  
  // Utilitários
  calcularSaldoDevedor: () => number;
  verificarPodeViajar: () => boolean;
  obterProximoVencimento: () => Date | null;
  
  // Refresh
  refetch: () => Promise<void>;
}

export interface UseRelatorioFinanceiroAvancadoReturn {
  // Dados
  resumoPorTipo: ResumoFinanceiroPorTipo[];
  fluxoCaixa: FluxoCaixaInteligente[];
  inadimplencia: ControleInadimplencia[];
  loading: boolean;
  error: string | null;
  
  // Filtros
  filtrarPorTipo: (tipo: TipoPagamento) => void;
  filtrarPorPeriodo: (inicio: string, fim: string) => void;
  
  // Refresh
  refetch: () => Promise<void>;
}