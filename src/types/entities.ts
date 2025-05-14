
export type TipoOnibus =
  | "46 Semi-Leito"
  | "50 Convencional"
  | "54 Convencional"
  | "42 Leito"
  | string; // Added string to make it more flexible

export type EmpresaOnibus =
  | "Viação 1001"
  | "Kaissara"
  | "Cometa"
  | "Itapemirim"
  | string; // Added string to make it more flexible

export interface ViagemOnibus {
  id?: string;
  viagem_id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  lugares_extras?: number | null;
}

export type FormaPagamento =
  | "Dinheiro"
  | "Cartão de Crédito"
  | "Cartão de Débito"
  | "Pix"
  | "Transferência Bancária";

// Adding missing types
export type StatusPagamento = "Pendente" | "Pago" | "Cancelado";

export type SetorMaracana = 
  | "Norte" 
  | "Sul" 
  | "Leste" 
  | "Oeste" 
  | "Maracanã Mais" 
  | "Sem ingresso";

export type FonteConhecimento = 
  | "Instagram" 
  | "Indicação" 
  | "Facebook" 
  | "Google" 
  | "Outro";
