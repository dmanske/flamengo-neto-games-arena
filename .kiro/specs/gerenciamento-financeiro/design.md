# Design Document - Sistema de Gerenciamento Financeiro

## Overview

O sistema de gerenciamento financeiro será integrado ao aplicativo existente de gestão de viagens, proporcionando controle completo sobre receitas, despesas, fluxo de caixa e relatórios financeiros. A solução será construída utilizando React/TypeScript no frontend e Supabase como backend, mantendo consistência com a arquitetura atual.

## Architecture

### Frontend Architecture
- **Framework**: React 18 com TypeScript
- **Roteamento**: React Router v6 (já implementado)
- **Estado Global**: Context API + hooks customizados
- **UI Components**: Shadcn/ui (já implementado)
- **Gráficos**: Recharts para visualizações financeiras
- **Formulários**: React Hook Form com validação Zod

### Backend Architecture
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (já implementado)
- **Real-time**: Supabase Realtime para atualizações em tempo real
- **Storage**: Supabase Storage para anexos de comprovantes

### Integration Points
- Integração com sistema de pagamentos Stripe existente
- Conexão com dados de viagens e passageiros
- Sincronização com dados de clientes

## Components and Interfaces

### Core Pages
1. **Dashboard Financeiro** (`/dashboard/financeiro`)
   - Indicadores financeiros principais
   - Gráficos de receitas vs despesas
   - Alertas de contas a vencer
   - Resumo de fluxo de caixa

2. **Receitas** (`/dashboard/financeiro/receitas`)
   - Lista de receitas
   - Formulário de cadastro/edição
   - Filtros e busca
   - Categorização

3. **Despesas** (`/dashboard/financeiro/despesas`)
   - Lista de despesas
   - Formulário de cadastro/edição
   - Filtros e busca
   - Categorização

4. **Contas a Pagar** (`/dashboard/financeiro/contas-pagar`)
   - Lista de contas pendentes
   - Calendário de vencimentos
   - Alertas de vencimento
   - Controle de pagamentos

5. **Relatórios** (`/dashboard/financeiro/relatorios`)
   - Relatórios personalizáveis
   - Exportação em múltiplos formatos
   - Gráficos interativos
   - Análise de lucratividade

6. **Fluxo de Caixa** (`/dashboard/financeiro/fluxo-caixa`)
   - Projeções futuras
   - Comparativo realizado vs projetado
   - Análise de tendências

### Component Structure
```
src/
├── pages/
│   └── financeiro/
│       ├── DashboardFinanceiro.tsx
│       ├── Receitas.tsx
│       ├── Despesas.tsx
│       ├── ContasPagar.tsx
│       ├── Relatorios.tsx
│       └── FluxoCaixa.tsx
├── components/
│   └── financeiro/
│       ├── dashboard/
│       │   ├── IndicadoresFinanceiros.tsx
│       │   ├── GraficoReceitasDespesas.tsx
│       │   └── AlertasVencimento.tsx
│       ├── receitas/
│       │   ├── ReceitaForm.tsx
│       │   ├── ReceitaCard.tsx
│       │   └── ReceitaFilters.tsx
│       ├── despesas/
│       │   ├── DespesaForm.tsx
│       │   ├── DespesaCard.tsx
│       │   └── DespesaFilters.tsx
│       ├── contas-pagar/
│       │   ├── ContaPagarForm.tsx
│       │   ├── ContaPagarCard.tsx
│       │   └── CalendarioVencimentos.tsx
│       ├── relatorios/
│       │   ├── RelatorioBuilder.tsx
│       │   ├── GraficoLucratividade.tsx
│       │   └── ExportOptions.tsx
│       └── fluxo-caixa/
│           ├── ProjecaoFluxo.tsx
│           ├── ComparativoRealizado.tsx
│           └── TendenciasChart.tsx
├── hooks/
│   └── financeiro/
│       ├── useReceitas.ts
│       ├── useDespesas.ts
│       ├── useContasPagar.ts
│       ├── useRelatorios.ts
│       └── useFluxoCaixa.ts
└── types/
    └── financeiro.ts
```

## Data Models

