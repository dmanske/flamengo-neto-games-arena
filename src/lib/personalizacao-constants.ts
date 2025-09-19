/**
 * Constantes e enums para o sistema de personalização de relatórios
 */

import { PassageiroColumnCategory, SecaoTipo } from '@/types/personalizacao-relatorios';

// ============================================================================
// CATEGORIAS DE COLUNAS
// ============================================================================

export const COLUMN_CATEGORIES: Record<PassageiroColumnCategory, { label: string; icon: string; description: string }> = {
  pessoais: {
    label: 'Dados Pessoais',
    icon: '👤',
    description: 'Nome, CPF, idade, contato, etc.'
  },
  localizacao: {
    label: 'Localização',
    icon: '📍',
    description: 'Endereço, cidade, estado, CEP'
  },
  viagem: {
    label: 'Dados da Viagem',
    icon: '🎫',
    description: 'Setor, ônibus, assento, foto'
  },
  financeiro: {
    label: 'Financeiro',
    icon: '💰',
    description: 'Pagamentos, valores, descontos'
  },
  passeios: {
    label: 'Passeios',
    icon: '🎠',
    description: 'Passeios selecionados e valores'
  },
  extras: {
    label: 'Informações Extras',
    icon: '📝',
    description: 'Observações, como conheceu, etc.'
  }
};

// ============================================================================
// TIPOS DE SEÇÕES
// ============================================================================

export const SECTION_TYPES: Record<SecaoTipo, { label: string; icon: string; description: string; category: string }> = {
  // Seções Financeiras
  resumo_financeiro: {
    label: 'Resumo Financeiro',
    icon: '💰',
    description: 'Total arrecadado, pendente e descontos',
    category: 'financeiro'
  },
  receita_categoria: {
    label: 'Receita por Categoria',
    icon: '📊',
    description: 'Receita separada por viagem e passeios',
    category: 'financeiro'
  },
  pagos_pendentes: {
    label: 'Pagos vs Pendentes',
    icon: '✅',
    description: 'Comparativo de pagamentos',
    category: 'financeiro'
  },
  descontos: {
    label: 'Descontos Aplicados',
    icon: '🏷️',
    description: 'Resumo de descontos concedidos',
    category: 'financeiro'
  },
  
  // Seções de Distribuição
  distribuicao_setor: {
    label: 'Distribuição por Setor',
    icon: '🏟️',
    description: 'Passageiros por setor do Maracanã',
    category: 'distribuicao'
  },
  distribuicao_onibus: {
    label: 'Distribuição por Ônibus',
    icon: '🚌',
    description: 'Ocupação e capacidade dos ônibus',
    category: 'distribuicao'
  },
  distribuicao_cidade: {
    label: 'Distribuição por Cidade',
    icon: '🌆',
    description: 'Passageiros por cidade/estado',
    category: 'distribuicao'
  },
  
  // Seções de Passeios
  estatisticas_passeios: {
    label: 'Estatísticas de Passeios',
    icon: '🎠',
    description: 'Participantes e receita por passeio',
    category: 'passeios'
  },
  totais_passeios: {
    label: 'Totais por Passeio',
    icon: '🎯',
    description: 'Resumo quantitativo dos passeios',
    category: 'passeios'
  },
  faixas_etarias_passeios: {
    label: 'Passeios & Faixas Etárias',
    icon: '👶👴',
    description: 'Distribuição etária nos passeios',
    category: 'passeios'
  },
  custos_passeios: {
    label: 'Custos Operacionais',
    icon: '💸',
    description: 'Custos e margem dos passeios',
    category: 'passeios'
  },
  
  // Seções Demográficas
  faixas_etarias: {
    label: 'Faixas Etárias',
    icon: '👥',
    description: 'Distribuição por idade',
    category: 'demografico'
  },
  distribuicao_genero: {
    label: 'Distribuição por Gênero',
    icon: '⚧️',
    description: 'Distribuição por gênero',
    category: 'demografico'
  },
  estatisticas_contato: {
    label: 'Estatísticas de Contato',
    icon: '📞',
    description: 'Telefones, emails cadastrados',
    category: 'demografico'
  },
  
  // Seções de Pagamento
  formas_pagamento: {
    label: 'Formas de Pagamento',
    icon: '💳',
    description: 'Distribuição por forma de pagamento',
    category: 'pagamento'
  },
  status_pagamento: {
    label: 'Status de Pagamento',
    icon: '📋',
    description: 'Situação dos pagamentos',
    category: 'pagamento'
  },
  parcelamentos: {
    label: 'Parcelamentos',
    icon: '📅',
    description: 'Informações sobre parcelas',
    category: 'pagamento'
  },
  creditos_utilizados: {
    label: 'Créditos Utilizados',
    icon: '🎁',
    description: 'Uso de créditos nas viagens',
    category: 'pagamento'
  },
  
  // Seções de Ingressos
  total_ingressos: {
    label: 'Total de Ingressos',
    icon: '🎫',
    description: 'Resumo geral de ingressos',
    category: 'ingressos'
  },
  ingressos_setor: {
    label: 'Ingressos por Setor',
    icon: '🏟️',
    description: 'Ingressos distribuídos por setor',
    category: 'ingressos'
  },
  ingressos_faixa_etaria: {
    label: 'Ingressos por Faixa Etária',
    icon: '🎫👥',
    description: 'Ingressos por idade',
    category: 'ingressos'
  }
};

