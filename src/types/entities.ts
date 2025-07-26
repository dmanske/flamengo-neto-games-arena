
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

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  como_conheceu: string;
  indicacao_nome?: string | null;
  observacoes?: string | null;
  foto?: string | null;
  passeio_cristo: string;
  fonte_cadastro: string;
  created_at?: string;
  updated_at?: string;
}

export interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  cidade_embarque: string;
  status_viagem: string;
  valor_padrao: number | null;
  setor_padrao: string | null;
  logo_adversario: string | null;
  logo_flamengo: string;
  capacidade_onibus: number;
  passeios_pagos: string[];
  outro_passeio: string | null;
  
  // Novos campos para sistema avançado de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
}

// Interface para formulários de viagem com nova estrutura de passeios
export interface ViagemFormData {
  adversario: string;
  data_jogo: string;
  data_saida: string;
  local_jogo: string;
  valor_padrao?: string;
  capacidade_onibus: string;
  status_viagem: string;
  setor_padrao?: string;
  cidade_embarque: string;
  logo_adversario?: string;
  logo_flamengo: string;
  passeios_pagos: string[]; // Manter compatibilidade
  passeios_selecionados: string[]; // Nova estrutura
  outro_passeio?: string;
  
  // Novos campos para sistema avançado de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
  
  // Campos auxiliares para controle de estado
  _isCustomAdversario?: boolean;
  _isCustomLocal?: boolean;
}
