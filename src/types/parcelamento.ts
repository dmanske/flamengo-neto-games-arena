/**
 * Tipos e Interfaces para o Sistema de Parcelamento Inteligente
 */

// =====================================================
// TIPOS BÁSICOS
// =====================================================

export type StatusParcela = 'pendente' | 'pago' | 'vencido' | 'cancelado';
export type TipoParcelamento = 'avista' | 'parcelado' | 'personalizado';
export type TipoAlerta = '5_dias_antes' | 'vencimento' | 'atraso_1dia' | 'atraso_7dias';
export type CanalAlerta = 'whatsapp' | 'email' | 'sms';
export type StatusEnvio = 'enviado' | 'lido' | 'respondido' | 'erro';
export type UrgenciaParcela = 'normal' | 'vence_em_breve' | 'vence_hoje' | 'atrasado';
export type AcaoHistorico = 'criada' | 'data_alterada' | 'valor_alterado' | 'pago' | 'cancelada' | 'status_alterado';

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

/**
 * Configuração de parcelamento por viagem
 */
export interface ParcelamentoConfig {
  id?: string;
  viagemId: string;
  descontoAvistaPercent: number;
  prazoLimiteDias: number;
  intervaloMinimoDias: number;
  maxParcelas: number;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Opção de parcelamento calculada
 */
export interface ParcelamentoOpcao {
  tipo: 'avista' | 'parcelado';
  parcelas: number;
  valorParcela: number;
  valorTotal: number;
  valorOriginal: number;
  desconto: number;
  datas: Date[];
  descricao: string;
  valida: boolean;
  observacoes?: string;
}

/**
 * Parcela individual
 */
export interface Parcela {
  id?: string;
  viagemPassageiroId: string;
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: StatusParcela;
  tipoParcelamento: TipoParcelamento;
  descontoAplicado: number;
  valorOriginal: number;
  formaPagamento?: string;
  descricao: string;
  observacoes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Parcela com informações completas (para views)
 */
export interface ParcelaCompleta extends Parcela {
  // Dados do passageiro
  passageiroNome: string;
  passageiroTelefone?: string;
  passageiroEmail?: string;
  
  // Dados da viagem
  viagemId: string;
  adversario: string;
  dataJogo: Date;
  prazoLimitePagamento: Date;
  
  // Cálculos
  diasAtraso: number;
  urgencia: UrgenciaParcela;
  
  // Totais do passageiro
  valorTotalPassageiro: number;
  descontoPassageiro: number;
}

/**
 * Alerta de parcela
 */
export interface ParcelaAlerta {
  id?: string;
  parcelaId: string;
  tipoAlerta: TipoAlerta;
  canal: CanalAlerta;
  templateUsado?: string;
  mensagemEnviada?: string;
  dataEnvio: Date;
  statusEnvio: StatusEnvio;
  respostaRecebida?: string;
  tentativas: number;
  createdAt?: Date;
}

/**
 * Histórico de alterações em parcela
 */
export interface ParcelaHistorico {
  id?: string;
  parcelaId: string;
  acao: AcaoHistorico;
  valorAnterior?: Record<string, any>;
  valorNovo?: Record<string, any>;
  usuarioId?: string;
  ipAddress?: string;
  userAgent?: string;
  observacoes?: string;
  createdAt?: Date;
}

// =====================================================
// INTERFACES PARA COMPONENTES
// =====================================================

/**
 * Props para seletor de parcelamento
 */
export interface ParcelamentoSelectorProps {
  viagemId: string;
  dataViagem: Date;
  valorTotal: number;
  valorDesconto?: number;
  config?: Partial<ParcelamentoConfig>;
  onOpcaoSelecionada: (opcao: ParcelamentoOpcao) => void;
  onParcelasGeradas: (parcelas: Parcela[]) => void;
  disabled?: boolean;
}

/**
 * Props para editor de parcelas
 */
export interface ParcelaEditorProps {
  parcelas: Parcela[];
  dataViagem: Date;
  onParcelasAlteradas: (parcelas: Parcela[]) => void;
  onValidacao: (valido: boolean, erros: string[]) => void;
  readOnly?: boolean;
}

/**
 * Props para dashboard de vencimentos
 */
export interface VencimentoDashboardProps {
  parcelas: ParcelaCompleta[];
  onCobrancaIndividual: (parcela: ParcelaCompleta) => void;
  onCobrancaEmMassa: (parcelas: ParcelaCompleta[]) => void;
  onFiltroAlterado: (filtro: FiltroVencimento) => void;
}

// =====================================================
// INTERFACES PARA HOOKS
// =====================================================

/**
 * Hook para gerenciar parcelamento
 */
export interface UseParcelamentoReturn {
  // Estado
  opcoes: ParcelamentoOpcao[];
  opcaoSelecionada: ParcelamentoOpcao | null;
  parcelas: Parcela[];
  isLoading: boolean;
  error: string | null;
  
