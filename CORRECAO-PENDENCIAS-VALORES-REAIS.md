# Correção de Pendências - Valores Reais ✅

## Problemas Identificados

### 1. **Warning DialogContent** - CORRIGIDO ✅
**Problema**: `Warning: Missing Description or aria-describedby={undefined} for {DialogContent}`

**Solução**: Adicionado `aria-describedby` e descrição oculta no modal de cobrança

**Arquivo**: `src/components/detalhes-jogo/forms/CobrancaModal.tsx`

```tsx
<DialogContent 
  className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
  aria-describedby="cobranca-modal-description"
>
  <DialogHeader>
    <DialogTitle>...</DialogTitle>
    <div id="cobranca-modal-description" className="sr-only">
      Modal para registrar cobrança de ingresso pendente
    </div>
  </DialogHeader>
```

### 2. **Valores de Pendência** - INVESTIGAÇÃO EM ANDAMENTO 🔍

**Problema**: Sistema ainda não está descontando valores já pagos das pendências

**Diagnóstico Implementado**: Adicionados logs de debug no hook `useCobrancaJogo`

**Logs Adicionados**:
- ✅ Verificação se view `vw_ingressos_pendentes_real` existe
- ✅ Logs de dados retornados pela view
- ✅ Logs de cálculos no método alternativo
- ✅ Logs de valores processados

**Arquivo**: `src/hooks/financeiro/useCobrancaJogo.ts`

## Scripts de Verificação

### 1. **Script de Verificação**: `verificar-sistema-cobrancas.sql`

Execute este script no Supabase para verificar:
- ✅ Se a view `vw_ingressos_pendentes_real` existe
- ✅ Se há ingressos pendentes no sistema
- ✅ Se há pagamentos registrados
- ✅ Se a função `calcular_valor_pendente_real` funciona
- ✅ Exemplos de ingressos com pagamentos parciais

## Como Testar

### 1. **Verificar Infraestrutura**
```sql
-- Execute no Supabase SQL Editor
-- Conteúdo do arquivo: verificar-sistema-cobrancas.sql
```

### 2. **Testar na Interface**
1. Acesse detalhes de um jogo com ingressos pendentes
2. Vá na aba "Financeiro" → "Pendências"
3. Abra o Console do Navegador (F12)
4. Verifique os logs de debug:
   - `🔍 Buscando ingressos pendentes para:`
   - `✅ Dados da view encontrados:` ou `❌ View não encontrada`
   - `💰 Cálculo de saldo:`

### 3. **Verificar Dados**
- Se a view existe mas não retorna dados corretos
- Se o método alternativo está sendo usado
- Se os cálculos de saldo estão corretos

## Possíveis Causas do Problema

### 1. **View não foi criada corretamente**
- Execute o script `verificar-sistema-cobrancas.sql`
- Se view não existir, execute novamente `criar-sistema-cobrancas-ingressos.sql`

### 2. **Dados não estão na estrutura esperada**
- Verificar se `jogo_data` está no formato correto
- Verificar se `adversario` e `local_jogo` batem exatamente

### 3. **Pagamentos não estão sendo encontrados**
- Verificar se tabela `historico_pagamentos_ingressos` tem dados
- Verificar se `ingresso_id` está correto nos pagamentos

## Próximos Passos

1. **Execute o script de verificação**
2. **Teste na interface e verifique os logs**
3. **Reporte os resultados dos logs**

Com essas informações, poderemos identificar exatamente onde está o problema e corrigi-lo.

## Status: EM INVESTIGAÇÃO 🔍

- ✅ Warning do DialogContent corrigido
- 🔍 Logs de debug adicionados para investigar valores
- 📋 Script de verificação criado
- ⏳ Aguardando resultados dos testes