// ============================================================================
// CATEGORIAS DE SEÇÕES
// ============================================================================

export const SECTION_CATEGORIES = {
  financeiro: {
    label: 'Financeiro',
    icon: '💰',
    color: '#10b981'
  },
  distribuicao: {
    label: 'Distribuição',
    icon: '📊',
    color: '#3b82f6'
  },
  passeios: {
    label: 'Passeios',
    icon: '🎠',
    color: '#8b5cf6'
  },
  demografico: {
    label: 'Demográfico',
    icon: '👥',
    color: '#f59e0b'
  },
  pagamento: {
    label: 'Pagamento',
    icon: '💳',
    color: '#ef4444'
  },
  ingressos: {
    label: 'Ingressos',
    icon: '🎫',
    color: '#06b6d4'
  }
};

// ============================================================================
// OPÇÕES DE FORMATAÇÃO
// ============================================================================

export const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Tahoma, sans-serif', label: 'Tahoma' },
  { value: 'Courier New, monospace', label: 'Courier New' }
];

export const FONT_SIZES = {
  header: { min: 8, max: 72, default: 16 },
  text: { min: 6, max: 24, default: 12 },
  table: { min: 6, max: 20, default: 10 }
};

export const COLOR_PRESETS = {
  flamengo: {
    headerPrincipal: '#dc2626',
    headerSecundario: '#991b1b',
    textoNormal: '#111827',
    destaque: '#dc2626',
    bordas: '#d1d5db',
    fundo: '#ffffff'
  },
  professional: {
    headerPrincipal: '#1f2937',
    headerSecundario: '#374151',
    textoNormal: '#111827',
    destaque: '#3b82f6',
    bordas: '#d1d5db',
    fundo: '#ffffff'
  },
  modern: {
    headerPrincipal: '#0f172a',
    headerSecundario: '#334155',
    textoNormal: '#0f172a',
    destaque: '#8b5cf6',
    bordas: '#e2e8f0',
    fundo: '#ffffff'
  },
  classic: {
    headerPrincipal: '#374151',
    headerSecundario: '#6b7280',
    textoNormal: '#111827',
    destaque: '#059669',
    bordas: '#d1d5db',
    fundo: '#f9fafb'
  }
};

// ============================================================================
// CONFIGURAÇÕES DE LAYOUT
// ============================================================================

export const LAYOUT_PRESETS = {
  compact: {
    margens: { superior: 15, inferior: 15, esquerda: 15, direita: 15 },
    espacamento: { entreSecoes: 10, entreTabelas: 8, entreParagrafos: 6, entreLinhas: 1.1 }
  },
  normal: {
    margens: { superior: 20, inferior: 20, esquerda: 20, direita: 20 },
    espacamento: { entreSecoes: 15, entreTabelas: 10, entreParagrafos: 8, entreLinhas: 1.2 }
  },
  spacious: {
    margens: { superior: 30, inferior: 30, esquerda: 25, direita: 25 },
    espacamento: { entreSecoes: 20, entreTabelas: 15, entreParagrafos: 12, entreLinhas: 1.4 }
  }
};

