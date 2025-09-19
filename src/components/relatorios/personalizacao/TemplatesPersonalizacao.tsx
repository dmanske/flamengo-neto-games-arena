/**
 * Componente para gerenciamento de templates
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  FileText, 
  Plus, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Eye,
  Star
} from 'lucide-react';
import { PersonalizationConfig, Template } from '@/types/personalizacao-relatorios';
import { PersonalizationStorage } from '@/lib/personalizacao/storage';

interface TemplatesPersonalizacaoProps {
  currentConfig: PersonalizationConfig;
  onApplyTemplate: (template: Template) => void;
}

export function TemplatesPersonalizacao({ currentConfig, onApplyTemplate }: TemplatesPersonalizacaoProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState<'todos' | 'oficial' | 'personalizado' | 'compartilhado'>('todos');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const loadedTemplates = PersonalizationStorage.loadTemplates();
    setTemplates(loadedTemplates);
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;

    try {
      PersonalizationStorage.saveTemplate({
        nome: newTemplateName,
        descricao: newTemplateDescription,
        categoria: 'personalizado',
        configuracao: currentConfig,
        metadata: {
          ...currentConfig.metadata,
          nome: newTemplateName,
          categoria: 'personalizado'
        }
      });
      
      setNewTemplateName('');
      setNewTemplateDescription('');
      setShowSaveDialog(false);
      loadTemplates();
    } catch (error) {
      alert(`Erro ao salvar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      PersonalizationStorage.deleteTemplate(templateId);
      loadTemplates();
    } catch (error) {
      alert(`Erro ao excluir template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDuplicateTemplate = (templateId: string) => {
    const newName = prompt('Nome para o template duplicado:');
    if (!newName) return;

    try {
      PersonalizationStorage.duplicateTemplate(templateId, newName);
      loadTemplates();
    } catch (error) {
      alert(`Erro ao duplicar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const templatesFiltrados = templates.filter(template => {
    if (filtroCategoria === 'todos') return true;
    return template.categoria === filtroCategoria;
  });

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Gerenciamento de Templates
          </CardTitle>
          <CardDescription>
            Salve, carregue e gerencie configurações personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {(['todos', 'oficial', 'personalizado', 'compartilhado'] as const).map(categoria => (
                <Button
                  key={categoria}
                  variant={filtroCategoria === categoria ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroCategoria(categoria)}
                >
                  {categoria === 'todos' ? 'Todos' :
                   categoria === 'oficial' ? 'Oficiais' :
                   categoria === 'personalizado' ? 'Personalizados' : 'Compartilhados'}
                </Button>
              ))}
            </div>

            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Salvar Atual
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Salvar Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Template</Label>
                    <Input
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Ex: Meu Template Personalizado"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição (opcional)</Label>
                    <Textarea
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Descreva as características deste template..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveTemplate} disabled={!newTemplateName.trim()}>
                      Salvar Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Templates */}
      <Card>
        <CardHeader>
          <CardTitle>
            Templates Disponíveis
            <Badge variant="secondary" className="ml-2">
              {templatesFiltrados.length} template(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {templatesFiltrados.map(template => (
                <div key={template.id} className="flex items-center gap-3 p-4 border rounded-lg bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{template.nome}</h4>
                      <Badge variant={template.categoria === 'oficial' ? 'default' : 'secondary'}>
                        {template.categoria === 'oficial' && <Star className="w-3 h-3 mr-1" />}
                        {template.categoria === 'oficial' ? 'Oficial' :
                         template.categoria === 'personalizado' ? 'Personalizado' : 'Compartilhado'}
                      </Badge>
                    </div>
                    {template.descricao && (
                      <p className="text-sm text-muted-foreground mb-2">{template.descricao}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Criado: {new Date(template.metadata.criadoEm).toLocaleDateString()}</span>
                      <span>Atualizado: {new Date(template.metadata.atualizadoEm).toLocaleDateString()}</span>
                      {template.metadata.tags && template.metadata.tags.length > 0 && (
                        <div className="flex gap-1">
                          {template.metadata.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onApplyTemplate(template)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Aplicar
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template.id)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>

                    {template.categoria !== 'oficial' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex items-center gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {templatesFiltrados.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum template encontrado nesta categoria</p>
                  {filtroCategoria === 'personalizado' && (
                    <p className="text-sm mt-2">Salve sua configuração atual para criar seu primeiro template personalizado</p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}