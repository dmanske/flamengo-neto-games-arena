# 🔍 DEBUG - Sistema de Créditos Atual

## ✅ **CONFIRMAÇÃO: IMPLEMENTAÇÕES REALIZADAS**

### **1. Função buscarOnibusComVagas() - IMPLEMENTADA**
**Arquivo:** `src/hooks/useCreditos.ts` (linha 478)
```typescript
const buscarOnibusComVagas = useCallback(async (viagemId: string) => {
  // Busca ônibus com contagem de passageiros
  // Filtra apenas com vagas disponíveis
  // Ordena por mais vagas primeiro
});
```
**Status:** ✅ Implementada e exportada

### **2. Componente CreditoBadge - CRIADO**
**Arquivo:** `src/components/detalhes-viagem/CreditoBadge.tsx`
```typescript
export function CreditoBadge({ tipo, valorCredito, valorTotal, size }) {
  // 4 tipos de badges: completo, parcial, multiplo, insuficiente
  // Cores diferentes por tipo
  // Tooltips dinâmicos
}
```
**Status:** ✅ Componente completo criado

### **3. Modal VincularCreditoModal - ATUALIZADO**
**Arquivo:** `src/components/creditos/VincularCreditoModal.tsx`
- ✅ Importa `buscarOnibusComVagas`
- ✅ Estados para ônibus disponíveis
- ✅ Seção "Selecionar Ônibus (Obrigatório)"
- ✅ Validação obrigatória
**Status:** ✅ Atualizado

### **4. PassageiroRow - ATUALIZADO**
**Arquivo:** `src/components/detalhes-viagem/PassageiroRow.tsx`
- ✅ Importa `CreditoBadge` e `useCreditoBadgeType`
- ✅ Lógica para detectar tipo de badge
- ✅ Layout com badge abaixo do status
**Status:** ✅ Atualizado

### **5. MeuOnibus - ATUALIZADO**
**Arquivo:** `src/pages/MeuOnibus.tsx`
- ✅ Importa `CreditoBadge` e `useCreditoBadgeType`
- ✅ Badge na seção de informações do passageiro
**Status:** ✅ Atualizado

### **6. Tipos TypeScript - ATUALIZADOS**
**Arquivo:** `src/types/creditos.ts`
- ✅ Interface `OnibusComVagas`
- ✅ Tipos para badges
**Status:** ✅ Atualizado

---

## 🚨 **POR QUE NÃO APARECE?**

### **POSSÍVEIS CAUSAS:**

1. **🔄 CACHE DO NAVEGADOR**
   - Fazer hard refresh: `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
   - Limpar cache do navegador

2. **📦 BUILD NÃO ATUALIZADO**
   - Parar o servidor de desenvolvimento
   - Executar: `npm run dev` novamente
   - Verificar se não há erros de compilação

3. **🔧 TYPESCRIPT ERRORS**
   - Executar: `npx tsc --noEmit`
   - Verificar se há erros de tipo

4. **📂 IMPORTS INCORRETOS**
   - Verificar se todos os imports estão corretos
   - Verificar se componentes estão sendo exportados

---

## 🧪 **COMO TESTAR AGORA:**

### **Teste 1: Verificar Função no Console**
```javascript
// No console do navegador (F12)
console.log('Testando função buscarOnibusComVagas');
```

### **Teste 2: Verificar Modal de Vinculação**
1. Ir para `/creditos`
2. Clicar em "Vincular" em algum crédito
3. Selecionar uma viagem
4. **DEVE APARECER**: Seção "🚌 Selecionar Ônibus (Obrigatório)"

### **Teste 3: Verificar Badges**
1. Ir para detalhes de uma viagem que tem passageiros pagos por crédito
2. **DEVE APARECER**: Badge 💳 abaixo do status do passageiro

### **Teste 4: Verificar Lista de Ônibus**
1. Ir para `/meu-onibus/[id-da-viagem]`
2. Buscar um passageiro pago por crédito
3. **DEVE APARECER**: Badge 💳 nas informações

---

## 🔧 **COMANDOS PARA EXECUTAR:**

```bash
# 1. Parar servidor atual
Ctrl+C

# 2. Limpar cache (se necessário)
rm -rf node_modules/.cache
rm -rf .next (se usando Next.js)

# 3. Reinstalar dependências (se necessário)
npm install

# 4. Iniciar servidor
npm run dev

# 5. Verificar erros TypeScript
npx tsc --noEmit
```

---

## 📋 **CHECKLIST DE VERIFICAÇÃO:**

- [ ] Servidor de desenvolvimento rodando sem erros
- [ ] Cache do navegador limpo
- [ ] Página `/creditos` carrega normalmente
- [ ] Modal de vinculação abre sem erros
- [ ] Console do navegador sem erros JavaScript
- [ ] Componentes importados corretamente

---

## 🎯 **PRÓXIMO PASSO:**

1. **REINICIAR** o servidor de desenvolvimento
2. **LIMPAR** cache do navegador
3. **TESTAR** modal de vinculação de crédito
4. **VERIFICAR** se aparece seção de seleção de ônibus

**Se ainda não aparecer, me avise que vou investigar mais profundamente!** 🔍