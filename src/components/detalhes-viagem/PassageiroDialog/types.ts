
export interface OnibusOption {
  id: string;
  numero_identificacao: string | null;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  lugares_extras?: number;
  passageiros_count?: number;
  disponivel?: boolean;
  capacidade_total?: number;
}
