# 💳 Sistema de Créditos Pré-pagos - Pacote de Instalação

## 🎯 O que é este pacote?

Sistema completo de **carteira digital** para gerenciar créditos pré-pagos de clientes, com funcionalidades administrativas avançadas.

## ✨ Funcionalidades

- ✅ Gestão de carteiras digitais
- ✅ Depósitos e uso de créditos
- ✅ Editar transações
- ✅ Cancelar transações com estorno
- ✅ Ajustar saldo manualmente
- ✅ Excluir carteiras
- ✅ Gerar extratos em PDF
- ✅ Histórico completo com auditoria

## 📦 Conteúdo do Pacote

```
├── components/wallet/     → 6 componentes React
├── hooks/                 → 1 hook customizado
├── pages/                 → 2 páginas completas
├── types/                 → Definições TypeScript
├── sql/                   → Scripts SQL (Supabase)
├── docs/                  → Documentação técnica
└── INSTALACAO-COMPLETA.md → Guia de instalação detalhado
```

## 🚀 Instalação Rápida

### 1. Instalar dependências
```bash
npm install jspdf jspdf-autotable
```

### 2. Executar SQL no Supabase
```bash
# Abrir: sql/database-changes.sql
# Executar no Supabase SQL Editor
```

### 3. Copiar arquivos
```bash
cp -r components/wallet/* SEU_PROJETO/src/components/wallet/
cp hooks/useWalletAdmin.ts SEU_PROJETO/src/hooks/
cp pages/*.tsx SEU_PROJETO/src/pages/
cp types/wallet.ts SEU_PROJETO/src/types/
```

### 4. Configurar rotas
```typescript
<Route path="/dashboard/creditos-prepagos" element={<CreditosPrePagos />} />
<Route path="/dashboard/creditos-prepagos/cliente/:id" element={<WalletClienteDetalhes />} />
```

## 📖 Documentação Completa

Leia **`INSTALACAO-COMPLETA.md`** para instruções detalhadas passo a passo.

## 🔧 Requisitos

- React 18+
- TypeScript
- Supabase (PostgreSQL)
- TanStack Query
- shadcn/ui
- Tailwind CSS

## 📊 Estrutura do Banco de Dados

### Tabelas necessárias:
- `cliente_wallet` - Carteiras dos clientes
- `wallet_transacoes` - Histórico de transações
- `clientes` - Dados dos clientes

### Funções SQL criadas:
- `wallet_editar_transacao()`
- `wallet_cancelar_transacao()`
- `wallet_ajustar_saldo()`
- `wallet_deletar_carteira()`

## 🧪 Teste Rápido

```bash
npm run dev
# Acessar: http://localhost:5173/dashboard/creditos-prepagos
```

## 📁 Arquivos Principais

### Componentes
- **WalletTransacaoEditModal** - Editar transações
- **WalletTransacaoCancelModal** - Cancelar transações
- **WalletAjusteSaldoModal** - Ajustar saldo
- **WalletDeleteModal** - Excluir carteiras
- **WalletPDFGenerator** - Gerar extratos PDF
- **WalletHistoricoAgrupado** - Histórico de transações

### Páginas
- **CreditosPrePagos** - Lista de clientes com carteira
- **WalletClienteDetalhes** - Detalhes da carteira do cliente

### Hooks
- **useWalletAdmin** - Mutations para operações administrativas

## ⚠️ Importante

1. **Revise o SQL** antes de executar no seu banco
2. **Ajuste os imports** conforme sua estrutura de pastas
3. **Configure a logo** da sua empresa no PDF
4. **Teste em desenvolvimento** antes de produção

## 📞 Suporte

Consulte:
- `INSTALACAO-COMPLETA.md` - Guia detalhado
- `docs/testing-guide.md` - Guia de testes
- `docs/design.md` - Arquitetura técnica

## ✅ Checklist de Instalação

- [ ] Dependências NPM instaladas
- [ ] SQL executado no Supabase
- [ ] Arquivos copiados
- [ ] Imports ajustados
- [ ] Rotas configuradas
- [ ] Logo configurada
- [ ] Testes realizados

## 🎉 Pronto!

Após seguir os passos, você terá um sistema completo de créditos pré-pagos funcionando!

**Tempo de instalação**: 30-60 minutos

---

**Versão**: 1.0.0  
**Data**: 2025-01-13  
**Compatível com**: React 18+, Supabase, TypeScript
