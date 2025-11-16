import { z } from 'zod';

// =====================================================
// TIPOS PRINCIPAIS DO SISTEMA DE CARTEIRA
// =====================================================

export interface ClienteWallet {
  id: string;
  cliente_id: string;
  saldo_atual: number;
  total_depositado: number;
  total_usado: number;
  created_at: string;
  updated_at: string;
  
  // Relacionamento
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
}

export interface WalletTransacao {
  id: string;
  cliente_id: string;
  tipo: 'deposito' | 'uso' | 'ajuste';
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao?: string;
  forma_pagamento?: string; // apenas para depósitos
  referencia_externa?: string; // ID da compra quando aplicável
  usuario_admin?: string;
  created_at: string;
  
  // Novos campos para gestão administrativa
  editado_em?: string;
  editado_por?: string;
  cancelada: boolean;
  motivo_cancelamento?: string;
  valor_original?: number;
  
  // Relacionamento
  cliente?: {
    nome: string;
    telefone?: string;
  };
}

export interface WalletAuditLog {
  id: string;
  operacao: 'deposito' | 'uso' | 'consulta' | 'relatorio';
  usuario: string;
  cliente_afetado?: string;
  valor?: number;
  ip_address?: string;
  user_agent?: string;
  detalhes?: Record<string, any>;
  created_at: string;
}

// =====================================================
// TIPOS PARA AGRUPAMENTO E RESUMOS
// =====================================================

export interface WalletTransacoesPorMes {
  chave: string; // 'YYYY-MM'
  nome: string; // 'Janeiro 2024'
  resumo: {
    total_depositos: number;
    total_usos: number;
    saldo_liquido: number; // depositos - usos
    quantidade_transacoes: number;
  };
  transacoes: WalletTransacao[];
}

export interface WalletResumo {
  total_clientes_com_saldo: number;
  valor_total_carteiras: number;
  depositos_mes_atual: number;
  usos_mes_atual: number;
  saldo_medio_por_cliente: number;
  clientes_saldo_baixo: number; // menos de R$ 100
}

export interface WalletResumoMensal {
  mes: string;
  total_transacoes: number;
  clientes_unicos: number;
  total_depositos: number;
  total_usos: number;
  saldo_liquido: number;
}

// =====================================================
// TIPOS PARA ALERTAS E NOTIFICAÇÕES
// =====================================================

export interface WalletAlerta {
  tipo: 'saldo_baixo' | 'sem_movimentacao' | 'alto_uso';
  mensagem: string;
  cor: 'yellow' | 'red' | 'blue';
  icone: string;
  cliente_id?: string;
}

export type WalletTendencia = 'crescendo' | 'diminuindo' | 'estavel';

export interface WalletStatus {
  saldo: number;
  cor: 'green' | 'yellow' | 'red';
  alerta?: WalletAlerta;
  tendencia: WalletTendencia;
}

// =====================================================
// TIPOS PARA FILTROS E FORMULÁRIOS
// =====================================================

export interface FiltrosWallet {
  cliente_id?: string;
  tipo?: 'deposito' | 'uso' | 'ajuste';
  data_inicio?: string;
  data_fim?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  filtro_rapido?: 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo';
  busca_descricao?: string;
}

export interface DepositoFormData {
  cliente_id: string;
  valor: number;
  data_deposito: string;
  forma_pagamento: string;
  descricao?: string;
}

export interface UsoFormData {
  cliente_id: string;
  valor: number;
  descricao: string;
  referencia_externa?: string;
}

// =====================================================
// SCHEMAS DE VALIDAÇÃO ZOD
// =====================================================

export const depositoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(50000, 'Valor máximo de R$ 50.000 por depósito'),
  data_deposito: z.string().min(1, 'Data do depósito é obrigatória'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
});

export const usoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(10000, 'Valor máximo de R$ 10.000 por uso'),
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição muito longa'),
  referencia_externa: z.string().max(100, 'Referência muito longa').optional(),
});

export const filtrosWalletSchema = z.object({
  cliente_id: z.string().optional(),
  tipo: z.enum(['deposito', 'uso']).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  valor_minimo: z.number().min(0).optional(),
  valor_maximo: z.number().min(0).optional(),
  filtro_rapido: z.enum(['mes_atual', 'ultimos_3_meses', 'ano_atual', 'tudo']).optional(),
  busca_descricao: z.string().max(100).optional(),
});

// =====================================================
// CONSTANTES E OPÇÕES
// =====================================================

