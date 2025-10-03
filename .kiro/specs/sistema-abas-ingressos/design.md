# Design Document

## Overview

Este documento descreve o design técnico para implementar um sistema de abas na página de Ingressos, seguindo o padrão estabelecido na página de Viagens. A solução reutilizará componentes existentes e manterá consistência visual e funcional com o resto do sistema.

## Architecture

### Component Structure

```
Ingressos.tsx (Modified)
├── Tabs (shadcn/ui)
│   ├── TabsList
│   │   ├── TabsTrigger "Jogos Futuros"
│   │   └── TabsTrigger "Jogos Passados"
│   ├── TabsContent "futuros"
│   │   ├── Cards de Resumo Financeiro
│   │   ├── Controles (Busca + Visualização)
│   │   └── Grid/Tabela de Jogos Futuros
│   └── TabsContent "passados"
│       ├── Controles (Busca + Filtro Período + Visualização)
│       └── Grid/Tabela de Jogos Passados (Agrupados por Mês)
```

### State Management

O componente manterá os seguintes estados:
- `activeTab`: 'futuros' | 'passados'
- `viewMode`: 'grid' | 'table' (compartilhado entre abas)
- `periodoFiltro`: string (apenas para aba passados)
- `busca`: string (compartilhado entre abas)

## Components and Interfaces

### Modified Ingressos Component

```typescript
// Novos estados a serem adicionados
const [activeTab, setActiveTab] = useState<'futuros' | 'passados'>('futuros');
const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");

// Função para separar jogos por data
const separarJogosPorData = (jogos: any[]) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const futuros = jogos.filter(jogo => new Date(jogo.jogo_data) >= hoje);
  const passados = jogos.filter(jogo => new Date(jogo.jogo_data) < hoje);
  
  return { futuros, passados };
};

// Função para agrupar jogos passados por mês
const agruparJogosPorMes = (jogos: any[]) => {
  // Similar à implementação da página Viagens
};

// Função para filtrar por período
const filtrarJogosPorPeriodo = (jogos: any[]) => {
  // Similar à implementação da página Viagens
};
```

### Tab Structure

```typescript
<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
    <TabsTrigger value="futuros" className="flex items-center gap-2">
      <Calendar className="h-4 w-4" />
      Jogos Futuros
    </TabsTrigger>
    <TabsTrigger value="passados" className="flex items-center gap-2">
      <Archive className="h-4 w-4" />
      Jogos Passados
    </TabsTrigger>
  </TabsList>

  <TabsContent value="futuros">
    {/* Conteúdo jogos futuros */}
  </TabsContent>

  <TabsContent value="passados">
    {/* Conteúdo jogos passados */}
  </TabsContent>
</Tabs>
```

## Data Models

### Existing Data Structures

O design reutilizará as estruturas de dados existentes:
- `jogosComIngressos` (jogos futuros)
- `jogosPassados` (jogos passados)
- `resumoFinanceiro` (cards de resumo)

### New Data Processing

```typescript
// Separação de jogos por data
interface JogosSeparados {
  futuros: any[];
  passados: any[];
}

// Agrupamento por mês (para jogos passados)
interface GrupoMensal {
  chave: string;
  mesAno: string;
  jogos: any[];
}
```

## Error Handling

### Loading States

- Manter os estados de loading existentes
- Aplicar loading independente para cada aba
- Usar skeleton loading durante transições

### Empty States

- **Jogos Futuros Vazios**: Mensagem com botões para criar nova viagem ou novo ingresso
- **Jogos Passados Vazios**: Mensagem informativa sobre histórico vazio
- **Busca Sem Resultados**: Mensagem específica para cada aba

### Error States

- Reutilizar tratamento de erros existente
- Manter toast notifications para ações
- Preservar funcionalidade de retry

## Testing Strategy

### Unit Tests

1. **Separação de Jogos por Data**
   - Testar filtro de jogos futuros vs passados
   - Validar edge cases com datas limítrofes

2. **Agrupamento por Mês**
   - Testar agrupamento correto por mês/ano
   - Validar ordenação dos grupos

3. **Filtros de Período**
   - Testar cada opção de filtro
   - Validar cálculos de datas

### Integration Tests

1. **Navegação entre Abas**
   - Testar mudança de aba mantém estado
   - Validar persistência de filtros

2. **Busca Cross-Tab**
   - Testar busca funcionando em ambas abas
   - Validar reset de busca

### Visual Tests

1. **Consistência com Página Viagens**
   - Comparar estilos visuais
   - Validar responsividade

2. **Estados de Loading/Empty**
   - Testar todos os estados visuais
   - Validar mensagens apropriadas

## Implementation Notes

### Code Reuse

- Reutilizar lógica de agrupamento da página Viagens
- Adaptar funções de filtro existentes
- Manter padrões de nomenclatura consistentes

### Performance Considerations

- Usar `useMemo` para cálculos pesados de agrupamento
- Implementar lazy loading se necessário
- Otimizar re-renders com `useCallback`

### Accessibility

- Manter navegação por teclado nas abas
- Preservar labels ARIA existentes
- Garantir contraste adequado

### Browser Compatibility

- Testar em navegadores suportados
- Validar funcionalidade de datas
- Verificar responsividade mobile

## Migration Strategy

### Phase 1: Structure Setup
- Adicionar componente Tabs
- Implementar estados básicos
- Mover conteúdo existente para aba "Jogos Futuros"

### Phase 2: Data Separation
- Implementar lógica de separação por data
- Criar aba "Jogos Passados"
- Adicionar filtros de período

### Phase 3: Polish & Testing
- Implementar agrupamento por mês
- Adicionar visualização tabela
- Testes e refinamentos

### Rollback Plan

- Manter código original comentado
- Feature flag para ativar/desativar abas
- Backup da versão anterior