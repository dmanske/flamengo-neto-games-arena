# Design Document

## Overview

Este documento descreve o design técnico para criar uma página dedicada "Detalhes do Jogo de Ingressos" que substitui o modal atual, oferecendo uma experiência mais rica e organizada para gerenciar ingressos de um jogo específico. A solução seguirá o padrão estabelecido pela página DetalhesViagem, mantendo consistência visual e funcional.

## Architecture

### Page Structure

```
DetalhesJogoIngressos.tsx
├── ModernJogoDetailsLayout (Header Component)
│   ├── Logos dos Times (Flamengo vs Adversário)
│   ├── Informações do Jogo (Data, Hora, Local)
│   ├── Botões de Ação (Voltar, Editar, Deletar, PDF)
│   └── Cards de Resumo (4 cards financeiros)
├── Tabs (shadcn/ui)
│   ├── TabsList
│   │   ├── TabsTrigger "Ingressos"
│   │   └── TabsTrigger "Financeiro"
│   ├── TabsContent "ingressos"
│   │   ├── Barra de Busca Inteligente
│   │   ├── Filtros (Status, Setor, Valor)
│   │   ├── Contador de Resultados
│   │   └── Tabela de Ingressos com Ações
│   └── TabsContent "financeiro"
│       ├── Resumo Financeiro Detalhado
│       ├── Histórico de Pagamentos
│       └── Análise de Performance
└── Modais (IngressoForm, IngressoDetails, Confirmações)
```

### URL Structure

```
/dashboard/jogo-ingressos/:jogoKey
```

Onde `jogoKey` é uma string codificada no formato:
`{adversario}-{data-iso}-{local}`

Exemplo: `palmeiras-2024-03-15-casa`

### State Management

```typescript
// Estados principais
const [jogo, setJogo] = useState<JogoDetails | null>(null);
const [ingressos, setIngressos] = useState<Ingresso[]>([]);
const [activeTab, setActiveTab] = useState<'ingressos' | 'financeiro'>('ingressos');
const [busca, setBusca] = useState('');
const [filtros, setFiltros] = useState<FiltrosIngressos>({});

// Estados de UI
const [loading, setLoading] = useState(true);
const [modalFormAberto, setModalFormAberto] = useState(false);
const [ingressoSelecionado, setIngressoSelecionado] = useState<Ingresso | null>(null);
```

## Components and Interfaces

### ModernJogoDetailsLayout Component

```typescript
interface ModernJogoDetailsLayoutProps {
  jogo: JogoDetails;
  onVoltar: () => void;
  onEditar: () => void;
  onDeletar: () => void;
  onExportarPDF: () => void;
  children: React.ReactNode;
}
```

**Responsabilidades:**
- Renderizar header com logos e informações do jogo
- Exibir cards de resumo financeiro
- Fornecer botões de ação principais
- Manter layout responsivo

### IngressosCard Component

```typescript
interface IngressosCardProps {
  ingressos: Ingresso[];
  busca: string;
  filtros: FiltrosIngressos;
  onBuscaChange: (busca: string) => void;
  onFiltrosChange: (filtros: FiltrosIngressos) => void;
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
  onNovoIngresso: () => void;
}
```

**Responsabilidades:**
- Renderizar barra de busca inteligente
- Exibir filtros por status, setor, valor
- Mostrar tabela de ingressos com ações
- Gerenciar estados de loading e vazio

### FinanceiroJogo Component

```typescript
interface FinanceiroJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
}
```

**Responsabilidades:**
- Gerenciar sistema de sub-abas financeiras
- Coordenar comunicação entre componentes filhos
- Manter estado global da aba financeiro
- Fornecer dados para todos os sub-componentes

### Sub-Components da Aba Financeiro

#### ResumoFinanceiroJogo Component
```typescript
interface ResumoFinanceiroJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  receitas: ReceitaJogo[];
  despesas: DespesaJogo[];
}
```

#### ReceitasJogo Component
```typescript
interface ReceitasJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  onAdicionarReceita: (receita: ReceitaJogo) => void;
  onEditarReceita: (receita: ReceitaJogo) => void;
  onExcluirReceita: (id: string) => void;
}
```

#### DespesasJogo Component
```typescript
interface DespesasJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  onAdicionarDespesa: (despesa: DespesaJogo) => void;
  onEditarDespesa: (despesa: DespesaJogo) => void;
  onExcluirDespesa: (id: string) => void;
}
```

#### ListaClientesJogo Component
```typescript
interface ListaClientesJogoProps {
  ingressos: Ingresso[];
  onMarcarComoPago: (ingressoId: string) => void;
  onEnviarCobranca: (cliente: Cliente) => void;
}
```

#### PendenciasJogo Component
```typescript
interface PendenciasJogoProps {
  ingressosPendentes: Ingresso[];
  onRegistrarCobranca: (ingressoId: string, tipo: string) => void;
  onMarcarComoPago: (ingressoId: string) => void;
}
```

#### GraficosJogo Component
```typescript
interface GraficosJogoProps {
  jogo: JogoDetails;
  ingressos: Ingresso[];
  dadosComparativos?: JogoComparativo[];
}
```

## Data Models

### JogoDetails Interface

