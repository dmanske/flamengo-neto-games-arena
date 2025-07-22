export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data_recebimento: string;
  viagem_id?: string;
  cliente_id?: string;
  metodo_pagamento?: string;
  status: 'recebido' | 'pendente' | 'cancelado';
  observacoes?: string;
  comprovante_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria: string;
  data_vencimento: string;
  data_pagamento?: string;
  viagem_id?: string;
  fornecedor?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  metodo_pagamento?: string;
  observacoes?: string;
  comprovante_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  fornecedor: string;
  categoria: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  recorrente: boolean;
  frequencia_recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor?: string;
  icone?: string;
  ativa: boolean;
  created_at: string;
}

export interface ProjecaoFluxoCaixa {
  id: string;
  mes_ano: string;
  receitas_projetadas: number;
  despesas_projetadas: number;
  saldo_projetado: number;
  receitas_realizadas: number;
  despesas_realizadas: number;
  saldo_realizado: number;
  created_at: string;
  updated_at: string;
}

export interface IndicadorFinanceiro {
  receita_total: number;
  despesa_total: number;
  lucro_liquido: number;
  margem_lucro: number;
  contas_vencidas: number;
  contas_a_vencer_30_dias: number;
}

export interface FiltroFinanceiro {
  data_inicio?: string;
  data_fim?: string;
  categoria?: string;
  status?: string;
  viagem_id?: string;
  cliente_id?: string;
}

export interface RelatorioFinanceiro {
  tipo: 'receitas' | 'despesas' | 'lucratividade' | 'fluxo_caixa';
  periodo_inicio: string;
  periodo_fim: string;
  filtros?: FiltroFinanceiro;
  dados: any[];
  totais: {
    receitas: number;
    despesas: number;
    lucro: number;
  };
}

export type MetodoPagamento = 
  | 'dinheiro'
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'transferencia'
  | 'boleto'
  | 'outros';

export type StatusPagamento = 
  | 'pendente'
  | 'pago'
  | 'recebido'
  | 'vencido'
  | 'cancelado';

export type TipoTransacao = 'receita' | 'despesa';

export type FrequenciaRecorrencia = 
  | 'mensal'
  | 'trimestral'
  | 'semestral'
  | 'anual';