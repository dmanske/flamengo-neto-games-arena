# 📋 DOCUMENTAÇÃO - SISTEMA DE PAGAMENTOS SEPARADOS

## 🎯 **DECISÃO ARQUITETURAL**

### **CENÁRIO ESCOLHIDO: Pagamento Livre com Categorias**
- **Baseado em**: Cenário 1 (Pagamento Livre) + Categorização
- **Implementação**: Sistema unificado na tabela `viagem_passageiros_parcelas`
- **Escopo**: Tela de Edição do Passageiro (inicialmente)

---

## 💳 **CARACTERÍSTICAS DO SISTEMA**

### **1. Flexibilidade Total:**
- ✅ **Data manual** - Usuário escolhe qualquer data
- ✅ **Valor livre** - Pode pagar qualquer valor (parcial ou total)
- ✅ **Categoria obrigatória** - viagem/passeios/ambos
- ✅ **Múltiplos pagamentos** - Quantos pagamentos quiser
- ✅ **Forma de pagamento** - PIX, cartão, dinheiro, etc.

### **2. Categorização:**
- **"viagem"** - Pagamento específico da viagem (R$ 1000)
- **"passeios"** - Pagamento específico dos passeios (R$ 205)
- **"ambos"** - Pagamento misto (viagem + passeios)

### **3. Exemplos de Uso:**
```
Passageiro: João Silva
Valor Viagem: R$ 1000
Valor Passeios: R$ 205 (Cristo Redentor + Pão de Açúcar)

Pagamentos Possíveis:
- R$ 300 | viagem | 15/01/2025 | PIX
- R$ 120 | passeios | 20/01/2025 | Cartão  
- R$ 200 | ambos | 25/01/2025 | Dinheiro
- R$ 585 | viagem | 30/01/2025 | PIX (completar viagem)
```

---

## 🗃️ **ESTRUTURA DE DADOS**

### **Tabela Unificada: `viagem_passageiros_parcelas`**
```sql
-- Estrutura atualizada
ALTER TABLE viagem_passageiros_parcelas 
ADD COLUMN categoria TEXT DEFAULT 'ambos' 
CHECK (categoria IN ('viagem', 'passeios', 'ambos'));

-- Campos existentes + novo campo
id, viagem_passageiro_id, valor_parcela, data_pagamento, 
forma_pagamento, observacoes, categoria
```

### **Migração de Dados Existentes:**
```sql
-- Parcelas antigas ficam como categoria "ambos"
UPDATE viagem_passageiros_parcelas 
SET categoria = 'ambos' 
WHERE categoria IS NULL;
```

---

## 🔄 **COMPATIBILIDADE COM CENÁRIOS EXISTENTES**

### **CENÁRIO 1: Pagamento Livre** ✅ **MANTIDO**
- **Onde**: Tela de Edição do Passageiro
- **Mudança**: + Categoria obrigatória
- **Impacto**: Melhoria (mais organizado)

### **CENÁRIO 2: Parcelamento Flexível** ⚠️ **PRECISA REVISÃO**
- **Onde**: Sistema de parcelamento sugerido
- **Questão**: Como integrar categorias com parcelas sugeridas?
- **Opções**:
  - A) Parcelas sugeridas sempre categoria "ambos"
  - B) Permitir escolher categoria por parcela
  - C) Manter sistema separado

### **CENÁRIO 3: Parcelamento Obrigatório** ⚠️ **PRECISA REVISÃO**  
- **Onde**: Viagens com parcelamento fixo
- **Questão**: Parcelas fixas podem ter categoria?
- **Opções**:
  - A) Parcelas fixas sempre categoria "ambos"
  - B) Definir categoria no momento da criação das parcelas
  - C) Manter sistema separado

---

## 🎯 **RECOMENDAÇÕES PARA OUTROS CENÁRIOS**

### **CENÁRIO 2 - Parcelamento Flexível:**
```
RECOMENDAÇÃO: Opção A - Parcelas sugeridas = "ambos"
MOTIVO: Simplicidade. Parcelas são sugestões, não pagamentos específicos.
IMPLEMENTAÇÃO: Quando criar parcelas sugeridas, categoria = "ambos"
```

### **CENÁRIO 3 - Parcelamento Obrigatório:**
```
RECOMENDAÇÃO: Opção A - Parcelas fixas = "ambos"  
MOTIVO: Parcelas obrigatórias são contratos, não escolhas de categoria.
IMPLEMENTAÇÃO: Quando criar parcelas fixas, categoria = "ambos"
```

---

## 📊 **CÁLCULOS E STATUS**

### **Cálculo por Categoria:**
```typescript
// Valores base
valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0)
valorPasseios = sum(passageiro_passeios.valor_cobrado)

// Pagamentos por categoria
pagoViagem = sum(parcelas WHERE categoria IN ('viagem', 'ambos'))
pagoPasseios = sum(parcelas WHERE categoria IN ('passeios', 'ambos'))

// Status automático
if (pagoViagem >= valorViagem && pagoPasseios >= valorPasseios) 
  status = "Pago Completo"
else if (pagoViagem >= valorViagem) 
  status = "Viagem Paga"
else if (pagoPasseios >= valorPasseios) 
  status = "Passeios Pagos"
else 
  status = "Pendente"
```

### **6 Novos Status:**
- 🟢 **Pago Completo** - Viagem + Passeios pagos
- 🟡 **Viagem Paga** - Só viagem paga
- 🟡 **Passeios Pagos** - Só passeios pagos  
- 🔴 **Pendente** - Nada pago
- 🎁 **Brinde** - Cortesia
- ❌ **Cancelado** - Cancelado

---

## 🚀 **IMPLEMENTAÇÃO ATUAL**

### **FASE 1 - Tela de Edição do Passageiro:**
- [x] Estrutura de dados (tabela + campos)
- [x] Cálculos por categoria
- [ ] Modal com data manual ⬅️ **PRÓXIMO**
- [ ] Histórico unificado
- [ ] Integração com parcelas existentes

### **FASE 2 - Outros Cenários:**
- [ ] Revisar Cenário 2 (Parcelamento Flexível)
- [ ] Revisar Cenário 3 (Parcelamento Obrigatório)
- [ ] Testes de compatibilidade
- [ ] Documentação para usuários

---

## ⚠️ **PONTOS DE ATENÇÃO**

### **1. Migração de Dados:**
- Parcelas existentes ficam como categoria "ambos"
- Não quebra funcionalidade atual
- Permite evolução gradual

### **2. Interface do Usuário:**
- Campo categoria é obrigatório em novos pagamentos
- Histórico mostra categoria de cada pagamento
- Filtros por categoria no histórico

### **3. Relatórios:**
- Breakdown por categoria em todos os relatórios
- Compatibilidade com dados antigos
- Novos insights de pagamento

---

## 📝 **PRÓXIMOS PASSOS**

1. **Corrigir cálculo** `P: R$0` → `P: R$205`
2. **Implementar modal** com data manual + categoria
3. **Testar pagamentos** separados
4. **Revisar cenários 2 e 3** para compatibilidade
5. **Expandir** para outras telas do sistema

---

**Data**: 26/07/2025  
**Status**: Em Implementação  
**Responsável**: Sistema de Pagamentos Separados