# Correção Urgente: Problemas no Sistema de Ingressos

## 🚨 Problemas Identificados e Corrigidos

### 1. ✅ Setores do Maracanã Sumiram
**Problema**: Função `getSetorOptions()` não reconhecia "Rio de Janeiro" como parâmetro
**Causa**: Código esperava apenas "casa", mas formulário passava "Rio de Janeiro"
**Correção**: Atualizada função para aceitar ambos os valores

**Antes**:
```typescript
if (localJogo === "casa") {
  return ["Norte", "Sul", "Leste Inferior", "Leste Superior", "Oeste", "Maracanã Mais", "Sem ingresso"];
}
```

**Depois**:
```typescript
if (localJogo === "casa" || localJogo === "Rio de Janeiro") {
  return [
    "Norte Inferior", "Norte Superior", 
    "Sul Inferior", "Sul Superior",
    "Leste Inferior", "Leste Superior", 
    "Oeste Inferior", "Oeste Superior",
    "Maracanã Mais", "Cadeira Especial",
    "Camarote", "Premium", "Sem ingresso"
  ];
}
```

### 2. ✅ Edição Não Identifica Jogo Selecionado
**Problema**: Campo `viagem_ingressos_id` sempre `null` na edição
**Causa**: Código hardcoded colocando `null` em vez de usar valor do ingresso
**Correção**: Usar valor correto do ingresso existente

**Antes**:
```typescript
viagem_ingressos_id: null, // Não há viagem_ingressos_id no ingresso existente
```

**Depois**:
```typescript
viagem_ingressos_id: ingresso.viagem_ingressos_id, // Usar o valor correto do ingresso
```

### 3. 🔍 Cards Duplicados em Jogos Futuros
**Análise**: Problema pode estar na lógica de agrupamento ou busca de viagens
**Status**: Investigando - pode estar relacionado à busca simultânea em duas tabelas

## 📋 Arquivos Corrigidos

- ✅ **src/data/estadios.ts**: Setores do Maracanã restaurados
- ✅ **src/components/ingressos/IngressoFormModal.tsx**: Edição corrigida

## 🧪 Testes Necessários

### Teste 1: Setores do Maracanã
1. Abrir formulário de novo ingresso
2. Selecionar "Casa (Maracanã)" 
3. Verificar se aparecem todos os setores:
   - Norte Inferior/Superior
   - Sul Inferior/Superior  
   - Leste Inferior/Superior
   - Oeste Inferior/Superior
   - Maracanã Mais, Cadeira Especial, Camarote, Premium

### Teste 2: Edição de Ingresso
1. Criar um ingresso vinculado a uma viagem
2. Editar o ingresso
3. Verificar se o jogo aparece selecionado corretamente
4. Verificar se os dados carregam corretamente

### Teste 3: Cards Duplicados
1. Criar alguns ingressos
2. Verificar se aparecem cards duplicados
3. Editar ingressos e ver se cria novos cards

## 🎯 Próximos Passos

1. **Testar as correções aplicadas**
2. **Investigar problema dos cards duplicados**
3. **Verificar se migration foi aplicada no Supabase**

## 💡 Observações

- Os setores agora incluem mais opções realistas do Maracanã
- A edição deve funcionar corretamente para ambos os tipos de viagem
- Se ainda houver problemas com cards duplicados, pode ser necessário revisar a lógica de agrupamento

## ⚠️ Lembrete Importante

**Execute a migration `executar_migration_ingressos.sql` no Supabase** se ainda não foi executada, pois ela é necessária para o funcionamento correto do sistema!