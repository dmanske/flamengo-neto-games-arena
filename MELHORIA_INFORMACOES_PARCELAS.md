# Melhoria: Informações Detalhadas das Parcelas

## 🎯 Problema Identificado
Na lista de pendências, não havia informações sobre as parcelas individuais, dificultando o entendimento de quantas parcelas estavam pendentes e quando venciam.

## ✅ Solução Implementada

### **1. Interface Expandida com Informações de Parcelas**

**Novas informações adicionadas:**
- **Quantidade de parcelas pendentes** (ex: 2/4 parcelas)
- **Próxima parcela a vencer** com valor e data
- **Indicador de urgência** baseado nos dias para vencer
- **Status visual** com cores diferentes

### **2. Modificações no Hook `useViagemFinanceiro`**

**Interface `PassageiroPendente` expandida:**
```typescript
export interface PassageiroPendente {
  // ... campos existentes
  parcelas_pendentes: number;
  total_parcelas: number;
  proxima_parcela?: {
    valor: number;
    data_vencimento: string;
    dias_para_vencer: number;
  };
}
```

**Lógica aprimorada:**
- ✅ Busca informações completas das parcelas
- ✅ Calcula parcelas pendentes vs total
- ✅ Identifica próxima parcela por data de vencimento
- ✅ Calcula dias para vencer/atraso

### **3. Visualização Melhorada**

#### **No Nome do Cliente:**
```
João Silva                    R$ 450,00
(11) 99999-9999  [2/4 parcelas]    deve
                                3 dias
```

#### **Seção Expandida:**
```
Valor devido: R$ 450,00    Dias em atraso: 5 dias
Total pago: R$ 350,00      Total viagem: R$ 800,00
Parcelas: 2/4 pendentes    Status: Pendente

┌─────────────────────────────────────────┐
│ Próxima Parcela: R$ 200,00              │
│ Vencimento: 25/07/2025                  │
│ Vence em 2 dias                         │
└─────────────────────────────────────────┘
```

## 🎨 Detalhes Visuais

### **Cores dos Indicadores:**
- 🔴 **Vermelho:** Parcela em atraso (dias negativos)
- 🟡 **Laranja:** Vence em 3 dias ou menos
- 🔵 **Azul:** Vence em mais de 3 dias

### **Badges de Parcelas:**
- **Formato:** `X/Y parcelas` (X pendentes de Y total)
- **Estilo:** Badge outline discreto
- **Posicionamento:** Ao lado do telefone

### **Card da Próxima Parcela:**
- **Fundo:** Branco semi-transparente
- **Borda:** Sutil para destacar
- **Layout:** Valor à esquerda, data à direita
- **Status:** Colorido baseado na urgência

## 📊 Benefícios Implementados

### **Para Gestão de Cobrança:**
1. **Visibilidade Imediata:** Quantas parcelas estão pendentes
2. **Priorização:** Próxima parcela a vencer destacada
3. **Urgência Visual:** Cores indicam prioridade
4. **Planejamento:** Datas de vencimento visíveis

### **Para Tomada de Decisão:**
1. **Estratégia de Cobrança:** Focar na próxima parcela
2. **Negociação:** Saber quantas parcelas restam
3. **Acompanhamento:** Progresso visual claro
4. **Eficiência:** Informações centralizadas

## 🔧 Arquivos Modificados

### **1. `src/hooks/financeiro/useViagemFinanceiro.ts`**
- Interface `PassageiroPendente` expandida
- Query do Supabase com dados completos das parcelas
- Lógica para calcular parcelas pendentes
- Algoritmo para encontrar próxima parcela

### **2. `src/components/detalhes-viagem/financeiro/DashboardPendencias.tsx`**
- Badge de parcelas ao lado do telefone
- Indicador de dias para vencer
- Card da próxima parcela
- Grid expandido (6 colunas)

### **3. `src/components/detalhes-viagem/financeiro/SistemaCobranca.tsx`**
- Mesmas melhorias para consistência
- Badge de parcelas
- Indicador de vencimento

## 🎯 Exemplos de Uso

### **Cenário 1: Parcela Vencendo**
```
Maria Santos                  R$ 300,00
(11) 98888-7777  [1/3 parcelas]    deve
                                2 dias
```

### **Cenário 2: Parcela Atrasada**
```
Pedro Silva                   R$ 150,00
(11) 97777-6666  [2/2 parcelas]    deve
                            5 dias atrasada
```

### **Cenário 3: Múltiplas Parcelas**
```
Ana Costa                     R$ 600,00
(11) 96666-5555  [3/6 parcelas]    deve
                                7 dias
```

## 🚀 Próximas Melhorias Sugeridas

### **Curto Prazo:**
- [ ] Ordenação por data de vencimento
- [ ] Filtro por parcelas vencendo hoje
- [ ] Notificação de parcelas críticas
- [ ] Ação rápida "Cobrar próxima parcela"

### **Médio Prazo:**
- [ ] Histórico de tentativas de cobrança por parcela
- [ ] Templates específicos por situação da parcela
- [ ] Calendário de vencimentos
- [ ] Relatório de parcelas por período

### **Longo Prazo:**
- [ ] Integração com WhatsApp automático
- [ ] Lembretes automáticos por parcela
- [ ] Dashboard de previsão de recebimentos
- [ ] Analytics de comportamento de pagamento

## ✅ Resultado Final

### **Antes:**
```
João Silva                    R$ 450,00
(11) 99999-9999                  deve

Valor devido: R$ 450,00
```

### **Depois:**
```
João Silva                    R$ 450,00
(11) 99999-9999  [2/4 parcelas]    deve
                                3 dias

Valor devido: R$ 450,00    Parcelas: 2/4 pendentes

┌─────────────────────────────────────────┐
│ Próxima Parcela: R$ 200,00              │
│ Vencimento: 25/07/2025                  │
│ Vence em 3 dias                         │
└─────────────────────────────────────────┘
```

---

**Status:** ✅ Implementado
**Data:** 23/07/2025
**Impacto:** Controle muito mais detalhado e eficiente das parcelas