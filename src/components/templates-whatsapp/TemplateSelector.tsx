/**
 * =====================================================
 * COMPONENTE - SELETOR MÚLTIPLO DE TEMPLATES
 * =====================================================
 * 
 * Componente para seleção múltipla de templates de WhatsApp
 * com preview automático e edição inline de mensagens.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { 
  WhatsAppTemplate, 
  SelectedTemplate,
  TemplateCategory,
  CATEGORY_LABELS,
  ViagemData,
  PassageiroData
} from '@/types/whatsapp-templates';
import {
  Search,
  MessageSquare,
  Edit3,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Hash
} from 'lucide-react';

// =====================================================
// INTERFACES
// =====================================================

interface TemplateSelectorProps {
  /** Dados da viagem para preview */
  viagem?: Partial<ViagemData>;
  
  /** Dados do passageiro para preview */
  passageiro?: Partial<PassageiroData>;
  
  /** Callback quando templates são selecionados */
  onSelectionChange: (selectedTemplates: SelectedTemplate[]) => void;
  
  /** Templates já selecionados (estado externo) */
  selectedTemplates?: SelectedTemplate[];
  
  /** Se deve mostrar preview automático */
  showPreview?: boolean;
  
  /** Classe CSS adicional */
  className?: string;
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function TemplateSelector({
  viagem,
  passageiro,
  onSelectionChange,
  selectedTemplates = [],
  showPreview = true,
  className = ''
}: TemplateSelectorProps) {
  
  // =====================================================
  // HOOKS E ESTADOS
  // =====================================================
  
  const {
    templates,
    loading,
    error,
    searchTemplates,
    filterByCategory,
    clearFilters,
    previewTemplate,
    processTemplate
  } = useWhatsAppTemplates();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [previewingTemplateId, setPreviewingTemplateId] = useState<string | null>(null);
  
  // =====================================================
  // COMPUTED VALUES
  // =====================================================
  
  // Templates filtrados
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(t => t.ativo);
    
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(t => t.categoria === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.nome.toLowerCase().includes(query) ||
        t.mensagem.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [templates, selectedCategory, searchQuery]);
  
  // Templates agrupados por categoria
  const templatesByCategory = useMemo(() => {
    const grouped: Record<TemplateCategory, WhatsAppTemplate[]> = {
      confirmacao: [],
      grupo: [],
      lembrete: [],
      cobranca: [],
      informativo: [],
      promocional: [],
      outros: []
    };
    
    filteredTemplates.forEach(template => {
      if (grouped[template.categoria]) {
        grouped[template.categoria].push(template);
      }
    });
    
    return grouped;
  }, [filteredTemplates]);
  
  // Estatísticas
  const stats = useMemo(() => ({
    total: filteredTemplates.length,
    selected: selectedTemplates.length,
    byCategory: Object.entries(templatesByCategory).map(([category, templates]) => ({
      category: category as TemplateCategory,
      label: CATEGORY_LABELS[category as TemplateCategory],
      count: templates.length
    })).filter(item => item.count > 0)
  }), [filteredTemplates, selectedTemplates, templatesByCategory]);
  
  // =====================================================
  // FUNÇÕES DE MANIPULAÇÃO
  // =====================================================
  
  /**
   * Verificar se template está selecionado
   */
  const isTemplateSelected = (templateId: string): boolean => {
    return selectedTemplates.some(st => st.template.id === templateId);
  };
  
  /**
   * Obter template selecionado
   */
  const getSelectedTemplate = (templateId: string): SelectedTemplate | undefined => {
    return selectedTemplates.find(st => st.template.id === templateId);
  };
  
  /**
   * Selecionar/desselecionar template
   */
  const handleTemplateToggle = (template: WhatsAppTemplate, checked: boolean) => {
    let newSelection = [...selectedTemplates];
    
    if (checked) {
      // Adicionar template
      if (!isTemplateSelected(template.id)) {
        newSelection.push({
          template,
          mensagemPersonalizada: template.mensagem,
          selecionado: true
        });
      }
    } else {
      // Remover template
      newSelection = newSelection.filter(st => st.template.id !== template.id);
    }
    
    onSelectionChange(newSelection);
  };
  
  /**
   * Atualizar mensagem personalizada
   */
  const handleMessageUpdate = (templateId: string, newMessage: string) => {
    const newSelection = selectedTemplates.map(st => 
      st.template.id === templateId 
        ? { ...st, mensagemPersonalizada: newMessage }
        : st
    );
    
    onSelectionChange(newSelection);
  };
  
  /**
   * Resetar mensagem para o original
   */
  const handleResetMessage = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      handleMessageUpdate(templateId, template.mensagem);
    }
  };
  
  /**
   * Buscar templates
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchTemplates(query);
    } else {
      clearFilters();
    }
  };
  
  /**
   * Filtrar por categoria
   */
  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category !== 'todos') {
      filterByCategory(category);
    } else {
      clearFilters();
    }
  };
  
  /**
   * Gerar preview de template
   */
  const generatePreview = (template: WhatsAppTemplate, customMessage?: string) => {
    if (!viagem || !passageiro) {
      return previewTemplate(template);
    }
    
    // Se há mensagem customizada, criar template temporário
    const templateToPreview = customMessage ? {
      ...template,
      mensagem: customMessage
    } : template;
    
    return previewTemplate(templateToPreview, viagem, passageiro);
  };
  
  // =====================================================
  // COMPONENTES DE RENDERIZAÇÃO
  // =====================================================
  
  /**
   * Renderizar card de template
   */
  const renderTemplateCard = (template: WhatsAppTemplate) => {
    const isSelected = isTemplateSelected(template.id);
    const selectedTemplate = getSelectedTemplate(template.id);
    const isEditing = editingTemplateId === template.id;
    const isPreviewing = previewingTemplateId === template.id;
    
    const preview = showPreview ? generatePreview(
      template, 
      selectedTemplate?.mensagemPersonalizada
    ) : null;
    
    return (
      <Card 
        key={template.id} 
        className={`transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleTemplateToggle(template, checked as boolean)}
                className="mt-1"
              />
              <div>
                <CardTitle className="text-sm font-medium">{template.nome}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {CATEGORY_LABELS[template.categoria]}
                  </Badge>
                  {template.variaveis.length > 0 && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Hash className="h-3 w-3" />
                      {template.variaveis.length} variáveis
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {/* Botão de Preview - sempre visível */}
              {showPreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewingTemplateId(isPreviewing ? null : template.id)}
                  className="h-8 w-8 p-0"
                  title={isPreviewing ? "Ocultar preview" : "Ver preview"}
                >
                  <Eye className="h-3 w-3" />
                </Button>
              )}
              
              {/* Botão de Edição - só quando selecionado */}
              {isSelected && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTemplateId(isEditing ? null : template.id)}
                  className="h-8 w-8 p-0"
                  title={isEditing ? "Cancelar edição" : "Editar mensagem"}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Mensagem Original ou Editável */}
          {isSelected && isEditing ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem Personalizada:</label>
                <Textarea
                  value={selectedTemplate?.mensagemPersonalizada || template.mensagem}
                  onChange={(e) => handleMessageUpdate(template.id, e.target.value)}
                  className="min-h-[120px] text-sm"
                  placeholder="Digite sua mensagem personalizada..."
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetMessage(template.id)}
                  className="gap-2"
                >
                  <RotateCcw className="h-3 w-3" />
                  Resetar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setEditingTemplateId(null)}
                >
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg font-mono whitespace-pre-wrap">
              {isSelected && selectedTemplate?.mensagemPersonalizada !== template.mensagem
                ? selectedTemplate?.mensagemPersonalizada
                : template.mensagem
              }
            </div>
          )}
          
          {/* Preview */}
          {isPreviewing && showPreview && preview && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Preview da Mensagem:</span>
              </div>
              <div className="text-sm text-green-700 whitespace-pre-wrap font-mono">
                {preview.mensagem_final}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-green-600">
                <span>{preview.total_caracteres} caracteres</span>
                {preview.valida ? (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Válida</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>Problemas encontrados</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  // =====================================================
  // RENDER PRINCIPAL
  // =====================================================
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Carregando templates...</p>
        </div>
      </div>
    );
  }
  
  // Debug: mostrar quantos templates foram carregados
  console.log('Templates carregados:', templates.length);
  console.log('Templates filtrados:', filteredTemplates.length);
  
  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Erro ao carregar templates: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com Estatísticas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Selecionar Templates</h3>
          <p className="text-sm text-gray-600">
            {stats.selected} de {stats.total} templates selecionados
          </p>
        </div>
        
        {stats.selected > 0 && (
          <Badge variant="default" className="self-start sm:self-center">
            {stats.selected} selecionado{stats.selected !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar templates por nome ou conteúdo..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as categorias</SelectItem>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Lista de Templates */}
      <Tabs defaultValue="lista" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista Completa</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lista" className="space-y-4">
          {filteredTemplates.length > 0 ? (
            <div className="grid gap-4">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'todos' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Crie seu primeiro template para começar'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="categorias" className="space-y-6">
          {stats.byCategory.map(({ category, label, count }) => (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <h4 className="text-md font-medium">{label}</h4>
                <Badge variant="secondary">{count}</Badge>
              </div>
              <div className="grid gap-4">
                {templatesByCategory[category].map(renderTemplateCard)}
              </div>
            </div>
          ))}
          
          {stats.byCategory.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros de busca
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}