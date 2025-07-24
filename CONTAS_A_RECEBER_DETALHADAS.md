# Contas a Receber - Sistema Detalhado

## Status: ✅ TOTALMENTE IMPLEMENTADO

O sistema de contas a receber **MOSTRA TUDO** que você pediu: quem está devendo, parcelas detalhadas, nome do cliente, viagem - tudo certinho!

## 🎯 **O que o Sistema Mostra:**

### 📋 **Informações Principais (Sempre Visíveis)**
- ✅ **Nome do Cliente** - Quem está devendo
- ✅ **Viagem** - "Flamengo x Adversário"
- ✅ **Valor Total** - Quanto deveria pagar
- ✅ **Valor Pago** - Quanto já foi pago
- ✅ **Valor Pendente** - Quanto ainda deve
- ✅ **Status de Urgência** - Em dia, atenção, urgente
- ✅ **Dias de Atraso** - Quantos dias está atrasado

### 🔍 **Detalhes das Parcelas (Expandível)**
Quando o cliente tem parcelamento, aparece um botão para expandir e ver:

- ✅ **Número da Parcela** - 1ª, 2ª, 3ª, etc.
- ✅ **Valor da Parcela** - Quanto vale cada uma
- ✅ **Data de Vencimento** - Quando deveria pagar
- ✅ **Data de Pagamento** - Quando realmente pagou (se pago)
- ✅ **Forma de Pagamento** - PIX, Cartão, Dinheiro, etc.
- ✅ **Status Individual** - Pago, Pendente, Vencido

## 📊 **Exemplo Visual:**

### Cliente: João Silva
**Viagem:** Flamengo x Botafogo  
**Total:** R$ 800 | **Pago:** R$ 400 | **Pendente:** R$ 400  
**Status:** ⚠️ Atenção (3 dias de atraso)

**[▼ Expandir Parcelas]**

```
1ª parcela - R$ 200 - Vence: 01/02/2024 - ✅ Pago em: 01/02/2024 (PIX)
2ª parcela - R$ 200 - Vence: 08/02/2024 - ✅ Pago em: 10/02/2024 (Cartão)  
3ª parcela - R$ 200 - Vence: 15/02/2024 - ⏳ Pendente
4ª parcela - R$ 200 - Vence: 22/02/2024 - 🔴 Vencido (3 dias)
```

## 🚨 **Categorização por Urgência:**

### 🟢 **Em Dia** (0 dias de atraso)
- Clientes que não estão atrasados
- Parcelas ainda dentro do prazo

### 🟡 **Atenção** (1-7 dias de atraso)
- Clientes com atraso recente
- Necessita acompanhamento

### 🔴 **Urgente** (8+ dias de atraso)
- Clientes com atraso significativo
- Prioridade máxima para cobrança

## 🔧 **Funcionalidades Implementadas:**

### ✅ **Busca Inteligente**
```typescript
// Hook corrigido - só conta parcelas realmente pagas
const valorPago = parcelas.filter(p => p.data_pagamento)
  .reduce((sum, p) => sum + p.valor_parcela, 0);
```

### ✅ **Interface Expandível**
- Botão de expansão para clientes parcelados
- Detalhes completos de cada parcela
- Status visual por cores

### ✅ **Ações de Cobrança**
- Botão WhatsApp
- Botão Telefone  
- Botão Email
- Cobrança em massa

## 📱 **Como Usar:**

### 1. **Visualizar Devedores**
- Acesse **Financeiro Geral** → **Contas a Receber**
- Veja lista ordenada por urgência

### 2. **Ver Detalhes das Parcelas**
- Clique na seta **▶** ao lado do nome
- Expande mostrando todas as parcelas
- Status individual de cada uma

### 3. **Fazer Cobrança**
- Use botões de WhatsApp, Telefone ou Email
- Informações completas para cobrança eficiente

## 🎯 **Benefícios:**

### ✅ **Controle Total**
- Sabe exatamente quem deve o quê
- Vê progresso de cada parcelamento
- Identifica parcelas específicas em atraso

### ✅ **Cobrança Eficiente**
- Dados completos para contato
- Histórico de pagamentos visível
- Priorização por urgência

### ✅ **Gestão Precisa**
- Valores reais (não inflados)
- Status atualizado automaticamente
- Relatórios confiáveis

## 📋 **Exemplo Completo de Tela:**

```
CONTAS A RECEBER - Março 2024

💰 Total a Receber: R$ 3.200 (8 contas)
🔴 Urgentes: R$ 1.200 (3 contas)  
🟡 Atenção: R$ 800 (2 contas)
🟢 Em Dia: R$ 1.200 (3 contas)

┌─────────────────────────────────────────────────────────────┐
│ [▼] João Silva    │ Flamengo x Botafogo │ R$ 800 │ R$ 400 │ R$ 400 │ 🔴 Urgente │
├─────────────────────────────────────────────────────────────┤
│     1ª parcela - R$ 200 - ✅ Pago em: 01/02 (PIX)          │
│     2ª parcela - R$ 200 - ✅ Pago em: 10/02 (Cartão)       │
│     3ª parcela - R$ 200 - ⏳ Vence: 15/02 (Pendente)       │
│     4ª parcela - R$ 200 - 🔴 Venceu: 22/02 (8 dias)        │
├─────────────────────────────────────────────────────────────┤
│ [▶] Maria Santos  │ Flamengo x Vasco    │ R$ 600 │ R$ 600 │ R$ 0   │ 🟢 Pago   │
│ [▶] Pedro Costa   │ Flamengo x Flu      │ R$ 800 │ R$ 0   │ R$ 800 │ 🟡 3 dias │
└─────────────────────────────────────────────────────────────┘
```

**CONCLUSÃO:** O sistema mostra **TUDO** que você precisa para gerenciar quem está devendo, com detalhes completos das parcelas! 🚀