export const FORMAS_PAGAMENTO_WALLET = [
  'Dinheiro',
  'PIX',
  'Cartão de Débito',
  'Cartão de Crédito',
  'Transferência Bancária',
  'Boleto',
  'Outros',
] as const;

export const FILTROS_RAPIDOS_OPTIONS = [
  { value: 'mes_atual', label: 'Este mês' },
  { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
  { value: 'ano_atual', label: 'Este ano' },
  { value: 'tudo', label: 'Tudo' },
] as const;

export const TIPOS_TRANSACAO_OPTIONS = [
  { value: 'deposito', label: '💰 Depósito', color: 'green' },
  { value: 'uso', label: '🛒 Uso', color: 'red' },
  { value: 'ajuste', label: '🔧 Ajuste', color: 'orange' },
] as const;

// =====================================================
// TIPOS PARA HOOKS E ESTADOS
// =====================================================

export interface EstadosWallet {
  carregando: boolean;
  erro: string | null;
  salvando: boolean;
  deletando: boolean;
}

export interface WalletOperationResult {
  success: boolean;
  message: string;
  transacao_id?: string;
  novo_saldo?: number;
}

// =====================================================
// TIPOS PARA COMPONENTES
// =====================================================

export interface WalletSaldoCardProps {
  saldo: number;
  totalDepositado: number;
  totalUsado: number;
  ultimaMovimentacao?: Date;
  size?: 'small' | 'large';
  showAlerts?: boolean;
}

export interface WalletHistoricoAgrupadoProps {
  clienteId: string;
  filtroRapido?: 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo';
  showFilters?: boolean;
  showExport?: boolean;
}

export interface WalletDepositoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  onSuccess: () => void;
}

export interface WalletUsoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string;
  onSuccess: () => void;
}

export interface WalletDashboardProps {
  periodo?: { inicio: Date; fim: Date };
}

// =====================================================
// TIPOS PARA ERROS CUSTOMIZADOS
// =====================================================

export class WalletError extends Error {
  constructor(
    message: string,
    public code: 
      | 'SALDO_INSUFICIENTE'
      | 'CLIENTE_NAO_ENCONTRADO' 
      | 'VALOR_INVALIDO'
      | 'TRANSACAO_DUPLICADA'
      | 'PERMISSAO_NEGADA'
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

// =====================================================
// MENSAGENS DE ERRO AMIGÁVEIS
// =====================================================

export const WALLET_ERROR_MESSAGES = {
  SALDO_INSUFICIENTE: 'Saldo insuficiente. Saldo atual: R$ {saldo}',
  CLIENTE_NAO_ENCONTRADO: 'Cliente não encontrado no sistema',
  VALOR_INVALIDO: 'Valor deve ser maior que zero',
  TRANSACAO_DUPLICADA: 'Esta transação já foi processada',
  PERMISSAO_NEGADA: 'Você não tem permissão para esta operação',
} as const;

// =====================================================
// TIPOS PARA OPERAÇÕES ADMINISTRATIVAS
// =====================================================

export interface EditarTransacaoData {
  transacao_id: string;
  novo_valor: number;
  nova_descricao: string;
}

export interface CancelarTransacaoData {
  transacao_id: string;
  motivo: string;
}

export interface AjustarSaldoData {
  cliente_id: string;
  novo_saldo: number;
  motivo: string;
}

export const editarTransacaoSchema = z.object({
  transacao_id: z.string().min(1, 'ID da transação é obrigatório'),
  novo_valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(50000, 'Valor máximo de R$ 50.000'),
  nova_descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(500, 'Descrição muito longa'),
});

export const cancelarTransacaoSchema = z.object({
  transacao_id: z.string().min(1, 'ID da transação é obrigatório'),
  motivo: z.string()
    .min(3, 'Motivo deve ter pelo menos 3 caracteres')
    .max(500, 'Motivo muito longo'),
});

export const ajustarSaldoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  novo_saldo: z.number()
    .min(0, 'Saldo não pode ser negativo')
    .max(100000, 'Saldo máximo de R$ 100.000'),
  motivo: z.string()
    .min(3, 'Motivo deve ter pelo menos 3 caracteres')
    .max(500, 'Motivo muito longo'),
});

// =====================================================
// UTILITÁRIOS DE TIPO
// =====================================================

export type WalletTransacaoTipo = WalletTransacao['tipo'];
export type WalletFormaPagamento = typeof FORMAS_PAGAMENTO_WALLET[number];
export type WalletFiltroRapido = FiltrosWallet['filtro_rapido'];
export type WalletAlertaTipo = WalletAlerta['tipo'];
export type WalletAlertaCor = WalletAlerta['cor'];