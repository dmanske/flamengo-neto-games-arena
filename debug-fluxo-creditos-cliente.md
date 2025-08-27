# 🔍 DEBUG - Fluxo Créditos do Cliente

## 📍 **CAMINHO CORRETO IDENTIFICADO:**

**Créditos de Viagens → Clicar no Cliente → Aba "Créditos" → Botão "Usar em Viagem"**

### **Fluxo Detalhado:**
1. `/creditos` - Página principal de créditos
2. Clicar em um cliente específico
3. `/cliente/[id]` - Página de detalhes do cliente
4. Aba "Créditos" (`CreditosCliente.tsx`)
5. Botão "Usar em Viagem" → Abre `VincularCreditoModal`

---

## ✅ **VERIFICAÇÃO DOS ARQUIVOS:**

### **1. CreditosCliente.tsx - ✅ CORRETO**
```typescript
import { VincularCreditoModal } from '@/components/creditos/VincularCreditoModal';

// Modal está sendo usado:
<VincularCreditoModal
  open={modalVincularAberto}
  onOpenChange={setModalVincularAberto}
  grupoCliente={grupoCliente}
  onSuccess={() => refresh()}
/>
```

### **2. VincularCreditoModal.tsx - ✅ CORRETO**
```typescript
const { vincularCreditoComViagem, buscarOnibusComVagas } = useCreditos();

// Função está sendo chamada:
const onibus = await buscarOnibusComVagas(viagem.id);
```

### **3. useCreditos.ts - ✅ CORRETO**
```typescript
const buscarOnibusComVagas = useCallback(async (viagemId: string) => {
  // Implementação completa
});

// Sendo exportado:
return { buscarOnibusComVagas, vincularCreditoComViagem, ... };
```

---

## 🚨 **POSSÍVEL PROBLEMA IDENTIFICADO:**

### **Callback `onViagemUpdated` Ausente**
No `CreditosCliente.tsx`, o modal está sendo chamado **SEM** o callback `onViagemUpdated`:

```typescript
// ❌ ATUAL (sem callback):
<VincularCreditoModal
  open={modalVincularAberto}
  onOpenChange={setModalVincularAberto}
  grupoCliente={grupoCliente}
  onSuccess={() => refresh()}
  // ❌ FALTANDO: onViagemUpdated
/>
```

**Isso pode causar problemas na atualização dos dados após vinculação.**

---

## 🔧 **CORREÇÃO NECESSÁRIA:**

Vou atualizar o `CreditosCliente.tsx` para incluir o callback:

```typescript
<VincularCreditoModal
  open={modalVincularAberto}
  onOpenChange={setModalVincularAberto}
  grupoCliente={grupoCliente}
  onSuccess={() => refresh()}
  onViagemUpdated={() => {
    // Callback para recarregar dados da viagem se necessário
    console.log('Viagem atualizada após vinculação');
  }}
/>
```

---

## 🧪 **TESTE PASSO A PASSO:**

### **1. Verificar Console do Navegador**
- Abrir DevTools (F12)
- Ir para aba Console
- Verificar se há erros JavaScript

### **2. Testar Modal**
1. Ir para `/creditos`
2. Clicar em um cliente que tem créditos
3. Ir para aba "Créditos"
4. Clicar em "Usar em Viagem"
5. **VERIFICAR:** Modal abre?
6. **VERIFICAR:** Seção de ônibus aparece ao selecionar viagem?

### **3. Debug no Console**
```javascript
// No console do navegador:
console.log('Testando função buscarOnibusComVagas');

// Verificar se função existe:
console.log(typeof window.buscarOnibusComVagas);
```

---

## 🎯 **PRÓXIMOS PASSOS:**

1. **CORRIGIR** callback ausente no CreditosCliente.tsx
2. **REINICIAR** servidor de desenvolvimento
3. **LIMPAR** cache do navegador
4. **TESTAR** fluxo completo
5. **VERIFICAR** console para erros

---

## 📋 **CHECKLIST FINAL:**

- [ ] Servidor reiniciado
- [ ] Cache limpo
- [ ] Console sem erros
- [ ] Modal abre corretamente
- [ ] Seção de ônibus aparece
- [ ] Seleção de ônibus funciona
- [ ] Vinculação funciona
- [ ] Passageiro vai para ônibus correto

**Se ainda não funcionar após essas correções, vou investigar mais profundamente!** 🔍