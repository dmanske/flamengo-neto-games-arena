/**
 * =====================================================
 * PÁGINA - GERENCIAMENTO DE TEMPLATES WHATSAPP
 * =====================================================
 * 
 * Página principal para gerenciar templates de WhatsApp.
 * Permite criar, editar, excluir e visualizar templates
 * com filtros por categoria e busca.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { TemplateForm } from '@/components/templates-whatsapp/TemplateForm';
import { TemplatePreview } from '@/components/templates-whatsapp/TemplatePreview';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { 
  WhatsAppTemplate, 
  TemplateCategory,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS 
} from '@/types/whatsapp-templates';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export function TemplatesWhatsApp() {
  
  // =====================================================
  // HOOKS E ESTADOS
  // =====================================================
  
  const {
    templates,
    loading,
    error,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    searchTemplates,
    filterByCategory,
    clearFilters,
    reloadTemplates,
    getTemplatesByCategory,
    previewTemplate
  } = useWhatsAppTemplates();
  
  // Estados locais
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplateData, setPreviewTemplateData] = useState<WhatsAppTemplate | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<WhatsAppTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<string>('todos');
  
  // =====================================================
  // DADOS COMPUTADOS
  // =====================================================
  
  // Estatísticas dos templates
  const stats = useMemo(() => {
    const total = templates.length;
    const ativos = templates.filter(t => t.ativo).length;
    const inativos = total - ativos;
    
    const porCategoria = templates.reduce((acc, template) => {
      acc[template.categoria] = (acc[template.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total,
      ativos,
      inativos,
      porCategoria
    };
  }, [templates]);
  
  // Templates filtrados
  const templatesFiltered = useMemo(() => {
    let filtered = templates;
    
    // Filtro por categoria
    if (activeTab !== 'todos') {
      filtered = filtered.filter(t => t.categoria === activeTab);
    }
    
    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.mensagem.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [templates, activeTab, searchQuery]);
  
  // =====================================================
  // HANDLERS
  // =====================================================
  
  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowForm(true);
  };
  
  const handleEditTemplate = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };
  
  const handleDeleteTemplate = (template: WhatsAppTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };
  
  const handlePreviewTemplate = (template: WhatsAppTemplate) => {
    setPreviewTemplateData(template);
    setShowPreview(true);
  };
  
  const handleSaveTemplate = async (data: any) => {
    try {
      if (editingTemplate) {
        await updateTemplate({ ...data, id: editingTemplate.id });
      } else {
        await createTemplate(data);
      }
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleCategoryFilter = (category: string) => {
    setActiveTab(category);
  };
  
  const handleRefresh = () => {
    reloadTemplates();
  };
  
  // =====================================================
  // RENDER
  // =====================================================
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates WhatsApp</h1>
          <p className="text-gray-600 mt-1">
            Gerencie mensagens pré-definidas para envio em massa
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={handleCreateTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Template
          </Button>
        </div>
      </div>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativos}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-orange-600">{stats.inativos}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.porCategoria).length}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar templates por nome ou conteúdo..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filtro por Status */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Apenas Ativos</SelectItem>
                <SelectItem value="inativo">Apenas Inativos</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Botão Limpar Filtros */}
            {(searchQuery || selectedCategory !== 'todos') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todos');
                  clearFilters();
                }}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Abas por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Templates por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleCategoryFilter}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="todos">
                Todos ({stats.total})
              </TabsTrigger>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <TabsTrigger key={key} value={key}>
                  {label} ({stats.porCategoria[key] || 0})
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-6">
              {/* Lista de Templates */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : templatesFiltered.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? 'Nenhum template encontrado' : 'Nenhum template nesta categoria'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery 
                      ? 'Tente ajustar os filtros de busca'
                      : 'Crie seu primeiro template para começar'
                    }
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleCreateTemplate} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Criar Template
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Variáveis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Criado em</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templatesFiltered.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{template.nome}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {template.mensagem.substring(0, 100)}...
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant="outline">
                              {CATEGORY_LABELS[template.categoria]}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {template.variaveis.slice(0, 3).map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {variable}
                                </Badge>
                              ))}
                              {template.variaveis.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.variaveis.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge variant={template.ativo ? 'default' : 'secondary'}>
                              {template.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            {format(new Date(template.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePreviewTemplate(template)}
                                title="Visualizar"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTemplate(template)}
                                title="Editar"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTemplate(template)}
                                title="Excluir"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Formulário de Template */}
      <TemplateForm
        isOpen={showForm}
        template={editingTemplate}
        onClose={() => {
          setShowForm(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
      />
      
      {/* Preview de Template */}
      {previewTemplateData && (
        <TemplatePreview
          isOpen={showPreview}
          template={previewTemplateData}
          onClose={() => {
            setShowPreview(false);
            setPreviewTemplateData(null);
          }}
        />
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setTemplateToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Excluir Template"
        description={templateToDelete ? `Tem certeza que deseja excluir o template "${templateToDelete.nome}"?

📋 Categoria: ${CATEGORY_LABELS[templateToDelete.categoria]}
📝 Variáveis: ${templateToDelete.variaveis.join(', ')}

⚠️ Esta ação não pode ser desfeita!` : ''}
        confirmText="Excluir Template"
        cancelText="Cancelar"
        variant="destructive"
        icon={<Trash2 className="h-5 w-5 text-red-600" />}
      />
      
      {/* Mensagem de Erro */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}