# ✅ Novos Cards - Pagamentos Viagem e Passeios

## 🎯 **Cards Implementados**

### **1. Card "Pagamentos Viagem"**
```
Pagamentos Viagem
✅ Pagos: 2
⚠️ Devendo: 1 (R$ 150,00)
Status dos pagamentos de viagem
```

### **2. Card "Pagamentos Passeios"** (só aparece se tem passeios)
```
Pagamentos Passeios
✅ Pagos: 2
⚠️ Devendo: 0 (R$ 0,00)
Status dos pagamentos de passeios
```

## 🛠️ **Implementação**

### **Card Pagamentos Viagem:**

```typescript
{/* Pagamentos Viagem */}
<Card>
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600">Pagamentos Viagem</p>
        <div className="mt-2 space-y-2">
          {(() => {
            // Filtrar apenas passageiros que têm valor de viagem
            const passageirosComViagem = todosPassageiros.filter(p => {
              const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
              return valorViagem > 0;
            });

            // Contar quantos pagaram a viagem completa
            const viagemPaga = passageirosComViagem.filter(p => {
              const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
              const historico = p.historico_pagamentos_categorizado || [];
              const pagoViagem = historico
                .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                .reduce((sum, h) => sum + h.valor_pago, 0);
              
              return pagoViagem >= valorViagem - 0.01; // Margem para centavos
            }).length;

            const viagemDevendo = passageirosComViagem.length - viagemPaga;
            
            // Calcular valor total devendo
            const valorDevendo = passageirosComViagem.reduce((total, p) => {
              const valorViagem = (p.valor_viagem || p.valor || 0) - (p.desconto || 0);
              const historico = p.historico_pagamentos_categorizado || [];
              const pagoViagem = historico
                .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                .reduce((sum, h) => sum + h.valor_pago, 0);
              
              const pendente = Math.max(0, valorViagem - pagoViagem);
              return total + pendente;
            }, 0);

            return (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm">Pagos: <strong>{viagemPaga}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">⚠️</span>
                  <span className="text-sm">
                    Devendo: <strong>{viagemDevendo}</strong> ({formatCurrency(valorDevendo)})
                  </span>
                </div>
              </>
            );
          })()}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Status dos pagamentos de viagem
        </p>
      </div>
      <DollarSign className="h-8 w-8 text-green-600" />
    </div>
  </CardContent>
</Card>
```

### **Card Pagamentos Passeios:**

```typescript
{/* Pagamentos Passeios */}
{sistema === 'novo' && temPasseios && (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">Pagamentos Passeios</p>
          <div className="mt-2 space-y-2">
            {(() => {
              // Filtrar apenas passageiros que têm passeios
              const passageirosComPasseios = todosPassageiros.filter(p => {
                const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                return valorPasseios > 0;
              });

              // Contar quantos pagaram os passeios completos
              const passeiosPagos = passageirosComPasseios.filter(p => {
                const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                const historico = p.historico_pagamentos_categorizado || [];
                const pagoPasseios = historico
                  .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                  .reduce((sum, h) => sum + h.valor_pago, 0);
                
                return pagoPasseios >= valorPasseios - 0.01;
              }).length;

              const passeiosDevendo = passageirosComPasseios.length - passeiosPagos;
              
              // Calcular valor total devendo
              const valorDevendo = passageirosComPasseios.reduce((total, p) => {
                const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                const historico = p.historico_pagamentos_categorizado || [];
                const pagoPasseios = historico
                  .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                  .reduce((sum, h) => sum + h.valor_pago, 0);
                
                const pendente = Math.max(0, valorPasseios - pagoPasseios);
                return total + pendente;
              }, 0);

              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-sm">Pagos: <strong>{passeiosPagos}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-600">⚠️</span>
                    <span className="text-sm">
                      Devendo: <strong>{passeiosDevendo}</strong> ({formatCurrency(valorDevendo)})
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Status dos pagamentos de passeios
          </p>
        </div>
        <Receipt className="h-8 w-8 text-purple-600" />
      </div>
    </CardContent>
  </Card>
)}
```

## 📊 **Lógica de Cálculo**

### **Para Viagem:**
1. **Filtrar**: Apenas passageiros com `valor_viagem > 0`
2. **Calcular pago**: Soma pagamentos com categoria `'viagem'` ou `'ambos'`
3. **Verificar**: Se `pago >= valor_viagem`, está pago
4. **Contar**: Pagos vs Devendo
5. **Somar**: Valor total pendente

### **Para Passeios:**
1. **Filtrar**: Apenas passageiros com `valor_passeios > 0`
2. **Calcular pago**: Soma pagamentos com categoria `'passeios'` ou `'ambos'`
3. **Verificar**: Se `pago >= valor_passeios`, está pago
4. **Contar**: Pagos vs Devendo
5. **Somar**: Valor total pendente

## 🎨 **Design Visual**

### **Elementos:**
- ✅ **Verde**: Pagos (positivo)
- ⚠️ **Laranja**: Devendo (atenção)
- 💰 **Ícone DollarSign**: Viagem
- 🎫 **Ícone Receipt**: Passeios

### **Layout:**
```
┌─────────────────────────────────────┐
│ Pagamentos Viagem              💰   │
│                                     │
│ ✅ Pagos: 2                        │
│ ⚠️ Devendo: 1 (R$ 150,00)         │
│                                     │
│ Status dos pagamentos de viagem     │
└─────────────────────────────────────┘
```

## ✨ **Benefícios**

1. **Visão rápida**: Status de pagamentos por categoria
2. **Separação clara**: Viagem vs Passeios
3. **Valores precisos**: Cálculo baseado no histórico real
4. **Responsivo**: Se adapta ao sistema (novo/antigo)
5. **Consistente**: Usa mesma lógica do sistema de pagamentos

## 🎯 **Resultado Final**

Agora o relatório financeiro tem cards específicos para:
- ✅ **Pagamentos Viagem**: Quantos pagaram/devem a viagem
- ✅ **Pagamentos Passeios**: Quantos pagaram/devem os passeios (só se tem passeios)
- ✅ **Valores exatos**: Quanto está pendente em cada categoria

## 🎉 **Status: Implementado**

Os cards aparecem logo após o card "Taxa de Presença" e antes dos cards de resumo por cidade/setor!