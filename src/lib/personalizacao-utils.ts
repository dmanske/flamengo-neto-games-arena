/**
 * Utilitários para trabalhar com configurações de personalização de relatórios
 */

import {
  PersonalizationConfig,
  PassageiroColumn,
  SecaoConfig,
  Template,
  ExportData,
  ShareableConfig,
  ValidationResult
} from '@/types/personalizacao-relatorios';
import { PersonalizationValidator, PersonalizationSanitizer } from '@/lib/validations/personalizacao-relatorios';

// ============================================================================
// MANIPULAÇÃO DE COLUNAS
// ============================================================================

/**
 * Reordena as colunas de passageiros
 */
export function reorderColumns(colunas: PassageiroColumn[], fromIndex: number, toIndex: number): PassageiroColumn[] {
  const result = [...colunas];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Atualizar ordens
  return result.map((col, index) => ({
    ...col,
    ordem: index
  }));
}

/**
 * Alterna a visibilidade de uma coluna
 */
export function toggleColumnVisibility(colunas: PassageiroColumn[], columnId: keyof any): PassageiroColumn[] {
  return colunas.map(col => 
    col.id === columnId 
      ? { ...col, visivel: !col.visivel }
      : col
  );
}

/**
 * Atualiza a largura de uma coluna
 */
export function updateColumnWidth(colunas: PassageiroColumn[], columnId: keyof any, width: number): PassageiroColumn[] {
  return colunas.map(col => 
    col.id === columnId 
      ? { ...col, largura: Math.max(50, Math.min(500, width)) }
      : col
  );
}

/**
 * Obtém apenas as colunas visíveis, ordenadas
 */
export function getVisibleColumns(colunas: PassageiroColumn[]): PassageiroColumn[] {
  return colunas
    .filter(col => col.visivel)
    .sort((a, b) => a.ordem - b.ordem);
}

/**
 * Calcula a largura total das colunas visíveis
 */
export function calculateTotalWidth(colunas: PassageiroColumn[]): number {
  return getVisibleColumns(colunas)
    .reduce((total, col) => total + (col.largura || 100), 0);
}

// ============================================================================
// MANIPULAÇÃO DE SEÇÕES
// ============================================================================

/**
 * Reordena as seções do relatório
 */
export function reorderSections(secoes: SecaoConfig[], fromIndex: number, toIndex: number): SecaoConfig[] {
  const result = [...secoes];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  
  // Atualizar ordens
  return result.map((secao, index) => ({
    ...secao,
    ordem: index
  }));
}

/**
 * Alterna a visibilidade de uma seção
 */
export function toggleSectionVisibility(secoes: SecaoConfig[], sectionId: string): SecaoConfig[] {
  return secoes.map(secao => 
    secao.id === sectionId 
      ? { ...secao, visivel: !secao.visivel }
      : secao
  );
}

/**
 * Obtém apenas as seções visíveis, ordenadas
 */
export function getVisibleSections(secoes: SecaoConfig[]): SecaoConfig[] {
  return secoes
    .filter(secao => secao.visivel)
    .sort((a, b) => a.ordem - b.ordem);
}

// ============================================================================
// CLONAGEM E MERGE DE CONFIGURAÇÕES
// ============================================================================

/**
 * Clona uma configuração profundamente
 */
export function cloneConfig(config: PersonalizationConfig): PersonalizationConfig {
  return JSON.parse(JSON.stringify(config));
}

/**
 * Faz merge de duas configurações, priorizando a segunda
 */
export function mergeConfigs(base: PersonalizationConfig, override: Partial<PersonalizationConfig>): PersonalizationConfig {
  const merged = cloneConfig(base);
  
  // Merge header
  if (override.header) {
    merged.header = { ...merged.header, ...override.header };
  }
  
  // Merge passageiros
  if (override.passageiros) {
    merged.passageiros = { ...merged.passageiros, ...override.passageiros };
  }
  
  // Merge ônibus
  if (override.onibus) {
    merged.onibus = { ...merged.onibus, ...override.onibus };
  }
  
  // Merge passeios
  if (override.passeios) {
    merged.passeios = { ...merged.passeios, ...override.passeios };
  }
  
  // Merge seções
  if (override.secoes) {
    merged.secoes = { ...merged.secoes, ...override.secoes };
  }
  
  // Merge estilo
  if (override.estilo) {
    merged.estilo = { ...merged.estilo, ...override.estilo };
  }
  
  // Merge metadata
  if (override.metadata) {
    merged.metadata = { ...merged.metadata, ...override.metadata };
  }
  
  return merged;
}

