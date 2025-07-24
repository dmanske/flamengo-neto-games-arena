# Debug: Status de Pagamento dos Passageiros

## Problema Identificado
Os passageiros estão sendo marcados automaticamente como "Pago" mesmo quando deveriam estar como "Pendente".

## Análise Realizada

### 1. Código de Cadastro
- ✅ `CadastroPassageiroSimples.tsx`: Status definido como 'Pendente' na linha 177
- ✅ `PassageiroDialog/index.tsx`: Status definido como "Pendente" na linha 56 e 191
- ✅ `ParcelasManager.tsx`: Parcelas criadas com status 'pendente'

### 2. Inserção de Parcelas
- ✅ Parcelas são inseridas sem `data_pagamento` (correto)
- ✅ Status das parcelas é 'pendente' (correto)
- ✅ Trigger `calcular_status_parcela()` está funcionando corretamente

### 3. Possíveis Causas do Problema

#### A. Lógica no `ParcelasEditManager.tsx`
A função `verificarEAtualizarStatus()` está sendo chamada e pode estar alterando o status incorretamente.

#### B. Lógica no `useViagemFinanceiro.ts`
A função `verificarStatusPagamento()` pode estar sendo chamada automaticamente.

#### C. Lógica no `PassageiroEditDialog`
A função `calcularTotalPago()` pode estar alterando o status automaticamente.

## Próximos Passos para Correção

1. **Verificar se há chamadas automáticas para funções de verificação de status**
2. **Corrigir a lógica de atualização automática do status**
3. **Garantir que o status só seja alterado manualmente pelo usuário**

## Correções Já Aplicadas

1. ✅ Data de vencimento à vista alterada para +3 dias (não mais "hoje")
2. ✅ Lógica no `PassageiroEditDialog` corrigida para não permitir marcar como "Pago" sem pagamento completo
3. ✅ Função `handlePaymentComplete` ajustada para reverter status se necessário

## PROBLEMA PRINCIPAL IDENTIFICADO E CORRIGIDO

**🔍 CAUSA RAIZ:** Múltiplas funções estavam somando **todas** as parcelas (incluindo as pendentes) em vez de somar apenas as parcelas **realmente pagas** (com `data_pagamento` preenchida).

### Arquivos Corrigidos:

4. ✅ `PassageiroEditDialog/index.tsx` - Função `calcularTotalPago()` 
   - Agora considera apenas parcelas com `data_pagamento`
   
5. ✅ `useViagemFinanceiro.ts` - Função `verificarStatusPagamento()` 
   - Corrigida para somar apenas parcelas pagas
   
6. ✅ `useViagemFinanceiro.ts` - Outras funções de cálculo
   - Todas as funções que somavam parcelas foram corrigidas
   
7. ✅ `useFinanceiroGeral.ts` - Funções de cálculo financeiro
   - Corrigidas para considerar apenas parcelas pagas
   
8. ✅ `useViagemDetails.ts` - Cálculo de valor pago
   - Corrigido para somar apenas parcelas com data_pagamento
   
9. ✅ `PassageirosCard.tsx` - Exibição de valores
   - Corrigida para mostrar apenas valor realmente pago
   
10. ✅ `PassageiroDetailsDialog.tsx` - Detalhes do passageiro
    - Corrigido cálculo de valor pago

## Resultado Esperado

Agora o sistema deve:
- ✅ Cadastrar passageiros com status "Pendente"
- ✅ Criar parcelas com status "pendente" 
- ✅ Considerar como "pago" apenas quando há `data_pagamento` na parcela
- ✅ Manter status "Pendente" até que parcelas sejam realmente pagas