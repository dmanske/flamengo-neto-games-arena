import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter } from 'lucide-react';

interface TemplateSearchProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string | null) => void;
  categories: Array<{ categoria: string; emoji: string; count: number }>;
  currentQuery: string;
  currentCategory: string | null;
  totalResults: number;
  isSearching: boolean;
}

export const TemplateSearch: React.FC<TemplateSearchProps> = ({
  onSearch,
  onCategoryFilter,
  categories,
  currentQuery,
  currentCategory,
  totalResults,
  isSearching
}) => {
  const [searchInput, setSearchInput] = useState(currentQuery);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearch]);

  // Limpar busca
  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  // Limpar filtro de categoria
  const handleClearCategory = () => {
    onCategoryFilter(null);
  };

  // Limpar todos os filtros
  const handleClearAll = () => {
    setSearchInput('');
    onSearch('');
    onCategoryFilter(null);
  };

  const hasActiveFilters = currentQuery || currentCategory;

  return (
    <div className="space-y-4">
      {/* Campo de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar templates por nome ou conteúdo..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Filtro por Categoria */}
        <div className="flex-1 min-w-0">
          <Select
            value={currentCategory || 'todos'}
            onValueChange={(value) => onCategoryFilter(value === 'todos' ? null : value)}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Todas as categorias" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">
                <div className="flex items-center gap-2">
                  <span>📋</span>
                  <span>Todas as categorias</span>
                  <span className="text-gray-500">
                    ({categories.reduce((sum, cat) => sum + cat.count, 0)})
                  </span>
                </div>
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.categoria} value={category.categoria}>
                  <div className="flex items-center gap-2">
                    <span>{category.emoji}</span>
                    <span className="capitalize">{category.categoria}</span>
                    <span className="text-gray-500">({category.count})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botão Limpar Filtros */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <X className="h-3 w-3" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Resultados da Busca */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {isSearching && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          )}
          <span>
            {totalResults} template{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs">
            {currentQuery && (
              <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Search className="h-3 w-3" />
                <span>"{currentQuery}"</span>
                <button
                  onClick={handleClearSearch}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
            {currentCategory && (
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                <Filter className="h-3 w-3" />
                <span className="capitalize">{currentCategory}</span>
                <button
                  onClick={handleClearCategory}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="h-2 w-2" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};