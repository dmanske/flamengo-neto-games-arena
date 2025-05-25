
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

export interface Parcela {
  id?: string;
  valor_parcela: number;
  forma_pagamento: string;
  observacoes?: string;
  data_pagamento?: string;
}

export interface PassageiroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: any;
  onSuccess: () => void;
}
