# 📁 ESTRUTURA DE ARQUIVOS - Sistema de Créditos Pré-pagos

## 📦 Visão Geral do Pacote

```
temp/creditos/
├── components/wallet/          → Componentes React (6 arquivos)
├── hooks/                      → Hooks customizados (1 arquivo)
├── pages/                      → Páginas completas (2 arquivos)
├── types/                      → Definições TypeScript (1 arquivo)
├── sql/                        → Scripts SQL (1 arquivo)
├── docs/                       → Documentação técnica (5 arquivos)
├── INSTALACAO-COMPLETA.md      → Guia de instalação detalhado
├── README.md                   → Visão geral e início rápido
├── CHECKLIST-INSTALACAO.md     → Checklist passo a passo
├── TROUBLESHOOTING.md          → Solução de problemas
├── ESTRUTURA-ARQUIVOS.md       → Este arquivo
└── package-dependencies.json   → Lista de dependências
```

---

## 🎨 COMPONENTES (components/wallet/)

### 1. WalletTransacaoEditModal.tsx
**Propósito**: Modal para editar transações existentes

**Funcionalidades**:
- Editar valor da transação
- Editar descrição
- Preview do impacto no saldo
- Validações de valor positivo
- Confirmação antes de salvar

**Props**:
```typescript
interface WalletTransacaoEditModalProps {
  transacao: WalletTransacao;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Dependências**:
- useWalletAdmin (hook)
- Dialog, Button, Input, Label (shadcn/ui)
- formatCurrency (utils)

**Tamanho**: ~250 linhas

---

### 2. WalletTransacaoCancelModal.tsx
**Propósito**: Modal para cancelar transações com estorno

**Funcionalidades**:
- Cancelar transação
- Campo obrigatório para motivo
- Calcular impacto no saldo
- Validar se saldo não ficará negativo
- Confirmação com aviso destacado

**Props**:
```typescript
interface WalletTransacaoCancelModalProps {
  transacao: WalletTransacao;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Dependências**:
- useWalletAdmin (hook)
- Dialog, Button, Input, Label, Alert (shadcn/ui)
- formatCurrency (utils)

**Tamanho**: ~280 linhas

---

### 3. WalletAjusteSaldoModal.tsx
**Propósito**: Modal para ajustar saldo manualmente

**Funcionalidades**:
- Informar novo saldo desejado
- Calcular diferença automaticamente
- Campo obrigatório para motivo
- Preview visual do ajuste
- Validar saldo >= 0

**Props**:
```typescript
interface WalletAjusteSaldoModalProps {
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Dependências**:
- useWalletAdmin (hook)
- Dialog, Button, Input, Label, Alert (shadcn/ui)
- formatCurrency (utils)

**Tamanho**: ~300 linhas

---

### 4. WalletDeleteModal.tsx
**Propósito**: Modal para excluir carteira completa

**Funcionalidades**:
- Verificar saldo atual
- Bloquear exclusão se saldo > 0
- Confirmação dupla (nome + "EXCLUIR")
- Aviso sobre ação irreversível
- Redirecionamento após exclusão

**Props**:
```typescript
interface WalletDeleteModalProps {
  clienteId: string;
  clienteNome: string;
  saldoAtual: number;
  totalTransacoes?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
```

**Dependências**:
- useWalletAdmin (hook)
- Dialog, Button, Input, Label, Alert (shadcn/ui)
- formatCurrency (utils)
- useNavigate (react-router-dom)

**Tamanho**: ~250 linhas

---

### 5. WalletPDFGenerator.tsx
**Propósito**: Gerar extratos em PDF profissionais

**Funcionalidades**:
- Seleção de período (date pickers)
- Buscar transações do período
- Gerar PDF com jsPDF
- Incluir logo da empresa
- Dados do cliente
- Resumo financeiro
- Histórico de transações
- Download automático

**Props**:
```typescript
interface WalletPDFGeneratorProps {
  clienteId: string;
  clienteNome: string;
  clienteTelefone?: string;
  clienteEmail?: string;
  saldoAtual: number;
  totalDepositado: number;
  totalUsado: number;
  isOpen: boolean;
  onClose: () => void;
}
```

**Dependências**:
- jsPDF, jsPDF-autotable
- useWalletTransacoes (hook)
- Dialog, Button, Input, Label, Alert (shadcn/ui)
- formatCurrency, formatPhone (utils)
- Logo da empresa (asset)

**Tamanho**: ~350 linhas

---

### 6. WalletHistoricoAgrupado.tsx
**Propósito**: Exibir histórico de transações com agrupamento

**Funcionalidades**:
- Agrupar transações por mês
- Botões de editar/cancelar por transação
- Badges visuais (Editada, Cancelada, Ajuste)
- Texto riscado para canceladas
- Exibir motivo de cancelamento
- Desabilitar edição em canceladas
- Integrar modais de edição/cancelamento

**Props**:
```typescript
interface WalletHistoricoAgrupadoProps {
  clienteId: string;
  saldoAtual: number;
}
```

**Dependências**:
- useWalletTransacoes (hook)
- WalletTransacaoEditModal
- WalletTransacaoCancelModal
- Card, Badge, Button (shadcn/ui)
- formatCurrency (utils)

**Tamanho**: ~400 linhas

---

## 🪝 HOOKS (hooks/)

### useWalletAdmin.ts
**Propósito**: Hook customizado para operações administrativas

**Funcionalidades**:
- Mutation: editarTransacao
- Mutation: cancelarTransacao
- Mutation: ajustarSaldo
- Mutation: deletarCarteira
- Invalidação automática de queries
- Tratamento de erros
- Toasts de sucesso/erro

**Exports**:
```typescript
export const useWalletAdmin = () => {
  return {
    editarTransacao: UseMutationResult,
    cancelarTransacao: UseMutationResult,
    ajustarSaldo: UseMutationResult,
    deletarCarteira: UseMutationResult
  };
};
```

**Dependências**:
- @tanstack/react-query
- Supabase client
- toast (shadcn/ui)

**Tamanho**: ~200 linhas

---

## 📄 PÁGINAS (pages/)

### 1. CreditosPrePagos.tsx
**Propósito**: Página principal - lista de clientes com carteira

**Funcionalidades**:
- Cards de resumo (4 cards)
- Alerta de saldo baixo
- Busca por nome/telefone
- Filtros (todos, com saldo, saldo baixo)
- Tabela de clientes
- Paginação (20 por página)
- Botões de ação por cliente
- Modal de novo depósito
- Modal de exclusão

**Rota**: `/dashboard/creditos-prepagos`

**Dependências**:
- useWalletResumo, useWalletClientes (hooks)
- WalletDepositoButton, WalletDeleteModal (components)
- Card, Table, Button, Input, Badge (shadcn/ui)

**Tamanho**: ~500 linhas

---

### 2. WalletClienteDetalhes.tsx
**Propósito**: Página de detalhes - carteira de um cliente específico

**Funcionalidades**:
- Header com nome do cliente
- Card de saldo atual
- Botões de ação rápida
- Histórico de transações
- Integração com todos os modais

**Rota**: `/dashboard/creditos-prepagos/cliente/:clienteId`

**Dependências**:
- useWalletDetalhes (hook)
- WalletHistoricoAgrupado (component)
- Todos os modais
- Card, Button (shadcn/ui)

**Tamanho**: ~400 linhas

---

## 📝 TYPES (types/)

### wallet.ts
**Propósito**: Definições TypeScript para o sistema

**Interfaces**:
```typescript
// Carteira do cliente
export interface ClienteWallet {
  id: string;
  cliente_id: string;
  saldo_atual: number;
  total_depositado: number;
  total_usado: number;
  created_at: string;
  updated_at: string;
  cliente?: Cliente;
}

// Transação
export interface WalletTransacao {
  id: string;
  cliente_id: string;
  tipo: 'deposito' | 'uso' | 'ajuste';
  valor: number;
  descricao: string | null;
  cancelada: boolean;
  motivo_cancelamento: string | null;
  valor_original: number | null;
  editado_em: string | null;
  editado_por: string | null;
  created_at: string;
}

// Dados para operações
export interface EditarTransacaoData {
  transacao_id: string;
  novo_valor: number;
  nova_descricao?: string;
}

export interface CancelarTransacaoData {
  transacao_id: string;
  motivo: string;
}

export interface AjustarSaldoData {
  cliente_id: string;
  novo_saldo: number;
  motivo: string;
}
```

**Tamanho**: ~100 linhas

---

## 🗄️ SQL (sql/)

### database-changes.sql
**Propósito**: Script SQL completo para Supabase

**Conteúdo**:
1. Adicionar campos de auditoria
2. Criar função wallet_editar_transacao
3. Criar função wallet_cancelar_transacao
4. Criar função wallet_ajustar_saldo
5. Criar função wallet_deletar_carteira
6. Comentários e documentação

**Tamanho**: ~400 linhas

**Execução**: Supabase Dashboard → SQL Editor

---

## 📚 DOCUMENTAÇÃO (docs/)

### 1. requirements.md
**Conteúdo**:
- Introdução ao sistema
- Glossário de termos
- User stories completas
- Acceptance criteria (EARS format)
- Requisitos funcionais detalhados

**Tamanho**: ~150 linhas

---

### 2. design.md
**Conteúdo**:
- Visão geral da arquitetura
- Componentes e interfaces
- Modelos de dados
- Fluxos de operação
- Estratégia de testes
- Decisões técnicas

**Tamanho**: ~300 linhas

---

### 3. tasks.md
**Conteúdo**:
- 14 tarefas implementadas
- Subtarefas detalhadas
- Referências a requisitos
- Status de conclusão
- Notas de implementação

**Tamanho**: ~400 linhas

---

### 4. testing-guide.md
**Conteúdo**:
- Guia de testes funcionais
- Casos de teste
- Cenários de validação
- Testes de integração
- Checklist de QA

**Tamanho**: ~250 linhas

---

### 5. README.md
**Conteúdo**:
- Visão geral do sistema
- Funcionalidades principais
- Arquitetura resumida
- Como usar
- Manutenção

**Tamanho**: ~200 linhas

---

## 📋 ARQUIVOS DE SUPORTE

### INSTALACAO-COMPLETA.md
- Guia passo a passo completo
- Pré-requisitos
- Configuração detalhada
- Troubleshooting básico

**Tamanho**: ~800 linhas

---

### README.md (raiz)
- Início rápido
- Visão geral do pacote
- Instalação resumida
- Links para documentação

**Tamanho**: ~200 linhas

---

### CHECKLIST-INSTALACAO.md
- Checklist interativo
- Verificações passo a passo
- Validações
- Espaço para notas

**Tamanho**: ~500 linhas

---

### TROUBLESHOOTING.md
- Problemas comuns
- Soluções detalhadas
- Ferramentas de diagnóstico
- Quando pedir ajuda

**Tamanho**: ~600 linhas

---

### package-dependencies.json
- Lista de dependências NPM
- Versões recomendadas
- Comandos de instalação
- Componentes shadcn/ui

**Tamanho**: ~50 linhas

---

## 📊 ESTATÍSTICAS DO PACOTE

### Arquivos por Tipo
- **Componentes React**: 6 arquivos (~2.000 linhas)
- **Hooks**: 1 arquivo (~200 linhas)
- **Páginas**: 2 arquivos (~900 linhas)
- **Types**: 1 arquivo (~100 linhas)
- **SQL**: 1 arquivo (~400 linhas)
- **Documentação**: 10 arquivos (~3.000 linhas)

### Total
- **Arquivos de código**: 10
- **Arquivos de documentação**: 10
- **Linhas de código**: ~3.600
- **Linhas de documentação**: ~3.000
- **Total**: ~6.600 linhas

---

## 🎯 MAPA DE DEPENDÊNCIAS

```
CreditosPrePagos.tsx
├── useWalletResumo
├── useWalletClientes
├── WalletDepositoButton
└── WalletDeleteModal
    └── useWalletAdmin

WalletClienteDetalhes.tsx
├── useWalletDetalhes
├── WalletHistoricoAgrupado
│   ├── useWalletTransacoes
│   ├── WalletTransacaoEditModal
│   │   └── useWalletAdmin
│   └── WalletTransacaoCancelModal
│       └── useWalletAdmin
├── WalletAjusteSaldoModal
│   └── useWalletAdmin
├── WalletPDFGenerator
│   ├── useWalletTransacoes
│   ├── useEmpresa
│   └── jsPDF
└── WalletDeleteModal
    └── useWalletAdmin
```

---

## 🔄 FLUXO DE DADOS

```
1. Usuário interage com UI (Página/Modal)
2. Componente chama hook (useWalletAdmin)
3. Hook faz mutation (TanStack Query)
4. Mutation chama função SQL (Supabase)
5. Função SQL valida e executa
6. Resposta retorna para hook
7. Hook invalida queries (atualiza cache)
8. UI atualiza automaticamente
9. Toast de sucesso/erro aparece
```

---

## ✅ CHECKLIST DE ARQUIVOS

Use para verificar que todos os arquivos foram copiados:

### Componentes
- [ ] WalletTransacaoEditModal.tsx
- [ ] WalletTransacaoCancelModal.tsx
- [ ] WalletAjusteSaldoModal.tsx
- [ ] WalletDeleteModal.tsx
- [ ] WalletPDFGenerator.tsx
- [ ] WalletHistoricoAgrupado.tsx

### Hooks
- [ ] useWalletAdmin.ts

### Páginas
- [ ] CreditosPrePagos.tsx
- [ ] WalletClienteDetalhes.tsx

### Types
- [ ] wallet.ts

### SQL
- [ ] database-changes.sql

### Documentação
- [ ] requirements.md
- [ ] design.md
- [ ] tasks.md
- [ ] testing-guide.md
- [ ] README.md (docs)

### Suporte
- [ ] INSTALACAO-COMPLETA.md
- [ ] README.md (raiz)
- [ ] CHECKLIST-INSTALACAO.md
- [ ] TROUBLESHOOTING.md
- [ ] ESTRUTURA-ARQUIVOS.md
- [ ] package-dependencies.json

---

**Total de arquivos**: 21  
**Última atualização**: 2025-01-13
