// Tipos para gerenciamento de grupos de ingressos
import type { Ingresso } from './ingressos';

// Cores padrão para grupos (mesmas do sistema de passageiros)
export const CORES_GRUPOS_INGRESSOS = [
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

export type CorGrupoIngresso = typeof CORES_GRUPOS_INGRESSOS[number];

export interface GrupoIngressos {
  nome: string;
  cor: string;
  ingressos: Ingresso[];
  total_membros: number;
}

export interface IngressoComGrupo extends Ingresso {
  grupo_nome?: string | null;
  grupo_cor?: string | null;
}