### Receitas Table
```sql
CREATE TABLE receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data_recebimento DATE NOT NULL,
  viagem_id UUID REFERENCES viagens(id),
  cliente_id UUID REFERENCES clientes(id),
  metodo_pagamento VARCHAR(30),
  status VARCHAR(20) DEFAULT 'recebido',
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Despesas Table
```sql
CREATE TABLE despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  viagem_id UUID REFERENCES viagens(id),
  fornecedor VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente',
  metodo_pagamento VARCHAR(30),
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Contas a Pagar Table
```sql
CREATE TABLE contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  fornecedor VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente',
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia_recorrencia VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Categorias Financeiras Table
```sql
CREATE TABLE categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(7), -- hex color
  icone VARCHAR(30),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Projecoes Fluxo Caixa Table
```sql
CREATE TABLE projecoes_fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano DATE NOT NULL,
  receitas_projetadas DECIMAL(10,2) DEFAULT 0,
  despesas_projetadas DECIMAL(10,2) DEFAULT 0,
  saldo_projetado DECIMAL(10,2) DEFAULT 0,
  receitas_realizadas DECIMAL(10,2) DEFAULT 0,
  despesas_realizadas DECIMAL(10,2) DEFAULT 0,
  saldo_realizado DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(mes_ano)
);
```

## Error Handling

### Frontend Error Handling
- **Toast Notifications**: Utilizar Sonner para feedback de erros
- **Error Boundaries**: Componentes de fallback para erros críticos
- **Form Validation**: Validação client-side com Zod
- **Loading States**: Skeletons e spinners durante carregamento

### Backend Error Handling
- **Database Constraints**: Validações a nível de banco
- **RLS Policies**: Row Level Security para proteção de dados
- **Transaction Management**: Operações atômicas para consistência
- **Audit Logs**: Registro de alterações importantes

## Testing Strategy

### Unit Tests
- **Components**: Testing Library para componentes React
- **Hooks**: Testes isolados de hooks customizados
- **Utils**: Funções utilitárias e formatadores
- **Validation**: Schemas Zod

### Integration Tests
- **API Integration**: Testes de integração com Supabase
- **User Flows**: Cypress para testes E2E críticos
- **Form Submissions**: Validação de fluxos completos

### Performance Tests
- **Bundle Size**: Análise de tamanho dos bundles
- **Rendering**: Performance de renderização de listas
- **Database Queries**: Otimização de consultas

## Security Considerations

### Authentication & Authorization
- **RLS Policies**: Políticas de segurança a nível de linha
- **Role-based Access**: Controle baseado em perfis de usuário
- **Session Management**: Gerenciamento seguro de sessões

### Data Protection
- **Input Sanitization**: Sanitização de entradas
- **SQL Injection Prevention**: Uso de prepared statements
- **File Upload Security**: Validação de tipos e tamanhos de arquivo
- **Audit Trail**: Rastro de auditoria para operações críticas

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Divisão de código por rotas
- **Lazy Loading**: Carregamento sob demanda
- **Memoization**: React.memo e useMemo para otimização
- **Virtual Scrolling**: Para listas grandes de transações

### Backend Optimization
- **Database Indexing**: Índices otimizados para consultas frequentes
- **Query Optimization**: Consultas eficientes com joins apropriados
- **Caching**: Cache de dados frequentemente acessados
- **Pagination**: Paginação para grandes volumes de dados

## Migration Strategy

### Database Migration
1. Criação das novas tabelas
2. Migração de dados existentes de pagamentos
3. Atualização de referências
4. Validação de integridade

### Feature Rollout
1. **Fase 1**: Dashboard básico e cadastro de receitas/despesas
2. **Fase 2**: Contas a pagar e relatórios simples
3. **Fase 3**: Fluxo de caixa e relatórios avançados
4. **Fase 4**: Integrações e automações

## Monitoring and Analytics

### Application Monitoring
- **Error Tracking**: Monitoramento de erros em produção
- **Performance Metrics**: Métricas de performance da aplicação
- **User Analytics**: Análise de uso das funcionalidades

### Business Metrics
- **Financial KPIs**: Indicadores financeiros chave
- **Usage Patterns**: Padrões de uso do sistema
- **Report Generation**: Relatórios de utilização