# Design Document

## Overview

Este documento descreve o design técnico para implementar o gerenciamento avançado de passageiros nos ônibus, incluindo funcionalidades de troca entre ônibus e agrupamento de passageiros. A solução será integrada ao sistema existente de detalhes de viagem, mantendo a arquitetura atual baseada em React + TypeScript + Supabase.

## Architecture

### Componentes Principais

1. **TrocarOnibusModal** - Modal para troca de passageiros entre ônibus
2. **GrupoPassageiros** - Componente para exibir grupos de passageiros
3. **PassageiroGroupForm** - Formulário para criar/editar grupos no cadastro
4. **useGruposPassageiros** - Hook para gerenciar grupos
5. **useTrocaOnibus** - Hook para gerenciar trocas entre ônibus

### Integração com Sistema Existente

- **PassageiroRow.tsx** - Adicionar botão "Trocar Ônibus" e badge de grupo
- **PassageirosList.tsx** - Modificar para agrupar passageiros por grupo
- **PassageiroDialog.tsx** - Adicionar campo de grupo no cadastro
- **PassageiroEditDialog.tsx** - Adicionar campo de grupo na edição
- **OnibusCards.tsx** - Exibir indicadores visuais de grupos

## Data Models

### Alterações no Banco de Dados

```sql
-- Adicionar coluna para grupos na tabela viagem_passageiros
ALTER TABLE viagem_passageiros 
ADD COLUMN grupo_nome VARCHAR(100) NULL,
ADD COLUMN grupo_cor VARCHAR(7) NULL; -- Código hex da cor (#FF5733)

-- Índice para melhorar performance de consultas por grupo
CREATE INDEX idx_viagem_passageiros_grupo 
ON viagem_passageiros(viagem_id, grupo_nome) 
WHERE grupo_nome IS NOT NULL;
```

### Tipos TypeScript

```typescript
// Extensão do tipo PassageiroDisplay existente
interface PassageiroDisplay {
  // ... campos existentes
  grupo_nome?: string | null;
  grupo_cor?: string | null;
}

// Novo tipo para grupos
interface GrupoPassageiros {
  nome: string;
  cor: string;
  passageiros: PassageiroDisplay[];
  total_membros: number;
}

// Tipo para dados de troca
interface TrocaOnibusData {
  passageiro_id: string;
  onibus_origem_id: string | null;
  onibus_destino_id: string | null;
  capacidade_disponivel: number;
}
```

## Components and Interfaces

### 1. TrocarOnibusModal

```typescript
interface TrocarOnibusModalProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: PassageiroDisplay;
  onibusList: Onibus[];
  onConfirm: (onibusDestinoId: string | null) => Promise<void>;
}
```

**Funcionalidades:**
- Modal com dropdown de ônibus disponíveis
- Exibir capacidade atual/disponível de cada ônibus
- Validação de capacidade em tempo real
- Desabilitar ônibus lotados
- Feedback visual durante operação

### 2. GrupoPassageiros

```typescript
interface GrupoPassageirosProps {
  grupo: GrupoPassageiros;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
  onTrocarOnibus: (passageiro: PassageiroDisplay) => void;
}
```

**Funcionalidades:**
- Cabeçalho com nome do grupo e cor
- Lista de membros do grupo
- Ações individuais para cada membro
- Indicador visual de grupo (cor de fundo sutil)

### 3. PassageiroGroupForm

```typescript
interface PassageiroGroupFormProps {
  value?: string;
  onChange: (grupoNome: string, grupoCor: string) => void;
  gruposExistentes: Array<{nome: string, cor: string}>;
  viagemId: string;
}
```

**Funcionalidades:**
- Campo de texto para nome do grupo
- Seletor de cor para o grupo
- Dropdown com grupos existentes na viagem
- Opção "Criar novo grupo"
- Validação de nomes únicos

### 4. Hooks Personalizados

#### useGruposPassageiros

