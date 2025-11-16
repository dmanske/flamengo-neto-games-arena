# ✅ CHECKLIST DE INSTALAÇÃO - Sistema de Créditos Pré-pagos

Use este checklist para garantir que todos os passos foram seguidos corretamente.

---

## 📋 PRÉ-INSTALAÇÃO

- [ ] Sistema alvo usa React 18+
- [ ] Sistema alvo usa TypeScript
- [ ] Sistema alvo usa Supabase (PostgreSQL)
- [ ] Sistema alvo usa TanStack Query (React Query)
- [ ] Sistema alvo usa shadcn/ui ou componentes UI similares
- [ ] Sistema alvo usa Tailwind CSS
- [ ] Tenho acesso ao Supabase Dashboard
- [ ] Tenho permissão para executar SQL
- [ ] Tenho permissão para modificar código

---

## 🗄️ BANCO DE DADOS

### Verificar Tabelas Existentes

- [ ] Tabela `clientes` existe
- [ ] Tabela `cliente_wallet` existe
- [ ] Tabela `wallet_transacoes` existe

### Executar SQL

- [ ] Abri o arquivo `sql/database-changes.sql`
- [ ] Revisei o SQL para compatibilidade
- [ ] Abri Supabase Dashboard → SQL Editor
- [ ] Executei o SQL completo
- [ ] SQL executou sem erros
- [ ] Verifiquei que 4 funções foram criadas:
  - [ ] `wallet_editar_transacao`
  - [ ] `wallet_cancelar_transacao`
  - [ ] `wallet_ajustar_saldo`
  - [ ] `wallet_deletar_carteira`

### Verificar Campos Adicionados

- [ ] Campo `cancelada` existe em `wallet_transacoes`
- [ ] Campo `motivo_cancelamento` existe em `wallet_transacoes`
- [ ] Campo `valor_original` existe em `wallet_transacoes`
- [ ] Campo `editado_em` existe em `wallet_transacoes`
- [ ] Campo `editado_por` existe em `wallet_transacoes`

---

## 📦 DEPENDÊNCIAS NPM

### Instalar Pacotes

- [ ] Executei: `npm install jspdf jspdf-autotable`
- [ ] Verifiquei instalação: `npm list jspdf`
- [ ] Verifiquei instalação: `npm list jspdf-autotable`

### Verificar Dependências Existentes

- [ ] `@tanstack/react-query` está instalado
- [ ] `react-router-dom` está instalado
- [ ] `date-fns` está instalado
- [ ] `lucide-react` está instalado
- [ ] `@supabase/supabase-js` está instalado

### Componentes shadcn/ui

- [ ] Componente `dialog` instalado
- [ ] Componente `button` instalado
- [ ] Componente `input` instalado
- [ ] Componente `label` instalado
- [ ] Componente `alert` instalado
- [ ] Componente `card` instalado
- [ ] Componente `table` instalado
- [ ] Componente `badge` instalado

---

## 📁 COPIAR ARQUIVOS

### Componentes

- [ ] Copiei `WalletTransacaoEditModal.tsx` para `src/components/wallet/`
- [ ] Copiei `WalletTransacaoCancelModal.tsx` para `src/components/wallet/`
- [ ] Copiei `WalletAjusteSaldoModal.tsx` para `src/components/wallet/`
- [ ] Copiei `WalletDeleteModal.tsx` para `src/components/wallet/`
- [ ] Copiei `WalletPDFGenerator.tsx` para `src/components/wallet/`
- [ ] Copiei `WalletHistoricoAgrupado.tsx` para `src/components/wallet/`

### Hooks

- [ ] Copiei `useWalletAdmin.ts` para `src/hooks/`

### Páginas

- [ ] Copiei `CreditosPrePagos.tsx` para `src/pages/`
- [ ] Copiei `WalletClienteDetalhes.tsx` para `src/pages/`

### Types

- [ ] Copiei `wallet.ts` para `src/types/`

---

## 🔧 AJUSTAR CÓDIGO

### Imports de Componentes UI

- [ ] Ajustei imports de `@/components/ui/*` conforme minha estrutura
- [ ] Verifiquei que todos os componentes UI existem

### Logo da Empresa

- [ ] Ajustei import da logo em `WalletPDFGenerator.tsx`
- [ ] Coloquei logo da minha empresa na pasta `assets/`
- [ ] Testei que logo carrega corretamente

### Hooks Customizados

- [ ] Verifiquei que `useWallet` existe no projeto
- [ ] Verifiquei que `useEmpresa` existe no projeto
- [ ] OU adaptei componentes para não usar esses hooks

### Formatters

- [ ] Verifiquei que `formatCurrency` existe em `utils/formatters`
- [ ] Verifiquei que `formatPhone` existe em `utils/formatters`
- [ ] OU criei essas funções

---

## 🛣️ CONFIGURAR ROTAS

### Adicionar Rotas

- [ ] Adicionei rota `/dashboard/creditos-prepagos`
- [ ] Adicionei rota `/dashboard/creditos-prepagos/cliente/:clienteId`
- [ ] Importei componentes `CreditosPrePagos` e `WalletClienteDetalhes`

### Menu de Navegação

- [ ] Adicionei link "Créditos Pré-pagos" no menu
- [ ] Link aponta para `/dashboard/creditos-prepagos`
- [ ] Ícone `Wallet` está visível

---

## 🧪 TESTES INICIAIS

### Compilação

