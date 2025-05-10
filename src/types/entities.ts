export type StatusPagamento = 'Pendente' | 'Pago' | 'Cancelado';
export type StatusViagem = 'Aberta' | 'Em Andamento' | 'Finalizada';
export type FormaPagamento = 'Pix' | 'Cartão' | 'Boleto' | 'Paypal' | 'Outro';
export type FonteConhecimento = 'Instagram' | 'Indicação' | 'Facebook' | 'Google' | 'Outro';
export type TipoOnibus = '43 Leitos Totais' | '52 Leitos Master' | '56 Leitos Master';
export type EmpresaOnibus = 'Bertoldo' | 'Majetur' | 'Sarcella' | 'HG TUR';
export type SetorMaracana = 'Norte' | 'Sul' | 'Leste' | 'Oeste' | 'Maracanã Mais' | 'Sem ingresso';

export interface Passageiro {
  id?: string;
  nome: string;
  telefone: string;
  email: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_pagamento: StatusPagamento;
  numero_onibus: string;
  valor?: number;
  forma_pagamento?: FormaPagamento;
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
  adversario: string;
  data_jogo: Date;
  tipo_onibus: TipoOnibus;
  empresa: EmpresaOnibus;
  rota: string;
  capacidade_onibus: number;
  status_viagem: StatusViagem;
  created_at?: Date;
  valor_padrao?: number;
  setor_padrao?: SetorMaracana;
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
