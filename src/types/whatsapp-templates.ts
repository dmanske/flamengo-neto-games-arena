/**
 * =====================================================
 * TIPOS E INTERFACES - TEMPLATES DE WHATSAPP
 * =====================================================
 * 
 * Definições de tipos TypeScript para o sistema de templates
 * de WhatsApp, incluindo interfaces para templates, variáveis
 * e dados de viagem.
 */

// =====================================================
// ENUMS E CONSTANTES
// =====================================================

/**
 * Categorias disponíveis para templates de WhatsApp
 */
export type TemplateCategory = 
  | 'confirmacao'    // Templates de confirmação de viagem
  | 'grupo'          // Templates relacionados a grupos WhatsApp
  | 'lembrete'       // Templates de lembrete e avisos
  | 'cobranca'       // Templates para cobrança de pendências
  | 'informativo'    // Templates informativos gerais
  | 'promocional'    // Templates promocionais e ofertas
  | 'outros';        // Templates diversos

/**
 * Variáveis disponíveis para substituição nos templates
 */
export type TemplateVariable = 
  | 'NOME'              // Nome do passageiro
  | 'DESTINO'           // Destino da viagem
  | 'ADVERSARIO'        // Time adversário (para jogos)
  | 'DATA'              // Data da viagem (formatada)
  | 'HORARIO'           // Horário de saída
  | 'HORARIO_CHEGADA'   // Horário sugerido de chegada
  | 'LOCAL_SAIDA'       // Local de embarque
  | 'ONIBUS'            // Número ou nome do ônibus
  | 'LINK_GRUPO'        // Link do grupo WhatsApp
  | 'VALOR'             // Valor da viagem (formatado)
  | 'TELEFONE';         // Telefone de contato

/**
 * Mapeamento de categorias para labels amigáveis
 */
export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  confirmacao: 'Confirmação',
  grupo: 'Grupo WhatsApp',
  lembrete: 'Lembrete',
  cobranca: 'Cobrança',
  informativo: 'Informativo',
  promocional: 'Promocional',
  outros: 'Outros'
};

/**
 * Descrições das categorias
 */
export const CATEGORY_DESCRIPTIONS: Record<TemplateCategory, string> = {
  confirmacao: 'Templates para confirmar viagens e reservas',
  grupo: 'Templates com links e informações de grupos',
  lembrete: 'Templates de lembrete e avisos importantes',
  cobranca: 'Templates para cobrança de pendências',
  informativo: 'Templates com informações gerais',
  promocional: 'Templates promocionais e ofertas especiais',
  outros: 'Templates diversos não categorizados'
};

/**
 * Descrições das variáveis disponíveis
 */
export const VARIABLE_DESCRIPTIONS: Record<TemplateVariable, string> = {
  NOME: 'Nome completo do passageiro',
  DESTINO: 'Cidade ou local de destino da viagem',
  ADVERSARIO: 'Time adversário para jogos (ex: Sport, Vasco)',
  DATA: 'Data da viagem no formato DD/MM/AAAA',
  HORARIO: 'Horário de saída no formato HH:MM',
  HORARIO_CHEGADA: 'Horário sugerido de chegada no local',
  LOCAL_SAIDA: 'Endereço ou local de embarque',
  ONIBUS: 'Número, nome ou identificação do ônibus',
  LINK_GRUPO: 'Link do grupo WhatsApp da viagem',
  VALOR: 'Valor da viagem formatado como R$ XX,XX',
  TELEFONE: 'Telefone de contato da empresa'
};

// =====================================================
// INTERFACES PRINCIPAIS
// =====================================================

/**
 * Interface principal para templates de WhatsApp
 */
export interface WhatsAppTemplate {
  /** ID único do template */
  id: string;
  
  /** Nome identificador do template */
  nome: string;
  
  /** Categoria do template */
  categoria: TemplateCategory;
  
  /** Conteúdo da mensagem com variáveis */
  mensagem: string;
  
  /** Lista de variáveis utilizadas no template */
  variaveis: TemplateVariable[];
  
  /** Se o template está ativo para uso */
  ativo: boolean;
  
  /** Data de criação */
  created_at: string;
  
  /** Data da última atualização */
  updated_at: string;
}

/**
 * Dados para criar ou atualizar um template
 */
export interface CreateTemplateData {
  nome: string;
  categoria: TemplateCategory;
  mensagem: string;
  variaveis?: TemplateVariable[];
  ativo?: boolean;
}

/**
 * Dados para atualizar um template existente
 */
export interface UpdateTemplateData extends Partial<CreateTemplateData> {
  id: string;
}

/**
 * Template selecionado para envio com personalização
 */
export interface SelectedTemplate {
  /** Template base selecionado */
  template: WhatsAppTemplate;
  
  /** Mensagem personalizada (pode ser editada) */
  mensagemPersonalizada: string;
  
  /** Variáveis customizadas para este envio específico */
  variaveisCustomizadas?: Record<string, string>;
  
  /** Se este template está selecionado para envio */
  selecionado: boolean;
}

// =====================================================
// INTERFACES DE DADOS DE VIAGEM
// =====================================================

/**
 * Dados da viagem para substituição de variáveis
 */
export interface ViagemData {
  /** ID da viagem */
  id: string;
  
  /** Destino da viagem */
  destino: string;
  
  /** Data da viagem */
  data_viagem: string;
  
  /** Horário de saída */
  horario_saida: string;
  
  /** Local de embarque */
  local_saida: string;
  
  /** Informações do ônibus */
  onibus?: {
    numero?: string;
    nome?: string;
    placa?: string;
  };
  
  /** Link do grupo WhatsApp (editável) */
  link_grupo?: string;
  
