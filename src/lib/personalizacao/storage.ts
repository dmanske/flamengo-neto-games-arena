/**
 * Sistema de armazenamento e gerenciamento de templates
 */

import {
  PersonalizationConfig,
  Template,
  ConfigMetadata,
  ValidationResult,
  ConfigScenario
} from '@/types/personalizacao-relatorios';
import { PersonalizationValidator, PersonalizationSanitizer } from '@/lib/validations/personalizacao-relatorios';
import { DEFAULT_CONFIGS } from '@/lib/personalizacao-defaults';

// ============================================================================
// INTERFACES DE ARMAZENAMENTO
// ============================================================================

interface StorageData {
  templates: Template[];
  configuracaoAtual?: PersonalizationConfig;
  historico: HistoryItem[];
  configuracoes: {
    versao: string;
    ultimaAtualizacao: string;
  };
}

interface HistoryItem {
  id: string;
  configuracao: PersonalizationConfig;
  timestamp: string;
  acao: string;
  descricao?: string;
}

// ============================================================================
// CLASSE PRINCIPAL DE ARMAZENAMENTO
// ============================================================================

export class PersonalizationStorage {
  private static readonly STORAGE_KEY = 'personalization-data';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_HISTORY_ITEMS = 20;
  private static readonly MAX_TEMPLATES = 100;

  /**
   * Inicializa o sistema de armazenamento
   */
  static initialize(): void {
    const data = this.loadData();
    
    // Criar templates oficiais se não existirem
    if (data.templates.length === 0) {
      this.createOfficialTemplates();
    }
    
    // Verificar versão e migrar se necessário
    if (data.configuracoes.versao !== this.VERSION) {
      this.migrateData(data);
    }
  }

