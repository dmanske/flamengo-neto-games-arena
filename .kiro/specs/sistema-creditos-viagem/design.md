# Design Document - Sistema de Créditos de Viagem

## Overview

O Sistema de Créditos de Viagem é uma funcionalidade que permite pagamentos antecipados sem viagem definida, com posterior vinculação a viagens disponíveis. O sistema gerencia automaticamente sobras e faltas, mantendo controle financeiro detalhado e organização temporal por mês.

## Architecture

### Estrutura de Dados

```sql
-- Tabela principal de créditos
CREATE TABLE cliente_creditos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  valor_credito DECIMAL(10,2) NOT NULL,
  tipo_credito VARCHAR(20) NOT NULL, -- 'viagem_completa', 'passeios', 'geral'
  data_pagamento DATE NOT NULL,
  forma_pagamento VARCHAR(50),
  observacoes TEXT,
  status VARCHAR(20) DEFAULT 'disponivel', -- 'disponivel', 'utilizado', 'parcial', 'reembolsado'
  saldo_disponivel DECIMAL(10,2) NOT NULL, -- valor ainda não utilizado
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vinculações de crédito com viagens
CREATE TABLE credito_viagem_vinculacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credito_id UUID REFERENCES cliente_creditos(id) NOT NULL,
  viagem_id UUID REFERENCES viagens(id) NOT NULL,
  valor_utilizado DECIMAL(10,2) NOT NULL,
  data_vinculacao TIMESTAMP DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de movimentações
CREATE TABLE credito_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credito_id UUID REFERENCES cliente_creditos(id) NOT NULL,
  tipo_movimentacao VARCHAR(20) NOT NULL, -- 'criacao', 'utilizacao', 'reembolso', 'ajuste'
  valor_anterior DECIMAL(10,2),
  valor_movimentado DECIMAL(10,2) NOT NULL,
  valor_posterior DECIMAL(10,2),
  descricao TEXT,
  viagem_id UUID REFERENCES viagens(id), -- quando aplicável
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Fluxo de Dados

1. **Registro de Crédito**: Cliente → Pagamento → Crédito Disponível
2. **Vinculação**: Crédito + Viagem → Cálculo → Utilização/Sobra
3. **Histórico**: Todas as movimentações são registradas
4. **Relatórios**: Organização por mês com resumos financeiros

## Components and Interfaces

### Páginas Principais

#### 1. `/creditos` - Página Principal
- **Cards de Resumo**: Total de créditos, disponível, utilizado, reembolsado
- **Organização por Mês**: Accordion com créditos agrupados por mês/ano
- **Filtros**: Por cliente, status, tipo, período
- **Ações**: Novo crédito, vincular viagem, reembolsar

#### 2. Aba "Créditos" na Página do Cliente
- **Resumo do Cliente**: Créditos disponíveis, histórico, vinculações
- **Organização Temporal**: Por mês, similar ao sistema de ingressos
- **Ações Rápidas**: Novo crédito, usar crédito, histórico completo

### Componentes Principais

#### 1. `CreditoFormModal`
```typescript
interface CreditoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito?: Credito | null;
  onSuccess: () => void;
}
```

#### 2. `VincularCreditoModal`
```typescript
interface VincularCreditoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito: Credito;
  onSuccess: () => void;
}
```

#### 3. `CreditoDetailsModal`
```typescript
interface CreditoDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credito: Credito | null;
}
```

#### 4. `CalculadoraCreditoViagem`
```typescript
interface CalculadoraProps {
  creditoDisponivel: number;
  valorViagem: number;
  tipoCreditoPermitido: string[];
  onCalculoChange: (resultado: CalculoCredito) => void;
}
```

## Data Models

### Tipos TypeScript

```typescript
export interface Credito {
  id: string;
  cliente_id: string;
  valor_credito: number;
  tipo_credito: 'viagem_completa' | 'passeios' | 'geral';
  data_pagamento: string;
  forma_pagamento?: string;
  observacoes?: string;
  status: 'disponivel' | 'utilizado' | 'parcial' | 'reembolsado';
  saldo_disponivel: number;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  cliente?: Cliente;
  vinculacoes?: CreditoVinculacao[];
  historico?: CreditoHistorico[];
}

