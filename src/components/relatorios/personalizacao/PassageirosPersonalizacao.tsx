/**
 * Componente para personalização da lista de passageiros
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Eye, 
  EyeOff, 
  GripVertical, 
  ArrowUpDown,
  Filter,
  Columns,
  Settings2,
  Hash,
  User,
  MapPin,
  CreditCard,
  FileText
} from 'lucide-react';

import { 
  PassageirosConfig, 
  PassageiroColumn, 
  PassageiroColumnCategory,
  PassageiroDisplay 
} from '@/types/personalizacao-relatorios';
import { COLUMN_CATEGORIES } from '@/lib/personalizacao-constants';
import { reorderColumns, toggleColumnVisibility, updateColumnWidth } from '@/lib/personalizacao-utils';

// ============================================================================
// INTERFACES
// ============================================================================

interface PassageirosPersonalizacaoProps {
  config: PassageirosConfig;
  onChange: (config: PassageirosConfig) => void;
}

interface ColumnItemProps {
  column: PassageiroColumn;
  onToggleVisibility: () => void;
  onUpdateWidth: (width: number) => void;
  onMove: (direction: 'up' | 'down') => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

// ============================================================================
// COMPONENTE DE ITEM DE COLUNA
// ============================================================================

function ColumnItem({ 
  column, 
  onToggleVisibility, 
  onUpdateWidth, 
  onMove, 
  canMoveUp, 
  canMoveDown 
}: ColumnItemProps) {
  const categoryInfo = COLUMN_CATEGORIES[column.categoria];

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-card">
      {/* Controles de movimento */}
      <div className="flex flex-col gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('up')}
          disabled={!canMoveUp}
          className="h-6 w-6 p-0"
        >
          <ArrowUpDown className="w-3 h-3" />
        </Button>
        <GripVertical className="w-4 h-4 text-muted-foreground" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMove('down')}
          disabled={!canMoveDown}
          className="h-6 w-6 p-0"
        >
          <ArrowUpDown className="w-3 h-3" />
        </Button>
      </div>

      {/* Informações da coluna */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{column.label}</span>
          <Badge variant="outline" className="text-xs">
            {categoryInfo.icon} {categoryInfo.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          ID: {column.id} • Ordem: {column.ordem}
        </p>
      </div>

      {/* Controle de largura */}
      <div className="flex items-center gap-2">
        <Label htmlFor={`width-${column.id}`} className="text-xs">
          Largura:
        </Label>
        <Input
          id={`width-${column.id}`}
          type="number"
          min="50"
          max="500"
          value={column.largura || 100}
          onChange={(e) => onUpdateWidth(parseInt(e.target.value) || 100)}
          className="w-20 h-8 text-xs"
        />
        <span className="text-xs text-muted-foreground">px</span>
      </div>

      {/* Toggle de visibilidade */}
      <Button
        variant={column.visivel ? "default" : "outline"}
        size="sm"
        onClick={onToggleVisibility}
        className="flex items-center gap-2"
      >
        {column.visivel ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        {column.visivel ? 'Visível' : 'Oculta'}
      </Button>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PassageirosPersonalizacao({ config, onChange }: PassageirosPersonalizacaoProps) {
  const [filtroCategoria, setFiltroCategoria] = useState<PassageiroColumnCategory | 'todas'>('todas');

  /**
   * Atualiza a configuração
   */
  const updateConfig = (updates: Partial<PassageirosConfig>) => {
    onChange({
      ...config,
      ...updates
    });
  };

  /**
   * Colunas filtradas por categoria
   */
  const colunasFiltradas = useMemo(() => {
    if (filtroCategoria === 'todas') {
      return config.colunas;
    }
    return config.colunas.filter(col => col.categoria === filtroCategoria);
  }, [config.colunas, filtroCategoria]);

  /**
   * Estatísticas das colunas
   */
  const estatisticas = useMemo(() => {
    const total = config.colunas.length;
    const visiveis = config.colunas.filter(col => col.visivel).length;
    const larguraTotal = config.colunas
      .filter(col => col.visivel)
      .reduce((sum, col) => sum + (col.largura || 100), 0);

    return { total, visiveis, larguraTotal };
  }, [config.colunas]);

  /**
   * Alterna visibilidade de uma coluna
   */
  const handleToggleVisibility = (columnId: keyof PassageiroDisplay) => {
    const newColumns = toggleColumnVisibility(config.colunas, columnId);
    updateConfig({ colunas: newColumns });
  };

  /**
   * Atualiza largura de uma coluna
   */
  const handleUpdateWidth = (columnId: keyof PassageiroDisplay, width: number) => {
    const newColumns = updateColumnWidth(config.colunas, columnId, width);
    updateConfig({ colunas: newColumns });
  };

  /**
   * Move uma coluna
   */
  const handleMoveColumn = (columnId: keyof PassageiroDisplay, direction: 'up' | 'down') => {
    const currentIndex = config.colunas.findIndex(col => col.id === columnId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= config.colunas.length) return;

    const newColumns = reorderColumns(config.colunas, currentIndex, newIndex);
    updateConfig({ colunas: newColumns });
  };

  /**
   * Mostra/oculta todas as colunas de uma categoria
   */
  const handleToggleCategory = (categoria: PassageiroColumnCategory, visible: boolean) => {
    const newColumns = config.colunas.map(col => 
      col.categoria === categoria ? { ...col, visivel: visible } : col
    );
    updateConfig({ colunas: newColumns });
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Passageiros
          </CardTitle>
          <CardDescription>
            Configure quais colunas serão exibidas na lista de passageiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.visiveis}</div>
              <div className="text-sm text-muted-foreground">Colunas Visíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{estatisticas.total}</div>
              <div className="text-sm text-muted-foreground">Total de Colunas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{estatisticas.larguraTotal}px</div>
              <div className="text-sm text-muted-foreground">Largura Total</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="filtro-categoria">Filtrar por Categoria</Label>
              <Select
                value={filtroCategoria}
                onValueChange={(value) => setFiltroCategoria(value as PassageiroColumnCategory | 'todas')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Categorias</SelectItem>
                  {Object.entries(COLUMN_CATEGORIES).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.icon} {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(COLUMN_CATEGORIES).map(([categoria, info]) => {
              const colunasCategoria = config.colunas.filter(col => col.categoria === categoria);
              const visiveisCategoria = colunasCategoria.filter(col => col.visivel).length;
              
              return (
                <div key={categoria} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{info.icon}</span>
                    <span className="text-sm font-medium">{info.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {visiveisCategoria}/{colunasCategoria.length}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCategory(categoria as PassageiroColumnCategory, true)}
                      className="h-6 px-2 text-xs"
                    >
                      Todas
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCategory(categoria as PassageiroColumnCategory, false)}
                      className="h-6 px-2 text-xs"
                    >
                      Nenhuma
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Colunas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns className="w-5 h-5" />
            Configuração de Colunas
            {filtroCategoria !== 'todas' && (
              <Badge variant="secondary">
                {COLUMN_CATEGORIES[filtroCategoria as PassageiroColumnCategory]?.icon} {COLUMN_CATEGORIES[filtroCategoria as PassageiroColumnCategory]?.label}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Arraste para reordenar, ajuste larguras e controle visibilidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {colunasFiltradas.map((column, index) => (
                <ColumnItem
                  key={column.id}
                  column={column}
                  onToggleVisibility={() => handleToggleVisibility(column.id)}
                  onUpdateWidth={(width) => handleUpdateWidth(column.id, width)}
                  onMove={(direction) => handleMoveColumn(column.id, direction)}
                  canMoveUp={index > 0}
                  canMoveDown={index < colunasFiltradas.length - 1}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Ordenação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5" />
            Ordenação
          </CardTitle>
          <CardDescription>
            Configure como a lista de passageiros será ordenada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campo-ordenacao">Campo de Ordenação</Label>
              <Select
                value={config.ordenacao.campo}
                onValueChange={(value) => 
                  updateConfig({
                    ordenacao: {
                      ...config.ordenacao,
                      campo: value as keyof PassageiroDisplay
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.colunas
                    .filter(col => col.visivel)
                    .map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.label}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="direcao-ordenacao">Direção</Label>
              <Select
                value={config.ordenacao.direcao}
                onValueChange={(value: 'asc' | 'desc') => 
                  updateConfig({
                    ordenacao: {
                      ...config.ordenacao,
                      direcao: value
                    }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Crescente (A-Z, 1-9)</SelectItem>
                  <SelectItem value="desc">Decrescente (Z-A, 9-1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ordenação secundária */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ordenacao-secundaria">Ordenação Secundária</Label>
              <Switch
                id="ordenacao-secundaria"
                checked={!!config.ordenacao.secundario}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateConfig({
                      ordenacao: {
                        ...config.ordenacao,
                        secundario: {
                          campo: 'nome',
                          direcao: 'asc'
                        }
                      }
                    });
                  } else {
                    updateConfig({
                      ordenacao: {
                        ...config.ordenacao,
                        secundario: undefined
                      }
                    });
                  }
                }}
              />
            </div>

            {config.ordenacao.secundario && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="campo-ordenacao-secundaria">Campo Secundário</Label>
                  <Select
                    value={config.ordenacao.secundario.campo}
                    onValueChange={(value) => 
                      updateConfig({
                        ordenacao: {
                          ...config.ordenacao,
                          secundario: {
                            ...config.ordenacao.secundario!,
                            campo: value as keyof PassageiroDisplay
                          }
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {config.colunas
                        .filter(col => col.visivel && col.id !== config.ordenacao.campo)
                        .map(col => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.label}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direcao-ordenacao-secundaria">Direção Secundária</Label>
                  <Select
                    value={config.ordenacao.secundario.direcao}
                    onValueChange={(value: 'asc' | 'desc') => 
                      updateConfig({
                        ordenacao: {
                          ...config.ordenacao,
                          secundario: {
                            ...config.ordenacao.secundario!,
                            direcao: value
                          }
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Crescente</SelectItem>
                      <SelectItem value="desc">Decrescente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agrupamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="w-5 h-5" />
            Agrupamento
          </CardTitle>
          <CardDescription>
            Configure se a lista deve ser agrupada por algum critério
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="agrupamento-ativo">Ativar Agrupamento</Label>
            <Switch
              id="agrupamento-ativo"
              checked={config.agrupamento.ativo}
              onCheckedChange={(checked) => 
                updateConfig({
                  agrupamento: {
                    ...config.agrupamento,
                    ativo: checked
                  }
                })
              }
            />
          </div>

          {config.agrupamento.ativo && (
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <div className="space-y-2">
                <Label htmlFor="campo-agrupamento">Agrupar Por</Label>
                <Select
                  value={config.agrupamento.campo || 'onibus'}
                  onValueChange={(value: 'onibus' | 'setor' | 'cidade' | 'status' | 'passeios') => 
                    updateConfig({
                      agrupamento: {
                        ...config.agrupamento,
                        campo: value
                      }
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onibus">Ônibus</SelectItem>
                    <SelectItem value="setor">Setor do Maracanã</SelectItem>
                    <SelectItem value="cidade">Cidade</SelectItem>
                    <SelectItem value="status">Status de Pagamento</SelectItem>
                    <SelectItem value="passeios">Passeios</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="totais-por-grupo">Mostrar Totais por Grupo</Label>
                <Switch
                  id="totais-por-grupo"
                  checked={config.agrupamento.mostrarTotaisPorGrupo}
                  onCheckedChange={(checked) => 
                    updateConfig({
                      agrupamento: {
                        ...config.agrupamento,
                        mostrarTotaisPorGrupo: checked
                      }
                    })
                  }
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}