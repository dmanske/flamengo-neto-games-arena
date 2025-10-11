// Tipos para o Sistema de Preços de Setores por Viagem

export interface ViagemSetorPreco {
  id: string;
  viagem_id: string;
  setor_nome: string;
  preco_custo: number;
  preco_venda: number;
  created_at: string;
  updated_at: string;
}

export interface ViagemSetorPrecoFormData {
  setor_nome: string;
  preco_custo: number;
  preco_venda: number;
}

export interface ViagemSetorPrecoInput {
  viagem_id: string;
  setores: ViagemSetorPrecoFormData[];
}

// Tipos para cálculos financeiros
export interface ResumoIngressosViagem {
  total_ingressos: number;
  total_custo: number;
  total_venda: number;
  total_lucro: number;
  margem_percentual: number;
  custos_por_setor: Record<string, {
    quantidade: number;
    custo_unitario: number;
    custo_total: number;
    venda_unitaria: number;
    venda_total: number;
    lucro_total: number;
  }>;
}

// Tipos para validação
export interface ValidacaoSetorPreco {
  setor_nome: boolean;
  preco_custo: boolean;
  preco_venda: boolean;
}

// Tipos para estados de loading
export interface EstadosSetoresPrecos {
  carregando: boolean;
  salvando: boolean;
  deletando: boolean;
}

// Tipos para erros
export interface ErrosSetoresPrecos {
  geral?: string;
  setor_nome?: string;
  preco_custo?: string;
  preco_venda?: string;
}

// Lista de setores do Maracanã (importada de estadios.ts)
export const SETORES_MARACANA_PADRAO = [
  'Norte',
  'Sul',
  'Leste Inferior',
  'Leste Superior',
  'Oeste',
  'Maracanã Mais'
] as const;

export type SetorMaracana = typeof SETORES_MARACANA_PADRAO[number];