  /** Telefone de contato */
  telefone_contato?: string;
}

/**
 * Dados do passageiro para substituição de variáveis
 */
export interface PassageiroData {
  /** ID do passageiro */
  id: string;
  
  /** Nome completo */
  nome: string;
  
  /** Telefone para WhatsApp */
  telefone: string;
  
  /** Valor da viagem para este passageiro */
  valor_total?: number;
  
  /** Status do pagamento */
  status_pagamento?: 'pago' | 'pendente' | 'cancelado';
}

/**
 * Mapeamento completo de variáveis para substituição
 */
export interface VariableMapping {
  NOME: string;
  DESTINO: string;
  ADVERSARIO: string;
  DATA: string;
  HORARIO: string;
  HORARIO_CHEGADA: string;
  LOCAL_SAIDA: string;
  ONIBUS: string;
  LINK_GRUPO: string;
  VALOR: string;
  TELEFONE: string;
}

// =====================================================
// INTERFACES DE RESPOSTA DA API
// =====================================================

/**
 * Resposta da API para listagem de templates
 */
export interface TemplatesResponse {
  templates: WhatsAppTemplate[];
  total: number;
  page?: number;
  limit?: number;
}

/**
 * Filtros para busca de templates
 */
export interface TemplateFilters {
  /** Filtrar por categoria */
  categoria?: TemplateCategory;
  
  /** Buscar por nome */
  busca?: string;
  
  /** Filtrar apenas ativos */
  ativo?: boolean;
  
  /** Paginação */
  page?: number;
  limit?: number;
}

// =====================================================
// INTERFACES DE ENVIO
// =====================================================

/**
 * Configurações customizadas para envio
 */
export interface ConfiguracoesEnvio {
  /** Link do grupo WhatsApp (sempre muda) */
  linkGrupo?: string;
  
  /** Time adversário para jogos */
  adversario?: string;
  
  /** Data customizada do jogo */
  dataJogo?: string;
  
  /** Outras variáveis customizadas */
  variaveisCustomizadas?: Record<string, string>;
}

/**
 * Dados para envio de mensagens
 */
export interface EnvioMensagemData {
  /** Templates selecionados */
  templates: SelectedTemplate[];
  
  /** Passageiros selecionados */
  passageiros: PassageiroData[];
  
  /** Dados da viagem */
  viagem: ViagemData;
  
  /** Configurações customizadas */
  configuracoes?: ConfiguracoesEnvio;
  
  /** Variáveis globais customizadas */
  variaveisGlobais?: Record<string, string>;
}

/**
 * Resultado do envio de uma mensagem
 */
export interface ResultadoEnvio {
  /** ID do passageiro */
  passageiro_id: string;
  
  /** Nome do passageiro */
  passageiro_nome: string;
  
  /** Telefone usado */
  telefone: string;
  
  /** Template usado */
  template_nome: string;
  
  /** Se o envio foi bem-sucedido */
  sucesso: boolean;
  
  /** Mensagem de erro (se houver) */
  erro?: string;
  
  /** Mensagem enviada */
  mensagem_enviada?: string;
}

/**
 * Resumo completo do envio
 */
export interface ResumoEnvio {
  /** Total de mensagens enviadas */
  total_enviadas: number;
  
  /** Total de sucessos */
  total_sucessos: number;
  
  /** Total de falhas */
  total_falhas: number;
  
  /** Resultados detalhados */
  resultados: ResultadoEnvio[];
  
  /** Tempo de processamento */
  tempo_processamento?: number;
}

// =====================================================
// INTERFACES DE PREVIEW
// =====================================================

/**
 * Dados para preview de template
 */
export interface PreviewData {
  /** Template para preview */
  template: WhatsAppTemplate;
  
  /** Dados da viagem (opcional, usa mock se não fornecido) */
  viagem?: Partial<ViagemData>;
  
  /** Dados do passageiro (opcional, usa mock se não fornecido) */
  passageiro?: Partial<PassageiroData>;
  
  /** Variáveis customizadas */
  variaveisCustom?: Record<string, string>;
}

/**
 * Resultado do preview
 */
export interface PreviewResult {
  /** Mensagem final com variáveis substituídas */
  mensagem_final: string;
  
  /** Variáveis que foram substituídas */
  variaveis_substituidas: Record<string, string>;
  
  /** Variáveis não encontradas */
  variaveis_nao_encontradas: string[];
  
  /** Contagem de caracteres */
  total_caracteres: number;
  
  /** Se a mensagem é válida para envio */
  valida: boolean;
  
  /** Avisos ou problemas encontrados */
  avisos?: string[];
}

// =====================================================
// UTILITÁRIOS E HELPERS
// =====================================================

/**
 * Opções para formatação de variáveis
 */
export interface FormatOptions {
  /** Formato de data (padrão: DD/MM/AAAA) */
  dateFormat?: string;
  
  /** Formato de hora (padrão: HH:MM) */
  timeFormat?: string;
  
  /** Formato de moeda (padrão: R$ XX,XX) */
  currencyFormat?: string;
  
  /** Locale para formatação (padrão: pt-BR) */
  locale?: string;
}

/**
 * Estado do hook de templates
 */
export interface TemplatesState {
  /** Lista de templates */
  templates: WhatsAppTemplate[];
  
  /** Se está carregando */
  loading: boolean;
  
  /** Erro atual */
  error: string | null;
  
  /** Filtros aplicados */
  filters: TemplateFilters;
  
  /** Templates selecionados */
  selectedTemplates: SelectedTemplate[];
}

// =====================================================
// NOTA: Todos os tipos e constantes são exportados
// diretamente em suas definições acima
// =====================================================