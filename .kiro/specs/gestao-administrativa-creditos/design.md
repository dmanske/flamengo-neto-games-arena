# Design Document - Gestão Administrativa de Créditos

## Overview

Este documento descreve o design técnico para implementar funcionalidades administrativas no sistema de créditos pré-pagos, incluindo edição, cancelamento, ajuste e exclusão de transações, além de geração de relatórios em PDF.

O design foca em manter a integridade dos dados, fornecer auditoria básica através de campos de rastreamento, e garantir uma experiência de usuário clara e segura.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
├─────────────────────────────────────────────────────────────┤
│  WalletClienteDetalhes.tsx                                   │
│  ├── WalletTransacaoEditModal.tsx (NOVO)                    │
│  ├── WalletTransacaoCancelModal.tsx (NOVO)                  │
│  ├── WalletAjusteSaldoModal.tsx (NOVO)                      │
│  ├── WalletDeleteModal.tsx (NOVO)                           │
│  └── WalletPDFGenerator.tsx (NOVO)                          │
├─────────────────────────────────────────────────────────────┤
│  Hooks                                                        │
│  ├── useWallet.ts (ATUALIZAR)                               │
│  └── useWalletAdmin.ts (NOVO)                               │
├─────────────────────────────────────────────────────────────┤
│                    Supabase Client                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  Database Functions (PostgreSQL)                             │
│  ├── wallet_editar_transacao() (NOVO)                       │
│  ├── wallet_cancelar_transacao() (NOVO)                     │
│  ├── wallet_ajustar_saldo() (NOVO)                          │
│  └── wallet_deletar_carteira() (NOVO)                       │
├─────────────────────────────────────────────────────────────┤
│  Tables                                                       │
│  ├── cliente_wallet (ATUALIZAR)                             │
│  └── wallet_transacoes (ATUALIZAR)                          │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Schema Changes

#### Tabela: wallet_transacoes (Alterações)

```sql
ALTER TABLE wallet_transacoes ADD COLUMN IF NOT EXISTS:
- editado_em TIMESTAMP -- Data/hora da última edição
- editado_por TEXT -- Identificador do admin que editou
- cancelada BOOLEAN DEFAULT FALSE -- Se a transação foi cancelada
- motivo_cancelamento TEXT -- Motivo do cancelamento
- valor_original NUMERIC(10,2) -- Valor antes da edição (para histórico)
```

#### Tipo de Transação (Novo)

```sql
-- Adicionar novo tipo de transação
ALTER TYPE tipo_transacao ADD VALUE IF NOT EXISTS 'ajuste';
-- Tipos: 'deposito', 'uso', 'ajuste'
```

### 2. Database Functions

#### Function: wallet_editar_transacao

```sql
CREATE OR REPLACE FUNCTION wallet_editar_transacao(
  p_transacao_id UUID,
  p_novo_valor NUMERIC,
  p_nova_descricao TEXT,
  p_editado_por TEXT
) RETURNS JSON
```

**Lógica:**
1. Buscar transação atual
2. Calcular diferença de valor
3. Atualizar saldo da carteira
4. Salvar valor_original se primeira edição
5. Atualizar transação com novos dados
6. Registrar editado_em e editado_por
7. Retornar sucesso/erro

#### Function: wallet_cancelar_transacao

```sql
CREATE OR REPLACE FUNCTION wallet_cancelar_transacao(
  p_transacao_id UUID,
  p_motivo TEXT,
  p_cancelado_por TEXT
) RETURNS JSON
```

**Lógica:**
1. Buscar transação
2. Verificar se já está cancelada
3. Calcular impacto no saldo
4. Validar se saldo não ficará negativo
5. Reverter valor no saldo
6. Marcar transação como cancelada
7. Registrar motivo e quem cancelou
8. Retornar sucesso/erro

#### Function: wallet_ajustar_saldo

```sql
CREATE OR REPLACE FUNCTION wallet_ajustar_saldo(
  p_cliente_id UUID,
  p_novo_saldo NUMERIC,
  p_motivo TEXT,
  p_ajustado_por TEXT
) RETURNS JSON
```

**Lógica:**
1. Buscar saldo atual
2. Calcular diferença
3. Criar transação tipo 'ajuste'
4. Atualizar saldo da carteira
5. Registrar motivo
6. Retornar sucesso/erro

#### Function: wallet_deletar_carteira

```sql
CREATE OR REPLACE FUNCTION wallet_deletar_carteira(
  p_cliente_id UUID
) RETURNS JSON
```

**Lógica:**
1. Verificar se saldo = 0
2. Se saldo > 0, retornar erro
3. Deletar todas as transações
4. Deletar carteira
5. Retornar sucesso/erro

### 3. Frontend Components

#### WalletTransacaoEditModal.tsx

