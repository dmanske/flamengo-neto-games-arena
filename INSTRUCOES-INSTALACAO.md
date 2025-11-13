# 📦 Instruções de Instalação - Gestão Administrativa de Créditos

## ⚠️ IMPORTANTE: Instalar Dependências

Para que o sistema de geração de PDF funcione, você precisa instalar as seguintes dependências:

```bash
npm install jspdf jspdf-autotable
```

ou

```bash
yarn add jspdf jspdf-autotable
```

## ✅ Verificação

Após instalar, verifique se as dependências foram adicionadas:

```bash
grep -E "jspdf" package.json
```

Você deve ver algo como:

```json
"jspdf": "^2.5.1",
"jspdf-autotable": "^3.8.2"
```

## 🚀 Próximos Passos

1. ✅ Instalar dependências (comando acima)
2. ✅ Reiniciar o servidor de desenvolvimento
3. ✅ Testar as funcionalidades

## 📝 O que foi implementado

### Componentes Criados:
- ✅ `src/hooks/useWalletAdmin.ts` - Hook com mutations administrativas
- ✅ `src/components/wallet/WalletTransacaoEditModal.tsx` - Editar transações
- ✅ `src/components/wallet/WalletTransacaoCancelModal.tsx` - Cancelar transações
- ✅ `src/components/wallet/WalletAjusteSaldoModal.tsx` - Ajustar saldo
- ✅ `src/components/wallet/WalletDeleteModal.tsx` - Excluir carteira
- ✅ `src/components/wallet/WalletPDFGenerator.tsx` - Gerar PDF

### Páginas Atualizadas:
- ✅ `src/pages/WalletClienteDetalhes.tsx` - Botões e modais integrados
- ✅ `src/components/wallet/WalletHistoricoAgrupado.tsx` - Botões de editar/cancelar

### Tipos Atualizados:
- ✅ `src/types/wallet.ts` - Novos campos e tipos

## 🗄️ Banco de Dados

O SQL já foi executado com sucesso! ✅

Funções criadas:
- ✅ `wallet_editar_transacao()`
- ✅ `wallet_cancelar_transacao()`
- ✅ `wallet_ajustar_saldo()`
- ✅ `wallet_deletar_carteira()`

## 🧪 Como Testar

### 1. Editar Transação
1. Ir em `/dashboard/creditos-prepagos/cliente/[ID]`
2. No histórico, clicar no botão de editar (lápis azul)
3. Alterar valor ou descrição
4. Salvar e verificar que o saldo foi recalculado

### 2. Cancelar Transação
1. No histórico, clicar no botão de cancelar (X vermelho)
2. Informar motivo do cancelamento
3. Confirmar e verificar que aparece badge "Cancelada"

### 3. Ajustar Saldo
1. Clicar em "Ajustar Saldo" nas ações rápidas
2. Informar novo saldo e motivo
3. Confirmar e verificar transação de ajuste no histórico

### 4. Excluir Carteira
1. Clicar em "Excluir Carteira" no header
2. Se saldo > 0, não permite
3. Se saldo = 0, pede confirmação com nome do cliente
4. Após confirmar, redireciona para lista

### 5. Gerar PDF
1. Clicar em "Gerar PDF" nas ações rápidas
2. Selecionar período
3. Clicar em "Gerar e Baixar PDF"
4. Verificar que o PDF foi baixado com todas as informações

## ⚠️ Pontos de Atenção

- ✅ Todas as validações estão no backend (SQL functions)
- ✅ Saldo nunca fica negativo
- ✅ Transações canceladas não podem ser editadas
- ✅ Exclusão só com saldo zero
- ✅ Motivo obrigatório em cancelamentos e ajustes

## 🎉 Pronto!

Após instalar as dependências, o sistema está 100% funcional e pronto para testes!
