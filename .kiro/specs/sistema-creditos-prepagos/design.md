# Design Document - Sistema de Créditos Pré-pagos

## Overview

O Sistema de Créditos Pré-pagos é uma carteira digital interna simples que permite depósitos antecipados e uso automático do saldo. Diferente do sistema atual complexo, este foca apenas em: saldo por cliente, histórico de transações e dashboard administrativo. A arquitetura é minimalista, priorizando performance e facilidade de uso.

## Architecture

### Estrutura de Dados Simplificada

```sql
-- Tabela principal: saldo atual por cliente
CREATE TABLE cliente_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) UNIQUE NOT NULL,
  saldo_atual DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  total_depositado DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  total_usado DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações (histórico completo)
CREATE TABLE wallet_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('deposito', 'uso')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_posterior DECIMAL(10,2) NOT NULL,
  descricao TEXT,
  forma_pagamento VARCHAR(50), -- apenas para depósitos
  referencia_externa VARCHAR(100), -- ID da compra/viagem quando aplicável
  usuario_admin VARCHAR(100), -- quem fez a operação
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_wallet_cliente ON cliente_wallet(cliente_id);
CREATE INDEX idx_transacoes_cliente ON wallet_transacoes(cliente_id);
CREATE INDEX idx_transacoes_data ON wallet_transacoes(created_at);
CREATE INDEX idx_transacoes_tipo ON wallet_transacoes(tipo);
```

### Fluxo de Dados Simplificado

1. **Depósito**: Admin → Valor → Atualiza Saldo + Cria Transação
2. **Uso**: Sistema → Debita Saldo → Cria Transação (automático)
3. **Consulta**: Cliente/Admin → Visualiza Saldo + Histórico
4. **Relatório**: Admin → Filtra Período → Exporta Dados

## Components and Interfaces

### Estrutura de Páginas

#### 1. `/creditos-prepagos` - Nova Seção Principal
```
📱 Layout Responsivo
├── 📊 Cards de Resumo Geral
│   ├── Total de Clientes com Saldo
│   ├── Valor Total em Carteiras
│   ├── Depósitos do Mês
│   └── Usos do Mês
├── 🔍 Filtros e Busca
│   ├── Buscar por Cliente
│   ├── Filtrar por Período
│   └── Filtrar por Tipo (Depósito/Uso)
├── 📋 Lista de Clientes
│   ├── Nome + Telefone
│   ├── Saldo Atual (destaque visual)
│   ├── Última Movimentação
│   └── Ações Rápidas
└── ➕ Botão "Novo Depósito"
```

#### 2. Aba "Carteira" na Página do Cliente
```
💳 Visão do Cliente Individual
├── 💰 Card de Saldo Atual (grande e destacado com alertas visuais)
├── 📈 Resumo Rápido
│   ├── Total Depositado (histórico)
│   ├── Total Usado (histórico)
│   └── Última Movimentação
├── 🔍 Filtros Rápidos
│   ├── "Este mês" | "Últimos 3 meses" | "Este ano" | "Tudo"
│   └── Busca por descrição
├── 📋 Histórico Agrupado por Mês (Accordion)
│   ├── 📅 Janeiro 2024 [💰 +R$ 500 | 🛒 -R$ 300] ▼
│   │   ├── 15/01 💰 +R$ 500,00 PIX "Depósito Janeiro"
│   │   ├── 12/01 🛒 -R$ 180,00 Uso "Viagem Flamengo"
│   │   └── 10/01 🛒 -R$ 120,00 Uso "Passeio Cristo"
│   ├── 📅 Dezembro 2023 [💰 +R$ 1.400 | 🛒 -R$ 200] ▶
│   └── 📅 Novembro 2023 [💰 +R$ 300 | 🛒 -R$ 150] ▶
└── ➕ Botão "Novo Depósito" (para este cliente)
```

### Componentes React

#### 1. `WalletDepositoModal`
```typescript
interface WalletDepositoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteId?: string; // opcional, se não informado abre seletor
  onSuccess: () => void;
}

// Campos do formulário:
// - Cliente (seletor se não pré-definido)
// - Valor (input numérico com máscara R$)
// - Forma de Pagamento (select)
// - Descrição (textarea opcional)
```

