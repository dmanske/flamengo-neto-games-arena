
export type StatusPagamento = 'Pendente' | 'Pago' | 'Cancelado';
export type StatusViagem = 'Aberta' | 'Em Andamento' | 'Finalizada';
export type FormaPagamento = 'Pix' | 'Cartão' | 'Boleto';
export type FonteConhecimento = 'Instagram' | 'Indicação' | 'Facebook' | 'Google' | 'Outro';

export interface Passageiro {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_pagamento: StatusPagamento;
  numero_onibus: string;
}

export interface Cliente {
  id?: string;
  nome: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  telefone: string;
  cep: string;
  cidade: string;
  estado: string;
  cpf: string;
  data_nascimento: Date;
  email: string;
  como_conheceu: FonteConhecimento;
  indicacao_nome?: string;
  observacoes?: string;
}

export interface Viagem {
  id?: string;
  data_viagem: Date;
  rota: string[];
  capacidade_onibus: number;
  status_viagem: StatusViagem;
}

export interface Embarque {
  id?: string;
  cidade: string;
  horario_embarque: Date;
  ponto_referencia: string;
}

export interface Pagamento {
  id?: string;
  valor: number;
  forma_pagamento: FormaPagamento;
  status: StatusPagamento;
  comprovante?: File;
}

export interface Onibus {
  id?: string;
  identificacao: string;
  capacidade: number;
  motorista: string;
  rota: string;
}