**Props:**
```typescript
interface WalletTransacaoEditModalProps {
  transacao: WalletTransacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State:**
```typescript
- valor: number
- descricao: string
- isLoading: boolean
- error: string | null
```

**Funcionalidades:**
- Formulário com campos valor e descrição
- Validação de valor > 0
- Preview do impacto no saldo
- Confirmação antes de salvar
- Feedback visual de sucesso/erro

#### WalletTransacaoCancelModal.tsx

**Props:**
```typescript
interface WalletTransacaoCancelModalProps {
  transacao: WalletTransacao;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State:**
```typescript
- motivo: string
- isLoading: boolean
- error: string | null
```

**Funcionalidades:**
- Campo obrigatório para motivo
- Cálculo do impacto no saldo
- Validação de saldo não negativo
- Confirmação com aviso destacado
- Feedback visual

#### WalletAjusteSaldoModal.tsx

**Props:**
```typescript
interface WalletAjusteSaldoModalProps {
  clienteId: string;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State:**
```typescript
- novoSaldo: number
- motivo: string
- diferenca: number
- isLoading: boolean
- error: string | null
```

**Funcionalidades:**
- Input para novo saldo
- Cálculo automático da diferença
- Campo obrigatório para motivo
- Preview visual do ajuste
- Validação de saldo >= 0
- Confirmação com destaque

#### WalletDeleteModal.tsx

**Props:**
```typescript
interface WalletDeleteModalProps {
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**State:**
```typescript
- confirmacao: string
- isLoading: boolean
- error: string | null
```

**Funcionalidades:**
- Verificação de saldo = 0
- Campo de confirmação (digitar nome)
- Aviso sobre ação irreversível
- Botão vermelho de perigo
- Redirecionamento após exclusão

#### WalletPDFGenerator.tsx

**Props:**
```typescript
interface WalletPDFGeneratorProps {
  clienteId: string;
  clienteNome: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**State:**
```typescript
- dataInicio: Date
- dataFim: Date
- isGenerating: boolean
- error: string | null
```

**Funcionalidades:**
- Seleção de período (date pickers)
- Preview de quantas transações
- Geração usando jsPDF ou react-pdf
- Download automático
- Formatação profissional

### 4. Hook: useWalletAdmin.ts

```typescript
export const useWalletAdmin = () => {
  // Mutation: Editar transação
  const editarTransacao = useMutation({
    mutationFn: async (dados: EditarTransacaoData) => {
      const { data, error } = await supabase.rpc('wallet_editar_transacao', {
        p_transacao_id: dados.transacao_id,
        p_novo_valor: dados.novo_valor,
        p_nova_descricao: dados.nova_descricao,
        p_editado_por: 'admin' // TODO: pegar do contexto
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Transação editada com sucesso!');
      queryClient.invalidateQueries(['wallet']);
    }
  });

  // Mutation: Cancelar transação
  const cancelarTransacao = useMutation({
    mutationFn: async (dados: CancelarTransacaoData) => {
      const { data, error } = await supabase.rpc('wallet_cancelar_transacao', {
        p_transacao_id: dados.transacao_id,
        p_motivo: dados.motivo,
        p_cancelado_por: 'admin'
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Transação cancelada com sucesso!');
      queryClient.invalidateQueries(['wallet']);
    }
  });

  // Mutation: Ajustar saldo
  const ajustarSaldo = useMutation({
    mutationFn: async (dados: AjustarSaldoData) => {
      const { data, error } = await supabase.rpc('wallet_ajustar_saldo', {
        p_cliente_id: dados.cliente_id,
        p_novo_saldo: dados.novo_saldo,
        p_motivo: dados.motivo,
        p_ajustado_por: 'admin'
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Saldo ajustado com sucesso!');
      queryClient.invalidateQueries(['wallet']);
    }
  });

  // Mutation: Deletar carteira
  const deletarCarteira = useMutation({
    mutationFn: async (clienteId: string) => {
      const { data, error } = await supabase.rpc('wallet_deletar_carteira', {
        p_cliente_id: clienteId
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Carteira excluída com sucesso!');
      queryClient.invalidateQueries(['wallet']);
    }
  });

  return {
    editarTransacao,
    cancelarTransacao,
    ajustarSaldo,
    deletarCarteira
  };
};
```

## Data Models

### WalletTransacao (Atualizado)

```typescript
interface WalletTransacao {
  id: string;
  cliente_id: string;
  tipo: 'deposito' | 'uso' | 'ajuste';
  valor: number;
  descricao: string;
  forma_pagamento?: string;
  referencia_externa?: string;
  created_at: string;
  
  // Novos campos
  editado_em?: string;
  editado_por?: string;
  cancelada: boolean;
  motivo_cancelamento?: string;
  valor_original?: number;
  
  // Relações
  cliente?: {
    nome: string;
    telefone: string;
  };
}
```

### Tipos para Operações Admin

```typescript
interface EditarTransacaoData {
  transacao_id: string;
  novo_valor: number;
  nova_descricao: string;
}

interface CancelarTransacaoData {
  transacao_id: string;
  motivo: string;
}

interface AjustarSaldoData {
  cliente_id: string;
  novo_saldo: number;
  motivo: string;
}
```

## Error Handling

### Tipos de Erro

1. **SALDO_INSUFICIENTE**: Cancelamento resultaria em saldo negativo
2. **CARTEIRA_COM_SALDO**: Tentativa de excluir carteira com saldo > 0
3. **TRANSACAO_CANCELADA**: Tentativa de editar transação já cancelada
4. **VALOR_INVALIDO**: Valor negativo ou zero
5. **MOTIVO_OBRIGATORIO**: Falta motivo em cancelamento/ajuste
6. **TRANSACAO_NAO_ENCONTRADA**: ID inválido

### Tratamento

```typescript
try {
  await operacao();
} catch (error) {
  if (error.message.includes('saldo insuficiente')) {
    toast.error('Operação cancelada: saldo ficaria negativo');
  } else if (error.message.includes('carteira com saldo')) {
    toast.error('Não é possível excluir carteira com saldo positivo');
  } else {
    toast.error('Erro ao processar operação');
  }
}
```

## Testing Strategy

### Testes Manuais

1. **Edição de Transação**
   - Editar valor de depósito (aumentar e diminuir)
   - Editar valor de uso (aumentar e diminuir)
   - Verificar recálculo de saldo
   - Verificar indicador "Editado"

2. **Cancelamento**
   - Cancelar depósito (saldo deve diminuir)
   - Cancelar uso (saldo deve aumentar)
   - Tentar cancelar quando resultaria em saldo negativo
   - Verificar badge "Cancelada"

3. **Ajuste de Saldo**
   - Ajustar para valor maior
   - Ajustar para valor menor
   - Tentar ajustar para valor negativo
   - Verificar transação de ajuste no histórico

4. **Exclusão de Carteira**
   - Tentar excluir com saldo > 0
   - Excluir com saldo = 0
   - Verificar remoção de transações
   - Verificar redirecionamento

5. **Geração de PDF**
   - Gerar com período específico
   - Gerar período sem transações
   - Verificar formatação
   - Verificar dados corretos

### Validações de Integridade

- Saldo nunca deve ficar negativo
- Transações canceladas não podem ser editadas
- Exclusão só com saldo zero
- Todos os ajustes devem ter motivo

## Security Considerations

1. **Validações no Backend**: Todas as operações críticas validadas em SQL functions
2. **Confirmações**: Ações irreversíveis exigem confirmação explícita
3. **Rastreamento**: Campos editado_por e cancelado_por para auditoria básica
4. **Integridade**: Transações em SQL para operações atômicas
5. **Permissões**: Apenas administradores podem acessar essas funcionalidades

## Performance Considerations

1. **Queries Otimizadas**: Índices em cliente_id e created_at
2. **Invalidação Seletiva**: Apenas queries afetadas são invalidadas
3. **PDF Assíncrono**: Geração não bloqueia interface
4. **Paginação**: Histórico paginado para grandes volumes

## Future Enhancements (Fora do Escopo Atual)

- Auditoria completa com tabela de logs
- Notificações automáticas para clientes
- Exportação em Excel
- Gráficos de uso ao longo do tempo
- Transferência entre carteiras
- Bloqueio/desbloqueio de carteiras

---

## ✅ Status da Implementação

**Implementado em:** 16/12/2024

### Componentes Criados

| Componente | Arquivo | Status |
|------------|---------|--------|
| WalletTransacaoEditModal | `src/components/wallet/WalletTransacaoEditModal.tsx` | ✅ |
| WalletTransacaoCancelModal | `src/components/wallet/WalletTransacaoCancelModal.tsx` | ✅ |
| WalletAjusteSaldoModal | `src/components/wallet/WalletAjusteSaldoModal.tsx` | ✅ |
| WalletDeleteModal | `src/components/wallet/WalletDeleteModal.tsx` | ✅ |
| WalletPDFGenerator | `src/components/wallet/WalletPDFGenerator.tsx` | ✅ |
| WalletHistoricoAgrupado | `src/components/wallet/WalletHistoricoAgrupado.tsx` | ✅ Atualizado |

### Hooks e Tipos

| Arquivo | Status |
|---------|--------|
| `src/hooks/useWalletAdmin.ts` | ✅ Criado |
| `src/types/wallet.ts` | ✅ Atualizado |

### Banco de Dados

| Função SQL | Status |
|------------|--------|
| wallet_editar_transacao | ✅ |
| wallet_cancelar_transacao | ✅ |
| wallet_ajustar_saldo | ✅ |
| wallet_deletar_carteira | ✅ |

### Notas de Implementação

1. **PDF Generator**: Utiliza jsPDF para geração de PDFs
2. **Validações**: Implementadas tanto no frontend quanto no backend
3. **Feedback Visual**: Toasts, badges e indicadores de loading
4. **Segurança**: Todas as operações críticas validadas em SQL functions
