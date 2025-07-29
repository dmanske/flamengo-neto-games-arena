# Design Document

## Overview

Este design implementa um sistema robusto de busca e filtros para a lista de passageiros, corrigindo problemas de busca ineficaz e adicionando capacidades de filtro por passeios. A solução foca em performance, usabilidade e feedback visual claro.

## Architecture

### Componentes Principais

1. **SearchAndFilters Component** - Interface unificada de busca e filtros
2. **Enhanced useViagemDetails Hook** - Lógica de busca e filtro otimizada
3. **FilterBadges Component** - Feedback visual dos filtros ativos
4. **PasseirosList Component** - Lista otimizada com contadores

### Fluxo de Dados

```
User Input → SearchAndFilters → useViagemDetails → FilteredResults → PasseirosList
     ↓              ↓                    ↓              ↓              ↓
  Debounce    Apply Filters    Process Data    Update State    Render UI
```

## Components and Interfaces

### 1. SearchAndFilters Component

```typescript
interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
  passeioFilter: string | null;
  onPasseioFilterChange: (passeio: string | null) => void;
  availablePasseios: string[];
  resultCount: number;
  totalCount: number;
  onClearFilters: () => void;
}
```

**Funcionalidades:**
- Input de busca com debounce de 300ms
- Dropdown de filtro por status
- Dropdown de filtro por passeios
- Badges de filtros ativos
- Contador de resultados
- Botão "Limpar filtros"

### 2. Enhanced Search Logic

```typescript
interface SearchConfig {
  searchFields: string[];
  caseSensitive: boolean;
  accentSensitive: boolean;
  partialMatch: boolean;
}

interface FilterState {
  searchTerm: string;
  statusFilter: string | null;
  passeioFilter: string | null;
}
```

**Campos de Busca:**
- `nome` - Nome completo do passageiro
- `telefone` - Número de telefone
- `email` - Email do passageiro
- `cidade` - Cidade de origem
- `setor_maracana` - Setor no Maracanã
- `cidade_embarque` - Cidade de embarque
- `observacoes` - Observações do passageiro
- `passeios` - Nomes dos passeios selecionados

### 3. Filter Options

```typescript
interface PasseioFilterOption {
  value: string;
  label: string;
  count: number;
}

const PASSEIO_FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos os passageiros', count: totalCount },
  { value: 'sem-passeios', label: 'Sem passeios', count: semPasseiosCount },
  ...availablePasseios.map(passeio => ({
    value: passeio.id,
    label: passeio.nome,
    count: passageirosComPasseio[passeio.id]
  }))
];
```

## Data Models

### Enhanced PassageiroDisplay

```typescript
interface PassageiroDisplay {
  // Campos existentes...
  
  // Campos para busca otimizada
  searchableText: string; // Texto concatenado para busca
  normalizedSearchText: string; // Sem acentos, lowercase
  passeioNames: string[]; // Array de nomes de passeios
  hasPasseios: boolean; // Flag para filtro rápido
}
```

### Filter State Management

```typescript
interface FilterState {
  searchTerm: string;
  debouncedSearchTerm: string;
  statusFilter: 'todos' | 'pago' | 'pendente' | 'parcial' | null;
  passeioFilter: 'todos' | 'sem-passeios' | string | null;
  activeFiltersCount: number;
}
```

## Error Handling

### Search Error States

1. **Nenhum resultado encontrado**
   - Exibir mensagem: "Nenhum passageiro encontrado para: [termo]"
   - Sugerir: "Tente limpar alguns filtros ou alterar o termo de busca"

2. **Filtros muito restritivos**
   - Exibir: "Nenhum passageiro atende aos critérios selecionados"
   - Mostrar botão "Limpar filtros"

3. **Erro de performance**
   - Implementar timeout de 5s para buscas
   - Fallback para busca simplificada

## Testing Strategy

### Unit Tests

1. **Search Function Tests**
   ```typescript
   describe('searchPassageiros', () => {
     test('should find passengers by partial name');
     test('should be case insensitive');
     test('should ignore accents');
     test('should search in multiple fields');
     test('should handle empty search terms');
   });
   ```

2. **Filter Function Tests**
   ```typescript
   describe('filterPassageiros', () => {
     test('should filter by status');
     test('should filter by passeios');
     test('should combine multiple filters');
     test('should handle edge cases');
   });
   ```

### Integration Tests

1. **Search + Filter Combination**
2. **Performance with Large Datasets**
3. **Debounce Behavior**
4. **State Persistence**

### User Experience Tests

1. **Search Response Time** (< 300ms)
2. **Filter Application Speed** (< 100ms)
3. **Visual Feedback Clarity**
4. **Mobile Responsiveness**

## Performance Optimizations

### 1. Search Optimization

```typescript
// Pre-compute searchable text
const preprocessPassageiros = (passageiros: PassageiroDisplay[]) => {
  return passageiros.map(p => ({
    ...p,
    searchableText: [
      p.nome,
      p.telefone,
      p.email,
      p.cidade,
      p.setor_maracana,
      p.cidade_embarque,
      p.observacoes,
      ...(p.passeios?.map(pp => pp.passeio_nome) || [])
    ].filter(Boolean).join(' '),
    normalizedSearchText: normalizeText([...].join(' '))
  }));
};
```

### 2. Filter Memoization

```typescript
const filteredPassageiros = useMemo(() => {
  return applyFilters(preprocessedPassageiros, filterState);
}, [preprocessedPassageiros, filterState]);
```

### 3. Debounced Search

```typescript
const debouncedSearchTerm = useDebounce(searchTerm, 300);
```

## UI/UX Design

### Search Bar Design

```jsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    placeholder="Buscar por nome, telefone, cidade, setor, passeios..."
    value={searchTerm}
    onChange={(e) => onSearchChange(e.target.value)}
    className="pl-10 pr-4"
  />
  {searchTerm && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSearchChange('')}
      className="absolute right-2 top-1/2 transform -translate-y-1/2"
    >
      <X className="h-4 w-4" />
    </Button>
  )}
</div>
```

### Filter Badges

```jsx
<div className="flex flex-wrap gap-2 mt-2">
  {statusFilter && statusFilter !== 'todos' && (
    <Badge variant="secondary" className="flex items-center gap-1">
      Status: {statusFilter}
      <X className="h-3 w-3 cursor-pointer" onClick={() => onStatusFilterChange('todos')} />
    </Badge>
  )}
  {passeioFilter && passeioFilter !== 'todos' && (
    <Badge variant="secondary" className="flex items-center gap-1">
      Passeio: {getPasseioLabel(passeioFilter)}
      <X className="h-3 w-3 cursor-pointer" onClick={() => onPasseioFilterChange('todos')} />
    </Badge>
  )}
</div>
```

### Results Counter

```jsx
<div className="flex items-center justify-between mb-4">
  <span className="text-sm text-gray-600">
    Mostrando {filteredCount} de {totalCount} passageiros
  </span>
  {hasActiveFilters && (
    <Button variant="outline" size="sm" onClick={onClearFilters}>
      Limpar filtros
    </Button>
  )}
</div>
```

## Implementation Priority

### Phase 1: Core Search Fix
1. Implement enhanced search logic
2. Fix field searching (nome, telefone, etc.)
3. Add accent-insensitive search

### Phase 2: Passeio Filters
1. Add passeio filter dropdown
2. Implement "Sem passeios" filter
3. Add individual passeio filters

### Phase 3: UX Enhancements
1. Add filter badges
2. Implement result counters
3. Add clear filters functionality

### Phase 4: Performance & Polish
1. Optimize search performance
2. Add debouncing
3. Improve mobile experience