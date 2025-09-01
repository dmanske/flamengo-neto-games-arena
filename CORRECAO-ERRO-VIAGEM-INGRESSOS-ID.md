# Correção: Erro "viagem_ingressos_id column not found"

## 🚨 Problema Identificado

**Erro**: `Could not find the 'viagem_ingressos_id' column of 'ingressos' in the schema cache`

**Localização**: `useIngressos.ts:252:17`

**Causa**: A tabela `ingressos` não possui a coluna `viagem_ingressos_id` que é referenciada no código TypeScript.

## 🔍 Análise do Problema

1. **Código TypeScript**: O sistema está tentando usar a coluna `viagem_ingressos_id` nos formulários e validações
2. **Banco de Dados**: A tabela `ingressos` não possui essa coluna
3. **Referência**: A coluna deveria referenciar a tabela `viagens_ingressos` que já existe

## ✅ Solução Implementada

### 1. Migration Criada
- **Arquivo**: `migrations/add_viagem_ingressos_id_to_ingressos.sql`
- **Função**: Adiciona a coluna `viagem_ingressos_id` à tabela `ingressos`
- **Referência**: Foreign key para `viagens_ingressos(id)`

### 2. Tipos TypeScript Atualizados
- **Arquivo**: `src/types/ingressos.ts`
- **Mudanças**:
  - Adicionado `viagem_ingressos_id?: string | null` na interface `Ingresso`
  - Adicionado `viagem_ingressos_id?: string | null` na interface `IngressoFormData`

### 3. Script de Execução
- **Arquivo**: `executar_migration_ingressos.sql`
- **Função**: Script completo para executar no Supabase SQL Editor

## 🚀 Como Aplicar a Correção

### Passo 1: Executar Migration no Supabase
```sql
-- Copie e cole o conteúdo do arquivo executar_migration_ingressos.sql
-- no Supabase SQL Editor e execute
```

### Passo 2: Verificar se Funcionou
Após executar a migration, o sistema deve:
- ✅ Criar ingressos sem erro
- ✅ Permitir vinculação com `viagens_ingressos`
- ✅ Manter compatibilidade com `viagens` normais

## 📋 Estrutura da Tabela Ingressos (Após Correção)

```sql
CREATE TABLE ingressos (
  id UUID PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  viagem_id UUID REFERENCES viagens(id),
  viagem_ingressos_id UUID REFERENCES viagens_ingressos(id), -- ✅ NOVA COLUNA
  
  -- Dados do jogo
  jogo_data TIMESTAMPTZ NOT NULL,
  adversario VARCHAR(255) NOT NULL,
  logo_adversario TEXT,
  local_jogo VARCHAR(10) NOT NULL,
  setor_estadio VARCHAR(255) NOT NULL,
  
  -- Controle financeiro
  preco_custo DECIMAL(10,2) NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  desconto DECIMAL(10,2) DEFAULT 0,
  valor_final DECIMAL(10,2) GENERATED ALWAYS AS (preco_venda - desconto) STORED,
  lucro DECIMAL(10,2) GENERATED ALWAYS AS (preco_venda - desconto - preco_custo) STORED,
  margem_percentual DECIMAL(5,2) GENERATED ALWAYS AS (...) STORED,
  
  -- Status e controle
  situacao_financeira VARCHAR(20) DEFAULT 'pendente',
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔗 Relacionamentos

- `ingressos.viagem_id` → `viagens.id` (viagens normais do sistema)
- `ingressos.viagem_ingressos_id` → `viagens_ingressos.id` (viagens específicas do sistema de ingressos)
- `ingressos.cliente_id` → `clientes.id` (cliente que comprou o ingresso)

## 🧪 Teste da Correção

Após aplicar a migration, teste:

1. **Criar um novo ingresso**
2. **Verificar se não há mais erro de coluna não encontrada**
3. **Confirmar que os dados são salvos corretamente**

## 📝 Observações

- A coluna `viagem_ingressos_id` é opcional (nullable)
- Mantém compatibilidade com o sistema existente
- Permite vinculação tanto com viagens normais quanto com viagens específicas de ingressos
- Inclui índices para performance otimizada

## ✨ Status

- ✅ **Migration criada**
- ✅ **Tipos TypeScript atualizados**
- ✅ **Script de execução preparado**
- ⏳ **Aguardando execução no Supabase**

Execute o script `executar_migration_ingressos.sql` no Supabase para resolver o problema! 🚀