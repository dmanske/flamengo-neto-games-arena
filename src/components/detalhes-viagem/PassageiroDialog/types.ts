
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

export interface ClienteOption {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
}

// Interface Parcela removida - sistema de parcelamento desabilitado

export interface PassageiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  onSuccess: () => void;
  valorPadrao?: number;
  setorPadrao?: string;
  defaultOnibusId?: string | null;
  viagem?: {
    local_jogo?: string;
    nome_estadio?: string;
  };
}
