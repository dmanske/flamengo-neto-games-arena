// Tipos para o Sistema de Ingressos

export type LocalJogo = 'casa' | 'fora';

// Interface para cliente (simplificada para uso nos filtros)
export interface Cliente {
  id: string;
  nome: string;
  telefone?: string;
  email?: string;
}

export type SituacaoFinanceiraIngresso = 'pendente' | 'pago' | 'cancelado';

export type FormaPagamentoIngresso = 
  | 'dinheiro' 
  | 'pix' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'transferencia' 
  | 'boleto'
  | 'outros';

// Interface principal do ingresso
export interface Ingresso {
  id: string;
  cliente_id: string;
  viagem_id?: string | null;
  viagem_ingressos_id?: string | null;
  
  // Dados do jogo
  jogo_data: string; // ISO date string
  adversario: string;
  // logo_adversario?: string | null; // TODO: Descomentar após executar migration
  local_jogo: LocalJogo;
  setor_estadio: string;
  
  // Controle financeiro
  preco_custo: number;
  preco_venda: number;
  desconto: number;
  valor_final: number; // Calculado automaticamente
  lucro: number; // Calculado automaticamente
  margem_percentual: number; // Calculado automaticamente
  
  // Status e controle
  situacao_financeira: SituacaoFinanceiraIngresso;
  observacoes?: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Dados relacionados (quando necessário)
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
    cpf?: string;
    data_nascimento?: string;
  };
  viagem?: {
    id: string;
    adversario: string;
    data_jogo: string;
  };
}

// Interface para histórico de pagamentos
export interface HistoricoPagamentoIngresso {
  id: string;
  ingresso_id: string;
  valor_pago: number;
  data_pagamento: string; // ISO date string
  forma_pagamento: FormaPagamentoIngresso;
  observacoes?: string | null;
  created_at: string;
  updated_at: string;
}

// Interface para resumo financeiro de ingressos
export interface ResumoFinanceiroIngressos {
  total_ingressos: number;
  total_receita: number;
  total_custo: number;
  total_lucro: number;
  margem_media: number;
  ingressos_pendentes: number;
  ingressos_pagos: number;
  ingressos_cancelados: number;
  valor_pendente: number;
  valor_recebido: number;
}

// Interface para setores do Maracanã
export interface SetorMaracana {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

// Tipos para formulários
export interface IngressoFormData {
  cliente_id: string;
  viagem_id?: string | null;
  viagem_ingressos_id?: string | null;
  jogo_data: string;
  adversario: string;
  logo_adversario?: string | null;
  local_jogo: LocalJogo;
  setor_estadio: string;
  preco_custo: number;
  preco_venda: number;
  desconto: number;
  situacao_financeira: SituacaoFinanceiraIngresso;
  observacoes?: string;
}

export interface PagamentoIngressoFormData {
  ingresso_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: FormaPagamentoIngresso;
  observacoes?: string;
}

// Tipos para filtros e busca
export interface FiltrosIngressos {
  cliente_id?: string;
  situacao_financeira?: SituacaoFinanceiraIngresso | '';
  local_jogo?: LocalJogo | '';
  data_inicio?: string;
  data_fim?: string;
  adversario?: string;
  setor_estadio?: string;
}

// Tipos para ordenação
export type CampoOrdenacaoIngresso = 
  | 'jogo_data'
  | 'adversario'
  | 'cliente_nome'
  | 'valor_final'
  | 'lucro'
  | 'situacao_financeira'
  | 'created_at';

export type DirecaoOrdenacao = 'asc' | 'desc';

export interface OrdenacaoIngressos {
  campo: CampoOrdenacaoIngresso;
  direcao: DirecaoOrdenacao;
}

// Tipos para estatísticas e relatórios
export interface EstatisticasIngressos {
  por_mes: {
    mes: string;
    total_ingressos: number;
    receita: number;
    lucro: number;
  }[];
  por_adversario: {
    adversario: string;
    total_ingressos: number;
    receita_media: number;
    lucro_medio: number;
  }[];
  por_setor: {
    setor: string;
    total_ingressos: number;
    receita_media: number;
    margem_media: number;
  }[];
}

// Tipos para dashboard
export interface MetricasIngressos {
  hoje: {
    vendas: number;
    receita: number;
  };
  mes_atual: {
    vendas: number;
    receita: number;
    lucro: number;
    margem: number;
  };
  mes_anterior: {
    vendas: number;
    receita: number;
    lucro: number;
    margem: number;
  };
  crescimento: {
    vendas_percentual: number;
    receita_percentual: number;
    lucro_percentual: number;
  };
}

// Tipos para validação
export interface ValidacaoIngresso {
  cliente_id: boolean;
  jogo_data: boolean;
  adversario: boolean;
  setor_estadio: boolean;
  preco_custo: boolean;
  preco_venda: boolean;
  desconto: boolean;
}

// Tipos para estados de loading
export interface EstadosIngressos {
  carregando: boolean;
  salvando: boolean;
  deletando: boolean;
  carregandoPagamentos: boolean;
  salvandoPagamento: boolean;
  deletandoPagamento: boolean;
}

// Tipos para erros
export interface ErrosIngressos {
  geral?: string;
  cliente_id?: string;
  jogo_data?: string;
  adversario?: string;
  setor_estadio?: string;
  preco_custo?: string;
  preco_venda?: string;
  desconto?: string;
  pagamento?: string;
}