# 📦 PACOTE DE INSTALAÇÃO - SISTEMA DE CRÉDITOS PRÉ-PAGOS

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Estrutura do Pacote](#estrutura-do-pacote)
4. [Instalação Passo a Passo](#instalação-passo-a-passo)
5. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
6. [Instalação dos Arquivos](#instalação-dos-arquivos)
7. [Dependências NPM](#dependências-npm)
8. [Configuração de Rotas](#configuração-de-rotas)
9. [Testes](#testes)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Este pacote contém um **sistema completo de gestão de créditos pré-pagos** (carteira digital) com funcionalidades administrativas avançadas.

### Funcionalidades Incluídas:

- ✅ **Gestão de Carteiras**: Criar, visualizar e gerenciar carteiras de clientes
- ✅ **Depósitos**: Adicionar créditos às carteiras
- ✅ **Uso de Créditos**: Consumir créditos em compras/serviços
- ✅ **Editar Transações**: Modificar valor e descrição de transações
- ✅ **Cancelar Transações**: Estornar transações com motivo
- ✅ **Ajustar Saldo**: Correção manual de saldo com auditoria
- ✅ **Excluir Carteiras**: Remover carteiras zeradas
- ✅ **Gerar PDF**: Extratos profissionais com logo da empresa
- ✅ **Histórico Completo**: Visualização detalhada de todas as movimentações
- ✅ **Auditoria**: Registro de quem fez cada alteração e quando

---

## 🔧 PRÉ-REQUISITOS

### Sistema Alvo Deve Ter:

1. **Frontend**:
   - React 18+
   - TypeScript
   - Vite ou Create React App
   - React Router DOM
   - TanStack Query (React Query)
   - shadcn/ui (ou componentes UI similares)
   - Tailwind CSS

2. **Backend**:
   - Supabase (PostgreSQL)
   - Autenticação configurada

3. **Estrutura de Pastas**:
   ```
   src/
   ├── components/
   ├── hooks/
   ├── pages/
   ├── types/
   ├── utils/
   └── lib/
   ```

---

## 📁 ESTRUTURA DO PACOTE

```
temp/creditos/
├── components/
│   └── wallet/
│       ├── WalletTransacaoEditModal.tsx
│       ├── WalletTransacaoCancelModal.tsx
│       ├── WalletAjusteSaldoModal.tsx
│       ├── WalletDeleteModal.tsx
│       ├── WalletPDFGenerator.tsx
│       └── WalletHistoricoAgrupado.tsx
├── hooks/
│   └── useWalletAdmin.ts
├── pages/
│   ├── CreditosPrePagos.tsx
│   └── WalletClienteDetalhes.tsx
├── types/
│   └── wallet.ts
├── sql/
│   └── database-changes.sql
├── docs/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   ├── testing-guide.md
│   └── README.md
└── INSTALACAO-COMPLETA.md (este arquivo)
```

---

## 🚀 INSTALAÇÃO PASSO A PASSO

### PASSO 1: Instalar Dependências NPM

```bash
# Dependências principais
npm install jspdf jspdf-autotable

# Se não tiver instalado:
npm install @tanstack/react-query
npm install react-router-dom
npm install date-fns
npm install lucide-react
npm install @supabase/supabase-js
```

### PASSO 2: Configurar Banco de Dados (Supabase)

1. **Abrir Supabase Dashboard**
2. **Ir em SQL Editor**
3. **Executar o arquivo**: `sql/database-changes.sql`

Este SQL irá:
- ✅ Adicionar campos de auditoria na tabela `wallet_transacoes`
- ✅ Criar 4 funções SQL para operações administrativas
- ✅ Configurar políticas de segurança (RLS)

**⚠️ IMPORTANTE**: Revise o SQL antes de executar para garantir compatibilidade com seu schema.

### PASSO 3: Copiar Arquivos para o Projeto

#### 3.1 Componentes

```bash
# Copiar componentes de wallet
cp -r components/wallet/* SEU_PROJETO/src/components/wallet/
```

**Arquivos copiados**:
- `WalletTransacaoEditModal.tsx` - Modal de edição
- `WalletTransacaoCancelModal.tsx` - Modal de cancelamento
- `WalletAjusteSaldoModal.tsx` - Modal de ajuste de saldo
- `WalletDeleteModal.tsx` - Modal de exclusão
- `WalletPDFGenerator.tsx` - Gerador de PDF
- `WalletHistoricoAgrupado.tsx` - Histórico de transações

#### 3.2 Hooks

```bash
cp hooks/useWalletAdmin.ts SEU_PROJETO/src/hooks/
```

#### 3.3 Páginas

```bash
cp pages/CreditosPrePagos.tsx SEU_PROJETO/src/pages/
cp pages/WalletClienteDetalhes.tsx SEU_PROJETO/src/pages/
```

#### 3.4 Types

```bash
cp types/wallet.ts SEU_PROJETO/src/types/
```

### PASSO 4: Ajustar Imports

Você precisará ajustar alguns imports conforme sua estrutura:

#### 4.1 Logo da Empresa (WalletPDFGenerator.tsx)

```typescript
// Linha 5 do arquivo WalletPDFGenerator.tsx
import logoNetoTours from '@/assets/landing/neto-tours-original.png';

// AJUSTE PARA:
import logoSuaEmpresa from '@/assets/sua-logo.png';
```

#### 4.2 Hooks Existentes

Verifique se você já tem estes hooks no seu projeto:
- `useWallet` (para buscar dados de carteiras)
- `useEmpresa` (para dados da empresa)

Se não tiver, você precisará criá-los ou adaptar os componentes.

### PASSO 5: Configurar Rotas

Adicione as rotas no seu `App.tsx` ou arquivo de rotas:

```typescript
import CreditosPrePagos from '@/pages/CreditosPrePagos';
import WalletClienteDetalhes from '@/pages/WalletClienteDetalhes';

// Dentro das suas rotas:
<Route path="/dashboard/creditos-prepagos" element={<CreditosPrePagos />} />
<Route path="/dashboard/creditos-prepagos/cliente/:clienteId" element={<WalletClienteDetalhes />} />
```

### PASSO 6: Adicionar ao Menu

Adicione um link no menu lateral/navegação:

```typescript
{
  label: 'Créditos Pré-pagos',
  icon: <Wallet />,
  path: '/dashboard/creditos-prepagos'
}
```

---

## 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS

### Tabelas Necessárias

O sistema espera estas tabelas no Supabase:

#### 1. `cliente_wallet`
```sql
- id (uuid, PK)
- cliente_id (uuid, FK → clientes)
- saldo_atual (numeric)
- total_depositado (numeric)
- total_usado (numeric)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 2. `wallet_transacoes`
```sql
- id (uuid, PK)
- cliente_id (uuid, FK → clientes)
- tipo (text: 'deposito', 'uso', 'ajuste')
- valor (numeric)
- descricao (text)
- cancelada (boolean)
- motivo_cancelamento (text)
- valor_original (numeric)
- editado_em (timestamp)
- editado_por (text)
- created_at (timestamp)
```

#### 3. `clientes`
```sql
- id (uuid, PK)
- nome (text)
- telefone (text)
- email (text)
- ... outros campos
```

### Funções SQL Criadas

O arquivo `sql/database-changes.sql` cria estas funções:

1. **`wallet_editar_transacao`** - Edita valor/descrição de transação
2. **`wallet_cancelar_transacao`** - Cancela transação com estorno
3. **`wallet_ajustar_saldo`** - Ajusta saldo manualmente
4. **`wallet_deletar_carteira`** - Deleta carteira e transações

---

## 📦 DEPENDÊNCIAS NPM

### Dependências Obrigatórias

```json
{
  "dependencies": {
    "jspdf": "^3.0.3",
    "jspdf-autotable": "^5.0.2",
    "@tanstack/react-query": "^5.x",
    "react-router-dom": "^6.x",
    "date-fns": "^3.x",
    "lucide-react": "^0.x",
    "@supabase/supabase-js": "^2.x"
  }
}
```

### Componentes UI (shadcn/ui)

Se você usa shadcn/ui, certifique-se de ter instalado:

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

## 🧪 TESTES

### Teste Rápido (5 minutos)

1. **Iniciar servidor**:
   ```bash
   npm run dev
   ```

2. **Acessar**: `http://localhost:5173/dashboard/creditos-prepagos`

3. **Testar funcionalidades**:
   - ✅ Ver lista de clientes
   - ✅ Criar novo depósito
   - ✅ Ver detalhes de uma carteira
   - ✅ Editar uma transação
   - ✅ Cancelar uma transação
   - ✅ Ajustar saldo
   - ✅ Gerar PDF
   - ✅ Excluir carteira (com saldo zero)

### Checklist de Validação

- [ ] SQL executado sem erros
- [ ] Funções SQL criadas no Supabase
- [ ] Dependências NPM instaladas
- [ ] Arquivos copiados corretamente
- [ ] Imports ajustados
- [ ] Rotas configuradas
- [ ] Logo da empresa configurada
- [ ] Sistema carrega sem erros
- [ ] Consegue criar depósito
- [ ] Consegue editar transação
- [ ] Consegue cancelar transação
- [ ] Consegue ajustar saldo
- [ ] Consegue gerar PDF
- [ ] Consegue excluir carteira

---

## 🐛 TROUBLESHOOTING

### Erro: "Function not found"

**Causa**: SQL não foi executado no Supabase
**Solução**: 
1. Abrir Supabase Dashboard
2. SQL Editor
3. Executar `sql/database-changes.sql`

### Erro: "Cannot read property..."

**Causa**: Tipo de dados incorreto ou hook não encontrado
**Solução**: 
1. Verificar console do navegador (F12)
2. Verificar se hooks `useWallet` e `useEmpresa` existem
3. Ajustar imports conforme sua estrutura

### PDF não gera

**Causa**: Dependências não instaladas
**Solução**:
```bash
npm install jspdf jspdf-autotable
```

### Logo não aparece no PDF

**Causa**: Caminho da logo incorreto
**Solução**: Ajustar import em `WalletPDFGenerator.tsx`:
```typescript
import logoSuaEmpresa from '@/assets/sua-logo.png';
```

### Saldo inconsistente

**Causa**: Erro na função SQL
**Solução**: 
1. Verificar logs do Supabase
2. Reexecutar SQL
3. Verificar políticas RLS

### Erro de TypeScript

**Causa**: Tipos não encontrados
**Solução**:
1. Verificar se `types/wallet.ts` foi copiado
2. Ajustar imports de tipos
3. Executar `npx tsc --noEmit` para ver erros

---

## 📚 DOCUMENTAÇÃO ADICIONAL

Consulte os arquivos na pasta `docs/` para mais informações:

- **`requirements.md`** - Requisitos funcionais completos
- **`design.md`** - Arquitetura e decisões técnicas
- **`tasks.md`** - Lista de tarefas implementadas
- **`testing-guide.md`** - Guia detalhado de testes
- **`README.md`** - Visão geral do sistema

---

## 🎯 PRÓXIMOS PASSOS

Após instalação bem-sucedida:

1. ✅ **Treinar equipe** no uso das funcionalidades
2. ✅ **Monitorar** primeiros usos em produção
3. ✅ **Coletar feedback** dos usuários
4. ✅ **Ajustar** conforme necessário

### Melhorias Futuras (Opcional)

- 📊 Relatórios em Excel
- 📧 Enviar extrato por email
- 🔔 Notificações automáticas de saldo baixo
- 📈 Gráficos de uso e tendências
- 🔄 Integração com sistema de pagamentos

---

## 📞 SUPORTE

Se encontrar problemas durante a instalação:

1. **Verificar logs**: Console do navegador (F12) e Supabase
2. **Consultar documentação**: Arquivos na pasta `docs/`
3. **Revisar checklist**: Garantir que todos os passos foram seguidos

---

## ✅ CONCLUSÃO

Este pacote fornece um sistema completo e profissional de gestão de créditos pré-pagos, pronto para ser instalado em qualquer sistema React + Supabase compatível.

**Tempo estimado de instalação**: 30-60 minutos

**Última atualização**: 2025-01-13

---

**Boa instalação! 🚀**