#### 2. `WalletSaldoCard`
```typescript
interface WalletSaldoCardProps {
  saldo: number;
  totalDepositado: number;
  totalUsado: number;
  ultimaMovimentacao?: Date;
  size?: 'small' | 'large';
  showAlerts?: boolean; // para alertas de saldo baixo
}

// Visual:
// - Saldo em destaque (fonte grande)
// - Cores dinâmicas: Verde (>R$ 500), Amarelo (R$ 100-500), Vermelho (<R$ 100)
// - Alerta visual quando saldo baixo (ícone ⚠️ + borda vermelha)
// - Indicadores de tendência (↗️ crescendo, ↘️ diminuindo)
// - Animação suave nas mudanças
```

#### 3. `WalletHistoricoAgrupado`
```typescript
interface WalletHistoricoAgrupadoProps {
  clienteId: string;
  filtroRapido?: 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo';
  showFilters?: boolean;
  showExport?: boolean;
}

// Features:
// - Agrupamento por mês em accordion
// - Resumo mensal (entradas vs saídas)
// - Filtros rápidos por período
// - Busca por descrição
// - Exportação para Excel
// - Alertas visuais para saldo baixo
```

#### 4. `WalletDashboard`
```typescript
interface WalletDashboardProps {
  periodo?: { inicio: Date; fim: Date };
}

// Métricas principais:
// - Cards de resumo geral
// - Gráfico de evolução mensal
// - Top 10 clientes por saldo
// - Alertas (saldos baixos, sem movimentação)
```

## Data Models

### Tipos TypeScript Simplificados

```typescript
export interface ClienteWallet {
  id: string;
  cliente_id: string;
  saldo_atual: number;
  total_depositado: number;
  total_usado: number;
  created_at: string;
  updated_at: string;
  
  // Relacionamento
  cliente?: {
    id: string;
    nome: string;
    telefone?: string;
    email?: string;
  };
}

export interface WalletTransacao {
  id: string;
  cliente_id: string;
  tipo: 'deposito' | 'uso';
  valor: number;
  saldo_anterior: number;
  saldo_posterior: number;
  descricao?: string;
  forma_pagamento?: string; // apenas para depósitos
  referencia_externa?: string; // ID da compra quando aplicável
  usuario_admin?: string;
  created_at: string;
  
  // Relacionamento
  cliente?: {
    nome: string;
    telefone?: string;
  };
}

export interface WalletResumo {
  total_clientes_com_saldo: number;
  valor_total_carteiras: number;
  depositos_mes_atual: number;
  usos_mes_atual: number;
  saldo_medio_por_cliente: number;
  clientes_saldo_baixo: number; // menos de R$ 100
}

// Formulários
export interface DepositoFormData {
  cliente_id: string;
  valor: number;
  forma_pagamento: string;
  descricao?: string;
}

export interface FiltrosWallet {
  cliente_id?: string;
  tipo?: 'deposito' | 'uso';
  data_inicio?: string;
  data_fim?: string;
  valor_minimo?: number;
  valor_maximo?: number;
  filtro_rapido?: 'mes_atual' | 'ultimos_3_meses' | 'ano_atual' | 'tudo';
  busca_descricao?: string;
}

// Novo tipo para agrupamento por mês
export interface WalletTransacoesPorMes {
  chave: string; // 'YYYY-MM'
  nome: string; // 'Janeiro 2024'
  resumo: {
    total_depositos: number;
    total_usos: number;
    saldo_liquido: number; // depositos - usos
    quantidade_transacoes: number;
  };
  transacoes: WalletTransacao[];
}

// Tipo para alertas visuais
export interface WalletAlerta {
  tipo: 'saldo_baixo' | 'sem_movimentacao' | 'alto_uso';
  mensagem: string;
  cor: 'yellow' | 'red' | 'blue';
  icone: string;
}
```

### Validações Zod

```typescript
export const depositoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number()
    .min(0.01, 'Valor deve ser maior que zero')
    .max(50000, 'Valor máximo de R$ 50.000 por depósito'),
  forma_pagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  descricao: z.string().max(500, 'Descrição muito longa').optional(),
});

export const usoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  descricao: z.string().max(200, 'Descrição muito longa'),
  referencia_externa: z.string().optional(),
});
```

## Error Handling

### Validações de Negócio

