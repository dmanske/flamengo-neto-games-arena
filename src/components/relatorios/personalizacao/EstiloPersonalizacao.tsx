/**
 * Componente para personalização de estilo e formatação
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Type, 
  Layout, 
  Image,
  Sliders
} from 'lucide-react';
import { EstiloConfig } from '@/types/personalizacao-relatorios';
import { FONT_FAMILIES, COLOR_PRESETS, LAYOUT_PRESETS } from '@/lib/personalizacao-constants';

interface EstiloPersonalizacaoProps {
  config: EstiloConfig;
  onChange: (config: EstiloConfig) => void;
}

export function EstiloPersonalizacao({ config, onChange }: EstiloPersonalizacaoProps) {
  const updateConfig = <K extends keyof EstiloConfig>(
    section: K,
    updates: Partial<EstiloConfig[K]>
  ) => {
    onChange({
      ...config,
      [section]: {
        ...config[section],
        ...updates
      }
    });
  };

  const applyColorPreset = (presetName: keyof typeof COLOR_PRESETS) => {
    const preset = COLOR_PRESETS[presetName];
    updateConfig('cores', preset);
  };

  const applyLayoutPreset = (presetName: keyof typeof LAYOUT_PRESETS) => {
    const preset = LAYOUT_PRESETS[presetName];
    updateConfig('layout', preset);
  };

  return (
    <div className="space-y-6">
      {/* Fontes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Configuração de Fontes
          </CardTitle>
          <CardDescription>
            Configure tamanhos e família de fontes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Família da Fonte</Label>
              <Select
                value={config.fontes.familia}
                onValueChange={(value) => updateConfig('fontes', { familia: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho do Header (px)</Label>
              <Input
                type="number"
                min="8"
                max="72"
                value={config.fontes.tamanhoHeader}
                onChange={(e) => updateConfig('fontes', { tamanhoHeader: parseInt(e.target.value) || 16 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tamanho do Texto (px)</Label>
              <Input
                type="number"
                min="6"
                max="24"
                value={config.fontes.tamanhoTexto}
                onChange={(e) => updateConfig('fontes', { tamanhoTexto: parseInt(e.target.value) || 12 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Tamanho da Tabela (px)</Label>
              <Input
                type="number"
                min="6"
                max="20"
                value={config.fontes.tamanhoTabela}
                onChange={(e) => updateConfig('fontes', { tamanhoTabela: parseInt(e.target.value) || 10 })}
              />
            </div>

            <div className="space-y-2">
              <Label>Peso do Header</Label>
              <Select
                value={config.fontes.pesoHeader}
                onValueChange={(value: 'normal' | 'bold' | 'bolder') => 
                  updateConfig('fontes', { pesoHeader: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Negrito</SelectItem>
                  <SelectItem value="bolder">Extra Negrito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Peso do Texto</Label>
              <Select
                value={config.fontes.pesoTexto}
                onValueChange={(value: 'normal' | 'bold') => 
                  updateConfig('fontes', { pesoTexto: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Negrito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Esquema de Cores
          </CardTitle>
          <CardDescription>
            Configure as cores do relatório
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets de cores */}
          <div className="space-y-2">
            <Label>Presets de Cores</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyColorPreset(key as keyof typeof COLOR_PRESETS)}
                  className="flex items-center gap-2"
                >
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.headerPrincipal }}
                  />
                  {key === 'flamengo' ? 'Flamengo' : 
                   key === 'professional' ? 'Profissional' :
                   key === 'modern' ? 'Moderno' : 'Clássico'}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Cores individuais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Header Principal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.headerPrincipal}
                  onChange={(e) => updateConfig('cores', { headerPrincipal: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.headerPrincipal}
                  onChange={(e) => updateConfig('cores', { headerPrincipal: e.target.value })}
                  placeholder="#1f2937"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Header Secundário</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.headerSecundario}
                  onChange={(e) => updateConfig('cores', { headerSecundario: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.headerSecundario}
                  onChange={(e) => updateConfig('cores', { headerSecundario: e.target.value })}
                  placeholder="#374151"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Texto Normal</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.textoNormal}
                  onChange={(e) => updateConfig('cores', { textoNormal: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.textoNormal}
                  onChange={(e) => updateConfig('cores', { textoNormal: e.target.value })}
                  placeholder="#111827"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Destaque</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.destaque}
                  onChange={(e) => updateConfig('cores', { destaque: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.destaque}
                  onChange={(e) => updateConfig('cores', { destaque: e.target.value })}
                  placeholder="#dc2626"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bordas</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.bordas}
                  onChange={(e) => updateConfig('cores', { bordas: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.bordas}
                  onChange={(e) => updateConfig('cores', { bordas: e.target.value })}
                  placeholder="#d1d5db"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fundo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.cores.fundo}
                  onChange={(e) => updateConfig('cores', { fundo: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.cores.fundo}
                  onChange={(e) => updateConfig('cores', { fundo: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Linhas alternadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Linhas Alternadas</Label>
              <Switch
                checked={config.cores.linhasAlternadas}
                onCheckedChange={(checked) => updateConfig('cores', { linhasAlternadas: checked })}
              />
            </div>

            {config.cores.linhasAlternadas && (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                <Label>Cor das Linhas Alternadas</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.cores.corLinhasAlternadas}
                    onChange={(e) => updateConfig('cores', { corLinhasAlternadas: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={config.cores.corLinhasAlternadas}
                    onChange={(e) => updateConfig('cores', { corLinhasAlternadas: e.target.value })}
                    placeholder="#f9fafb"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Layout e Espaçamento
          </CardTitle>
          <CardDescription>
            Configure margens, espaçamentos e orientação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Presets de layout */}
          <div className="space-y-2">
            <Label>Presets de Layout</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyLayoutPreset(key as keyof typeof LAYOUT_PRESETS)}
                >
                  {key === 'compact' ? 'Compacto' : 
                   key === 'normal' ? 'Normal' : 'Espaçoso'}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Orientação */}
          <div className="space-y-2">
            <Label>Orientação da Página</Label>
            <Select
              value={config.layout.orientacao}
              onValueChange={(value: 'retrato' | 'paisagem') => 
                updateConfig('layout', { orientacao: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retrato">Retrato</SelectItem>
                <SelectItem value="paisagem">Paisagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Margens */}
          <div className="space-y-2">
            <Label>Margens (px)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Superior</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.layout.margens.superior}
                  onChange={(e) => updateConfig('layout', {
                    margens: { ...config.layout.margens, superior: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Inferior</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.layout.margens.inferior}
                  onChange={(e) => updateConfig('layout', {
                    margens: { ...config.layout.margens, inferior: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Esquerda</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.layout.margens.esquerda}
                  onChange={(e) => updateConfig('layout', {
                    margens: { ...config.layout.margens, esquerda: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Direita</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={config.layout.margens.direita}
                  onChange={(e) => updateConfig('layout', {
                    margens: { ...config.layout.margens, direita: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Espaçamentos */}
          <div className="space-y-2">
            <Label>Espaçamentos (px)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Entre Seções</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={config.layout.espacamento.entreSecoes}
                  onChange={(e) => updateConfig('layout', {
                    espacamento: { ...config.layout.espacamento, entreSecoes: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Entre Tabelas</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={config.layout.espacamento.entreTabelas}
                  onChange={(e) => updateConfig('layout', {
                    espacamento: { ...config.layout.espacamento, entreTabelas: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Entre Parágrafos</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={config.layout.espacamento.entreParagrafos}
                  onChange={(e) => updateConfig('layout', {
                    espacamento: { ...config.layout.espacamento, entreParagrafos: parseInt(e.target.value) || 0 }
                  })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Entre Linhas</Label>
                <Input
                  type="number"
                  min="1"
                  max="3"
                  step="0.1"
                  value={config.layout.espacamento.entreLinhas}
                  onChange={(e) => updateConfig('layout', {
                    espacamento: { ...config.layout.espacamento, entreLinhas: parseFloat(e.target.value) || 1.2 }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Opções de layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Quebras Automáticas</Label>
              <Switch
                checked={config.layout.quebrasAutomaticas}
                onCheckedChange={(checked) => updateConfig('layout', { quebrasAutomaticas: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Colunas Duplas</Label>
              <Switch
                checked={config.layout.colunasDuplas}
                onCheckedChange={(checked) => updateConfig('layout', { colunasDuplas: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Elementos Visuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            Elementos Visuais
          </CardTitle>
          <CardDescription>
            Configure elementos visuais adicionais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label>Bordas</Label>
              <Switch
                checked={config.elementos.bordas}
                onCheckedChange={(checked) => updateConfig('elementos', { bordas: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Separadores</Label>
              <Switch
                checked={config.elementos.separadores}
                onCheckedChange={(checked) => updateConfig('elementos', { separadores: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Numeração de Páginas</Label>
              <Switch
                checked={config.elementos.numeracaoPaginas}
                onCheckedChange={(checked) => updateConfig('elementos', { numeracaoPaginas: checked })}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Marca D'água (opcional)</Label>
              <Input
                value={config.elementos.marcaDagua || ''}
                onChange={(e) => updateConfig('elementos', { marcaDagua: e.target.value || undefined })}
                placeholder="Texto da marca d'água"
              />
            </div>

            <div className="space-y-2">
              <Label>Rodapé Personalizado (opcional)</Label>
              <Input
                value={config.elementos.rodape || ''}
                onChange={(e) => updateConfig('elementos', { rodape: e.target.value || undefined })}
                placeholder="Texto do rodapé"
              />
            </div>

            <div className="space-y-2">
              <Label>Cabeçalho Personalizado (opcional)</Label>
              <Input
                value={config.elementos.cabecalho || ''}
                onChange={(e) => updateConfig('elementos', { cabecalho: e.target.value || undefined })}
                placeholder="Texto do cabeçalho"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}