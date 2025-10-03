/**
 * =====================================================
 * HOOK - OTIMIZAÇÃO DE PERFORMANCE PARA TEMPLATES
 * =====================================================
 * 
 * Hook com otimizações de performance, cache, debounce
 * e lazy loading para o sistema de templates.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WhatsAppTemplate, TemplateFilters } from '@/types/whatsapp-templates';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';

// =====================================================
// INTERFACES
// =====================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live em ms
}

interface PerformanceMetrics {
  searchTime: number;
  renderTime: number;
  cacheHits: number;
  cacheMisses: number;
}

// =====================================================
// CACHE MANAGER
// =====================================================

class TemplateCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutos
  
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Verificar se expirou
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  size(): number {
    return this.cache.size;
  }
  
  // Limpar entradas expiradas
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// =====================================================
// DEBOUNCE HOOK
// =====================================================

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useTemplatePerformance() {
  const {
    templates,
    loading,
    error,
    searchTemplates,
    filterByCategory,
    clearFilters
  } = useWhatsAppTemplates();
  
  // =====================================================
  // ESTADOS E REFS
  // =====================================================
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    searchTime: 0,
    renderTime: 0,
    cacheHits: 0,
    cacheMisses: 0
  });
  
  const cacheRef = useRef(new TemplateCache());
  const searchStartTimeRef = useRef<number>(0);
  const renderStartTimeRef = useRef<number>(0);
  
  // =====================================================
  // DEBOUNCED VALUES
  // =====================================================
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedCategory = useDebounce(selectedCategory, 100);
  
  // =====================================================
  // MEMOIZED VALUES
  // =====================================================
  
  // Templates filtrados com cache
  const filteredTemplates = useMemo(() => {
    const startTime = performance.now();
    
    // Criar chave de cache
    const cacheKey = `filtered_${debouncedSearchQuery}_${debouncedCategory}`;
    
    // Tentar buscar do cache
    const cached = cacheRef.current.get<WhatsAppTemplate[]>(cacheKey);
    if (cached) {
      setMetrics(prev => ({ ...prev, cacheHits: prev.cacheHits + 1 }));
      return cached;
    }
    
    // Filtrar templates
    let filtered = templates.filter(t => t.ativo);
    
    // Filtro por categoria
    if (debouncedCategory !== 'todos') {
      filtered = filtered.filter(t => t.categoria === debouncedCategory);
    }
    
    // Filtro por busca
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.nome.toLowerCase().includes(query) ||
        t.mensagem.toLowerCase().includes(query) ||
        t.variaveis.some(v => v.toLowerCase().includes(query))
      );
    }
    
    // Salvar no cache
    cacheRef.current.set(cacheKey, filtered, 2 * 60 * 1000); // 2 minutos
    
    // Atualizar métricas
    const endTime = performance.now();
    setMetrics(prev => ({
      ...prev,
      searchTime: endTime - startTime,
      cacheMisses: prev.cacheMisses + 1
    }));
    
    return filtered;
  }, [templates, debouncedSearchQuery, debouncedCategory]);
  
  // Templates agrupados por categoria (memoizado)
  const templatesByCategory = useMemo(() => {
    const cacheKey = `grouped_${debouncedSearchQuery}_${debouncedCategory}`;
    
    const cached = cacheRef.current.get<Record<string, WhatsAppTemplate[]>>(cacheKey);
    if (cached) {
      return cached;
    }
    
    const grouped = filteredTemplates.reduce((acc, template) => {
      if (!acc[template.categoria]) {
        acc[template.categoria] = [];
      }
      acc[template.categoria].push(template);
      return acc;
    }, {} as Record<string, WhatsAppTemplate[]>);
    
    cacheRef.current.set(cacheKey, grouped);
    return grouped;
  }, [filteredTemplates, debouncedSearchQuery, debouncedCategory]);
  
  // Estatísticas (memoizadas)
  const stats = useMemo(() => {
    const categoryCounts = Object.entries(templatesByCategory).map(([category, templates]) => ({
      category,
      count: templates.length
    }));
    
    return {
      total: filteredTemplates.length,
      totalAtivos: templates.filter(t => t.ativo).length,
      totalInativos: templates.filter(t => !t.ativo).length,
      byCategory: categoryCounts,
      hasFilters: debouncedSearchQuery.trim() !== '' || debouncedCategory !== 'todos'
    };
  }, [filteredTemplates, templates, templatesByCategory, debouncedSearchQuery, debouncedCategory]);
  
  // =====================================================
  // CALLBACKS OTIMIZADOS
  // =====================================================
  
  /**
   * Buscar templates com métricas
   */
  const handleSearch = useCallback((query: string) => {
    searchStartTimeRef.current = performance.now();
    setSearchQuery(query);
    
    // Limpar cache relacionado à busca
    cacheRef.current.clear();
  }, []);
  
  /**
   * Filtrar por categoria com métricas
   */
  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category);
    
    // Limpar cache relacionado à categoria
    cacheRef.current.clear();
  }, []);
  
  /**
   * Limpar todos os filtros
   */
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('todos');
    cacheRef.current.clear();
    clearFilters();
  }, [clearFilters]);
  
  /**
   * Pré-carregar templates por categoria
   */
  const preloadCategory = useCallback((category: string) => {
    const cacheKey = `filtered__${category}`;
    
    if (!cacheRef.current.get(cacheKey)) {
      const filtered = templates.filter(t => 
        t.ativo && (category === 'todos' || t.categoria === category)
      );
      cacheRef.current.set(cacheKey, filtered);
    }
  }, [templates]);
  
  /**
   * Otimizar renderização com virtual scrolling
   */
  const getVisibleTemplates = useCallback((startIndex: number, endIndex: number) => {
    return filteredTemplates.slice(startIndex, endIndex + 1);
  }, [filteredTemplates]);
  
  // =====================================================
  // EFFECTS
  // =====================================================
  
  // Cleanup do cache periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      cacheRef.current.cleanup();
    }, 60000); // 1 minuto
    
    return () => clearInterval(interval);
  }, []);
  
  // Pré-carregar categorias populares
  useEffect(() => {
    if (templates.length > 0) {
      ['confirmacao', 'grupo', 'lembrete'].forEach(category => {
        preloadCategory(category);
      });
    }
  }, [templates, preloadCategory]);
  
  // Medir tempo de renderização
  useEffect(() => {
    if (renderStartTimeRef.current > 0) {
      const renderTime = performance.now() - renderStartTimeRef.current;
      setMetrics(prev => ({ ...prev, renderTime }));
      renderStartTimeRef.current = 0;
    }
  });
  
  // =====================================================
  // FUNÇÕES UTILITÁRIAS
  // =====================================================
  
  /**
   * Iniciar medição de renderização
   */
  const startRenderMeasure = useCallback(() => {
    renderStartTimeRef.current = performance.now();
  }, []);
  
  /**
   * Obter métricas de performance
   */
  const getPerformanceMetrics = useCallback(() => {
    return {
      ...metrics,
      cacheSize: cacheRef.current.size(),
      templatesLoaded: templates.length,
      filteredCount: filteredTemplates.length
    };
  }, [metrics, templates.length, filteredTemplates.length]);
  
  /**
   * Resetar métricas
   */
  const resetMetrics = useCallback(() => {
    setMetrics({
      searchTime: 0,
      renderTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    });
  }, []);
  
  // =====================================================
  // RETORNO DO HOOK
  // =====================================================
  
  return {
    // Estados básicos
    templates: filteredTemplates,
    templatesByCategory,
    loading,
    error,
    stats,
    
    // Filtros
    searchQuery,
    selectedCategory,
    debouncedSearchQuery,
    debouncedCategory,
    
    // Funções de filtro
    handleSearch,
    handleCategoryFilter,
    handleClearFilters,
    
    // Performance
    getVisibleTemplates,
    preloadCategory,
    startRenderMeasure,
    getPerformanceMetrics,
    resetMetrics,
    
    // Cache
    clearCache: () => cacheRef.current.clear(),
    cacheSize: cacheRef.current.size()
  };
}