```typescript
export class WalletError extends Error {
  constructor(
    message: string,
    public code: 
      | 'SALDO_INSUFICIENTE'
      | 'CLIENTE_NAO_ENCONTRADO' 
      | 'VALOR_INVALIDO'
      | 'TRANSACAO_DUPLICADA'
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

// Validações principais:
// 1. Saldo suficiente antes de usar créditos
// 2. Valores sempre positivos
// 3. Cliente deve existir
// 4. Prevenir transações duplicadas (idempotência)
// 5. Limites de valor por transação
```

### Tratamento de Erros na UI

```typescript
// Mensagens amigáveis para o usuário
const ERROR_MESSAGES = {
  SALDO_INSUFICIENTE: 'Saldo insuficiente. Saldo atual: R$ {saldo}',
  CLIENTE_NAO_ENCONTRADO: 'Cliente não encontrado no sistema',
  VALOR_INVALIDO: 'Valor deve ser maior que zero',
  TRANSACAO_DUPLICADA: 'Esta transação já foi processada',
} as const;
```

## Testing Strategy

### Testes Unitários Essenciais

```typescript
// 1. Cálculos de saldo
describe('Wallet Calculations', () => {
  test('should update balance correctly after deposit', () => {
    const saldoAnterior = 100;
    const deposito = 50;
    const saldoPosterior = calcularNovoSaldo(saldoAnterior, deposito, 'deposito');
    expect(saldoPosterior).toBe(150);
  });

  test('should prevent negative balance', () => {
    const saldoAnterior = 50;
    const uso = 100;
    expect(() => {
      calcularNovoSaldo(saldoAnterior, uso, 'uso');
    }).toThrow(WalletError);
  });
});

// 2. Validações de formulário
describe('Form Validations', () => {
  test('should validate deposit form correctly', () => {
    const validData = {
      cliente_id: 'uuid-valid',
      valor: 100,
      forma_pagamento: 'PIX',
    };
    expect(depositoSchema.parse(validData)).toEqual(validData);
  });
});
```

### Testes de Integração

```typescript
// 1. Fluxo completo: Depósito → Uso → Verificar Saldo
// 2. Múltiplas transações simultâneas
// 3. Relatórios com dados reais
// 4. Performance com muitas transações
```

## Performance Considerations

### Otimizações de Banco

```sql
-- Índices estratégicos
CREATE INDEX CONCURRENTLY idx_wallet_saldo_atual ON cliente_wallet(saldo_atual DESC);
CREATE INDEX CONCURRENTLY idx_transacoes_cliente_data ON wallet_transacoes(cliente_id, created_at DESC);

-- View materializada para relatórios
CREATE MATERIALIZED VIEW wallet_resumo_mensal AS
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_transacoes,
  SUM(CASE WHEN tipo = 'deposito' THEN valor ELSE 0 END) as total_depositos,
  SUM(CASE WHEN tipo = 'uso' THEN valor ELSE 0 END) as total_usos
FROM wallet_transacoes
GROUP BY DATE_TRUNC('month', created_at);

-- Refresh automático da view
CREATE OR REPLACE FUNCTION refresh_wallet_resumo()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY wallet_resumo_mensal;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Otimizações Frontend

```typescript
// 1. React Query para cache inteligente
const useWalletSaldo = (clienteId: string) => {
  return useQuery({
    queryKey: ['wallet', 'saldo', clienteId],
    queryFn: () => fetchWalletSaldo(clienteId),
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: true,
  });
};

// 2. Paginação virtual para listas grandes
const WalletHistoricoVirtualized = () => {
  return (
    <VirtualizedList
      itemCount={transacoes.length}
      itemSize={80}
      renderItem={({ index }) => <TransacaoItem {...transacoes[index]} />}
    />
  );
};

// 3. Debounce em filtros de busca
const useDebouncedFilter = (filter: string, delay: number = 300) => {
  const [debouncedFilter, setDebouncedFilter] = useState(filter);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filter), delay);
    return () => clearTimeout(timer);
  }, [filter, delay]);
  
  return debouncedFilter;
};
```

## Security Considerations

### Controle de Acesso

```typescript
// 1. Apenas admins podem fazer depósitos
// 2. Logs de auditoria para todas as operações
// 3. Validação de sessão em todas as transações
// 4. Rate limiting para prevenir spam

