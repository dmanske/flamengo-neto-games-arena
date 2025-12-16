// Tipos para gerenciamento de grupos de ingressos
import type { Ingresso } from './ingressos';

// Cores padrão para grupos - Paleta expandida
export const CORES_GRUPOS_INGRESSOS = [
  // Cores originais
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
  
  // Cores adicionais
  '#FF8A80', // Vermelho coral
  '#80CBC4', // Verde azulado
  '#81C784', // Verde claro
  '#FFD54F', // Amarelo dourado
  '#BA68C8', // Roxo médio
  '#FF8A65', // Laranja coral
  '#64B5F6', // Azul médio
  '#F48FB1', // Rosa médio
  '#A1C181', // Verde oliva
  '#FFB74D', // Laranja claro
  
  // Cores mais vibrantes
  '#E91E63', // Rosa vibrante
  '#9C27B0', // Roxo vibrante
  '#673AB7', // Roxo escuro
  '#3F51B5', // Azul índigo
  '#2196F3', // Azul
  '#00BCD4', // Ciano
  '#009688', // Verde azulado
  '#4CAF50', // Verde
  '#8BC34A', // Verde lima
  '#CDDC39', // Lima
  '#FFEB3B', // Amarelo
  '#FFC107', // Âmbar
  '#FF9800', // Laranja
  '#FF5722', // Laranja avermelhado
  '#795548', // Marrom
  '#607D8B', // Azul acinzentado
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