export interface CreditoVinculacao {
  id: string;
  credito_id: string;
  viagem_id: string;
  valor_utilizado: number;
  data_vinculacao: string;
  observacoes?: string;
  
  // Relacionamentos
  viagem?: Viagem;
}

export interface CalculoCredito {
  valorViagem: number;
  creditoDisponivel: number;
  valorUtilizado: number;
  sobra: number;
  falta: number;
  statusResultado: 'completo' | 'sobra' | 'falta';
}

export interface ResumoCreditos {
  total_creditos: number;
  valor_total: number;
  valor_disponivel: number;
  valor_utilizado: number;
  valor_reembolsado: number;
  creditos_por_status: {
    disponivel: number;
    utilizado: number;
    parcial: number;
    reembolsado: number;
  };
}
```

### Filtros e Validações

```typescript
export interface FiltrosCreditos {
  cliente_id?: string;
  status?: string;
  tipo_credito?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const creditoSchema = z.object({
  cliente_id: z.string().min(1, 'Cliente é obrigatório'),
  valor_credito: z.number().min(0.01, 'Valor deve ser maior que zero'),
  tipo_credito: z.enum(['viagem_completa', 'passeios', 'geral']),
  data_pagamento: z.string().min(1, 'Data é obrigatória'),
  forma_pagamento: z.string().optional(),
  observacoes: z.string().optional(),
});
```

## Error Handling

### Validações de Negócio

1. **Crédito Insuficiente**: Validar se há saldo disponível antes de vincular
2. **Tipo Incompatível**: Verificar se tipo de crédito é compatível com uso
3. **Viagem Inválida**: Validar se viagem existe e está disponível
4. **Valor Negativo**: Impedir valores negativos em créditos e vinculações
5. **Cliente Inexistente**: Validar existência do cliente antes de criar crédito

### Tratamento de Erros

```typescript
export class CreditoError extends Error {
  constructor(
    message: string,
    public code: 'INSUFFICIENT_CREDIT' | 'INVALID_TYPE' | 'INVALID_TRIP' | 'INVALID_VALUE'
  ) {
    super(message);
    this.name = 'CreditoError';
  }
}
```

## Testing Strategy

### Testes Unitários

1. **Cálculos de Crédito**: Testar todas as combinações de sobra/falta
2. **Validações**: Testar schemas e regras de negócio
3. **Hooks**: Testar operações CRUD e cálculos
4. **Componentes**: Testar renderização e interações

### Testes de Integração

1. **Fluxo Completo**: Criar crédito → Vincular → Verificar saldos
2. **Múltiplas Vinculações**: Testar uso parcial de créditos
3. **Reembolsos**: Testar processo completo de reembolso
4. **Relatórios**: Validar cálculos de resumos por período

### Cenários de Teste

```typescript
// Cenário 1: Crédito exato
const credito = 2000;
const viagem = 2000;
// Resultado: completo, sobra = 0, falta = 0

// Cenário 2: Crédito maior
const credito = 2500;
const viagem = 2000;
// Resultado: sobra, sobra = 500, falta = 0

// Cenário 3: Crédito menor
const credito = 1500;
const viagem = 2000;
// Resultado: falta, sobra = 0, falta = 500
```

## Performance Considerations

### Otimizações

1. **Índices de Banco**: Em cliente_id, data_pagamento, status
2. **Cache de Cálculos**: Memoizar cálculos complexos de saldos
3. **Paginação**: Para listas grandes de créditos
4. **Lazy Loading**: Carregar detalhes apenas quando necessário

### Monitoramento

1. **Métricas**: Tempo de cálculo de saldos, frequência de vinculações
2. **Alertas**: Créditos não utilizados há muito tempo
3. **Logs**: Todas as operações financeiras para auditoria