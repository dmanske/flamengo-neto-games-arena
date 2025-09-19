/**
 * Componente para personalização de seções do relatório
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Eye, 
  EyeOff, 
  GripVertical, 
  ArrowUp, 
  ArrowDown,
  Filter
} from 'lucide-react';
import { SecoesConfig, SecaoConfig } from '@/types/personalizacao-relatorios';
import { SECTION_TYPES, SECTION_CATEGORIES } from '@/lib/personalizacao-constants';
import { reorderSections, toggleSectionVisibility } from '@/lib/personalizacao-utils';

interface SecoesPersonalizacaoProps {
  config: SecoesConfig;
  onChange: (config: SecoesConfig) => void;
}

export function SecoesPersonalizacao({ config, onChange }: SecoesPersonalizacaoProps) {
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const updateConfig = (updates: Partial<SecoesConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleToggleSection = (sectionId: string) => {
    const newSections = toggleSectionVisibility(config.secoes, sectionId);
    updateConfig({ secoes: newSections });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = config.secoes.findIndex(s => s.id === sectionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= config.secoes.length) return;

    const newSections = reorderSections(config.secoes, currentIndex, newIndex);
    updateConfig({ secoes: newSections });
  };

  const handleUpdateTitle = (sectionId: string, title: string) => {
    const newSections = config.secoes.map(secao =>
      secao.id === sectionId ? { ...secao, titulo: title } : secao
    );
    updateConfig({ secoes: newSections });
  };

  const secoesFiltradasPorCategoria = config.secoes.filter(secao => {
    if (filtroCategoria === 'todas') return true;
    const sectionType = SECTION_TYPES[secao.tipo];
    return sectionType?.category === filtroCategoria;
  });

  const estatisticas = {
    total: config.secoes.length,
    visiveis: config.secoes.filter(s => s.visivel).length,
    porCategoria: Object.keys(SECTION_CATEGORIES).reduce((acc, cat) => {
      acc[cat] = config.secoes.filter(s => {
        const type = SECTION_TYPES[s.tipo];
        return type?.category === cat && s.visivel;
      }).length;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Seções do Relatório
          </CardTitle>
          <CardDescription>
            Configure quais seções serão incluídas no relatório
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.visiveis}</div>
              <div className="text-sm text-muted-foreground">Seções Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{estatisticas.total}</div>
              <div className="text-sm text-muted-foreground">Total Disponível</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Object.keys(SECTION_CATEGORIES).length}</div>
              <div className="text-sm text-muted-foreground">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round((estatisticas.visiveis / estatisticas.total) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Cobertura</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant={filtroCategoria === 'todas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroCategoria('todas')}
              className="justify-start"
            >
              Todas ({estatisticas.total})
            </Button>
            {Object.entries(SECTION_CATEGORIES).map(([key, info]) => (
              <Button
                key={key}
                variant={filtroCategoria === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroCategoria(key)}
                className="justify-start"
              >
                <span className="mr-2">{info.icon}</span>
                {info.label} ({estatisticas.porCategoria[key] || 0})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Quebras Automáticas de Página</Label>
            <Switch
              checked={config.quebrasAutomaticas}
              onCheckedChange={(checked) => updateConfig({ quebrasAutomaticas: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Seções */}
      <Card>
        <CardHeader>
          <CardTitle>
            Configuração de Seções
            {filtroCategoria !== 'todas' && (
              <Badge variant="secondary" className="ml-2">
                {SECTION_CATEGORIES[filtroCategoria]?.icon} {SECTION_CATEGORIES[filtroCategoria]?.label}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Ative/desative seções, reordene e personalize títulos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {secoesFiltradasPorCategoria.map((secao, index) => {
                const sectionType = SECTION_TYPES[secao.tipo];
                const categoryInfo = SECTION_CATEGORIES[sectionType?.category || 'financeiro'];
                
                return (
                  <div key={secao.id} className="flex items-center gap-3 p-3 border rounded-lg bg-card">
                    {/* Controles de movimento */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSection(secao.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMoveSection(secao.id, 'down')}
                        disabled={index === secoesFiltradasPorCategoria.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Informações da seção */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{sectionType?.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {categoryInfo?.icon} {categoryInfo?.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Ordem: {secao.ordem}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <Label htmlFor={`title-${secao.id}`} className="text-xs">
                          Título Personalizado:
                        </Label>
                        <Input
                          id={`title-${secao.id}`}
                          value={secao.titulo}
                          onChange={(e) => handleUpdateTitle(secao.id, e.target.value)}
                          placeholder={sectionType?.label}
                          className="h-8 text-sm"
                        />
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {sectionType?.description}
                      </p>
                    </div>

                    {/* Toggle de visibilidade */}
                    <Button
                      variant={secao.visivel ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleSection(secao.id)}
                      className="flex items-center gap-2"
                    >
                      {secao.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      {secao.visivel ? 'Ativa' : 'Inativa'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}