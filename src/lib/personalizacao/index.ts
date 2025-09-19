/**
 * Índice principal do sistema de personalização de relatórios
 * 
 * Este arquivo centraliza todas as exportações relacionadas ao sistema
 * de personalização para facilitar as importações em outros componentes.
 */

// Tipos e interfaces
export * from '@/types/personalizacao-relatorios';

// Validadores e sanitizadores
export * from '@/lib/validations/personalizacao-relatorios';

// Configurações padrão
export * from '@/lib/personalizacao-defaults';

// Utilitários
export * from '@/lib/personalizacao-utils';

// Constantes
export * from '@/lib/personalizacao-constants';

// Sistema de armazenamento
export * from './storage';

// Integração com sistema atual
export * from './integration';

// Componentes
export { PersonalizacaoDialog } from '@/components/relatorios/PersonalizacaoDialog';
export { PersonalizedReport } from '@/components/relatorios/PersonalizedReport';

// Hook
export { usePersonalizacao } from '@/hooks/usePersonalizacao';

// Re-exportações organizadas por categoria
export {
  // Tipos principais
  type PersonalizationConfig,
  type HeaderConfig,
  type PassageirosConfig,
  type OnibusConfig,
  type PasseiosConfig,
  type SecoesConfig,
  type EstiloConfig,
  type Template,
  
  // Enums e constantes
  ConfigScenario
} from '@/types/personalizacao-relatorios';

export {
  // Classes de validação
  PersonalizationValidator,
  PersonalizationSanitizer
} from '@/lib/validations/personalizacao-relatorios';

export {
  // Configurações padrão
  DEFAULT_CONFIGS,
  getDefaultConfig,
  getAvailableScenarios
} from '@/lib/personalizacao-defaults';

export {
  // Utilitários principais
  cloneConfig,
  mergeConfigs
} from '@/lib/personalizacao-utils';

export {
  // Storage
  PersonalizationStorage
} from './storage';