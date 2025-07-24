# Sistema de Badges Inteligentes

## Visão Geral
O sistema de badges foi reformulado para ser mais inteligente e refletir melhor a situação real dos pagamentos dos passageiros.

## Novos Status de Badges

### 🎁 **BRINDE** (Roxo)
- **Quando aparece:** Quando o desconto é igual ou maior que o valor total
- **Significado:** Cliente não precisa pagar nada (ganhou desconto total)
- **Cor:** `bg-purple-100 text-purple-800`
- **Exemplo:** Valor R$ 800, Desconto R$ 800 = BRINDE

### 💳 **PARCELADO** (Azul)
- **Quando aparece:** Quando o passageiro tem mais de 1 parcela cadastrada
- **Significado:** Pagamento foi dividido em parcelas (independente se foram pagas)
- **Cor:** `bg-blue-100 text-blue-800`
- **Tooltip:** Mostra quantas parcelas foram pagas (ex: "2/3 parcelas pagas")
- **Exemplo:** Cliente escolheu pagar em 3x semanais

### ⏳ **PENDENTE** (Amarelo)
- **Quando aparece:** Quando é pagamento à vista mas ainda não foi pago
- **Significado:** Aguardando pagamento único
- **Cor:** `bg-amber-100 text-amber-800`
- **Exemplo:** Cliente escolheu à vista mas ainda não pagou

### ✅ **PAGO** (Verde)
- **Quando aparece:** Quando o valor pago é igual ou maior que o valor líquido
- **Significado:** Pagamento totalmente quitado
- **Cor:** `bg-green-100 text-green-800`
- **Exemplo:** Todas as parcelas foram pagas ou pagamento à vista foi efetuado

## Lógica de Cálculo

### 1. Verificação de Brinde
```typescript
if (desconto >= valor || valorLiquido <= 0) {
  return 'Brinde';
}
```

### 2. Cálculo do Valor Pago
- Soma apenas parcelas que têm `data_pagamento` preenchida
- Parcelas "pendentes" não são contabilizadas

### 3. Verificação de Status
```typescript
if (valorPago >= valorLiquido) return 'Pago';
if (totalParcelas > 1) return 'Parcelado';
return 'Pendente';
```

## Exemplos Práticos

### Exemplo 1: Cliente Brinde
- **Valor:** R$ 800
- **Desconto:** R$ 800
- **Badge:** 🎁 **BRINDE** (roxo)
- **Tooltip:** "Cliente ganhou desconto total"

### Exemplo 2: Cliente Parcelado (Pagando)
- **Valor:** R$ 800
- **Desconto:** R$ 0
- **Parcelas:** 4x de R$ 200 (2 pagas, 2 pendentes)
- **Badge:** 💳 **PARCELADO** (azul)
- **Tooltip:** "2/4 parcelas pagas"

### Exemplo 3: Cliente Parcelado (Quitado)
- **Valor:** R$ 800
- **Desconto:** R$ 0
- **Parcelas:** 4x de R$ 200 (todas pagas)
- **Badge:** ✅ **PAGO** (verde)
- **Tooltip:** "Pagamento completo"

### Exemplo 4: Cliente À Vista (Pendente)
- **Valor:** R$ 800
- **Desconto:** R$ 0
- **Parcelas:** 1x de R$ 800 (não paga)
- **Badge:** ⏳ **PENDENTE** (amarelo)
- **Tooltip:** "Aguardando pagamento à vista"

### Exemplo 5: Cliente À Vista (Pago)
- **Valor:** R$ 800
- **Desconto:** R$ 0
- **Parcelas:** 1x de R$ 800 (paga)
- **Badge:** ✅ **PAGO** (verde)
- **Tooltip:** "Pagamento completo"

## Benefícios do Sistema

### Para o Usuário
- ✅ **Clareza visual:** Cores distintas para cada situação
- ✅ **Informação precisa:** Badge reflete a situação real
- ✅ **Tooltips informativos:** Detalhes adicionais ao passar o mouse
- ✅ **Diferenciação clara:** Entre parcelado e pendente

### Para o Negócio
- ✅ **Controle financeiro:** Sabe exatamente quem pagou o quê
- ✅ **Gestão de brindes:** Identifica facilmente clientes com desconto total
- ✅ **Acompanhamento de parcelas:** Vê progresso dos pagamentos parcelados
- ✅ **Relatórios precisos:** Dados financeiros mais confiáveis

## Implementação Técnica

### Arquivos Modificados
- `src/lib/status-utils.ts` - Nova lógica de cálculo
- `PassageirosCard.tsx` - Badges atualizados
- `PassageirosList.tsx` - Badges atualizados
- `PassageiroDetailsDialog.tsx` - Badges atualizados
- `RelatorioFinanceiro.tsx` - Badges atualizados
- `ViagemReport.tsx` - Badges atualizados
- `usePassageirosCount.ts` - Contagem atualizada
- `DetalhesViagem.tsx` - Contagem atualizada

### Função Principal
```typescript
function calcularStatusInteligente(
  valor: number,
  desconto: number,
  parcelas?: Array<{ data_pagamento?: string | null; valor_parcela: number }>,
  statusOriginal?: string
): PassageiroStatus
```

### Integração
Todos os componentes que exibem status agora usam:
```typescript
const statusInteligente = converterStatusParaInteligente({
  valor: passageiro.valor || 0,
  desconto: passageiro.desconto || 0,
  parcelas: passageiro.parcelas,
  status_pagamento: passageiro.status_pagamento
});
```

## Migração
- ✅ **Compatibilidade:** Sistema funciona com dados existentes
- ✅ **Sem quebras:** Não requer alterações no banco de dados
- ✅ **Gradual:** Pode ser implementado componente por componente
- ✅ **Fallback:** Mantém compatibilidade com status antigos

Este sistema torna a interface muito mais intuitiva e precisa para o gerenciamento financeiro das viagens!