```typescript
interface UseGruposPassageiros {
  grupos: GrupoPassageiros[];
  passageirosSemGrupo: PassageiroDisplay[];
  criarGrupo: (nome: string, cor: string) => Promise<void>;
  adicionarAoGrupo: (passageiroId: string, grupoNome: string) => Promise<void>;
  removerDoGrupo: (passageiroId: string) => Promise<void>;
  obterCoresDisponiveis: () => string[];
  loading: boolean;
  error: string | null;
}
```

#### useTrocaOnibus

```typescript
interface UseTrocaOnibus {
  trocarPassageiro: (passageiroId: string, onibusDestinoId: string | null) => Promise<void>;
  verificarCapacidade: (onibusId: string) => number;
  obterOnibusDisponiveis: () => Array<{id: string, nome: string, capacidade: number, ocupacao: number}>;
  loading: boolean;
  error: string | null;
}
```

## Error Handling

### Validações de Troca de Ônibus

1. **Capacidade Insuficiente**
   - Verificar capacidade antes de permitir troca
   - Exibir mensagem clara: "Ônibus lotado (45/45 lugares)"
   - Desabilitar opção no dropdown

2. **Erro de Conexão**
   - Retry automático em caso de falha de rede
   - Mensagem de erro amigável
   - Manter estado anterior em caso de falha

### Validações de Grupos

1. **Nome Duplicado**
   - Verificar nomes únicos por viagem
   - Sugerir nomes alternativos
   - Permitir juntar-se a grupo existente

2. **Cor Duplicada**
   - Sugerir cores disponíveis
   - Permitir cores similares mas distinguíveis
   - Fallback para cores automáticas

## Testing Strategy

### Testes Unitários

1. **Hooks**
   - `useGruposPassageiros`: criação, edição, remoção de grupos
   - `useTrocaOnibus`: validação de capacidade, troca de ônibus

2. **Componentes**
   - `TrocarOnibusModal`: renderização, validações, ações
   - `GrupoPassageiros`: agrupamento visual, ações
   - `PassageiroGroupForm`: criação de grupos, validações

### Testes de Integração

1. **Fluxo de Troca**
   - Abrir modal → Selecionar ônibus → Confirmar → Verificar atualização

2. **Fluxo de Agrupamento**
   - Criar grupo → Adicionar passageiros → Verificar exibição visual

### Testes E2E

1. **Cenário Completo**
   - Cadastrar passageiros com grupos
   - Trocar passageiros entre ônibus
   - Verificar persistência dos grupos após troca

## Implementation Details

### Cores Padrão para Grupos

```typescript
const CORES_GRUPOS = [
  '#FF6B6B', // Vermelho suave
  '#4ECDC4', // Verde água
  '#45B7D1', // Azul claro
  '#96CEB4', // Verde menta
  '#FFEAA7', // Amarelo suave
  '#DDA0DD', // Roxo claro
  '#FFB347', // Laranja suave
  '#98D8C8', // Verde claro
];
```

### Ordenação da Lista de Passageiros

1. **Grupos primeiro** (ordenados alfabeticamente por nome do grupo)
2. **Passageiros sem grupo** (ordenados alfabeticamente por nome)

### Performance

- **Lazy loading** para grupos com muitos membros
- **Memoização** de componentes de grupo
- **Debounce** em campos de busca de grupos
- **Índices** no banco para consultas por grupo

### Acessibilidade

- **ARIA labels** para grupos e cores
- **Contraste** adequado para cores de grupos
- **Navegação por teclado** em modais
- **Screen reader** friendly para agrupamentos

## Migration Strategy

### Fase 1: Estrutura Base
- Criar migrations do banco
- Implementar hooks básicos
- Adicionar campos de grupo nos formulários

### Fase 2: Interface
- Implementar modal de troca
- Criar componente de grupos
- Integrar com lista existente

### Fase 3: Refinamentos
- Melhorar UX/UI
- Adicionar validações avançadas
- Otimizar performance

### Rollback Plan
- Campos de grupo são opcionais (nullable)
- Sistema funciona normalmente sem grupos
- Fácil remoção das funcionalidades se necessário