export type FonteConhecimento = 
  | "Instagram" 
  | "Indicação" 
  | "Facebook" 
  | "Google" 
  | "WhatsApp" 
  | "Outro";

export type StatusPagamento = "Pendente" | "Pago" | "Cancelado";

export type FormaPagamento = "Pix" | "Cartão" | "Boleto" | "Paypal" | "Outro";

export type SetorMaracana = "Norte" | "Sul" | "Leste" | "Oeste" | "Maracanã Mais" | "Sem ingresso";

export type TipoOnibus = "46 Semi-Leito" | "50 Convencional";

export type EmpresaOnibus = "Viação 1001" | "Kaissara";

export interface ViagemOnibus {
  viagem_id: string;
  tipo_onibus: TipoOnibus;
  empresa: EmpresaOnibus;
  capacidade_onibus: number;
  numero_identificacao: string;
  id?: string;
}
