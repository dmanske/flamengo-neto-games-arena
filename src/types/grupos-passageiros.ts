// Tipos para gerenciamento de grupos de passageiros
import type { PassageiroDisplay } from '@/hooks/useViagemDetails';

// Cores padrão para grupos
export const CORES_GRUPOS = [
  '#FF6B6B', // Vermelho suave
  '#4ECDC4', // Verde água
  '#45B7D1', // Azul claro
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarelo suave
  '#DDA0DD', // Roxo claro
  '#FFB347', // Laranja suave
  '#98D8C8', // Verde claro
  '#F8BBD9', // Rosa claro
  '#A8E6CF', // Verde pastel
] as const;

export type CorGrupo = typeof CORES_GRUPOS[number];

export interface GrupoPassageiros {
  nome: string;
  cor: string;
  passageiros: PassageiroDisplay[];
  total_membros: number;
}

export interface TrocaOnibusData {
  passageiro_id: string;
  onibus_origem_id: string | null;
  onibus_destino_id: string | null;
  capacidade_disponivel: number;
}

export interface OnibusDisponivel {
  id: string;
  nome: string;
  capacidade: number;
  ocupacao: number;
  disponivel: number;
  lotado: boolean;
}

export interface PassageiroComGrupo {
  id: string;
  nome: string;
  grupo_nome?: string | null;
  grupo_cor?: string | null;
  onibus_id?: string | null;
  viagem_passageiro_id: string;
}

// Extensão do tipo PassageiroDisplay existente
declare module '@/hooks/useViagemDetails' {
  interface PassageiroDisplay {
    grupo_nome?: string | null;
    grupo_cor?: string | null;
  }
}