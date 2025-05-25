
export interface PassageiroEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: any;
  onSuccess: () => void;
}

export interface OnibusOption {
  id: string;
  numero_identificacao: string | null;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  passageiros_count?: number;
  disponivel?: boolean;
}

export interface Parcela {
  id: string;
  valor_parcela: number;
  forma_pagamento: string;
  observacoes?: string;
  data_pagamento?: string;
}
