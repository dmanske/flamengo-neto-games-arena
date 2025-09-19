/**
 * Hook para gerenciar personalização de relatórios
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  PersonalizationConfig, 
  ValidationResult, 
  Template,
  ConfigScenario
} from '@/types/personalizacao-relatorios';
import { 
  PersonalizationValidator, 
  PersonalizationSanitizer 
} from '@/lib/validations/personalizacao-relatorios';
import { PersonalizationStorage } from '@/lib/personalizacao/storage';
import { getDefaultConfig } from '@/lib/personalizacao-defaults';
import { cloneConfig } from '@/lib/personalizacao-utils';

export interface UsePersonalizacaoOptions {
  viagemId?: string;
  configuracaoInicial?: PersonalizationConfig;
  autoSave?: boolean;
  debounceMs?: number;
}

export function usePersonalizacao(options: UsePersonalizacaoOptions = {}) {
  const {
    viagemId,
    configuracaoInicial,
    autoSave = true,
    debounceMs = 1000
  } = options;

  // Estados principais
  const [config, setConfig] = useState<PersonalizationConfig>(() => {
    if (configuracaoInicial) return configuracaoInicial;
    
    // Tentar carregar configuração atual do storage
    const saved = PersonalizationStorage.loadCurrentConfig();
    return saved || getDefaultConfig(ConfigScenario.COMPLETO);
  });

  const [originalConfig, setOriginalConfig] = useState<PersonalizationConfig>(config);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);

  // Inicialização
  useEffect(() => {
    PersonalizationStorage.initialize();
    loadTemplates();
  }, []);

  // Validação automática
  useEffect(() => {
    const newValidation = PersonalizationValidator.validate(config);
    setValidation(newValidation);
  }, [config]);

  // Detectar mudanças
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  }, [config, originalConfig]);

  // Auto-save com debounce
  useEffect(() => {
    if (!autoSave || !hasChanges) return;

    const timeoutId = setTimeout(() => {
      try {
        const sanitized = PersonalizationSanitizer.sanitize(config);
        PersonalizationStorage.saveCurrentConfig(sanitized);
        PersonalizationStorage.addToHistory(sanitized, 'auto_save', 'Salvamento automático');
      } catch (error) {
        console.error('Erro no auto-save:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [config, hasChanges, autoSave, debounceMs]);

  // ============================================================================
  // FUNÇÕES DE CONFIGURAÇÃO
  // ============================================================================

  /**
   * Atualiza a configuração completa
   */
  const updateConfig = useCallback((newConfig: PersonalizationConfig) => {
    setConfig(newConfig);
  }, []);

  /**
   * Atualiza uma parte específica da configuração
   */
  const updatePartialConfig = useCallback(<K extends keyof PersonalizationConfig>(
    key: K,
    value: PersonalizationConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
      metadata: {
        ...prev.metadata,
        atualizadoEm: new Date().toISOString()
      }
    }));
  }, []);

  /**
   * Reseta para configuração padrão
   */
  const resetConfig = useCallback((scenario: ConfigScenario = ConfigScenario.COMPLETO) => {
    const defaultConfig = getDefaultConfig(scenario);
    setConfig(defaultConfig);
    setOriginalConfig(defaultConfig);
    
    PersonalizationStorage.addToHistory(defaultConfig, 'reset', `Reset para ${scenario}`);
  }, []);

  /**
   * Clona a configuração atual
   */
  const cloneCurrentConfig = useCallback(() => {
    return cloneConfig(config);
  }, [config]);

  // ============================================================================
  // FUNÇÕES DE TEMPLATE
  // ============================================================================

  /**
   * Carrega templates do storage
   */
  const loadTemplates = useCallback(() => {
    const loadedTemplates = PersonalizationStorage.loadTemplates();
    setTemplates(loadedTemplates);
  }, []);

  /**
   * Salva configuração atual como template
   */
  const saveAsTemplate = useCallback(async (nome: string, descricao?: string) => {
    setIsLoading(true);
    try {
      const template = PersonalizationStorage.saveTemplate({
        nome,
        descricao,
        categoria: 'personalizado',
        configuracao: cloneConfig(config),
        metadata: {
          ...config.metadata,
          nome,
          categoria: 'personalizado'
        }
      });
      
      loadTemplates();
      PersonalizationStorage.addToHistory(config, 'template_saved', `Template "${nome}" salvo`);
      
      return template;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [config, loadTemplates]);

  /**
   * Aplica um template
   */
  const applyTemplate = useCallback((template: Template) => {
    setConfig(template.configuracao);
    PersonalizationStorage.addToHistory(template.configuracao, 'template_applied', `Template "${template.nome}" aplicado`);
  }, []);

  /**
   * Remove um template
   */
  const deleteTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    try {
      PersonalizationStorage.deleteTemplate(templateId);
      loadTemplates();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadTemplates]);

  // ============================================================================
  // FUNÇÕES DE EXPORTAÇÃO/IMPORTAÇÃO
  // ============================================================================

  /**
   * Exporta configuração atual
   */
  const exportConfig = useCallback((metadata?: any) => {
    return PersonalizationStorage.exportConfig(config, {
      viagemId,
      ...metadata
    });
  }, [config, viagemId]);

  /**
   * Importa configuração
   */
  const importConfig = useCallback(async (jsonString: string) => {
    setIsLoading(true);
    try {
      const imported = PersonalizationStorage.importConfig(jsonString);
      setConfig(imported);
      PersonalizationStorage.addToHistory(imported, 'imported', 'Configuração importada');
      return imported;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // FUNÇÕES DE HISTÓRICO
  // ============================================================================

  /**
   * Carrega histórico de configurações
   */
  const loadHistory = useCallback(() => {
    return PersonalizationStorage.loadHistory();
  }, []);

  /**
   * Carrega configuração do histórico
   */
  const loadFromHistory = useCallback((historyId: string) => {
    const historyConfig = PersonalizationStorage.loadFromHistory(historyId);
    if (historyConfig) {
      setConfig(historyConfig);
      PersonalizationStorage.addToHistory(historyConfig, 'history_restored', 'Configuração restaurada do histórico');
    }
    return historyConfig;
  }, []);

  // ============================================================================
  // FUNÇÕES DE VALIDAÇÃO E APLICAÇÃO
  // ============================================================================

  /**
   * Valida configuração atual
   */
  const validateConfig = useCallback(() => {
    return PersonalizationValidator.validate(config);
  }, [config]);

  /**
   * Sanitiza configuração atual
   */
  const sanitizeConfig = useCallback(() => {
    const sanitized = PersonalizationSanitizer.sanitize(config);
    setConfig(sanitized);
    return sanitized;
  }, [config]);

  /**
   * Aplica configuração (salva e marca como aplicada)
   */
  const applyConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const sanitized = PersonalizationSanitizer.sanitize(config);
      
      // Validar antes de aplicar
      const validation = PersonalizationValidator.validate(sanitized);
      if (!validation.valido) {
        throw new Error(`Configuração inválida: ${validation.errors[0]?.mensagem}`);
      }
      
      // Salvar no storage
      PersonalizationStorage.saveCurrentConfig(sanitized);
      PersonalizationStorage.addToHistory(sanitized, 'applied', 'Configuração aplicada');
      
      // Atualizar estado
      setOriginalConfig(sanitized);
      setConfig(sanitized);
      
      return sanitized;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [config]);

  // ============================================================================
  // FUNÇÕES UTILITÁRIAS
  // ============================================================================

  /**
   * Obtém estatísticas da configuração
   */
  const getConfigStats = useCallback(() => {
    const colunasVisiveis = config.passageiros.colunas.filter(c => c.visivel).length;
    const secoesVisiveis = config.secoes.secoes.filter(s => s.visivel).length;
    const larguraTotal = config.passageiros.colunas
      .filter(c => c.visivel)
      .reduce((sum, c) => sum + (c.largura || 100), 0);

    return {
      colunasVisiveis,
      totalColunas: config.passageiros.colunas.length,
      secoesVisiveis,
      totalSecoes: config.secoes.secoes.length,
      larguraTotal,
      temAgrupamento: config.passageiros.agrupamento.ativo,
      orientacao: config.estilo.layout.orientacao,
      familia: config.estilo.fontes.familia
    };
  }, [config]);

  /**
   * Verifica se a configuração é válida para aplicação
   */
  const canApply = useCallback(() => {
    return validation?.valido === true;
  }, [validation]);

  // ============================================================================
  // RETORNO DO HOOK
  // ============================================================================

  return {
    // Estados
    config,
    originalConfig,
    validation,
    isLoading,
    hasChanges,
    templates,

    // Funções de configuração
    updateConfig,
    updatePartialConfig,
    resetConfig,
    cloneCurrentConfig,

    // Funções de template
    loadTemplates,
    saveAsTemplate,
    applyTemplate,
    deleteTemplate,

    // Funções de exportação/importação
    exportConfig,
    importConfig,

    // Funções de histórico
    loadHistory,
    loadFromHistory,

    // Funções de validação e aplicação
    validateConfig,
    sanitizeConfig,
    applyConfig,

    // Funções utilitárias
    getConfigStats,
    canApply
  };
}