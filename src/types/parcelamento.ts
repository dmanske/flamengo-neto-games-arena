export interface ParcelaConfig {
  numero: number;
  valor: number;
  dataVencimento: Date;
  formaPagamento: string;
  observacoes?: string;
}

export interface ParcelamentoOption {
  id: string;
  nome: string;
  descricao: string;
  parcelas: number;
  valorMinimo: number;
  permitido: boolean;
  motivo?: string;
}