```typescript
interface JogoDetails {
  adversario: string;
  jogo_data: string;
  local_jogo: 'casa' | 'fora';
  logo_adversario?: string;
  logo_flamengo?: string;
  total_ingressos: number;
  receita_total: number;
  lucro_total: number;
  ingressos_pendentes: number;
  ingressos_pagos: number;
  viagem_ingressos_id?: string;
}
```

### New Data Models

#### ReceitaJogo Interface
```typescript
interface ReceitaJogo {
  id: string;
  jogo_id: string;
  tipo: 'ingresso' | 'patrocinio' | 'comissao' | 'extra';
  descricao: string;
  valor: number;
  data_receita: string;
  observacoes?: string;
  created_at: string;
}
```

#### DespesaJogo Interface
```typescript
interface DespesaJogo {
  id: string;
  jogo_id: string;
  tipo: 'custo_ingresso' | 'transporte' | 'alimentacao' | 'comissao' | 'outros';
  descricao: string;
  valor: number;
  data_despesa: string;
  categoria: string;
  observacoes?: string;
  created_at: string;
}
```

#### SetorAnalytics Interface
```typescript
interface SetorAnalytics {
  setor: string;
  quantidade_vendida: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  preco_medio: number;
  margem_percentual: number;
  taxa_ocupacao: number;
}
```

#### JogoComparativo Interface
```typescript
interface JogoComparativo {
  adversario: string;
  data: string;
  receita_total: number;
  lucro_total: number;
  total_ingressos: number;
  ticket_medio: number;
}
```
```

### Search and Filter Logic

```typescript
// Busca inteligente
const filtrarIngressos = (ingressos: Ingresso[], busca: string) => {
  if (!busca) return ingressos;
  
  const termo = busca.toLowerCase();
  return ingressos.filter(ingresso => 
    ingresso.cliente?.nome.toLowerCase().includes(termo) ||
    ingresso.cliente?.cpf.includes(termo) ||
    ingresso.cliente?.telefone.includes(termo) ||
    ingresso.setor_estadio.toLowerCase().includes(termo) ||
    ingresso.adversario.toLowerCase().includes(termo)
  );
};

// Filtros avançados
const aplicarFiltros = (ingressos: Ingresso[], filtros: FiltrosIngressos) => {
  return ingressos.filter(ingresso => {
    if (filtros.situacao_financeira && ingresso.situacao_financeira !== filtros.situacao_financeira) {
      return false;
    }
    if (filtros.valor_min && ingresso.valor_final < filtros.valor_min) {
      return false;
    }
    if (filtros.valor_max && ingresso.valor_final > filtros.valor_max) {
      return false;
    }
    return true;
  });
};
```

## Error Handling

### Navigation Validation

- Validar formato da `jogoKey` na URL
- Verificar se o jogo existe (tem ingressos)
- Redirecionar para página de ingressos se inválido

### Loading States

- Skeleton loading durante carregamento inicial
- Loading states para ações (deletar, exportar)
- Indicadores visuais para operações assíncronas

### Empty States

- Estado vazio quando jogo não tem ingressos
- Mensagem de erro quando jogo não é encontrado
- Opções de ação em estados vazios

## Testing Strategy

### Unit Tests

1. **Hook useJogoDetails**
   - Testar busca de dados do jogo
   - Validar cálculos financeiros
   - Testar tratamento de erros

2. **Componentes de Filtro**
   - Testar busca inteligente
   - Validar filtros por status e valor
   - Testar combinação de filtros

3. **Navegação**
   - Testar parsing da jogoKey
   - Validar redirecionamentos
   - Testar navegação entre abas

### Integration Tests

1. **Fluxo Completo**
   - Navegar da página de ingressos
   - Gerenciar ingressos na página de detalhes
   - Retornar à página principal

2. **Ações CRUD**
   - Criar novo ingresso
   - Editar ingresso existente
   - Deletar ingresso individual
   - Deletar jogo completo

### Visual Tests

1. **Consistência com DetalhesViagem**
   - Comparar layouts e estilos
   - Validar responsividade
   - Testar estados visuais

2. **Funcionalidade de Busca**
   - Testar busca em tempo real
   - Validar filtros visuais
   - Testar estados de resultado

## Implementation Notes

### Code Reuse

- Reutilizar componentes de layout da DetalhesViagem
- Adaptar componentes existentes de ingressos
- Manter padrões de nomenclatura consistentes

### Performance Considerations

- Usar `useMemo` para filtros e buscas
- Implementar `useCallback` para funções de ação
- Lazy loading para dados pesados

### Accessibility

- Navegação por teclado em todas as funcionalidades
- Labels ARIA apropriados
- Contraste adequado em todos os elementos

### Browser Compatibility

- Testar em navegadores suportados
- Validar funcionalidade de datas e formatação
- Verificar responsividade mobile

## Migration Strategy

### Phase 1: Core Structure
- Criar página base e roteamento
- Implementar hook useJogoDetails
- Criar layout básico

### Phase 2: Content Implementation
- Implementar aba de ingressos
- Adicionar busca e filtros
- Criar aba financeira

### Phase 3: Integration
- Conectar com página de ingressos
- Implementar ações CRUD
- Testes e refinamentos

### Rollback Plan

- Manter modal atual como fallback
- Feature flag para ativar/desativar nova página
- Backup das funcionalidades existentes