- [ ] Executei `npm run dev` sem erros
- [ ] Não há erros TypeScript
- [ ] Não há erros no console do navegador

### Navegação

- [ ] Consigo acessar `/dashboard/creditos-prepagos`
- [ ] Página carrega sem erros
- [ ] Vejo lista de clientes (ou mensagem "nenhum cliente")

### Funcionalidade Básica

- [ ] Consigo criar um novo depósito
- [ ] Depósito aparece no histórico
- [ ] Saldo é atualizado corretamente

---

## 🎯 TESTES COMPLETOS

### Editar Transação

- [ ] Botão de editar (lápis azul) aparece nas transações
- [ ] Modal de edição abre corretamente
- [ ] Consigo alterar valor
- [ ] Consigo alterar descrição
- [ ] Saldo é recalculado corretamente
- [ ] Badge "Editada em [data]" aparece
- [ ] Toast de sucesso aparece

### Cancelar Transação

- [ ] Botão de cancelar (X vermelho) aparece nas transações
- [ ] Modal de cancelamento abre corretamente
- [ ] Campo de motivo é obrigatório
- [ ] Saldo é revertido corretamente
- [ ] Badge "Cancelada" aparece em vermelho
- [ ] Texto fica riscado
- [ ] Motivo é exibido
- [ ] Toast de sucesso aparece

### Ajustar Saldo

- [ ] Botão "Ajustar Saldo" aparece na página de detalhes
- [ ] Modal de ajuste abre corretamente
- [ ] Consigo informar novo saldo
- [ ] Campo de motivo é obrigatório
- [ ] Diferença é calculada automaticamente
- [ ] Saldo é atualizado corretamente
- [ ] Transação tipo "Ajuste Manual" é criada
- [ ] Badge laranja aparece
- [ ] Toast de sucesso aparece

### Excluir Carteira

- [ ] Botão "Excluir Carteira" aparece (se implementado)
- [ ] Modal de exclusão abre corretamente
- [ ] Bloqueio funciona se saldo > 0
- [ ] Confirmação dupla funciona
- [ ] Carteira é deletada com saldo = 0
- [ ] Redirecionamento funciona
- [ ] Toast de sucesso aparece

### Gerar PDF

- [ ] Botão "Gerar PDF" aparece
- [ ] Modal de PDF abre corretamente
- [ ] Seleção de período funciona
- [ ] Preview mostra quantidade de transações
- [ ] PDF é gerado sem erros
- [ ] PDF é baixado automaticamente
- [ ] Logo aparece no PDF (não esticada)
- [ ] Dados do cliente estão corretos
- [ ] Transações estão formatadas
- [ ] Resumo financeiro está correto

---

## 🔍 VALIDAÇÕES

### Validações de Negócio

- [ ] Não consigo editar transação cancelada
- [ ] Não consigo cancelar transação que deixaria saldo negativo
- [ ] Não consigo excluir carteira com saldo > 0
- [ ] Não consigo ajustar para saldo negativo
- [ ] Motivo é obrigatório em cancelamentos
- [ ] Motivo é obrigatório em ajustes

### Feedback Visual

- [ ] Toasts verdes aparecem em sucesso
- [ ] Toasts vermelhos aparecem em erro
- [ ] Loading aparece durante operações
- [ ] Botões ficam desabilitados durante processamento
- [ ] Badges coloridos aparecem corretamente

### Auditoria

- [ ] Campo `editado_em` é preenchido ao editar
- [ ] Campo `editado_por` é preenchido ao editar
- [ ] Campo `motivo_cancelamento` é preenchido ao cancelar
- [ ] Campo `valor_original` é preservado na primeira edição

---

## 📊 VERIFICAÇÃO FINAL

### Performance

- [ ] Página carrega em menos de 2 segundos
- [ ] Operações respondem em menos de 1 segundo
- [ ] Não há lentidão perceptível

### Responsividade

- [ ] Interface funciona em desktop
- [ ] Interface funciona em tablet
- [ ] Interface funciona em mobile

### Segurança

- [ ] Políticas RLS estão ativas no Supabase
- [ ] Apenas usuários autenticados acessam
- [ ] Validações de backend funcionam

---

## 📚 DOCUMENTAÇÃO

### Documentação Lida

- [ ] Li `INSTALACAO-COMPLETA.md`
- [ ] Li `README.md`
- [ ] Li `docs/requirements.md`
- [ ] Li `docs/design.md`
- [ ] Li `docs/testing-guide.md`

### Equipe Treinada

- [ ] Equipe sabe criar depósitos
- [ ] Equipe sabe editar transações
- [ ] Equipe sabe cancelar transações
- [ ] Equipe sabe ajustar saldo
- [ ] Equipe sabe gerar PDF
- [ ] Equipe sabe excluir carteiras

---

## ✅ CONCLUSÃO

### Checklist Final

- [ ] Todos os itens acima foram verificados
- [ ] Sistema está funcionando 100%
- [ ] Equipe está treinada
- [ ] Documentação está acessível
- [ ] Pronto para produção

---

## 📝 NOTAS

Use este espaço para anotar problemas encontrados ou ajustes necessários:

```
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
_______________________________________________
```

---

**Data da Instalação**: ___/___/_____  
**Instalado por**: _____________________  
**Tempo total**: _______ minutos  
**Status**: [ ] Sucesso  [ ] Problemas encontrados

---

**Parabéns pela instalação! 🎉**