// ============================================================================
// COMPARAÇÃO DE CONFIGURAÇÕES
// ============================================================================

/**
 * Compara duas configurações e retorna as diferenças
 */
export function compareConfigs(config1: PersonalizationConfig, config2: PersonalizationConfig): string[] {
  const differences: string[] = [];
  
  // Comparar header
  if (JSON.stringify(config1.header) !== JSON.stringify(config2.header)) {
    differences.push('Header');
  }
  
  // Comparar passageiros
  if (JSON.stringify(config1.passageiros) !== JSON.stringify(config2.passageiros)) {
    differences.push('Configuração de Passageiros');
  }
  
  // Comparar ônibus
  if (JSON.stringify(config1.onibus) !== JSON.stringify(config2.onibus)) {
    differences.push('Configuração de Ônibus');
  }
  
  // Comparar passeios
  if (JSON.stringify(config1.passeios) !== JSON.stringify(config2.passeios)) {
    differences.push('Configuração de Passeios');
  }
  
  // Comparar seções
  if (JSON.stringify(config1.secoes) !== JSON.stringify(config2.secoes)) {
    differences.push('Configuração de Seções');
  }
  
  // Comparar estilo
  if (JSON.stringify(config1.estilo) !== JSON.stringify(config2.estilo)) {
    differences.push('Configuração de Estilo');
  }
  
  return differences;
}

/**
 * Verifica se duas configurações são idênticas
 */
export function areConfigsEqual(config1: PersonalizationConfig, config2: PersonalizationConfig): boolean {
  return compareConfigs(config1, config2).length === 0;
}

// ============================================================================
// EXPORTAÇÃO E IMPORTAÇÃO
// ============================================================================

/**
 * Exporta uma configuração para JSON
 */
