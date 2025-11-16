# 🔧 TROUBLESHOOTING - Sistema de Créditos Pré-pagos

Guia completo para resolver problemas comuns durante e após a instalação.

---

## 📋 ÍNDICE

1. [Erros de Banco de Dados](#erros-de-banco-de-dados)
2. [Erros de Dependências](#erros-de-dependências)
3. [Erros de Compilação](#erros-de-compilação)
4. [Erros de Runtime](#erros-de-runtime)
5. [Problemas com PDF](#problemas-com-pdf)
6. [Problemas de Saldo](#problemas-de-saldo)
7. [Problemas de Interface](#problemas-de-interface)
8. [Problemas de Performance](#problemas-de-performance)

---

## 🗄️ ERROS DE BANCO DE DADOS

### Erro: "Function not found: wallet_editar_transacao"

**Sintoma**: Ao tentar editar transação, aparece erro "function not found"

**Causa**: SQL não foi executado no Supabase

**Solução**:
```sql
1. Abrir Supabase Dashboard
2. Ir em SQL Editor
3. Executar arquivo sql/database-changes.sql
4. Verificar que não há erros
5. Confirmar que 4 funções foram criadas
```

**Verificação**:
```sql
-- Executar no SQL Editor para verificar:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name LIKE 'wallet_%';

-- Deve retornar:
-- wallet_editar_transacao
-- wallet_cancelar_transacao
-- wallet_ajustar_saldo
-- wallet_deletar_carteira
```

---

### Erro: "Column does not exist: cancelada"

**Sintoma**: Erro ao buscar transações

**Causa**: Campos de auditoria não foram adicionados

**Solução**:
```sql
-- Executar no Supabase SQL Editor:
ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS cancelada BOOLEAN DEFAULT FALSE;

ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;

ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS valor_original NUMERIC;

ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS editado_em TIMESTAMP WITH TIME ZONE;

ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS editado_por TEXT;
```

---

### Erro: "Permission denied for function"

**Sintoma**: Erro de permissão ao executar funções

**Causa**: Políticas RLS muito restritivas

**Solução**:
```sql
-- Verificar políticas:
SELECT * FROM pg_policies 
WHERE tablename = 'wallet_transacoes';

-- Se necessário, ajustar políticas para permitir execução das funções
```

---

## 📦 ERROS DE DEPENDÊNCIAS

### Erro: "Cannot find module 'jspdf'"

**Sintoma**: Erro ao importar jsPDF

**Causa**: Dependência não instalada

**Solução**:
```bash
npm install jspdf jspdf-autotable
```

**Verificação**:
```bash
npm list jspdf
npm list jspdf-autotable
```

---

### Erro: "Module not found: @/components/ui/dialog"

**Sintoma**: Componentes shadcn/ui não encontrados

**Causa**: Componentes não instalados

**Solução**:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
```

---

### Erro: "Cannot find module '@tanstack/react-query'"

**Sintoma**: React Query não encontrado

**Causa**: Dependência não instalada

**Solução**:
```bash
npm install @tanstack/react-query
```

---

## 🔨 ERROS DE COMPILAÇÃO

### Erro: "Property 'cancelada' does not exist on type 'WalletTransacao'"

**Sintoma**: Erro TypeScript sobre tipos

**Causa**: Arquivo `types/wallet.ts` não foi copiado ou está desatualizado

**Solução**:
```typescript
// Verificar que types/wallet.ts contém:
export interface WalletTransacao {
  id: string;
  cliente_id: string;
  tipo: 'deposito' | 'uso' | 'ajuste';
  valor: number;
  descricao: string | null;
  cancelada: boolean;
  motivo_cancelamento: string | null;
  valor_original: number | null;
  editado_em: string | null;
  editado_por: string | null;
  created_at: string;
}
```

---

### Erro: "Cannot find name 'formatCurrency'"

**Sintoma**: Função de formatação não encontrada

**Causa**: Função não existe em `utils/formatters`

**Solução**:
```typescript
// Criar ou adicionar em src/utils/formatters.ts:

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};
```

---

### Erro: "Module not found: @/assets/landing/neto-tours-original.png"

**Sintoma**: Logo não encontrada

**Causa**: Caminho da logo incorreto

**Solução**:
```typescript
// Em WalletPDFGenerator.tsx, ajustar import:
import logoSuaEmpresa from '@/assets/sua-logo.png';

// E usar:
doc.addImage(logoSuaEmpresa, 'PNG', logoX, yPos, logoWidth, logoHeight);
```

---

## 🚀 ERROS DE RUNTIME

### Erro: "Cannot read property 'mutateAsync' of undefined"

**Sintoma**: Hook useWalletAdmin não funciona

**Causa**: Hook não está sendo usado dentro de QueryClientProvider

**Solução**:
```typescript
// Verificar que App.tsx tem:
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Suas rotas aqui */}
    </QueryClientProvider>
  );
}
```

---

### Erro: "useNavigate() may be used only in the context of a <Router>"

**Sintoma**: Erro ao usar navegação

**Causa**: Componente não está dentro de Router

**Solução**:
```typescript
// Verificar que App.tsx tem:
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      {/* Suas rotas aqui */}
    </BrowserRouter>
  );
}
```

---

### Erro: "Supabase client not initialized"

**Sintoma**: Erro ao fazer chamadas ao Supabase

**Causa**: Cliente Supabase não configurado

**Solução**:
```typescript
// Verificar que existe src/lib/supabase.ts:
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## 📄 PROBLEMAS COM PDF

### PDF não gera

**Sintoma**: Ao clicar em "Gerar PDF", nada acontece

**Diagnóstico**:
```typescript
// Abrir console do navegador (F12)
// Verificar se há erros
```

**Soluções possíveis**:

1. **Dependências faltando**:
```bash
npm install jspdf jspdf-autotable
```

2. **Logo não carrega**:
```typescript
// Ajustar caminho da logo ou usar fallback de texto
```

3. **Erro de CORS**:
```typescript
// Se logo está em URL externa, pode ter problema de CORS
// Solução: hospedar logo localmente
```

---

### Logo esticada no PDF

**Sintoma**: Logo aparece distorcida

**Causa**: Proporção incorreta

**Solução**:
```typescript
// Em WalletPDFGenerator.tsx, ajustar:
const logoHeight = 35; // Ajustar conforme necessário
const logoWidth = logoHeight * aspectRatio; // Mantém proporção
```

---

### PDF vazio ou incompleto

**Sintoma**: PDF gera mas está vazio

**Causa**: Transações não foram carregadas

**Solução**:
```typescript
// Verificar que useWalletTransacoes está retornando dados:
console.log('Transações:', transacoes);

// Verificar período selecionado
console.log('Período:', dataInicio, dataFim);
```

---

## 💰 PROBLEMAS DE SALDO

### Saldo inconsistente após edição

**Sintoma**: Saldo não bate após editar transação

**Diagnóstico**:
```sql
-- Verificar no Supabase:
SELECT * FROM wallet_transacoes 
WHERE cliente_id = 'UUID_DO_CLIENTE'
ORDER BY created_at DESC;

SELECT * FROM cliente_wallet 
WHERE cliente_id = 'UUID_DO_CLIENTE';
```

**Solução**:
```sql
-- Recalcular saldo manualmente:
UPDATE cliente_wallet
SET saldo_atual = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN tipo = 'deposito' AND NOT cancelada THEN valor
      WHEN tipo = 'uso' AND NOT cancelada THEN -valor
      WHEN tipo = 'ajuste' AND NOT cancelada THEN valor
      ELSE 0
    END
  ), 0)
  FROM wallet_transacoes
  WHERE cliente_id = cliente_wallet.cliente_id
)
WHERE cliente_id = 'UUID_DO_CLIENTE';
```

---

### Cancelamento não reverte saldo

**Sintoma**: Ao cancelar, saldo não muda

**Causa**: Função SQL com erro

**Solução**:
```sql
-- Verificar logs da função no Supabase
-- Reexecutar sql/database-changes.sql
```

---

### Não consigo cancelar (saldo ficaria negativo)

**Sintoma**: Erro ao tentar cancelar transação

**Causa**: Validação funcionando corretamente

**Explicação**: 
- Isso é esperado! A validação impede cancelamentos que deixariam saldo negativo
- Exemplo: Cliente tem R$ 50, tentou cancelar depósito de R$ 100

**Solução**:
- Ajustar saldo primeiro (se necessário)
- Ou cancelar outras transações antes

---

## 🎨 PROBLEMAS DE INTERFACE

### Botões não aparecem

**Sintoma**: Botões de editar/cancelar não aparecem no histórico

**Causa**: Componente WalletHistoricoAgrupado não foi atualizado

**Solução**:
```typescript
// Verificar que WalletHistoricoAgrupado.tsx foi copiado
// Verificar imports dos modais
```

---

### Badges não aparecem

**Sintoma**: Badges "Editada", "Cancelada" não aparecem

**Causa**: Componente Badge não instalado

**Solução**:
```bash
npx shadcn-ui@latest add badge
```

---

### Modal não abre

**Sintoma**: Ao clicar em botão, modal não abre

**Diagnóstico**:
```typescript
// Verificar console (F12) para erros
// Verificar que Dialog está instalado
```

**Solução**:
```bash
npx shadcn-ui@latest add dialog
```

---

### Estilos quebrados

**Sintoma**: Interface sem estilos ou mal formatada

**Causa**: Tailwind CSS não configurado

**Solução**:
```typescript
// Verificar tailwind.config.js
// Verificar que @tailwind directives estão em index.css
```

---

## ⚡ PROBLEMAS DE PERFORMANCE

### Página lenta para carregar

**Sintoma**: Lista de clientes demora muito

**Causa**: Muitos clientes sem paginação

**Solução**:
- Paginação já está implementada em CreditosPrePagos.tsx
- Verificar que está funcionando (20 por página)

---

### Operações lentas

**Sintoma**: Editar/cancelar demora muito

**Diagnóstico**:
```sql
-- Verificar índices no Supabase:
SELECT * FROM pg_indexes 
WHERE tablename = 'wallet_transacoes';
```

**Solução**:
```sql
-- Criar índices se não existirem:
CREATE INDEX IF NOT EXISTS idx_wallet_transacoes_cliente 
ON wallet_transacoes(cliente_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transacoes_created 
ON wallet_transacoes(created_at DESC);
```

---

## 🔍 FERRAMENTAS DE DIAGNÓSTICO

### Console do Navegador

```javascript
// Abrir DevTools (F12)
// Aba Console - ver erros JavaScript
// Aba Network - ver chamadas HTTP
// Aba Application - ver localStorage/cookies
```

### Supabase Dashboard

```
1. Logs → Ver erros de funções SQL
2. Database → Ver dados das tabelas
3. SQL Editor → Executar queries de diagnóstico
4. API → Ver endpoints disponíveis
```

### Verificar Estado do React Query

```typescript
// Adicionar temporariamente:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// No componente:
<ReactQueryDevtools initialIsOpen={false} />
```

---

## 📞 QUANDO PEDIR AJUDA

Se após seguir este guia o problema persistir:

1. **Coletar informações**:
   - Mensagem de erro completa
   - Console do navegador (F12)
   - Logs do Supabase
   - Versões das dependências (`npm list`)

2. **Verificar documentação**:
   - `docs/design.md` - Arquitetura
   - `docs/testing-guide.md` - Testes
   - `INSTALACAO-COMPLETA.md` - Instalação

3. **Revisar checklist**:
   - `CHECKLIST-INSTALACAO.md`

---

## ✅ PROBLEMAS RESOLVIDOS?

Após resolver o problema:

- [ ] Documentei a solução
- [ ] Testei que funciona
- [ ] Atualizei este guia (se necessário)

---

**Última atualização**: 2025-01-13