  // Ações
  calcularOpcoes: (dataViagem: Date, valorTotal: number, config?: Partial<ParcelamentoConfig>) => Promise<void>;
  selecionarOpcao: (opcao: ParcelamentoOpcao) => void;
  editarParcela: (index: number, novaData: Date) => void;
  confirmarParcelamento: () => Promise<void>;
  cancelar: () => void;
  
  // Validações
  validarParcelas: () => { valido: boolean; erros: string[] };
}

/**
 * Hook para dashboard de vencimentos
 */
export interface UseVencimentosReturn {
  // Estado
  parcelas: ParcelaCompleta[];
  parcelasAgrupadas: ParcelasAgrupadasPorUrgencia;
  filtro: FiltroVencimento;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  carregarParcelas: () => Promise<void>;
  alterarFiltro: (novoFiltro: Partial<FiltroVencimento>) => void;
  cobrarParcela: (parcela: ParcelaCompleta) => Promise<void>;
  cobrarEmMassa: (parcelas: ParcelaCompleta[]) => Promise<void>;
  marcarComoPago: (parcelaId: string, dataPagamento: Date, formaPagamento: string) => Promise<void>;
}

/**
 * Hook para alertas automáticos
 */
export interface UseAlertasReturn {
  // Estado
  alertasPendentes: ParcelaAlerta[];
  historicoAlertas: ParcelaAlerta[];
  isProcessing: boolean;
  
  // Ações
  verificarVencimentos: () => Promise<void>;
  enviarAlerta: (parcela: ParcelaCompleta, tipo: TipoAlerta) => Promise<void>;
  marcarComoLido: (alertaId: string) => Promise<void>;
  obterHistorico: (parcelaId: string) => Promise<ParcelaAlerta[]>;
}

// =====================================================
// INTERFACES PARA FILTROS E AGRUPAMENTOS
// =====================================================

/**
 * Filtro para dashboard de vencimentos
 */
export interface FiltroVencimento {
  status?: StatusParcela[];
  urgencia?: UrgenciaParcela[];
  dataInicio?: Date;
  dataFim?: Date;
  viagemId?: string;
  passageiroNome?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

/**
 * Parcelas agrupadas por urgência
 */
export interface ParcelasAgrupadasPorUrgencia {
  atrasado: ParcelaCompleta[];
  vence_hoje: ParcelaCompleta[];
  vence_em_breve: ParcelaCompleta[];
  normal: ParcelaCompleta[];
}

/**
 * Resumo de vencimentos
 */
export interface ResumoVencimentos {
  totalParcelas: number;
  valorTotal: number;
  parcelasAtrasadas: number;
  valorAtrasado: number;
  parcelasVencemHoje: number;
  valorVenceHoje: number;
  parcelasVencemEmBreve: number;
  valorVenceEmBreve: number;
  taxaInadimplencia: number;
}

// =====================================================
// INTERFACES PARA TEMPLATES E MENSAGENS
// =====================================================

/**
 * Template de mensagem para cobrança
 */
export interface TemplateCobranca {
  id?: string;
  nome: string;
  tipoAlerta: TipoAlerta;
  canal: CanalAlerta;
  assunto?: string;
  mensagem: string;
  variaveis: string[];
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Dados para substituição em template
 */
export interface DadosTemplate {
  // Dados do passageiro
  nome: string;
  telefone?: string;
  email?: string;
  
  // Dados da parcela
  numeroParcela: number;
  totalParcelas: number;
  valorParcela: number;
  dataVencimento: string;
  diasAtraso?: number;
  
  // Dados da viagem
  adversario: string;
  dataJogo: string;
  prazoLimite: string;
  
  // Dados de pagamento
  chavePix?: string;
  linkPagamento?: string;
  