// ============================================================================
// VALIDAÇÃO
// ============================================================================

export const VALIDATION_LIMITS = {
  columnWidth: { min: 50, max: 500 },
  fontSize: { min: 6, max: 72 },
  margins: { min: 0, max: 100 },
  spacing: { min: 0, max: 50 },
  titleLength: { max: 200 },
  descriptionLength: { max: 500 },
  maxVisibleColumns: 20,
  maxVisibleSections: 15
};

// ============================================================================
// MENSAGENS DE ERRO E AVISO
// ============================================================================

export const ERROR_MESSAGES = {
  NO_VISIBLE_COLUMNS: 'Pelo menos uma coluna deve estar visível na lista de passageiros',
  DUPLICATE_COLUMN_ORDER: 'Existem colunas com a mesma ordem de exibição',
  DUPLICATE_SECTION_ORDER: 'Existem seções com a mesma ordem de exibição',
  INVALID_COLOR_FORMAT: 'Cor deve estar no formato hexadecimal (#RRGGBB)',
  NEGATIVE_MARGINS: 'Margens não podem ser negativas',
  NO_PASSEIO_TYPES: 'Pelo menos um tipo de passeio deve estar incluído',
  COLUMN_WIDTH_EXCEEDED: 'A largura total das colunas pode causar problemas de layout',
  FONT_SIZE_OUT_OF_RANGE: 'Tamanho da fonte fora do intervalo recomendado'
};

export const WARNING_MESSAGES = {
  NO_ESSENTIAL_INFO: 'Recomendamos mostrar pelo menos o adversário, título personalizado ou nome da empresa',
  LONG_TITLE: 'Título muito longo pode afetar o layout',
  ORDERING_COLUMN_HIDDEN: 'A coluna de ordenação não está visível na lista',
  NO_BASIC_BUS_INFO: 'Recomendamos mostrar pelo menos uma informação básica do ônibus',
  NO_VISIBLE_SECTIONS: 'Nenhuma seção está visível no relatório'
};

// ============================================================================
// ÍCONES E SÍMBOLOS
// ============================================================================

export const ICONS = {
  // Categorias
  pessoais: '👤',
  localizacao: '📍',
  viagem: '🎫',
  financeiro: '💰',
  passeios: '🎠',
  extras: '📝',
  
  // Ações
  visible: '👁️',
  hidden: '🙈',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  export: '📤',
  import: '📥',
  copy: '📋',
  share: '🔗',
  
  // Status
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  
  // Navegação
  up: '⬆️',
  down: '⬇️',
  left: '⬅️',
  right: '➡️',
  
  // Formatação
  bold: '𝐁',
  italic: '𝐼',
  underline: '𝐔',
  color: '🎨',
  font: '🔤'
};

// ============================================================================
// TEMPLATES OFICIAIS
// ============================================================================

export const OFFICIAL_TEMPLATE_IDS = [
  'responsavel-onibus',
  'lista-passageiros',
  'empresa-onibus',
  'comprar-ingressos',
  'comprar-passeios',
  'transfer',
  'financeiro-completo',
  'operacional-simples'
];

// ============================================================================
// CONFIGURAÇÕES DE PERFORMANCE
// ============================================================================

export const PERFORMANCE_CONFIG = {
  debounceDelay: 300, // ms para debounce de atualizações
  maxPreviewRows: 100, // máximo de linhas no preview
  virtualScrollThreshold: 50, // quando ativar scroll virtual
  maxHistoryItems: 10, // máximo de itens no histórico
  maxTemplates: 50 // máximo de templates salvos
};

// ============================================================================
// VERSIONING
// ============================================================================

export const VERSION_INFO = {
  current: '1.0.0',
  compatibility: ['1.0.0'],
  migrationRequired: false
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  COLUMN_CATEGORIES,
  SECTION_TYPES,
  SECTION_CATEGORIES,
  FONT_FAMILIES,
  FONT_SIZES,
  COLOR_PRESETS,
  LAYOUT_PRESETS,
  VALIDATION_LIMITS,
  ERROR_MESSAGES,
  WARNING_MESSAGES,
  ICONS,
  OFFICIAL_TEMPLATE_IDS,
  PERFORMANCE_CONFIG,
  VERSION_INFO
};