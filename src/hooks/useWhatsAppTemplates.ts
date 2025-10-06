/**
 * =====================================================
 * HOOK - GERENCIAMENTO DE TEMPLATES WHATSAPP
 * =====================================================
 * 
 * Hook personalizado para gerenciar templates de WhatsApp,
 * incluindo CRUD completo, cache, filtros e processamento
 * de variáveis.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  WhatsAppTemplate,
  CreateTemplateData,
  UpdateTemplateData,
  TemplateFilters,
  TemplatesResponse,
  SelectedTemplate,
  ViagemData,
  PassageiroData,
  VariableMapping,
  PreviewResult,
  TemplateVariable,
  VARIABLE_DESCRIPTIONS
} from '@/types/whatsapp-templates';

// =====================================================
// INTERFACE DO HOOK
// =====================================================

interface TemplateGroup {
  categoria: string;
  emoji: string;
  templates: WhatsAppTemplate[];
  count: number;
}

interface TemplateSearchState {
  query: string;
  selectedCategory: string | null;
  filteredTemplates: WhatsAppTemplate[];
  isSearching: boolean;
}

interface TemplateCacheState {
  status: 'loading' | 'fresh' | 'stale' | 'error';
  lastUpdated: Date | null;
  ttl: number;
}

interface UseWhatsAppTemplatesReturn {
  // Estados
  templates: WhatsAppTemplate[];
  loading: boolean;
  error: string | null;
  
  // CRUD Operations
  createTemplate: (data: CreateTemplateData) => Promise<WhatsAppTemplate>;
  updateTemplate: (data: UpdateTemplateData) => Promise<WhatsAppTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => Promise<WhatsAppTemplate | null>;
  
  // Listagem e Filtros
  loadTemplates: (filters?: TemplateFilters) => Promise<void>;
  searchTemplates: (query: string) => void;
  filterByCategory: (category: string) => void;
  clearFilters: () => void;
  
  // Processamento de Templates
  processTemplate: (template: WhatsAppTemplate, viagem: ViagemData, passageiro: PassageiroData, customVars?: Record<string, string>) => string;
  previewTemplate: (template: WhatsAppTemplate, viagem?: Partial<ViagemData>, passageiro?: Partial<PassageiroData>) => PreviewResult;
  extractVariables: (mensagem: string) => TemplateVariable[];
  
  // Seleção de Templates
  selectedTemplates: SelectedTemplate[];
  selectTemplate: (template: WhatsAppTemplate) => void;
  unselectTemplate: (templateId: string) => void;
  updateSelectedTemplate: (templateId: string, mensagem: string, customVars?: Record<string, string>) => void;
  clearSelection: () => void;
  
  // Utilitários
  reloadTemplates: () => Promise<void>;
  getTemplatesByCategory: (category: string) => WhatsAppTemplate[];
  validateTemplate: (data: CreateTemplateData) => { valid: boolean; errors: string[] };
  
  // Novas funcionalidades para reformulação
  getTemplatesGroupedByCategory: () => Record<string, TemplateGroup>;
  searchTemplatesRealTime: (query: string) => WhatsAppTemplate[];
  getTemplatePreview: (template: WhatsAppTemplate, dadosViagem?: any) => string;
  getCategoryStats: () => Record<string, number>;
  
  // Cache inteligente
  cacheState: TemplateCacheState;
  refreshCache: () => Promise<void>;
  
  // Estados de busca
  searchState: TemplateSearchState;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useWhatsAppTemplates(): UseWhatsAppTemplatesReturn {
  
  // =====================================================
  // ESTADOS
  // =====================================================
  
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({});
  const [selectedTemplates, setSelectedTemplates] = useState<SelectedTemplate[]>([]);
  
  // Novos estados para reformulação
  const [cacheState, setCacheState] = useState<TemplateCacheState>({
    status: 'loading',
    lastUpdated: null,
    ttl: 5 * 60 * 1000 // 5 minutos
  });
  
  const [searchState, setSearchState] = useState<TemplateSearchState>({
    query: '',
    selectedCategory: null,
    filteredTemplates: [],
    isSearching: false
  });
  
  // Cache para templates processados
  const [templateCache, setTemplateCache] = useState<Map<string, any>>(new Map());
  
  // Mapeamento de emojis por categoria
  const CATEGORY_EMOJIS: Record<string, string> = {
    'confirmacao': '✅',
    'grupo': '👥',
    'lembrete': '⏰',
    'cobranca': '💰',
    'informativo': '📋',
    'promocional': '🎉',
    'outros': '📱'
  };
  
  // =====================================================
  // FUNÇÕES CRUD
  // =====================================================
  
  /**
   * Criar novo template
   */
  const createTemplate = useCallback(async (data: CreateTemplateData): Promise<WhatsAppTemplate> => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar dados
      const validation = validateTemplate(data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // Extrair variáveis automaticamente se não fornecidas
      const variaveis = data.variaveis || extractVariables(data.mensagem);
      
      const templateData = {
        ...data,
        variaveis,
        ativo: data.ativo ?? true
      };
      
      const { data: newTemplate, error } = await supabase
        .from('whatsapp_templates')
        .insert([templateData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setTemplates(prev => [newTemplate, ...prev]);
      
      toast.success('Template criado com sucesso!');
      return newTemplate;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar template';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Atualizar template existente
   */
  const updateTemplate = useCallback(async (data: UpdateTemplateData): Promise<WhatsAppTemplate> => {
    try {
      setLoading(true);
      setError(null);
      
      const { id, ...updateData } = data;
      
      // Extrair variáveis se mensagem foi alterada
      if (updateData.mensagem) {
        updateData.variaveis = extractVariables(updateData.mensagem);
      }
      
      const { data: updatedTemplate, error } = await supabase
        .from('whatsapp_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Atualizar lista local
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      
      toast.success('Template atualizado com sucesso!');
      return updatedTemplate;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar template';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Excluir template
   */
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remover da lista local
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      // Remover da seleção se estiver selecionado
      setSelectedTemplates(prev => prev.filter(st => st.template.id !== id));
      
      toast.success('Template excluído com sucesso!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir template';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Buscar template por ID
   */
  const getTemplate = useCallback(async (id: string): Promise<WhatsAppTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
      
    } catch (err) {
      console.error('Erro ao buscar template:', err);
      return null;
    }
  }, []);
  
  // =====================================================
  // FUNÇÕES DE LISTAGEM E FILTROS
  // =====================================================
  
  /**
   * Carregar templates com filtros
   */
  const loadTemplates = useCallback(async (newFilters?: TemplateFilters): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = newFilters || filters;
      
      let query = supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Aplicar filtros
      if (currentFilters.categoria) {
        query = query.eq('categoria', currentFilters.categoria);
      }
      
      if (currentFilters.ativo !== undefined) {
        query = query.eq('ativo', currentFilters.ativo);
      }
      
      if (currentFilters.busca) {
        query = query.or(`nome.ilike.%${currentFilters.busca}%,mensagem.ilike.%${currentFilters.busca}%`);
      }
      
      // Paginação
      if (currentFilters.page && currentFilters.limit) {
        const from = (currentFilters.page - 1) * currentFilters.limit;
        const to = from + currentFilters.limit - 1;
        query = query.range(from, to);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setTemplates(data || []);
      setFilters(currentFilters);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMessage);
      console.error('Erro ao carregar templates:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);
  
  /**
   * Buscar templates por texto
   */
  const searchTemplates = useCallback((query: string) => {
    const newFilters = { ...filters, busca: query };
    loadTemplates(newFilters);
  }, [filters, loadTemplates]);
  
  /**
   * Filtrar por categoria
   */
  const filterByCategory = useCallback((category: string) => {
    const newFilters = { 
      ...filters, 
      categoria: category === 'todos' ? undefined : category as any 
    };
    loadTemplates(newFilters);
  }, [filters, loadTemplates]);
  
  /**
   * Limpar filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    loadTemplates({});
  }, [loadTemplates]);
  
  // =====================================================
  // PROCESSAMENTO DE TEMPLATES
  // =====================================================
  
  /**
   * Extrair variáveis de uma mensagem
   */
  const extractVariables = useCallback((mensagem: string): TemplateVariable[] => {
    const regex = /\{([A-Z_]+)\}/g;
    const matches = mensagem.match(regex);
    
    if (!matches) return [];
    
    const variables = matches
      .map(match => match.replace(/[{}]/g, ''))
      .filter((variable, index, array) => array.indexOf(variable) === index) // Remove duplicatas
      .filter(variable => Object.keys(VARIABLE_DESCRIPTIONS).includes(variable)) as TemplateVariable[];
    
    return variables;
  }, []);
  
  /**
   * Processar template substituindo variáveis
   */
  const processTemplate = useCallback((
    template: WhatsAppTemplate,
    viagem: ViagemData,
    passageiro: PassageiroData,
    customVars?: Record<string, string>
  ): string => {
    
    // Criar mapeamento de variáveis
    const variableMapping: VariableMapping = {
      NOME: passageiro.nome,
      DESTINO: viagem.destino,
      ADVERSARIO: viagem.destino, // Por padrão usa destino, mas pode ser customizado
      DATA: new Date(viagem.data_viagem).toLocaleDateString('pt-BR'),
      HORARIO: viagem.horario_saida,
      HORARIO_CHEGADA: calculateArrivalTime(viagem.horario_saida), // 30min antes
      LOCAL_SAIDA: viagem.local_saida,
      ONIBUS: viagem.onibus?.numero || viagem.onibus?.nome || 'A definir',
      LINK_GRUPO: viagem.link_grupo || 'Link será enviado em breve',
      VALOR: passageiro.valor_total ? `R$ ${passageiro.valor_total.toFixed(2).replace('.', ',')}` : 'A definir',
      TELEFONE: viagem.telefone_contato || '(11) 99999-9999'
    };
    
    // Aplicar variáveis customizadas
    if (customVars) {
      Object.assign(variableMapping, customVars);
    }
    
    // Substituir variáveis na mensagem
    let mensagemProcessada = template.mensagem;
    
    Object.entries(variableMapping).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      mensagemProcessada = mensagemProcessada.replace(regex, value);
    });
    
    return mensagemProcessada;
  }, []);
  
  /**
   * Preview de template com dados simulados
   */
  const previewTemplate = useCallback((
    template: WhatsAppTemplate,
    viagem?: Partial<ViagemData>,
    passageiro?: Partial<PassageiroData>
  ): PreviewResult => {
    
    // Dados mock para preview
    const mockViagem: ViagemData = {
      id: '1',
      destino: viagem?.destino || 'Rio de Janeiro',
      data_viagem: viagem?.data_viagem || new Date().toISOString(),
      horario_saida: viagem?.horario_saida || '06:00',
      local_saida: viagem?.local_saida || 'Terminal Rodoviário',
      onibus: viagem?.onibus || { numero: '001', nome: 'Ônibus Executivo' },
      link_grupo: viagem?.link_grupo || 'https://chat.whatsapp.com/exemplo123',
      telefone_contato: viagem?.telefone_contato || '(11) 99999-9999'
    };
    
    const mockPassageiro: PassageiroData = {
      id: '1',
      nome: passageiro?.nome || 'João Silva',
      telefone: passageiro?.telefone || '(11) 98765-4321',
      valor_total: passageiro?.valor_total || 150.00,
      status_pagamento: passageiro?.status_pagamento || 'pendente'
    };
    
    try {
      const mensagemFinal = processTemplate(template, mockViagem, mockPassageiro);
      const variaveisUsadas = extractVariables(template.mensagem);
      
      // Verificar variáveis não encontradas
      const variaveisNaoEncontradas = variaveisUsadas.filter(v => 
        !Object.keys(VARIABLE_DESCRIPTIONS).includes(v)
      );
      
      // Criar mapeamento das variáveis substituídas
      const variaveisSubstituidas: Record<string, string> = {};
      variaveisUsadas.forEach(variable => {
        const regex = new RegExp(`\\{${variable}\\}`, 'g');
        if (template.mensagem.match(regex)) {
          variaveisSubstituidas[variable] = 'Substituída com sucesso';
        }
      });
      
      return {
        mensagem_final: mensagemFinal,
        variaveis_substituidas: variaveisSubstituidas,
        variaveis_nao_encontradas: variaveisNaoEncontradas,
        total_caracteres: mensagemFinal.length,
        valida: mensagemFinal.length > 0 && mensagemFinal.length <= 4096,
        avisos: mensagemFinal.length > 1000 ? ['Mensagem muito longa para WhatsApp'] : undefined
      };
      
    } catch (error) {
      return {
        mensagem_final: 'Erro ao processar template',
        variaveis_substituidas: {},
        variaveis_nao_encontradas: [],
        total_caracteres: 0,
        valida: false,
        avisos: ['Erro no processamento do template']
      };
    }
  }, [processTemplate, extractVariables]);
  
  // =====================================================
  // SELEÇÃO DE TEMPLATES
  // =====================================================
  
  /**
   * Selecionar template para envio
   */
  const selectTemplate = useCallback((template: WhatsAppTemplate) => {
    setSelectedTemplates(prev => {
      const exists = prev.find(st => st.template.id === template.id);
      if (exists) return prev;
      
      return [...prev, {
        template,
        mensagemPersonalizada: template.mensagem,
        selecionado: true
      }];
    });
  }, []);
  
  /**
   * Desselecionar template
   */
  const unselectTemplate = useCallback((templateId: string) => {
    setSelectedTemplates(prev => prev.filter(st => st.template.id !== templateId));
  }, []);
  
  /**
   * Atualizar template selecionado
   */
  const updateSelectedTemplate = useCallback((
    templateId: string, 
    mensagem: string, 
    customVars?: Record<string, string>
  ) => {
    setSelectedTemplates(prev => prev.map(st => 
      st.template.id === templateId 
        ? { ...st, mensagemPersonalizada: mensagem, variaveisCustomizadas: customVars }
        : st
    ));
  }, []);
  
  /**
   * Limpar seleção
   */
  const clearSelection = useCallback(() => {
    setSelectedTemplates([]);
  }, []);
  
  // =====================================================
  // UTILITÁRIOS
  // =====================================================
  
  /**
   * Recarregar templates
   */
  const reloadTemplates = useCallback(async () => {
    await loadTemplates(filters);
  }, [loadTemplates, filters]);
  
  /**
   * Obter templates por categoria
   */
  const getTemplatesByCategory = useCallback((category: string) => {
    return templates.filter(t => t.categoria === category && t.ativo);
  }, [templates]);
  
  /**
   * Validar dados do template
   */
  const validateTemplate = useCallback((data: CreateTemplateData) => {
    const errors: string[] = [];
    
    if (!data.nome?.trim()) {
      errors.push('Nome é obrigatório');
    }
    
    if (!data.mensagem?.trim()) {
      errors.push('Mensagem é obrigatória');
    }
    
    if (data.mensagem && data.mensagem.length > 4096) {
      errors.push('Mensagem muito longa (máximo 4096 caracteres)');
    }
    
    if (!data.categoria) {
      errors.push('Categoria é obrigatória');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }, []);
  
  // =====================================================
  // EFEITOS
  // =====================================================
  
  // Carregar templates iniciais
  useEffect(() => {
    loadTemplates();
  }, []);
  
  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================
  
  /**
   * Calcular horário de chegada (30min antes da saída)
   */
  function calculateArrivalTime(horarioSaida: string): string {
    try {
      const [hours, minutes] = horarioSaida.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 30; // 30min antes
      
      if (totalMinutes < 0) {
        // Se for antes da meia-noite, ajustar para o dia anterior
        const adjustedMinutes = 24 * 60 + totalMinutes;
        const newHours = Math.floor(adjustedMinutes / 60);
        const newMinutes = adjustedMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      }
      
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      
      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    } catch {
      return horarioSaida; // Retorna o original se houver erro
    }
  }
  
  // =====================================================
  // NOVAS FUNCIONALIDADES PARA REFORMULAÇÃO
  // =====================================================
  
  /**
   * Agrupar templates por categoria com metadados
   */
  const getTemplatesGroupedByCategory = useCallback((): Record<string, TemplateGroup> => {
    const activeTemplates = templates.filter(t => t.ativo);
    const grouped: Record<string, TemplateGroup> = {};
    
    activeTemplates.forEach(template => {
      const categoria = template.categoria;
      if (!grouped[categoria]) {
        grouped[categoria] = {
          categoria,
          emoji: CATEGORY_EMOJIS[categoria] || '📱',
          templates: [],
          count: 0
        };
      }
      grouped[categoria].templates.push(template);
      grouped[categoria].count++;
    });
    
    return grouped;
  }, [templates]);
  
  /**
   * Busca em tempo real com debounce
   */
  const searchTemplatesRealTime = useCallback((query: string): WhatsAppTemplate[] => {
    if (!query.trim()) return templates.filter(t => t.ativo);
    
    const searchTerm = query.toLowerCase();
    return templates.filter(t => 
      t.ativo && (
        t.nome.toLowerCase().includes(searchTerm) ||
        t.mensagem.toLowerCase().includes(searchTerm) ||
        t.categoria.toLowerCase().includes(searchTerm)
      )
    );
  }, [templates]);
  
  /**
   * Preview de template com dados mock
   */
  const getTemplatePreview = useCallback((template: WhatsAppTemplate, dadosViagem?: any): string => {
    const mockData = {
      NOME: 'João Silva',
      DESTINO: dadosViagem?.adversario || 'Rio de Janeiro',
      DATA: dadosViagem?.data_jogo ? new Date(dadosViagem.data_jogo).toLocaleDateString('pt-BR') : '15/12/2024',
      HORARIO: dadosViagem?.horario || '07:00',
      LOCAL_SAIDA: dadosViagem?.local_saida || 'Terminal Rodoviário',
      ONIBUS: dadosViagem?.onibus || 'Ônibus 001',
      LINK_GRUPO: 'https://chat.whatsapp.com/exemplo123',
      VALOR: 'R$ 150,00',
      TELEFONE: '(11) 99999-9999',
      HORARIO_CHEGADA: '06:30'
    };
    
    let preview = template.mensagem;
    Object.entries(mockData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      preview = preview.replace(regex, value);
    });
    
    return preview;
  }, []);
  
  /**
   * Estatísticas por categoria
   */
  const getCategoryStats = useCallback((): Record<string, number> => {
    const stats: Record<string, number> = {};
    templates.filter(t => t.ativo).forEach(template => {
      stats[template.categoria] = (stats[template.categoria] || 0) + 1;
    });
    return stats;
  }, [templates]);
  
  /**
   * Refresh do cache
   */
  const refreshCache = useCallback(async (): Promise<void> => {
    setCacheState(prev => ({ ...prev, status: 'loading' }));
    setTemplateCache(new Map());
    await loadTemplates();
    setCacheState(prev => ({ 
      ...prev, 
      status: 'fresh', 
      lastUpdated: new Date() 
    }));
  }, [loadTemplates]);
  
  /**
   * Definir query de busca
   */
  const setSearchQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      isSearching: query.length > 0,
      filteredTemplates: searchTemplatesRealTime(query)
    }));
  }, [searchTemplatesRealTime]);
  
  /**
   * Definir categoria selecionada
   */
  const setSelectedCategory = useCallback((category: string | null) => {
    setSearchState(prev => ({
      ...prev,
      selectedCategory: category,
      filteredTemplates: category 
        ? templates.filter(t => t.ativo && t.categoria === category)
        : templates.filter(t => t.ativo)
    }));
  }, [templates]);
  
  // =====================================================
  // EFEITOS APRIMORADOS
  // =====================================================
  
  // Carregar templates iniciais e configurar cache
  useEffect(() => {
    loadTemplates().then(() => {
      setCacheState(prev => ({ 
        ...prev, 
        status: 'fresh', 
        lastUpdated: new Date() 
      }));
    });
  }, []);
  
  // Verificar TTL do cache
  useEffect(() => {
    const interval = setInterval(() => {
      if (cacheState.lastUpdated) {
        const now = new Date().getTime();
        const lastUpdate = cacheState.lastUpdated.getTime();
        const elapsed = now - lastUpdate;
        
        if (elapsed > cacheState.ttl) {
          setCacheState(prev => ({ ...prev, status: 'stale' }));
        }
      }
    }, 60000); // Verificar a cada minuto
    
    return () => clearInterval(interval);
  }, [cacheState.lastUpdated, cacheState.ttl]);
  
  // =====================================================
  // RETORNO DO HOOK
  // =====================================================
  
  return {
    // Estados
    templates,
    loading,
    error,
    
    // CRUD
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate,
    
    // Listagem e Filtros
    loadTemplates,
    searchTemplates,
    filterByCategory,
    clearFilters,
    
    // Processamento
    processTemplate,
    previewTemplate,
    extractVariables,
    
    // Seleção
    selectedTemplates,
    selectTemplate,
    unselectTemplate,
    updateSelectedTemplate,
    clearSelection,
    
    // Utilitários
    reloadTemplates,
    getTemplatesByCategory,
    validateTemplate,
    
    // Novas funcionalidades
    getTemplatesGroupedByCategory,
    searchTemplatesRealTime,
    getTemplatePreview,
    getCategoryStats,
    
    // Cache
    cacheState,
    refreshCache,
    
    // Busca
    searchState,
    setSearchQuery,
    setSelectedCategory
  };
}