  /**
   * Carrega dados do localStorage
   */
  private static loadData(): StorageData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultStorageData();
      }
      
      const data = JSON.parse(stored) as StorageData;
      return {
        ...this.getDefaultStorageData(),
        ...data
      };
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return this.getDefaultStorageData();
    }
  }

  /**
   * Salva dados no localStorage
   */
  private static saveData(data: StorageData): void {
    try {
      data.configuracoes.ultimaAtualizacao = new Date().toISOString();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
      throw new Error('Não foi possível salvar as configurações');
    }
  }

  /**
   * Retorna dados padrão de armazenamento
   */
  private static getDefaultStorageData(): StorageData {
    return {
      templates: [],
      historico: [],
      configuracoes: {
        versao: this.VERSION,
        ultimaAtualizacao: new Date().toISOString()
      }
    };
  }

  // ============================================================================
  // GERENCIAMENTO DE TEMPLATES
  // ============================================================================

  /**
   * Salva um template
   */
  static saveTemplate(template: Omit<Template, 'id'>): Template {
    const data = this.loadData();
    
    // Verificar limite de templates
    if (data.templates.length >= this.MAX_TEMPLATES) {
      throw new Error(`Limite máximo de ${this.MAX_TEMPLATES} templates atingido`);
    }
    
    const newTemplate: Template = {
      ...template,
      id: this.generateTemplateId(),
      metadata: {
        ...template.metadata,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      }
    };
    
    // Validar configuração do template
    const validation = PersonalizationValidator.validate(newTemplate.configuracao);
    if (!validation.valido) {
      throw new Error(`Template inválido: ${validation.errors[0]?.mensagem || 'Erro desconhecido'}`);
    }
    
    data.templates.push(newTemplate);
    this.saveData(data);
    
    return newTemplate;
  }

  /**
   * Atualiza um template existente
   */
  static updateTemplate(templateId: string, updates: Partial<Template>): Template {
    const data = this.loadData();
    const index = data.templates.findIndex(t => t.id === templateId);
    
    if (index === -1) {
      throw new Error('Template não encontrado');
    }
    
    const updatedTemplate: Template = {
      ...data.templates[index],
      ...updates,
      id: templateId, // Garantir que o ID não mude
      metadata: {
        ...data.templates[index].metadata,
        ...updates.metadata,
        atualizadoEm: new Date().toISOString()
      }
    };
    
    // Validar se há configuração para validar
    if (updates.configuracao) {
      const validation = PersonalizationValidator.validate(updatedTemplate.configuracao);
      if (!validation.valido) {
        throw new Error(`Template inválido: ${validation.errors[0]?.mensagem || 'Erro desconhecido'}`);
      }
    }
    
    data.templates[index] = updatedTemplate;
    this.saveData(data);
    
    return updatedTemplate;
  }

  /**
   * Remove um template
   */
  static deleteTemplate(templateId: string): void {
    const data = this.loadData();
    const template = data.templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error('Template não encontrado');
    }
    
    // Não permitir exclusão de templates oficiais
    if (template.categoria === 'oficial') {
      throw new Error('Templates oficiais não podem ser excluídos');
    }
    
    data.templates = data.templates.filter(t => t.id !== templateId);
    this.saveData(data);
  }

  /**
   * Carrega todos os templates
   */
  static loadTemplates(): Template[] {
    const data = this.loadData();
    return data.templates.sort((a, b) => {
      // Oficiais primeiro, depois por data de criação
      if (a.categoria === 'oficial' && b.categoria !== 'oficial') return -1;
      if (a.categoria !== 'oficial' && b.categoria === 'oficial') return 1;
      return new Date(b.metadata.criadoEm).getTime() - new Date(a.metadata.criadoEm).getTime();
    });
  }

  /**
   * Carrega um template específico
   */
  static loadTemplate(templateId: string): Template | null {
    const data = this.loadData();
    return data.templates.find(t => t.id === templateId) || null;
  }

  /**
   * Duplica um template
   */
  static duplicateTemplate(templateId: string, newName?: string): Template {
    const template = this.loadTemplate(templateId);
    if (!template) {
      throw new Error('Template não encontrado');
    }
    
    return this.saveTemplate({
      nome: newName || `${template.nome} (Cópia)`,
      descricao: template.descricao,
      categoria: 'personalizado',
      configuracao: JSON.parse(JSON.stringify(template.configuracao)), // Deep clone
      metadata: {
        ...template.metadata,
        nome: newName || `${template.nome} (Cópia)`,
        categoria: 'personalizado'
      }
    });
  }

  // ============================================================================
  // CONFIGURAÇÃO ATUAL
  // ============================================================================

  /**
   * Salva a configuração atual
   */
  static saveCurrentConfig(config: PersonalizationConfig): void {
    const data = this.loadData();
    
    // Validar configuração
    const validation = PersonalizationValidator.validate(config);
    if (!validation.valido) {
      console.warn('Configuração com avisos:', validation.warnings);
    }
    
    // Sanitizar configuração
    const sanitized = PersonalizationSanitizer.sanitize(config);
    
    data.configuracaoAtual = sanitized;
    this.saveData(data);
  }

  /**
   * Carrega a configuração atual
   */
  static loadCurrentConfig(): PersonalizationConfig | null {
    const data = this.loadData();
    return data.configuracaoAtual || null;
  }

  // ============================================================================
  // HISTÓRICO
  // ============================================================================

  /**
   * Adiciona item ao histórico
   */
  static addToHistory(config: PersonalizationConfig, acao: string, descricao?: string): void {
    const data = this.loadData();
    
    const historyItem: HistoryItem = {
      id: this.generateHistoryId(),
      configuracao: JSON.parse(JSON.stringify(config)), // Deep clone
      timestamp: new Date().toISOString(),
      acao,
      descricao
    };
    
    data.historico.unshift(historyItem);
    
    // Manter apenas os últimos itens
    if (data.historico.length > this.MAX_HISTORY_ITEMS) {
      data.historico = data.historico.slice(0, this.MAX_HISTORY_ITEMS);
    }
    
    this.saveData(data);
  }

  /**
   * Carrega o histórico
   */
  static loadHistory(): HistoryItem[] {
    const data = this.loadData();
    return data.historico;
  }

  /**
   * Carrega uma configuração do histórico
   */
  static loadFromHistory(historyId: string): PersonalizationConfig | null {
    const data = this.loadData();
    const item = data.historico.find(h => h.id === historyId);
    return item ? item.configuracao : null;
  }

  /**
   * Limpa o histórico
   */
  static clearHistory(): void {
    const data = this.loadData();
    data.historico = [];
    this.saveData(data);
  }

  // ============================================================================
  // EXPORTAÇÃO E IMPORTAÇÃO
  // ============================================================================

  /**
   * Exporta configuração como JSON
   */
  static exportConfig(config: PersonalizationConfig, metadata?: any): string {
    const exportData = {
      configuracao: config,
      metadata: {
        dataExportacao: new Date().toISOString(),
        versaoSistema: this.VERSION,
        versaoConfig: '1.0',
        compatibilidade: ['1.0'],
        ...metadata
      }
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importa configuração de JSON
   */
  static importConfig(jsonString: string): PersonalizationConfig {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.configuracao) {
        throw new Error('Arquivo inválido: configuração não encontrada');
      }
      
      // Verificar compatibilidade
      if (data.metadata?.versaoConfig && !this.isCompatibleVersion(data.metadata.versaoConfig)) {
        throw new Error('Versão da configuração não compatível');
      }
      
      // Sanitizar e validar
      const sanitized = PersonalizationSanitizer.sanitize(data.configuracao);
      const validation = PersonalizationValidator.validate(sanitized);
      
      if (!validation.valido) {
        console.warn('Configuração importada com avisos:', validation.warnings);
        if (validation.errors.length > 0) {
          throw new Error(`Configuração inválida: ${validation.errors[0].mensagem}`);
        }
      }
      
      return sanitized;
    } catch (error) {
      throw new Error(`Erro ao importar configuração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Exporta todos os dados (templates + configurações)
   */
  static exportAllData(): string {
    const data = this.loadData();
    return JSON.stringify({
      ...data,
      exportInfo: {
        dataExportacao: new Date().toISOString(),
        versaoSistema: this.VERSION
      }
    }, null, 2);
  }

  /**
   * Importa todos os dados
   */
  static importAllData(jsonString: string, overwrite: boolean = false): void {
    try {
      const importedData = JSON.parse(jsonString);
      
      if (!importedData.templates || !Array.isArray(importedData.templates)) {
        throw new Error('Arquivo inválido: templates não encontrados');
      }
      
      const currentData = this.loadData();
      
      if (overwrite) {
        // Substituir todos os dados
        this.saveData({
          ...importedData,
          configuracoes: {
            versao: this.VERSION,
            ultimaAtualizacao: new Date().toISOString()
          }
        });
      } else {
        // Mesclar dados
        const mergedTemplates = [...currentData.templates];
        
        importedData.templates.forEach((template: Template) => {
          const existingIndex = mergedTemplates.findIndex(t => t.id === template.id);
          if (existingIndex >= 0) {
            mergedTemplates[existingIndex] = template;
          } else {
            mergedTemplates.push(template);
          }
        });
        
        this.saveData({
          ...currentData,
          templates: mergedTemplates,
          configuracaoAtual: importedData.configuracaoAtual || currentData.configuracaoAtual
        });
      }
    } catch (error) {
      throw new Error(`Erro ao importar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  // ============================================================================
  // TEMPLATES OFICIAIS
  // ============================================================================

  /**
   * Cria templates oficiais baseados nos cenários padrão
   */
  private static createOfficialTemplates(): void {
    const scenarios = [
      { scenario: ConfigScenario.COMPLETO, nome: 'Relatório Completo', descricao: 'Todas as informações e seções disponíveis' },
      { scenario: ConfigScenario.RESPONSAVEL, nome: 'Lista para Responsável', descricao: 'Sem informações financeiras, foco operacional' },
      { scenario: ConfigScenario.PASSAGEIROS, nome: 'Lista para Passageiros', descricao: 'Informações essenciais, agrupado por ônibus' },
      { scenario: ConfigScenario.EMPRESA_ONIBUS, nome: 'Lista para Empresa de Ônibus', descricao: 'CPF, data nascimento e dados de embarque' },
      { scenario: ConfigScenario.COMPRAR_INGRESSOS, nome: 'Lista para Compra de Ingressos', descricao: 'Foco em setores e dados de ingressos' },
      { scenario: ConfigScenario.COMPRAR_PASSEIOS, nome: 'Lista para Compra de Passeios', descricao: 'Foco em passeios e faixas etárias' },
      { scenario: ConfigScenario.TRANSFER, nome: 'Lista para Transfer', descricao: 'Agrupado por ônibus com dados de rota' }
    ];

    scenarios.forEach(({ scenario, nome, descricao }) => {
      const config = DEFAULT_CONFIGS[scenario]();
      
      const template: Template = {
        id: `oficial-${scenario}`,
        nome,
        descricao,
        categoria: 'oficial',
        configuracao: config,
        metadata: {
          ...config.metadata,
          nome,
          categoria: 'oficial',
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        }
      };
      
      const data = this.loadData();
      const existingIndex = data.templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        data.templates[existingIndex] = template;
      } else {
        data.templates.push(template);
      }
      
      this.saveData(data);
    });
  }

  // ============================================================================
  // UTILITÁRIOS PRIVADOS
  // ============================================================================

  /**
   * Gera ID único para template
   */
  private static generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera ID único para item do histórico
   */
  private static generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se uma versão é compatível
   */
  private static isCompatibleVersion(version: string): boolean {
    // Por enquanto, apenas versão 1.0 é suportada
    return version === '1.0';
  }

  /**
   * Migra dados de versões antigas
   */
  private static migrateData(data: StorageData): void {
    // Implementar migrações futuras aqui
    console.log('Migrando dados para versão', this.VERSION);
    
    data.configuracoes.versao = this.VERSION;
    this.saveData(data);
  }

  // ============================================================================
  // LIMPEZA E MANUTENÇÃO
  // ============================================================================

  /**
   * Limpa dados antigos e otimiza armazenamento
   */
  static cleanup(): void {
    const data = this.loadData();
    
    // Remover itens antigos do histórico
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    data.historico = data.historico.filter(item => 
      new Date(item.timestamp) > thirtyDaysAgo
    );
    
    // Limitar número de templates personalizados
    const personalizedTemplates = data.templates.filter(t => t.categoria === 'personalizado');
    if (personalizedTemplates.length > 50) {
      // Manter apenas os 50 mais recentes
      const sorted = personalizedTemplates.sort((a, b) => 
        new Date(b.metadata.atualizadoEm).getTime() - new Date(a.metadata.atualizadoEm).getTime()
      );
      
      const toKeep = sorted.slice(0, 50);
      data.templates = [
        ...data.templates.filter(t => t.categoria !== 'personalizado'),
        ...toKeep
      ];
    }
    
    this.saveData(data);
  }

  /**
   * Reseta todos os dados para padrão
   */
  static reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initialize();
  }

  /**
   * Obtém estatísticas de uso
   */
  static getStats(): {
    totalTemplates: number;
    templatesOficiais: number;
    templatesPersonalizados: number;
    templatesCompartilhados: number;
    itensHistorico: number;
    tamanhoArmazenamento: number;
  } {
    const data = this.loadData();
    const storageSize = new Blob([JSON.stringify(data)]).size;
    
    return {
      totalTemplates: data.templates.length,
      templatesOficiais: data.templates.filter(t => t.categoria === 'oficial').length,
      templatesPersonalizados: data.templates.filter(t => t.categoria === 'personalizado').length,
      templatesCompartilhados: data.templates.filter(t => t.categoria === 'compartilhado').length,
      itensHistorico: data.historico.length,
      tamanhoArmazenamento: storageSize
    };
  }
}