# 💳 Sistema de Badges de Crédito

## 🎯 **Objetivo**
Identificar visualmente passageiros que foram adicionados via sistema de créditos em todas as interfaces do sistema.

## 🏷️ **Tipos de Badges**

### **💳 Crédito** (credito_completo)
- **Quando aparece**: Passageiro pago 100% por crédito
- **Cor**: Azul (`bg-blue-100 text-blue-800`)
- **Tooltip**: "Pago 100% por crédito pré-pago (X% do valor total)"

### **💳 Crédito + $** (credito_parcial)  
- **Quando aparece**: Crédito + pagamento adicional
- **Cor**: Roxo (`bg-purple-100 text-purple-800`)
- **Tooltip**: "Pago parcialmente por crédito + pagamento adicional (X% do valor total)"

### **👥 Crédito Grupo** (credito_multiplo)
- **Quando aparece**: Múltiplos passageiros no mesmo crédito
- **Cor**: Verde (`bg-green-100 text-green-800`)
- **Tooltip**: "Múltiplos passageiros pagos pelo mesmo crédito - X passageiros"

### **⚠️ Crédito Parcial** (credito_insuficiente)
- **Quando aparece**: Crédito não foi suficiente
- **Cor**: Laranja (`bg-orange-100 text-orange-800`)
- **Tooltip**: "Crédito não foi suficiente - valor pendente (X% do valor total)"

## 📍 **Onde Aparecem**

### **1. Lista de Passageiros (DetalhesViagem)**
```tsx
<div className="flex flex-col items-center gap-1">
  <StatusBadgeAvancado status="Pago Completo" />
  <CreditoBadge tipo="credito_completo" />
</div>
```

### **2. Lista de Ônibus (MeuOnibus)**
```tsx
<div className="flex justify-center mb-4">
  <CreditoBadge tipo="credito_completo" size="md" />
</div>
```

### **3. Modal de Resultado (Após Vinculação)**
- Informações sobre como identificar depois
- Explicação sobre onde encontrar os badges

## 🔧 **Implementação Técnica**

### **Hook para Determinar Tipo**
```tsx
const creditoBadgeData = useCreditoBadgeType(passageiro);
// Retorna: { tipo, valorCredito, valorTotal } ou null
```

### **Lógica de Detecção**
```tsx
// Verifica se foi pago por crédito
if (!passageiro.pago_por_credito || !passageiro.credito_origem_id) {
  return null; // Não mostra badge
}

// Calcula valores e determina tipo
const valorCredito = passageiro.valor_credito_utilizado;
const valorTotal = valorViagem + valorPasseios;

if (valorCredito >= valorTotal) return 'credito_completo';
if (valorCredito > 0) return 'credito_parcial';
return 'credito_insuficiente';
```

## 🎨 **Variações Visuais**

### **Tamanhos**
- `size="sm"`: Lista de passageiros (compacto)
- `size="md"`: Lista de ônibus (mais visível)

### **Tooltips Dinâmicos**
- Mostram percentual do valor total
- Incluem quantidade de passageiros se múltiplo
- Explicam o tipo de pagamento

## 🔄 **Cenários de Uso**

### **Cenário 1: Crédito Completo**
```
Passageiro: João Silva
Valor Viagem: R$ 150,00
Valor Crédito: R$ 150,00
Badge: 💳 "Crédito" (azul)
Tooltip: "Pago 100% por crédito pré-pago (100% do valor total)"
```

### **Cenário 2: Crédito Parcial**
```
Passageiro: Maria Santos  
Valor Total: R$ 200,00
Valor Crédito: R$ 120,00
Badge: 💳 "Crédito + $" (roxo)
Tooltip: "Pago parcialmente por crédito + pagamento adicional (60% do valor total)"
```

### **Cenário 3: Múltiplos Passageiros**
```
Crédito: R$ 300,00 para 2 passageiros
Badge: 👥 "Crédito Grupo" (verde)
Tooltip: "Múltiplos passageiros pagos pelo mesmo crédito - 2 passageiros"
```

## ✅ **Benefícios**

1. **Identificação Imediata**: Saber quem veio por crédito
2. **Controle Financeiro**: Entender origem dos pagamentos
3. **Suporte ao Cliente**: Explicar situação do pagamento
4. **Auditoria**: Rastrear uso de créditos
5. **UX Melhorada**: Interface mais informativa

## 🚀 **Próximas Melhorias**

- [ ] Badge para créditos expirados
- [ ] Indicador de data de vinculação
- [ ] Link direto para detalhes do crédito
- [ ] Histórico de vinculações no tooltip
- [ ] Badge para créditos reembolsados

---

**Status**: ✅ Implementado e funcionando
**Arquivos**: `CreditoBadge.tsx`, `PassageiroRow.tsx`, `MeuOnibus.tsx`