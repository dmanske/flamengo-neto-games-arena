// Tipos para o módulo de fornecedores

export type TipoFornecedor = 'ingressos' | 'transporte' | 'hospedagem' | 'alimentacao' | 'eventos';

export interface Fornecedor {
  id: string;
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  cnpj?: string;
  contato_principal?: string;
  observacoes?: string;
  mensagem_padrao?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  assunto: string;
  corpo_mensagem: string;
  variaveis_disponiveis: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MensagemGerada {
  assunto: string;
  corpo: string;
  fornecedor: Fornecedor;
  viagem: any; // Usar tipo existente da viagem
  template: MessageTemplate;
}

export interface FornecedorFormData {
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  cnpj?: string;
  contato_principal?: string;
  observacoes?: string;
  mensagem_padrao?: string;
}

export interface MessageTemplateFormData {
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  assunto: string;
  corpo_mensagem: string;
}