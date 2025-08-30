# 🔧 CORREÇÃO: Despesas Detalhadas dos Passeios

## 🎯 **PROBLEMA IDENTIFICADO**

O sistema estava calculando os custos dos passeios automaticamente nos cards financeiros, mas **não estava mostrando as despesas detalhadas** na aba "Despesas" e relatórios.

### **Situação Anterior:**
- ✅ Cards financeiros mostravam custos dos passeios
- ❌ Aba "Despesas" não listava os custos dos passeios
- ❌ Relatórios não detalhavam os gastos por passeio

## 🚀 **SOLUÇÃO IMPLEMENTADA**

### **1. Despesas Virtuais Automáticas**
Criado sistema que gera **despesas virtuais** dos passeios para exibição detalhada:

```typescript
// Exemplo de despesa virtual gerada automaticamente:
{
  id: "virtual-passeio-123",
  fornecedor: "Custo: Cristo Redentor",
  categoria: "passeios",
  subcategoria: "3 vendidos",
  valor: 384.00, // 3 × R$ 128
  forma_pagamento: "Custo Operacional",
  status: "calculado",
  observacoes: "Custo automático: 3x R$ 128.00",
  isVirtual: true
}
```

### **2. Interface Atualizada**
A aba "Despesas" agora mostra **duas seções distintas**:

#### **🔵 Custos dos Passeios (Automático)**
- Fundo azul para diferenciação visual
- Ícone Calculator
- Badge "Automático"
- Não editável (calculado automaticamente)

#### **⚪ Despesas Manuais**
- Fundo branco (padrão)
- Editável e deletável
- Botões de ação disponíveis

### **3. Cálculo Automático**
```typescript
// Para cada passeio vendido na viagem:
const custoTotal = quantidadeVendida × custoOperacional;

// Exemplo:
// Cristo Redentor: 3 passageiros × R$ 128 = R$ 384
// Pão de Açúcar: 2 passageiros × R$ 155 = R$ 310
```

## 📊 **RESULTADO VISUAL**

### **Antes:**
```
💸 Despesas
├── Combustível: R$ 500
├── Pedágio: R$ 200
└── Total: R$ 700
```

### **Depois:**
```
💸 Despesas
├── 🔵 Custos dos Passeios (Automático)
│   ├── Custo: Cristo Redentor (3 vendidos): R$ 384
│   ├── Custo: Pão de Açúcar (2 vendidos): R$ 310
│   └── Custo: Museu do Flamengo (1 vendido): R$ 55
├── ⚪ Despesas Manuais
│   ├── Combustível: R$ 500
│   └── Pedágio: R$ 200
└── Total: R$ 1.449
```

## 🔧 **ARQUIVOS MODIFICADOS**

### **1. Hook de Custos dos Passeios**
- **Arquivo**: `src/hooks/usePasseiosCustos.ts`
- **Adicionado**: Função `gerarDespesasVirtuaisPasseios()`

### **2. Hook Financeiro**
- **Arquivo**: `src/hooks/financeiro/useViagemFinanceiro.ts`
- **Modificado**: Função `fetchDespesas()` para incluir despesas virtuais

### **3. Interface Financeira**
- **Arquivo**: `src/components/detalhes-viagem/financeiro/FinanceiroViagem.tsx`
- **Modificado**: Aba "Despesas" com duas seções distintas

## 🧪 **TESTE DA CORREÇÃO**

### **Cenário de Teste:**
1. **Criar viagem** com passeios selecionados
2. **Adicionar passageiros** com passeios
3. **Acessar aba Financeiro** → Despesas
4. **Verificar** se aparecem:
   - Seção "Custos dos Passeios (Automático)" em azul
   - Cada passeio vendido com quantidade e valor
   - Seção "Despesas Manuais" separada

### **Resultado Esperado:**
```
🔵 Custos dos Passeios (Automático) [2 passeio(s)]
├── Custo: Cristo Redentor - 3 vendidos: R$ 384,00 [Automático]
└── Custo: Museu do Flamengo - 1 vendido: R$ 55,00 [Automático]

⚪ Despesas Manuais [2 despesa(s)]
├── Combustível: R$ 500,00 [Pago]
└── Pedágio: R$ 200,00 [Pendente]
```

## ✅ **BENEFÍCIOS DA CORREÇÃO**

1. **📊 Transparência Total**: Agora é possível ver exatamente quanto foi gasto com cada passeio
2. **📈 Relatórios Completos**: Despesas detalhadas incluem custos dos passeios
3. **🎯 Gestão Precisa**: Fácil identificar quais passeios geram mais custos
4. **🔍 Auditoria**: Rastreabilidade completa dos gastos por categoria
5. **📱 UX Melhorada**: Interface clara separando custos automáticos de despesas manuais

## 🎯 **STATUS FINAL**

**✅ CORREÇÃO IMPLEMENTADA COM SUCESSO**

- ✅ Despesas dos passeios aparecem detalhadamente
- ✅ Interface diferenciada (azul vs branco)
- ✅ Cálculo automático baseado em vendas reais
- ✅ Compatibilidade com sistema existente
- ✅ Zero trabalho manual necessário

**Agora o sistema mostra EXATAMENTE quanto foi gasto com cada passeio em cada viagem!** 🎉