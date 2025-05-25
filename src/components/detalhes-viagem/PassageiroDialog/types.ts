
export interface ClienteOption {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
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
  id?: string;
  valor_parcela: number;
  forma_pagamento: string;
  observacoes?: string;
}

export interface PassageiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSuccess: () => void;
  valorPadrao?: number | null;
  setorPadrao?: string | null;
  defaultOnibusId?: string | null;
}