export function exportConfig(config: PersonalizationConfig, metadata?: any): string {
  const exportData: ExportData = {
    configuracao: config,
    metadata: {
      dataExportacao: new Date().toISOString(),
      versaoConfig: '1.0',
      compatibilidade: ['1.0'],
      ...metadata
    },
    versaoSistema: '1.0'
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Importa uma configuração de JSON
 */
export function importConfig(jsonString: string): PersonalizationConfig {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    
    // Validar estrutura básica
    if (!data.configuracao) {
      throw new Error('Arquivo de configuração inválido: configuração não encontrada');
    }
    
    // Sanitizar a configuração importada
    const sanitized = PersonalizationSanitizer.sanitize(data.configuracao);
    
    // Validar a configuração
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

// ============================================================================
// URLs COMPARTILHÁVEIS
// ============================================================================

/**
 * Gera uma URL compartilhável para uma configuração
 */
export function generateShareableUrl(config: PersonalizationConfig, baseUrl: string = window.location.origin): string {
  try {
    // Comprimir a configuração
    const compressed = compressConfig(config);
    
    // Gerar URL
    const url = new URL(baseUrl);
    url.searchParams.set('config', compressed);
    
    return url.toString();
  } catch (error) {
    throw new Error('Erro ao gerar URL compartilhável');
  }
}

/**
 * Extrai uma configuração de uma URL compartilhável
 */
export function extractConfigFromUrl(url: string): PersonalizationConfig | null {
  try {
    const urlObj = new URL(url);
    const configParam = urlObj.searchParams.get('config');
    
    if (!configParam) {
      return null;
    }
    
    return decompressConfig(configParam);
  } catch (error) {
    console.error('Erro ao extrair configuração da URL:', error);
    return null;
  }
}

/**
 * Comprime uma configuração para uso em URL
 */
function compressConfig(config: PersonalizationConfig): string {
  try {
    const json = JSON.stringify(config);
    // Usar btoa para encoding base64 simples
    return btoa(encodeURIComponent(json));
  } catch (error) {
    throw new Error('Erro ao comprimir configuração');
  }
}

/**
 * Descomprime uma configuração de URL
 */
function decompressConfig(compressed: string): PersonalizationConfig {
  try {
    const json = decodeURIComponent(atob(compressed));
    const config = JSON.parse(json) as PersonalizationConfig;
    
    // Sanitizar e validar
    return PersonalizationSanitizer.sanitize(config);
  } catch (error) {
    throw new Error('Erro ao descomprimir configuração');
  }
}

// ============================================================================
// TEMPLATES
// ============================================================================

/**
 * Converte uma configuração em template
 */
export function configToTemplate(config: PersonalizationConfig, templateData: Partial<Template>): Template {
  return {
    id: templateData.id || generateTemplateId(),
    nome: templateData.nome || 'Novo Template',
    descricao: templateData.descricao,
    categoria: templateData.categoria || 'personalizado',
    configuracao: cloneConfig(config),
    metadata: {
      ...config.metadata,
      nome: templateData.nome || config.metadata.nome,
      categoria: templateData.categoria || 'personalizado'
    }
  };
}

/**
 * Gera um ID único para template
 */
function generateTemplateId(): string {
  return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// ARMAZENAMENTO LOCAL
// ============================================================================

const STORAGE_KEY = 'personalization-data';

/**
 * Interface para dados armazenados localmente
 */
interface StoredData {
  templates: Template[];
  configuracaoAtual?: PersonalizationConfig;
  historico: Array<{
    id: string;
    configuracao: PersonalizationConfig;
    timestamp: string;
    acao: string;
  }>;
}

/**
 * Salva dados no localStorage
 */
export function saveToLocalStorage(data: Partial<StoredData>): void {
  try {
    const existing = getFromLocalStorage();
    const updated = { ...existing, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
}

/**
 * Carrega dados do localStorage
 */
export function getFromLocalStorage(): StoredData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { templates: [], historico: [] };
    }
    
    return JSON.parse(stored) as StoredData;
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return { templates: [], historico: [] };
  }
}

/**
 * Salva um template no localStorage
 */
export function saveTemplate(template: Template): void {
  const data = getFromLocalStorage();
  const existingIndex = data.templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    data.templates[existingIndex] = template;
  } else {
    data.templates.push(template);
  }
  
  saveToLocalStorage({ templates: data.templates });
}

/**
 * Remove um template do localStorage
 */
export function removeTemplate(templateId: string): void {
  const data = getFromLocalStorage();
  data.templates = data.templates.filter(t => t.id !== templateId);
  saveToLocalStorage({ templates: data.templates });
}

/**
 * Carrega todos os templates do localStorage
 */
export function loadTemplates(): Template[] {
  return getFromLocalStorage().templates;
}

// ============================================================================
// HISTÓRICO DE CONFIGURAÇÕES
// ============================================================================

/**
 * Adiciona uma configuração ao histórico
 */
export function addToHistory(config: PersonalizationConfig, acao: string = 'modificado'): void {
  const data = getFromLocalStorage();
  
  const historyItem = {
    id: `history_${Date.now()}`,
    configuracao: cloneConfig(config),
    timestamp: new Date().toISOString(),
    acao
  };
  
  data.historico.unshift(historyItem);
  
  // Manter apenas os últimos 10 itens
  if (data.historico.length > 10) {
    data.historico = data.historico.slice(0, 10);
  }
  
  saveToLocalStorage({ historico: data.historico });
}

/**
 * Carrega o histórico de configurações
 */
export function loadHistory(): Array<{ id: string; configuracao: PersonalizationConfig; timestamp: string; acao: string }> {
  return getFromLocalStorage().historico;
}

// ============================================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================================

/**
 * Formata um valor de acordo com a configuração da coluna
 */
export function formatColumnValue(value: any, column: PassageiroColumn): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const formatacao = column.formatacao;
  if (!formatacao) {
    return String(value);
  }
  
  switch (formatacao.tipo) {
    case 'moeda':
      const numero = typeof value === 'number' ? value : parseFloat(value);
      return `${formatacao.prefixo || ''}${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}${formatacao.sufixo || ''}`;
    
    case 'cpf':
      const cpf = String(value).replace(/\D/g, '');
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    case 'telefone':
      const telefone = String(value).replace(/\D/g, '');
      if (telefone.length === 11) {
        return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (telefone.length === 10) {
        return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      return String(value);
    
    case 'data':
      try {
        const data = new Date(value);
        return data.toLocaleDateString('pt-BR');
      } catch {
        return String(value);
      }
    
    case 'numero':
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num) ? String(value) : num.toLocaleString('pt-BR');
    
    default:
      return String(value);
  }
}