const WALLET_PERMISSIONS = {
  DEPOSITAR: ['admin', 'financeiro'],
  VISUALIZAR_TODOS: ['admin', 'financeiro'],
  VISUALIZAR_PROPRIO: ['cliente'],
  GERAR_RELATORIO: ['admin', 'financeiro'],
} as const;
```

### Auditoria e Logs

```typescript
// Todas as operações são logadas
interface WalletAuditLog {
  operacao: 'deposito' | 'uso' | 'consulta' | 'relatorio';
  usuario: string;
  cliente_afetado: string;
  valor?: number;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}
```

## Migration Strategy

### Coexistência com Sistema Atual

```sql
-- Fase 1: Criar novas tabelas sem afetar sistema atual
-- Fase 2: Migrar dados existentes (opcional)
-- Fase 3: Criar nova seção na UI
-- Fase 4: Deprecar sistema antigo gradualmente

-- Script de migração (se necessário)
INSERT INTO cliente_wallet (cliente_id, saldo_atual, total_depositado)
SELECT 
  cliente_id,
  COALESCE(SUM(saldo_disponivel), 0) as saldo_atual,
  COALESCE(SUM(valor_credito), 0) as total_depositado
FROM cliente_creditos 
WHERE status IN ('disponivel', 'parcial')
GROUP BY cliente_id;
```

## Visual Examples

### Dashboard Principal
```
┌─────────────────────────────────────────────────────────────┐
│ 💳 Créditos Pré-pagos                                       │
├─────────────────────────────────────────────────────────────┤
│ [📊 125 Clientes] [💰 R$ 45.230] [📈 +R$ 8.500] [📉 -R$ 3.200] │
├─────────────────────────────────────────────────────────────┤
│ 🔍 [Buscar cliente...] [📅 Este mês ▼] [➕ Novo Depósito]    │
├─────────────────────────────────────────────────────────────┤
│ João Silva        📱 (11) 99999-9999    💰 R$ 1.250,00  [👁️] │
│ Maria Santos      📱 (11) 88888-8888    💰 R$ 890,50    [👁️] │
│ Pedro Costa       📱 (11) 77777-7777    💰 R$ 2.100,00  [👁️] │
│ Ana Oliveira      📱 (11) 66666-6666    ⚠️  R$ 45,00    [👁️] │
└─────────────────────────────────────────────────────────────┘
```

### Página do Cliente (Atualizada)
```
┌─────────────────────────────────────────────────────────────┐
│ 💳 Carteira - João Silva                                    │
├─────────────────────────────────────────────────────────────┤
│              ⚠️ R$ 85,00                                    │
│            Saldo Baixo (borda vermelha)                     │
├─────────────────────────────────────────────────────────────┤
│ 📊 Total Depositado: R$ 2.500,00  📉 Total Usado: R$ 2.415,00│
│ 🕒 Última movimentação: há 2 dias  ↘️ Tendência: Diminuindo │
├─────────────────────────────────────────────────────────────┤
│ � [iEste mês ▼] [Últimos 3 meses] [Este ano] [Tudo]         │
│    [🔍 Buscar descrição...]                                 │
├─────────────────────────────────────────────────────────────┤
│ � Hi-stórico por Mês                                        │
│                                                             │
│ ▼ 📅 Janeiro 2024          💰 +R$ 500,00  🛒 -R$ 300,00    │
│   ├─ 15/01  💰 +R$ 500,00  PIX      "Depósito Janeiro"     │
│   ├─ 12/01  🛒 -R$ 180,00  Uso      "Viagem Flamengo"      │
│   └─ 10/01  🛒 -R$ 120,00  Uso      "Passeio Cristo"       │
│                                                             │
│ ▼ 📅 Dezembro 2023         💰 +R$ 1.400,00 🛒 -R$ 200,00   │
│   ├─ 20/12  💰 +R$ 800,00  PIX      "Depósito Dezembro"    │
│   ├─ 15/12  🛒 -R$ 200,00  Uso      "Viagem Botafogo"      │
│   └─ 01/12  💰 +R$ 600,00  Cartão   "Depósito Dezembro"    │
│                                                             │
│ ▶ 📅 Novembro 2023         💰 +R$ 300,00  🛒 -R$ 150,00    │
│                                                             │
│ [➕ Novo Depósito] [📊 Exportar] [🔄 Atualizar]             │
└─────────────────────────────────────────────────────────────┘
```

Esta arquitetura simplificada foca no essencial: saldo por cliente, histórico de transações e interface administrativa limpa. Elimina toda a complexidade do sistema atual mantendo apenas o que é necessário para uma carteira digital eficiente.