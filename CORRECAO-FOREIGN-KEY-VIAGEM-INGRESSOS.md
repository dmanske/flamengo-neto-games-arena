# Correção: Erro Foreign Key Constraint "ingressos_viagem_id_fkey"

## 🚨 Problema Identificado

**Erro**: `insert or update on table "ingressos" violates foreign key constraint "ingressos_viagem_id_fkey"`

**Detalhes**: `Key is not present in table "viagens"`

**Localização**: `useIngressos.ts:252:17`

**Causa**: O sistema estava misturando as referências entre as tabelas `viagens` e `viagens_ingressos`.

## 🔍 Análise do Problema

### Problema na Lógica Original:
1. **Busca correta**: O código buscava primeiro na tabela `viagens`, depois na `viagens_ingressos`
2. **Atribuição incorreta**: Quando encontrava uma viagem na tabela `viagens_ingressos`, colocava o ID na coluna `viagem_id`
3. **Foreign key violation**: A coluna `viagem_id` referencia `viagens.id`, não `viagens_ingressos.id`

### Estrutura das Tabelas:
```sql
-- Tabela ingressos tem DUAS referências:
ingressos.viagem_id → viagens.id (viagens normais)
ingressos.viagem_ingressos_id → viagens_ingressos.id (viagens específicas de ingressos)
```

## ✅ Solução Implementada

### 1. Correção da Lógica de Busca
```typescript
// ANTES (incorreto):
let viagemId = dados.viagem_id;
// Sempre colocava na coluna viagem_id

// DEPOIS (correto):
let viagemId = dados.viagem_id;
let viagemIngressosId = dados.viagem_ingressos_id;
// Separa as duas referências
```

### 2. Correção da Atribuição
```typescript
// ANTES (incorreto):
dadosParaInserir.viagem_id = viagemId; // Sempre na mesma coluna

// DEPOIS (correto):
if (viagemId) {
  dadosParaInserir.viagem_id = viagemId;
  dadosParaInserir.viagem_ingressos_id = null;
} else if (viagemIngressosId) {
  dadosParaInserir.viagem_id = null;
  dadosParaInserir.viagem_ingressos_id = viagemIngressosId;
}
```

### 3. Correção da Validação
```typescript
// ANTES (incorreto):
.eq('viagem_id', viagemId) // Sempre validava a mesma coluna

// DEPOIS (correto):
if (viagemId) {
  query = query.eq('viagem_id', viagemId);
} else if (viagemIngressosId) {
  query = query.eq('viagem_ingressos_id', viagemIngressosId);
}
```

## 🎯 Fluxo Corrigido

### Cenário 1: Viagem Normal (tabela viagens)
1. ✅ Busca na tabela `viagens`
2. ✅ Encontra viagem → `viagemId = viagem.id`
3. ✅ Insere com `viagem_id = viagemId` e `viagem_ingressos_id = null`

### Cenário 2: Viagem de Ingressos (tabela viagens_ingressos)
1. ✅ Não encontra na tabela `viagens`
2. ✅ Busca na tabela `viagens_ingressos`
3. ✅ Encontra viagem → `viagemIngressosId = viagem.id`
4. ✅ Insere com `viagem_id = null` e `viagem_ingressos_id = viagemIngressosId`

### Cenário 3: Nenhuma Viagem Encontrada
1. ✅ Não encontra em nenhuma tabela
2. ✅ Retorna erro pedindo para criar viagem primeiro

## 🧪 Teste da Correção

Após aplicar a correção, teste:

1. **Criar ingresso vinculado a viagem normal**
   - Deve usar `viagem_id` e deixar `viagem_ingressos_id` como null

2. **Criar ingresso vinculado a viagem de ingressos**
   - Deve usar `viagem_ingressos_id` e deixar `viagem_id` como null

3. **Criar ingresso sem viagem existente**
   - Deve mostrar erro pedindo para criar viagem primeiro

## 📋 Arquivos Modificados

- ✅ **src/hooks/useIngressos.ts**: Lógica de criação corrigida
- ✅ **src/types/ingressos.ts**: Tipos já atualizados (pelo Kiro IDE)

## 🔗 Relacionamentos Corretos

```sql
-- Ingresso vinculado a viagem normal:
INSERT INTO ingressos (viagem_id, viagem_ingressos_id, ...) 
VALUES ('uuid-da-viagem', NULL, ...);

-- Ingresso vinculado a viagem de ingressos:
INSERT INTO ingressos (viagem_id, viagem_ingressos_id, ...) 
VALUES (NULL, 'uuid-da-viagem-ingressos', ...);
```

## ✨ Status

- ✅ **Lógica de busca corrigida**
- ✅ **Atribuição de IDs corrigida**
- ✅ **Validação de duplicatas corrigida**
- ✅ **Foreign key constraints respeitadas**

O erro de foreign key constraint deve estar resolvido! 🚀

Agora o sistema pode:
- Criar ingressos vinculados a viagens normais
- Criar ingressos vinculados a viagens específicas de ingressos
- Manter a integridade referencial do banco de dados