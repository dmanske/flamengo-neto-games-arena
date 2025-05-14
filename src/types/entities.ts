export type TipoOnibus =
  | "46 Semi-Leito"
  | "50 Convencional"
  | "54 Convencional"
  | "42 Leito";

export type EmpresaOnibus =
  | "Viação 1001"
  | "Kaissara"
  | "Cometa"
  | "Itapemirim";

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
