/**
 * Componente principal do sistema de personalização de relatórios
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  Eye, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Users,
  Bus,
  MapPin,
  Palette,
  FileText,
  Loader2
} from 'lucide-react';

import {
  PersonalizationConfig,
  ValidationResult,
  Template,
  ConfigScenario
} from '@/types/personalizacao-relatorios';
import { PersonalizationValidator, PersonalizationSanitizer } from '@/lib/validations/personalizacao-relatorios';
import { PersonalizationStorage } from '@/lib/personalizacao/storage';
import { getDefaultConfig } from '@/lib/personalizacao-defaults';
import { cloneConfig } from '@/lib/personalizacao-utils';

// Componentes das abas (serão implementados nas próximas tarefas)
import { HeaderPersonalizacao } from './personalizacao/HeaderPersonalizacao';
import { PassageirosPersonalizacao } from './personalizacao/PassageirosPersonalizacao';
import { OnibusPersonalizacao } from './personalizacao/OnibusPersonalizacao';
import { PasseiosPersonalizacao } from './personalizacao/PasseiosPersonalizacao';
import { SecoesPersonalizacao } from './personalizacao/SecoesPersonalizacao';
import { EstiloPersonalizacao } from './personalizacao/EstiloPersonalizacao';
import { TemplatesPersonalizacao } from './personalizacao/TemplatesPersonalizacao';
import { PreviewPersonalizacao } from './personalizacao/PreviewPersonalizacao';

// ============================================================================
// INTERFACES
// ============================================================================

interface PersonalizacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagemId: string;
  configuracaoInicial?: PersonalizationConfig;
  onAplicar: (config: PersonalizationConfig) => void;
  realData?: {
    viagem: any;
    passageiros: any[];
    onibus: any[];
    passeios: any[];
  };
}

type TabId = 'header' | 'passageiros' | 'onibus' | 'passeios' | 'secoes' | 'estilo' | 'templates' | 'preview';

interface TabInfo {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function PersonalizacaoDialog({
  open,
  onOpenChange,
  viagemId,
  configuracaoInicial,
  onAplicar,
  realData
}: PersonalizacaoDialogProps) {
  // Estados principais
  const [config, setConfig] = useState<PersonalizationConfig>(() => 
    configuracaoInicial || getDefaultConfig(ConfigScenario.COMPLETO)
  );
  const [originalConfig, setOriginalConfig] = useState<PersonalizationConfig>(config);
  const [activeTab, setActiveTab] = useState<TabId>('header');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Configuração das abas
  const tabs: TabInfo[] = useMemo(() => [
    {
      id: 'header',
      label: 'Cabeçalho',
      icon: <Settings className="w-4 h-4" />,
      description: 'Configurar informações do cabeçalho'
    },
    {
      id: 'passageiros',
      label: 'Passageiros',
      icon: <Users className="w-4 h-4" />,
      description: 'Personalizar lista de passageiros'
    },
    {
      id: 'onibus',
      label: 'Ônibus',
      icon: <Bus className="w-4 h-4" />,
      description: 'Configurar dados dos ônibus'
    },
    {
      id: 'passeios',
      label: 'Passeios',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Personalizar informações de passeios'
    },
    {
      id: 'secoes',
      label: 'Seções',
      icon: <FileText className="w-4 h-4" />,
      description: 'Gerenciar seções do relatório'
    },
    {
      id: 'estilo',
      label: 'Estilo',
      icon: <Palette className="w-4 h-4" />,
      description: 'Formatação e aparência'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <FileText className="w-4 h-4" />,
      description: 'Gerenciar templates salvos'
    },
    {
      id: 'preview',
      label: 'Preview',
      icon: <Eye className="w-4 h-4" />,
      description: 'Visualizar resultado final'
    }
  ], []);

  // ============================================================================
  // EFEITOS
  // ============================================================================

  // Validar configuração sempre que mudar
  useEffect(() => {
    const newValidation = PersonalizationValidator.validate(config);
    setValidation(newValidation);
  }, [config]);

  // Detectar mudanças
  useEffect(() => {
    const changed = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(changed);
  }, [config, originalConfig]);

  // Inicializar armazenamento
  useEffect(() => {
    if (open) {
      PersonalizationStorage.initialize();
    }
  }, [open]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Atualiza a configuração
   */
  const handleConfigChange = useCallback((newConfig: PersonalizationConfig) => {
    setConfig(newConfig);
  }, []);

  /**
   * Atualiza uma parte específica da configuração
   */
  const handlePartialConfigChange = useCallback(<K extends keyof PersonalizationConfig>(
    key: K,
    value: PersonalizationConfig[K]
  ) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
      metadata: {
        ...prev.metadata,
        atualizadoEm: new Date().toISOString()
      }
    }));
  }, []);

  /**
   * Aplica a configuração
   */
  const handleAplicar = useCallback(async () => {
    if (!validation?.valido) {
      return;
    }

    setIsLoading(true);
    try {
      // Sanitizar configuração antes de aplicar
      const sanitized = PersonalizationSanitizer.sanitize(config);
      
      // Salvar no histórico
      PersonalizationStorage.addToHistory(sanitized, 'aplicado', 'Configuração aplicada ao relatório');
      
      // Salvar como configuração atual
      PersonalizationStorage.saveCurrentConfig(sanitized);
      
      // Aplicar configuração
      onAplicar(sanitized);
      
      // Fechar dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao aplicar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config, validation, onAplicar, onOpenChange]);

  /**
   * Cancela as alterações
   */
  const handleCancelar = useCallback(() => {
    if (hasChanges) {
      const confirmed = window.confirm('Você tem alterações não salvas. Deseja realmente cancelar?');
      if (!confirmed) return;
    }
    
    setConfig(originalConfig);
    onOpenChange(false);
  }, [hasChanges, originalConfig, onOpenChange]);

  /**
   * Reseta para configuração padrão
   */
  const handleResetar = useCallback(() => {
    const confirmed = window.confirm('Isso irá resetar todas as configurações para o padrão. Continuar?');
    if (!confirmed) return;
    
    const defaultConfig = getDefaultConfig(ConfigScenario.COMPLETO);
    setConfig(defaultConfig);
    
    PersonalizationStorage.addToHistory(defaultConfig, 'resetado', 'Configuração resetada para padrão');
  }, []);

  /**
   * Salva como template
   */
  const handleSalvarTemplate = useCallback(() => {
    const nome = window.prompt('Nome do template:');
    if (!nome) return;
    
    try {
      PersonalizationStorage.saveTemplate({
        nome,
        descricao: `Template criado em ${new Date().toLocaleDateString()}`,
        categoria: 'personalizado',
        configuracao: cloneConfig(config),
        metadata: {
          ...config.metadata,
          nome,
          categoria: 'personalizado'
        }
      });
      
      alert('Template salvo com sucesso!');
    } catch (error) {
      alert(`Erro ao salvar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [config]);

  /**
   * Exporta configuração
   */
  const handleExportar = useCallback(() => {
    try {
      const exported = PersonalizationStorage.exportConfig(config, {
        viagemId,
        usuario: 'atual'
      });
      
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configuracao-relatorio-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Erro ao exportar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [config, viagemId]);

  /**
   * Importa configuração
   */
  const handleImportar = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const imported = PersonalizationStorage.importConfig(content);
          setConfig(imported);
          
          PersonalizationStorage.addToHistory(imported, 'importado', `Configuração importada de ${file.name}`);
          alert('Configuração importada com sucesso!');
        } catch (error) {
          alert(`Erro ao importar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Personalização de Relatório
            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                Alterações não salvas
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Validação */}
        {validation && (
          <div className="flex-shrink-0 space-y-2">
            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validation.errors.length} erro(s) encontrado(s). Corrija antes de aplicar.
                </AlertDescription>
              </Alert>
            )}
            
            {validation.warnings.length > 0 && validation.errors.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validation.warnings.length} aviso(s) encontrado(s).
                </AlertDescription>
              </Alert>
            )}
            
            {validation.valido && validation.warnings.length === 0 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Configuração válida e pronta para aplicar.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Abas */}
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as TabId)}
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center gap-1 p-2 h-auto text-xs"
                  title={tab.description}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 mt-4 min-h-0">
              <ScrollArea className="h-full">
                <TabsContent value="header" className="mt-0">
                  <HeaderPersonalizacao
                    config={config.header}
                    onChange={(header) => handlePartialConfigChange('header', header)}
                  />
                </TabsContent>

                <TabsContent value="passageiros" className="mt-0">
                  <PassageirosPersonalizacao
                    config={config.passageiros}
                    onChange={(passageiros) => handlePartialConfigChange('passageiros', passageiros)}
                  />
                </TabsContent>

                <TabsContent value="onibus" className="mt-0">
                  <OnibusPersonalizacao
                    config={config.onibus}
                    onChange={(onibus) => handlePartialConfigChange('onibus', onibus)}
                  />
                </TabsContent>

                <TabsContent value="passeios" className="mt-0">
                  <PasseiosPersonalizacao
                    config={config.passeios}
                    onChange={(passeios) => handlePartialConfigChange('passeios', passeios)}
                  />
                </TabsContent>

                <TabsContent value="secoes" className="mt-0">
                  <SecoesPersonalizacao
                    config={config.secoes}
                    onChange={(secoes) => handlePartialConfigChange('secoes', secoes)}
                  />
                </TabsContent>

                <TabsContent value="estilo" className="mt-0">
                  <EstiloPersonalizacao
                    config={config.estilo}
                    onChange={(estilo) => handlePartialConfigChange('estilo', estilo)}
                  />
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                  <TemplatesPersonalizacao
                    currentConfig={config}
                    onApplyTemplate={(template) => {
                      setConfig(template.configuracao);
                      PersonalizationStorage.addToHistory(template.configuracao, 'template_aplicado', `Template "${template.nome}" aplicado`);
                    }}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-0">
                  <PreviewPersonalizacao
                    config={config}
                    viagemId={viagemId}
                    realData={realData}
                  />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </div>

        <Separator className="flex-shrink-0" />

        {/* Ações */}
        <div className="flex-shrink-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetar}
              disabled={isLoading}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSalvarTemplate}
              disabled={isLoading || !validation?.valido}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportar}
              disabled={isLoading}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleImportar}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancelar}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleAplicar}
              disabled={isLoading || !validation?.valido}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Aplicando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aplicar Configuração
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}