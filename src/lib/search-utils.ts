/**
 * Utilitários para busca e filtros otimizados
 */

/**
 * Remove acentos e converte para lowercase para busca normalizada
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

/**
 * Verifica se um termo de busca está contido em um texto
 */
export function containsSearchTerm(text: string, searchTerm: string): boolean {
  if (!text || !searchTerm) return false;
  
  const normalizedText = normalizeText(text);
  const normalizedSearchTerm = normalizeText(searchTerm);
  
  return normalizedText.includes(normalizedSearchTerm);
}

/**
 * Busca um termo em múltiplos campos de texto
 */
export function searchInFields(fields: (string | null | undefined)[], searchTerm: string): boolean {
  if (!searchTerm.trim()) return true; // Se não há termo, mostra todos
  
  return fields.some(field => {
    if (!field) return false;
    return containsSearchTerm(field, searchTerm);
  });
}

/**
 * Extrai termos de busca de uma string, dividindo por espaços
 */
export function extractSearchTerms(searchText: string): string[] {
  return searchText
    .trim()
    .split(/\s+/)
    .filter(term => term.length > 0);
}

/**
 * Verifica se todos os termos de busca estão presentes nos campos
 */
export function matchesAllTerms(fields: (string | null | undefined)[], searchText: string): boolean {
  const terms = extractSearchTerms(searchText);
  if (terms.length === 0) return true;
  
  return terms.every(term => searchInFields(fields, term));
}

/**
 * Cria texto pesquisável concatenando todos os campos relevantes
 */
export function createSearchableText(fields: (string | null | undefined)[]): string {
  return fields
    .filter(Boolean)
    .join(' ')
    .trim();
}

/**
 * Interface para configuração de busca
 */
export interface SearchConfig {
  caseSensitive?: boolean;
  accentSensitive?: boolean;
  partialMatch?: boolean;
  minTermLength?: number;
}

/**
 * Configuração padrão para busca
 */
export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  caseSensitive: false,
  accentSensitive: false,
  partialMatch: true,
  minTermLength: 1
};