# Design Document - Agrupamento de Ingressos

## Overview

Este documento descreve o design técnico para implementar o sistema de agrupamento de ingressos, replicando a funcionalidade existente de agrupamento de passageiros. A implementação seguirá os mesmos padrões e componentes já utilizados no sistema de viagens.

## Architecture

A arquitetura segue o padrão existente do projeto:

```
┌─────────────────────────────────────────────────────────────┐
│                    IngressosCard (modificado)                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              GrupoIngressos (novo)                       ││
│  │  - Renderiza card visual com cor do grupo               ││
│  │  - Lista ingressos do grupo                             ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │           Ingressos Individuais                          ││
│  │  - Tabela padrão para ingressos sem grupo               ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              useGruposIngressos (novo hook)                  │
│  - agruparIngressos(): separa em grupos e individuais       │
│  - adicionarAoGrupo(): atualiza ingresso com grupo          │
│  - removerDoGrupo(): remove grupo do ingresso               │
│  - obterCoresDisponiveis(): retorna cores não usadas        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase (ingressos)                      │
│  - grupo_nome: text (nullable)                              │
│  - grupo_cor: text (nullable)                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Hook: useGruposIngressos

```typescript
// src/hooks/useGruposIngressos.ts
interface UseGruposIngressos {
  grupos: GrupoIngressos[];
  ingressosSemGrupo: Ingresso[];
  gruposExistentes: Array<{nome: string, cor: string}>;
  agruparIngressos: (ingressos: Ingresso[]) => {
    grupos: GrupoIngressos[];
    semGrupo: Ingresso[];
  };
  adicionarAoGrupo: (ingressoId: string, grupoNome: string, grupoCor: string) => Promise<void>;
  removerDoGrupo: (ingressoId: string) => Promise<void>;
  obterCoresDisponiveis: () => string[];
  loading: boolean;
  error: string | null;
}
```

### 2. Componente: GrupoIngressos

```typescript
// src/components/detalhes-jogo/GrupoIngressos.tsx
interface GrupoIngressosProps {
  grupo: GrupoIngressos;
  index: number;
  onVerDetalhes: (ingresso: Ingresso) => void;
  onEditar: (ingresso: Ingresso) => void;
  onDeletar: (ingresso: Ingresso) => void;
}
```

### 3. Tipo: GrupoIngressos

```typescript
// src/types/grupos-ingressos.ts
interface GrupoIngressos {
  nome: string;
  cor: string;
  ingressos: Ingresso[];
  total_membros: number;
}
```

## Data Models

### Extensão da tabela ingressos

```sql
-- Migration: add_grupo_fields_to_ingressos.sql
ALTER TABLE ingressos 
ADD COLUMN grupo_nome TEXT,
ADD COLUMN grupo_cor TEXT;

-- Índice para otimizar queries de agrupamento
CREATE INDEX idx_ingressos_grupo ON ingressos(grupo_nome, grupo_cor);
```

### Extensão do tipo Ingresso

```typescript
// Adicionar ao src/types/ingressos.ts
interface Ingresso {
  // ... campos existentes ...
  grupo_nome?: string | null;
  grupo_cor?: string | null;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Ordenação correta de grupos e individuais
*For any* lista de ingressos, quando agrupados, todos os ingressos com grupo devem aparecer antes dos ingressos individuais, e dentro de cada categoria devem estar ordenados alfabeticamente (grupos por nome do grupo, individuais por nome do cliente).
**Validates: Requirements 1.1, 4.1, 4.2**

### Property 2: Classificação correta de ingressos
*For any* ingresso, se possui grupo_nome e grupo_cor definidos, deve aparecer em um grupo; caso contrário, deve aparecer na seção de individuais.
**Validates: Requirements 1.2, 1.3, 2.3**

### Property 3: Contagem correta de membros do grupo
*For any* grupo de ingressos, o total_membros deve ser igual ao número de ingressos no array de ingressos do grupo.
**Validates: Requirements 1.4**

### Property 4: Grupos vazios não existem
*For any* resultado de agrupamento, não deve existir nenhum grupo com zero membros.
**Validates: Requirements 2.4**

### Property 5: Cores válidas da paleta
*For any* grupo criado, a cor deve pertencer à paleta predefinida de 10 cores.
**Validates: Requirements 3.1**

### Property 6: Filtros preservam estrutura de grupos
*For any* lista de ingressos filtrada, a estrutura de agrupamento deve ser mantida (grupos primeiro, individuais depois, ordenação alfabética).
**Validates: Requirements 4.3**

## Error Handling

1. **Erro ao atualizar grupo**: Exibir toast de erro e manter estado anterior
2. **Cor inválida**: Validar cor contra paleta antes de salvar
3. **Nome de grupo vazio**: Impedir criação com validação no formulário
4. **Erro de conexão**: Retry automático com feedback ao usuário

## Testing Strategy

### Abordagem Dual: Unit Tests + Property-Based Tests

#### Unit Tests
- Testar renderização do componente GrupoIngressos
- Testar integração do hook useGruposIngressos
- Testar edge cases específicos (grupo com 1 membro, todas cores usadas)

#### Property-Based Tests
- **Biblioteca**: fast-check (já utilizada no projeto ou vitest com @fast-check/vitest)
- **Configuração**: Mínimo de 100 iterações por propriedade
- **Formato de tag**: `**Feature: agrupamento-ingressos, Property {number}: {property_text}**`

Cada propriedade de corretude será implementada como um teste de propriedade separado, gerando ingressos aleatórios e verificando que as propriedades se mantêm.
