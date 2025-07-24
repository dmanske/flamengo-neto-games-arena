
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
  passageiro: {
    viagem_passageiro_id: number;
    nome?: string;
    viagem_id?: string;
    setor_maracana?: string;
    status_pagamento?: string;
    forma_pagamento?: string;
    valor?: number;
    desconto?: number;
    onibus_id?: string;
    cidade_embarque?: string;
    observacoes?: string;
    passeios?: { passeio_nome: string; status: string }[];
  } | null;
  onSuccess: () => void;
  passeiosPagos?: string[];
  outroPasseio?: string | null;
}
