import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Clipboard, RefreshCw } from 'lucide-react';
import { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
import { TemplateSearch } from './TemplateSearch';
import { TemplateCategoryGroup } from './TemplateCategoryGroup';
import { TemplatesEmptyState } from './TemplatesEmptyState';
import { toast } from 'sonner';

interface TemplatesMensagemProps {
  mensagem: string;
  onMensagemChange: (mensagem: string) => void;
  dadosViagem?: {
    adversario?: string;
    dataJogo?: string;
    dataViagem?: string;
    horario?: string;
    localSaida?: string;
    valor?: string;
    onibus?: string;
    prazo?: string;
  };
}

export const TemplatesMensagem: React.FC<TemplatesMensagemProps> = ({
  mensagem,
  onMensagemChange,
  dadosViagem = {}
}) => {
  // Hook principal para templates do banco de dados
  const { 
    templates,
    loading,
    error,
    getTemplatesGroupedByCategory,
    searchState,
    setSearchQuery,
    setSelectedCategory,
    cacheState,
    refreshCache,
    getTemplatePreview
  } = useWhatsAppTemplates();

  // Processar templates agrupados por categoria
  const templatesAgrupados = useMemo(() => {
    return getTemplatesGroupedByCategory();
  }, [getTemplatesGroupedByCategory]);

  // Obter templates filtrados baseado na busca
  const templatesExibidos = useMemo(() => {
    if (searchState.query || searchState.selectedCategory) {
      return searchState.filteredTemplates;
    }
    return templates.filter(t => t.ativo);
  }, [templates, searchState]);

  // Preparar dados para o componente de busca
  const categoriesForSearch = useMemo(() => {
    return Object.values(templatesAgrupados).map(group => ({
      categoria: group.categoria,
      emoji: group.emoji,
      count: group.count
    }));
  }, [templatesAgrupados]);

  // Aplicar template selecionado
  const aplicarTemplate = (template: any) => {
    // Mapear variáveis do banco para o formato esperado pelo sistema
    let mensagemProcessada = template.mensagem;
    
    // Mapeamento de variáveis do banco para o sistema atual
    const mapeamentoVariaveis = {
      '{NOME}': '{nome}',
      '{ADVERSARIO}': dadosViagem.adversario || '{adversario}',
      '{DESTINO}': dadosViagem.adversario || '{adversario}',
      '{DATA}': dadosViagem.dataJogo || '{dataJogo}',
      '{HORARIO}': dadosViagem.horario || '{horario}',
      '{LOCAL_SAIDA}': dadosViagem.localSaida || '{localSaida}',
      '{HORARIO_CHEGADA}': dadosViagem.horario ? calcularHorarioChegada(dadosViagem.horario) : '{horario}',
      '{LINK_GRUPO}': '{linkGrupo}',
      '{TELEFONE}': '(11) 99999-9999',
      '{ONIBUS}': dadosViagem.onibus || '{onibus}',
      '{VALOR}': dadosViagem.valor || '{valor}'
    };
    
    // Substituir variáveis
    Object.entries(mapeamentoVariaveis).forEach(([variavelAntiga, variavelNova]) => {
      const regex = new RegExp(variavelAntiga.replace(/[{}]/g, '\\$&'), 'g');
      mensagemProcessada = mensagemProcessada.replace(regex, variavelNova);
    });
    
    onMensagemChange(mensagemProcessada);
  };

  // Função auxiliar para calcular horário de chegada (30min antes)
  const calcularHorarioChegada = (horarioSaida: string): string => {
    try {
      const [hours, minutes] = horarioSaida.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 30; // 30min antes
      
      if (totalMinutes < 0) {
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
  };

  // Copiar mensagem atual
  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(mensagem);
      toast.success('📋 Mensagem copiada para área de transferência!');
    } catch (error) {
      toast.error('❌ Erro ao copiar mensagem');
    }
  };

  // Colar do clipboard
  const handleColar = async () => {
    try {
      const textoColado = await navigator.clipboard.readText();
      if (textoColado) {
        onMensagemChange(textoColado);
        toast.success('📥 Texto colado da área de transferência!');
      } else {
        toast.warning('📋 Área de transferência vazia');
      }
    } catch (error) {
      toast.error('❌ Erro ao acessar área de transferência');
    }
  };

  // Navegar para gerenciador de templates
  const handleOpenTemplateManager = () => {
    window.open('/dashboard/templates-whatsapp', '_blank');
  };

  // Limpar busca
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header com Status do Cache */}
      <div className="flex items-center justify-between">
        <h6 className="text-lg font-medium text-gray-800">📋 Templates Disponíveis</h6>
        <div className="flex items-center gap-2">
          {cacheState.status === 'stale' && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshCache}
              className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <RefreshCw className="h-3 w-3" />
              Atualizar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenTemplateManager}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            Gerenciar Templates
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Carregando templates...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <span>❌</span>
            <span className="font-medium">Erro ao carregar templates:</span>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCache}
            className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
        </Card>
      )}

      {/* Templates Content */}
      {!loading && !error && (
        <>
          {/* Search and Filters */}
          {templates.length > 0 && (
            <TemplateSearch
              onSearch={setSearchQuery}
              onCategoryFilter={setSelectedCategory}
              categories={categoriesForSearch}
              currentQuery={searchState.query}
              currentCategory={searchState.selectedCategory}
              totalResults={templatesExibidos.length}
              isSearching={searchState.isSearching}
            />
          )}

          {/* Templates Display */}
          {templatesExibidos.length > 0 ? (
            <div className="space-y-6">
              {/* Se há busca ativa, mostrar resultados em lista simples */}
              {searchState.query || searchState.selectedCategory ? (
                <div className="space-y-4">
                  {Object.entries(
                    templatesExibidos.reduce((acc, template) => {
                      if (!acc[template.categoria]) acc[template.categoria] = [];
                      acc[template.categoria].push(template);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([categoria, templates]) => (
                    <TemplateCategoryGroup
                      key={categoria}
                      categoria={categoria}
                      emoji={templatesAgrupados[categoria]?.emoji || '📱'}
                      templates={templates}
                      onTemplateSelect={aplicarTemplate}
                      dadosViagem={dadosViagem}
                      isExpanded={true}
                    />
                  ))}
                </div>
              ) : (
                /* Mostrar todos os templates agrupados por categoria */
                <div className="space-y-4">
                  {Object.values(templatesAgrupados).map((group) => (
                    <TemplateCategoryGroup
                      key={group.categoria}
                      categoria={group.categoria}
                      emoji={group.emoji}
                      templates={group.templates}
                      onTemplateSelect={aplicarTemplate}
                      dadosViagem={dadosViagem}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <TemplatesEmptyState
              hasSearchQuery={!!(searchState.query || searchState.selectedCategory)}
              searchQuery={searchState.query}
              selectedCategory={searchState.selectedCategory}
              onCreateTemplate={handleOpenTemplateManager}
              onClearSearch={handleClearSearch}
              onRefresh={refreshCache}
              isLoading={loading}
            />
          )}
        </>
      )}

      {/* Botões de Copiar/Colar */}
      <div className="flex gap-2 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopiar}
          disabled={!mensagem.trim()}
          className="flex-1"
        >
          <Copy className="h-3 w-3 mr-2" />
          📋 Copiar Mensagem
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleColar}
          className="flex-1"
        >
          <Clipboard className="h-3 w-3 mr-2" />
          📥 Colar do Clipboard
        </Button>
      </div>

      {/* Variáveis Disponíveis */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h6 className="text-sm font-medium text-blue-800 mb-2">🔧 Variáveis Disponíveis (clique para adicionar):</h6>
        
        <div className="space-y-2">
          {/* Variáveis do Passageiro */}
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">👤 Passageiro:</div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{nome}')}
              >
                {'{nome}'}
              </Button>
            </div>
          </div>

          {/* Variáveis da Viagem */}
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">🏆 Jogo:</div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{adversario}')}
              >
                {'{adversario}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{linkGrupo}')}
              >
                {'{linkGrupo}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{dataJogo}')}
              >
                {'{dataJogo}'}
              </Button>
            </div>
          </div>

          {/* Variáveis da Viagem */}
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">🚌 Viagem:</div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{dataViagem}')}
              >
                {'{dataViagem}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{horario}')}
              >
                {'{horario}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{localSaida}')}
              >
                {'{localSaida}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{onibus}')}
              >
                {'{onibus}'}
              </Button>
            </div>
          </div>

          {/* Variáveis Financeiras */}
          <div>
            <div className="text-xs font-medium text-blue-700 mb-1">💰 Financeiro:</div>
            <div className="flex flex-wrap gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{valor}')}
              >
                {'{valor}'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs bg-white hover:bg-blue-100"
                onClick={() => onMensagemChange(mensagem + '{prazo}')}
              >
                {'{prazo}'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-blue-600">
          💡 <strong>Clique nas variáveis</strong> para adicionar automaticamente na sua mensagem!
        </div>
      </div>
    </div>
  );
};