  // Dados calculados
  parcelasRestantes: number;
  valorRestante: number;
  percentualPago: number;
}

// =====================================================
// INTERFACES PARA RELATÓRIOS
// =====================================================

/**
 * Relatório de performance de parcelamento
 */
export interface RelatorioParcelamento {
  periodo: {
    inicio: Date;
    fim: Date;
  };
  
  resumo: {
    totalViagens: number;
    totalPassageiros: number;
    totalParcelas: number;
    valorTotal: number;
  };
  
  porTipoParcelamento: {
    avista: { quantidade: number; valor: number; percentual: number };
    parcelado: { quantidade: number; valor: number; percentual: number };
    personalizado: { quantidade: number; valor: number; percentual: number };
  };
  
  inadimplencia: {
    parcelasAtrasadas: number;
    valorAtrasado: number;
    taxaInadimplencia: number;
    tempoMedioAtraso: number;
  };
  
  efetividadeCobranca: {
    alertasEnviados: number;
    respostasRecebidas: number;
    pagamentosAposAlerta: number;
    taxaEfetividade: number;
  };
  
  porViagem: Array<{
    viagemId: string;
    adversario: string;
    dataJogo: Date;
    totalPassageiros: number;
    totalParcelas: number;
    valorTotal: number;
    parcelasAtrasadas: number;
    taxaInadimplencia: number;
  }>;
}

// =====================================================
// INTERFACES PARA VALIDAÇÃO
// =====================================================

/**
 * Resultado de validação
 */
export interface ResultadoValidacao {
  valido: boolean;
  erros: ErroValidacao[];
  avisos: AvisoValidacao[];
}

/**
 * Erro de validação
 */
export interface ErroValidacao {
  campo: string;
  codigo: string;
  mensagem: string;
  valor?: any;
}

/**
 * Aviso de validação
 */
export interface AvisoValidacao {
  campo: string;
  codigo: string;
  mensagem: string;
  valor?: any;
}

// =====================================================
// CONSTANTES E ENUMS
// =====================================================

/**
 * Códigos de erro do sistema
 */
export const PARCELAMENTO_ERROR_CODES = {
  PRAZO_LIMITE_EXCEDIDO: 'PRAZO_LIMITE_EXCEDIDO',
  INTERVALO_MINIMO: 'INTERVALO_MINIMO',
  VALOR_INCONSISTENTE: 'VALOR_INCONSISTENTE',
  PARCELA_JA_PAGA: 'PARCELA_JA_PAGA',
  VIAGEM_MUITO_PROXIMA: 'VIAGEM_MUITO_PROXIMA',
  DATA_INVALIDA: 'DATA_INVALIDA',
  VALOR_INVALIDO: 'VALOR_INVALIDO',
  CONFIG_INVALIDA: 'CONFIG_INVALIDA',
  PARCELA_NAO_ENCONTRADA: 'PARCELA_NAO_ENCONTRADA',
  PERMISSAO_NEGADA: 'PERMISSAO_NEGADA'
} as const;

/**
 * Configurações padrão do sistema
 */
export const PARCELAMENTO_DEFAULTS = {
  DESCONTO_AVISTA_PERCENT: 0,
  PRAZO_LIMITE_DIAS: 5,
  INTERVALO_MINIMO_DIAS: 15,
  MAX_PARCELAS: 6,
  TENTATIVAS_ALERTA: 3,
  DIAS_ALERTA_ANTECIPADO: 5
} as const;

/**
 * Templates padrão de mensagem
 */
export const TEMPLATES_PADRAO = {
  LEMBRETE_5_DIAS: {
    nome: 'Lembrete 5 dias antes',
    tipoAlerta: '5_dias_antes' as TipoAlerta,
    canal: 'whatsapp' as CanalAlerta,
    mensagem: `Oi {{nome}}! 👋
Sua {{numeroParcela}}ª parcela de R$ {{valorParcela}} vence em 5 dias ({{dataVencimento}}).

Viagem: Flamengo x {{adversario}} - {{dataJogo}}
{{#parcelasRestantes}}Restam {{parcelasRestantes}} parcelas após esta.{{/parcelasRestantes}}

PIX: {{chavePix}}
Link: {{linkPagamento}}

Lembre-se: pagamento deve estar completo até {{prazoLimite}} (5 dias antes da viagem)! ⚽`
  },
  
  VENCIMENTO: {
    nome: 'Vencimento hoje',
    tipoAlerta: 'vencimento' as TipoAlerta,
    canal: 'whatsapp' as CanalAlerta,
    mensagem: `Oi {{nome}}! 🔴
Sua {{numeroParcela}}ª parcela de R$ {{valorParcela}} vence HOJE ({{dataVencimento}}).

Viagem: Flamengo x {{adversario}} - {{dataJogo}}
{{#parcelasRestantes}}Restam {{parcelasRestantes}} parcelas (R$ {{valorRestante}}).{{/parcelasRestantes}}

PIX: {{chavePix}}
Link: {{linkPagamento}}

Prazo final: {{prazoLimite}} ⏰`
  },
  
  ATRASO_1_DIA: {
    nome: 'Atraso 1 dia',
    tipoAlerta: 'atraso_1dia' as TipoAlerta,
    canal: 'whatsapp' as CanalAlerta,
    mensagem: `{{nome}}, sua {{numeroParcela}}ª parcela está 1 dia em atraso! 🚨

Valor: R$ {{valorParcela}}
Venceu em: {{dataVencimento}}
Viagem: Flamengo x {{adversario}} - {{dataJogo}}

Para não perder sua vaga, quite hoje:
PIX: {{chavePix}}
Link: {{linkPagamento}}

Prazo final para viagem: {{prazoLimite}} ⏰`
  },
  
  ATRASO_7_DIAS: {
    nome: 'Atraso 7 dias - Urgente',
    tipoAlerta: 'atraso_7dias' as TipoAlerta,
    canal: 'whatsapp' as CanalAlerta,
    mensagem: `{{nome}}, URGENTE! 🚨🚨

Sua parcela está {{diasAtraso}} dias em atraso.
Valor: R$ {{valorParcela}}
Venceu em: {{dataVencimento}}

Viagem: Flamengo x {{adversario}} - {{dataJogo}}
Prazo FINAL: {{prazoLimite}}

QUITE AGORA para não perder sua vaga:
PIX: {{chavePix}}
Link: {{linkPagamento}}

Após o prazo, sua vaga será cancelada! ⚠️`
  }
} as const;

// =====================================================
// TYPE GUARDS
// =====================================================

/**
 * Verifica se um valor é um status de parcela válido
 */
export function isStatusParcela(value: any): value is StatusParcela {
  return ['pendente', 'pago', 'vencido', 'cancelado'].includes(value);
}

/**
 * Verifica se um valor é um tipo de parcelamento válido
 */
export function isTipoParcelamento(value: any): value is TipoParcelamento {
  return ['avista', 'parcelado', 'personalizado'].includes(value);
}

/**
 * Verifica se um valor é um tipo de alerta válido
 */
export function isTipoAlerta(value: any): value is TipoAlerta {
  return ['5_dias_antes', 'vencimento', 'atraso_1dia', 'atraso_7dias'].includes(value);
}

/**
 * Verifica se um valor é um canal de alerta válido
 */
export function isCanalAlerta(value: any): value is CanalAlerta {
  return ['whatsapp', 'email', 'sms'].includes(value);
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Parcela para criação (sem campos gerados automaticamente)
 */
export type ParcelaCriacao = Omit<Parcela, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Parcela para atualização (campos opcionais)
 */
export type ParcelaAtualizacao = Partial<Omit<Parcela, 'id' | 'viagemPassageiroId' | 'createdAt'>>;

/**
 * Configuração para criação
 */
export type ParcelamentoConfigCriacao = Omit<ParcelamentoConfig, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Configuração para atualização
 */
export type ParcelamentoConfigAtualizacao = Partial<Omit<ParcelamentoConfig, 'id' | 'viagemId' | 'createdAt'>>;

/**
 * Dados mínimos para cálculo de parcelamento
 */
export type DadosCalculoParcelamento = {
  dataViagem: Date;
  valorTotal: number;
  config?: Partial<ParcelamentoConfig>;
};

/**
 * Resultado do cálculo de parcelamento
 */
export type ResultadoCalculoParcelamento = {
  opcoes: ParcelamentoOpcao[];
  permiteParcelamento: boolean;
  diasDisponiveis: number;
  prazoLimite: Date;
};