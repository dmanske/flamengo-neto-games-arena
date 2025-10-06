import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Search, RefreshCw } from 'lucide-react';

interface TemplatesEmptyStateProps {
  hasSearchQuery: boolean;
  searchQuery?: string;
  selectedCategory?: string | null;
  onCreateTemplate?: () => void;
  onClearSearch?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const TemplatesEmptyState: React.FC<TemplatesEmptyStateProps> = ({
  hasSearchQuery,
  searchQuery,
  selectedCategory,
  onCreateTemplate,
  onClearSearch,
  onRefresh,
  isLoading = false
}) => {
  
  // Estado vazio por busca sem resultados
  if (hasSearchQuery) {
    return (
      <Card className="p-8 text-center bg-yellow-50 border-yellow-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Search className="h-8 w-8 text-yellow-600" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-yellow-800">
              Nenhum template encontrado
            </h3>
            <p className="text-yellow-700 max-w-md">
              {searchQuery && selectedCategory ? (
                <>
                  Não encontramos templates na categoria <strong>"{selectedCategory}"</strong> que contenham <strong>"{searchQuery}"</strong>
                </>
              ) : searchQuery ? (
                <>
                  Não encontramos templates que contenham <strong>"{searchQuery}"</strong>
                </>
              ) : selectedCategory ? (
                <>
                  Não há templates na categoria <strong>"{selectedCategory}"</strong>
                </>
              ) : (
                'Tente usar outros termos de busca ou filtros'
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {onClearSearch && (
              <Button
                variant="outline"
                onClick={onClearSearch}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Limpar Busca
              </Button>
            )}
            
            {onCreateTemplate && (
              <Button
                onClick={onCreateTemplate}
                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
              >
                <Plus className="h-4 w-4" />
                Criar Template
              </Button>
            )}
          </div>

          <div className="text-xs text-yellow-600 mt-4">
            💡 <strong>Dica:</strong> Tente buscar por palavras-chave como "confirmação", "pagamento", "embarque" ou "grupo"
          </div>
        </div>
      </Card>
    );
  }

  // Estado vazio geral (sem templates no banco)
  return (
    <Card className="p-8 text-center bg-blue-50 border-blue-200">
      <div className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-blue-100 rounded-full">
          <FileText className="h-12 w-12 text-blue-600" />
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-blue-800">
            Nenhum template encontrado
          </h3>
          <p className="text-blue-700 max-w-lg">
            Você ainda não tem templates de WhatsApp cadastrados. 
            Templates facilitam o envio de mensagens padronizadas para seus passageiros.
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-200 max-w-md">
          <h4 className="font-medium text-blue-800 mb-2">📱 O que são templates?</h4>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Mensagens pré-definidas com variáveis</li>
            <li>• Substituição automática de dados da viagem</li>
            <li>• Organização por categorias</li>
            <li>• Reutilização em diferentes viagens</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRefresh && (
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          )}
          
          {onCreateTemplate && (
            <Button
              onClick={onCreateTemplate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Template
            </Button>
          )}
        </div>

        <div className="space-y-3 text-sm text-blue-600">
          <div className="flex items-center justify-center gap-2">
            <span>🔗</span>
            <span>Ou acesse o</span>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 hover:text-blue-800 underline"
              onClick={() => window.open('/dashboard/templates-whatsapp', '_blank')}
            >
              Gerenciador de Templates
            </Button>
          </div>
          
          <div className="bg-blue-100 p-3 rounded text-xs">
            <strong>💡 Dica:</strong> Comece criando templates básicos como "Confirmação de Viagem", 
            "Lembrete de Embarque" e "Link do Grupo" para cobrir as principais necessidades.
          </div>
        </div>
      </div>
    </Card>
  );
};