# 🎯 ONDE ESTÃO OS BOTÕES - Guia Visual

## 📍 Localização das Funcionalidades

---

## 1️⃣ PÁGINA: Detalhes da Carteira
**URL:** `/dashboard/creditos-prepagos/cliente/[ID]`

```
┌─────────────────────────────────────────────────────────────┐
│  ← Voltar    Carteira - João Silva    [Atualizar] [🗑️ Excluir Carteira]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💰 Saldo Atual: R$ 500,00                                  │
│  📊 Total Depositado: R$ 1.000,00                           │
│  📉 Total Usado: R$ 500,00                                  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  AÇÕES RÁPIDAS                                              │
│                                                              │
│  [💰 Novo Depósito]  [🛒 Usar Créditos]                    │
│  [🔧 Ajustar Saldo]  [📄 Gerar PDF]                        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  HISTÓRICO DE TRANSAÇÕES                                    │
│                                                              │
│  📅 Janeiro 2025                                            │
│  ├─ 15/01  💰 +R$ 100,00  Depósito PIX  [✏️] [❌]          │
│  ├─ 10/01  🛒 -R$ 50,00   Uso em viagem [✏️] [❌]          │
│  └─ 05/01  🔧 ~R$ 50,00   Ajuste Manual [✏️] [❌]          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Botões no Header:
- **[Atualizar]** - Recarrega dados
- **[🗑️ Excluir Carteira]** - Deleta carteira (só se saldo = 0)

### Botões em Ações Rápidas:
- **[💰 Novo Depósito]** - Adicionar créditos (já existia)
- **[🛒 Usar Créditos]** - Usar em viagem (já existia)
- **[🔧 Ajustar Saldo]** - **NOVO!** Ajuste manual
- **[📄 Gerar PDF]** - **NOVO!** Extrato em PDF

### Botões no Histórico:
- **[✏️]** - **NOVO!** Editar transação (lápis azul)
- **[❌]** - **NOVO!** Cancelar transação (X vermelho)

---

## 2️⃣ BADGES NO HISTÓRICO

### Transação Normal:
```
15/01  💰 +R$ 100,00  Depósito PIX  [✏️] [❌]
```

### Transação Editada:
```
15/01  💰 +R$ 150,00  Depósito PIX  [🟡 Editada em 16/01]  [✏️] [❌]
       Valor original: R$ 100,00
