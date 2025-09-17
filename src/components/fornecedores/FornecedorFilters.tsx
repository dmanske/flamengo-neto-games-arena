import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FiltroTipoFornecedor } from './FiltroTipoFornecedor';
import { FornecedorSearch } from './FornecedorSearch';
import { TipoFornecedor } from '@/types/fornecedores';
import { FilterX, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface FornecedorFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  tipoSelecionado: TipoFornecedor | 'todos';
  onTipoChange: (tipo: TipoFornecedor | 'todos') => void;
  contadores?: Record<TipoFornecedor | 'total', number>;
  totalFiltrados: number;
  totalGeral: number;
}

export const FornecedorFilters = ({
  searchTerm,
  onSearchChange,
  tipoSelecionado,
  onTipoChange,
  contadores = {},
  totalFiltrados,
  totalGeral
}: FornecedorFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const temFiltrosAtivos = searchTerm.trim() !== '' || tipoSelecionado !== 'todos';

  const limparTodosFiltros = () => {
    onSearchChange('');
    onTipoChange('todos');
  };

  return (
    <div className="space-y-4">
      {/* Barra de busca principal */}
      <FornecedorSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* Filtros avançados */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros Avançados
              </Button>
              
              {temFiltrosAtivos && (
                <Badge variant="outline" className="text-xs">
                  {totalFiltrados} de {totalGeral}
                </Badge>
              )}
            </div>

            {temFiltrosAtivos && (
              <Button
                variant="outline"
                size="sm"
                onClick={limparTodosFiltros}
                className="flex items-center gap-1"
              >
                <FilterX className="h-3 w-3" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {showAdvanced && (
            <div className="space-y-3">
              {/* Filtro por tipo */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Tipo de Fornecedor
                </label>
                <FiltroTipoFornecedor
                  tipoSelecionado={tipoSelecionado}
                  onTipoChange={onTipoChange}
                  contadores={contadores}
                />
              </div>

              {/* Resumo dos filtros ativos */}
              {temFiltrosAtivos && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-600">Filtros ativos:</span>
                    
                    {searchTerm.trim() && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Busca: "{searchTerm.trim()}"
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSearchChange('')}
                          className="h-3 w-3 p-0 hover:bg-gray-200 rounded-full ml-1"
                        >
                          <FilterX className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                    
                    {tipoSelecionado !== 'todos' && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        Tipo: {tipoSelecionado}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onTipoChange('todos')}
                          className="h-3 w-3 p-0 hover:bg-gray-200 rounded-full ml-1"
                        >
                          <FilterX className="h-2 w-2" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo dos resultados */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          {temFiltrosAtivos ? (
            <>Mostrando {totalFiltrados} de {totalGeral} fornecedores</>
          ) : (
            <>{totalGeral} fornecedores cadastrados</>
          )}
        </span>
        
        {temFiltrosAtivos && (
          <Button
            variant="link"
            size="sm"
            onClick={limparTodosFiltros}
            className="text-blue-600 p-0 h-auto"
          >
            Ver todos
          </Button>
        )}
      </div>
    </div>
  );
};