```

### Transação Cancelada:
```
15/01  💰 +R$ 100,00  Depósito PIX  [🔴 Cancelada]
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       Motivo: Pagamento duplicado
```

### Ajuste Manual:
```
15/01  🔧 ~R$ 50,00  AJUSTE MANUAL: Correção  [🟠 Ajuste Manual]  [✏️] [❌]
```

---

## 3️⃣ MODAIS

### Modal: Editar Transação
```
┌─────────────────────────────────────┐
│  ✏️ Editar Transação               │
├─────────────────────────────────────┤
│                                     │
│  Tipo: 💰 Depósito                 │
│  Valor Original: R$ 100,00          │
│  Saldo Atual: R$ 500,00             │
│                                     │
│  Novo Valor: [R$ 150,00]           │
│  Descrição: [Depósito PIX]         │
│                                     │
│  📊 Impacto no Saldo:              │
│  Diferença: +R$ 50,00               │
│  Novo saldo: R$ 550,00              │
│                                     │
│  [Cancelar] [Salvar Alterações]    │
└─────────────────────────────────────┘
```

### Modal: Cancelar Transação
```
┌─────────────────────────────────────┐
│  ❌ Cancelar Transação             │
├─────────────────────────────────────┤
│                                     │
│  Tipo: 💰 Depósito                 │
│  Valor: R$ 100,00                   │
│  Saldo Atual: R$ 500,00             │
│                                     │
│  📊 Impacto do Cancelamento:       │
│  O valor será subtraído do saldo    │
│  Novo saldo: R$ 400,00              │
│                                     │
│  Motivo do Cancelamento: *          │
│  [Digite o motivo...]              │
│                                     │
│  ⚠️ Esta ação não pode ser desfeita │
│                                     │
│  [Voltar] [Confirmar Cancelamento] │
└─────────────────────────────────────┘
```

### Modal: Ajustar Saldo
```
┌─────────────────────────────────────┐
│  🔧 Ajustar Saldo Manualmente      │
├─────────────────────────────────────┤
│                                     │
│  Cliente: João Silva                │
│  Saldo Atual: R$ 500,00             │
│                                     │
│  Novo Saldo: [R$ 600,00]           │
│                                     │
│  📊 Ajuste a ser realizado:        │
│  Saldo Atual: R$ 500,00             │
│  Diferença: +R$ 100,00              │
│  Novo Saldo: R$ 600,00              │
│                                     │
│  Motivo do Ajuste: *                │
│  [Digite o motivo...]              │
│                                     │
│  ⚠️ Criará transação "Ajuste Manual"│
│                                     │
│  [Cancelar] [Confirmar Ajuste]     │
└─────────────────────────────────────┘
```

### Modal: Excluir Carteira
```
┌─────────────────────────────────────┐
│  🗑️ Excluir Carteira               │
├─────────────────────────────────────┤
│                                     │
│  Cliente: João Silva                │
│  Saldo Atual: R$ 0,00 ✅            │
│  Total de Transações: 15            │
│                                     │
│  Digite o nome do cliente: *        │
│  [João Silva]                       │
│                                     │
│  ⚠️ O que será deletado:           │
│  • Registro da carteira             │
│  • 15 transação(ões) no histórico   │
│  • Todos os dados relacionados      │
│                                     │
│  🚨 Esta ação NÃO pode ser desfeita!│
│                                     │
│  [Cancelar] [Excluir Permanentemente]│
└─────────────────────────────────────┘
```

### Modal: Gerar PDF
```
┌─────────────────────────────────────┐
│  📄 Gerar Extrato em PDF           │
├─────────────────────────────────────┤
│                                     │
│  Cliente: João Silva                │
│  Saldo Atual: R$ 500,00             │
│                                     │
│  📅 Data Início: [01/10/2024]      │
│  📅 Data Fim:    [13/01/2025]      │
│                                     │
│  📊 Preview do Extrato:            │
│  25 transação(ões) encontrada(s)    │
│  O PDF incluirá: dados do cliente,  │
│  resumo financeiro e histórico.     │
│                                     │
│  [Cancelar] [⬇️ Gerar e Baixar PDF]│
└─────────────────────────────────────┘
```

---

## 4️⃣ FLUXO DE USO

### Editar Transação:
```
1. Ver histórico
2. Clicar no lápis azul [✏️]
3. Alterar valor/descrição
4. Salvar
5. ✅ Badge "Editada" aparece
```

### Cancelar Transação:
```
1. Ver histórico
2. Clicar no X vermelho [❌]
3. Informar motivo
4. Confirmar
5. ✅ Badge "Cancelada" + texto riscado
```

### Ajustar Saldo:
```
1. Clicar em "Ajustar Saldo"
2. Informar novo saldo
3. Informar motivo
4. Confirmar
5. ✅ Nova transação "Ajuste Manual"
```

### Excluir Carteira:
```
1. Ajustar saldo para R$ 0,00
2. Clicar em "Excluir Carteira"
3. Digitar nome do cliente
4. Confirmar
5. ✅ Redirecionado para lista
```

### Gerar PDF:
```
1. Clicar em "Gerar PDF"
2. Selecionar período
3. Clicar em "Gerar"
4. ✅ PDF baixado automaticamente
```

---

## 5️⃣ CORES E ÍCONES

### Botões:
- 🔵 **Azul** - Editar, Gerar PDF
- 🔴 **Vermelho** - Cancelar, Excluir
- 🟠 **Laranja** - Ajustar Saldo
- 🟢 **Verde** - Novo Depósito

### Badges:
- 🟡 **Amarelo** - Editada
- 🔴 **Vermelho** - Cancelada
- 🟠 **Laranja** - Ajuste Manual

### Ícones:
- ✏️ Editar
- ❌ Cancelar
- 🔧 Ajustar
- 🗑️ Excluir
- 📄 PDF
- 💰 Depósito
- 🛒 Uso

---

## 6️⃣ ATALHOS VISUAIS

### Transação pode ser editada?
- ✅ Sim, se não estiver cancelada
- ❌ Não, se estiver cancelada (botão desaparece)

### Transação pode ser cancelada?
- ✅ Sim, se não estiver cancelada
- ❌ Não, se já estiver cancelada (botão desaparece)

### Carteira pode ser excluída?
- ✅ Sim, se saldo = R$ 0,00
- ❌ Não, se saldo > R$ 0,00 (mostra erro)

### Saldo pode ser ajustado?
- ✅ Sempre pode (qualquer valor >= 0)

---

## 🎯 RESUMO RÁPIDO

**Onde clicar para:**

- **Editar transação** → Lápis azul no histórico
- **Cancelar transação** → X vermelho no histórico
- **Ajustar saldo** → Botão "Ajustar Saldo" nas ações
- **Excluir carteira** → Botão "Excluir Carteira" no header
- **Gerar PDF** → Botão "Gerar PDF" nas ações

**Tudo está na página:** `/dashboard/creditos-prepagos/cliente/[ID]`

---

**Pronto para testar!** 🚀
