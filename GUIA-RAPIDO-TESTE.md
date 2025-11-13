# 🧪 GUIA RÁPIDO DE TESTE - 5 Minutos

## ✅ Dependências Instaladas!

```
✅ jspdf: ^3.0.3
✅ jspdf-autotable: ^5.0.2
```

---

## 🚀 INICIAR SERVIDOR

```bash
npm run dev
```

---

## 🎯 ROTEIRO DE TESTE (5 minutos)

### 1️⃣ Acessar Carteira (30 segundos)

1. Abrir navegador: `http://localhost:5173`
2. Fazer login
3. Ir em **Créditos Pré-pagos** (menu lateral)
4. Clicar em qualquer cliente com saldo

**URL esperada:** `/dashboard/creditos-prepagos/cliente/[ID]`

---

### 2️⃣ Testar EDIÇÃO (1 minuto)

1. **Localizar** uma transação no histórico
2. **Clicar** no botão azul (lápis) ✏️
3. **Alterar** o valor (ex: de R$ 100 para R$ 150)
4. **Salvar**

**✅ Resultado esperado:**
- Toast verde: "Transação editada com sucesso!"
- Badge amarelo: "Editada em [data]"
- Saldo atualizado (+R$ 50)
- Valor original preservado

---

### 3️⃣ Testar CANCELAMENTO (1 minuto)

1. **Clicar** no botão vermelho (X) ❌ em outra transação
2. **Digitar** motivo: "Teste de cancelamento"
3. **Confirmar**

**✅ Resultado esperado:**
- Toast verde: "Transação cancelada com sucesso!"
- Badge vermelho: "Cancelada"
- Texto riscado
- Motivo visível
- Saldo ajustado (depósito diminui, uso aumenta)

---

### 4️⃣ Testar AJUSTE DE SALDO (1 minuto)

1. **Clicar** em "Ajustar Saldo" (botão laranja)
2. **Informar** novo saldo: R$ 500,00
3. **Informar** motivo: "Teste de ajuste"
4. **Confirmar**

**✅ Resultado esperado:**
- Toast verde: "Saldo ajustado com sucesso!"
- Saldo = R$ 500,00
- Nova transação tipo "Ajuste Manual" no histórico
- Badge laranja na transação

---

### 5️⃣ Testar GERAÇÃO DE PDF (1 minuto)

1. **Clicar** em "Gerar PDF" (botão azul)
2. **Verificar** período (padrão: últimos 3 meses)
3. **Clicar** em "Gerar e Baixar PDF"

**✅ Resultado esperado:**
- PDF baixado automaticamente
- Nome: `extrato-[nome-cliente]-[data].pdf`
- Contém: logo, dados do cliente, resumo, histórico
- Transações formatadas com badges

---

### 6️⃣ Testar EXCLUSÃO (1 minuto)

**ATENÇÃO:** Só funciona com saldo = 0

1. **Primeiro:** Ajustar saldo para R$ 0,00
2. **Clicar** em "Excluir Carteira" (botão vermelho no header)
3. **Digitar** nome do cliente exatamente
4. **Confirmar**

**✅ Resultado esperado:**
- Toast verde: "Carteira excluída com sucesso!"
- Redirecionamento para `/dashboard/creditos-prepagos`
- Carteira não aparece mais na lista

---

## 🔍 VERIFICAÇÕES IMPORTANTES

### ✅ Validações que DEVEM funcionar:

1. **Editar transação cancelada** → Botão desabilitado ❌
2. **Cancelar quando saldo ficaria negativo** → Erro ❌
3. **Excluir carteira com saldo > 0** → Erro ❌
4. **Ajustar para valor negativo** → Erro ❌
5. **Cancelar sem motivo** → Botão desabilitado ❌

### ✅ Badges que DEVEM aparecer:

- 🟡 **Amarelo** → "Editada em [data]"
- 🔴 **Vermelho** → "Cancelada"
- 🟠 **Laranja** → "Ajuste Manual"

### ✅ Comportamentos esperados:

- Texto riscado em transações canceladas
- Motivo do cancelamento visível
- Valor original quando editada
- Saldo sempre consistente
- Loading durante operações

---

## 🐛 SE ALGO DER ERRADO

### Erro: "Function not found"
**Causa:** SQL não foi executado
**Solução:** Verificar no Supabase se as 4 funções existem

### Erro: "Cannot read property..."
**Causa:** Tipo de dados incorreto
**Solução:** Verificar console do navegador

### PDF não gera
**Causa:** Dependências não instaladas
**Solução:** Verificar `npm list jspdf`

### Saldo inconsistente
**Causa:** Erro na função SQL
**Solução:** Verificar logs do Supabase

---

## 📊 CHECKLIST FINAL

Após testar tudo, verificar:

- [ ] ✏️ Edição funciona e recalcula saldo
- [ ] ❌ Cancelamento funciona e reverte saldo
- [ ] 🔧 Ajuste funciona e cria transação
- [ ] 🗑️ Exclusão funciona (só com saldo = 0)
- [ ] 📄 PDF gera e baixa corretamente
- [ ] 🟡 Badges aparecem corretamente
- [ ] ⚠️ Validações impedem operações inválidas
- [ ] 🔄 Saldo sempre consistente
- [ ] 🎨 Interface responsiva e clara
- [ ] ✅ Toasts de sucesso/erro aparecem

---

## 🎉 TUDO FUNCIONANDO?

**Parabéns!** O sistema está 100% operacional.

### Próximos passos:

1. ✅ Treinar equipe no uso
2. ✅ Monitorar primeiros usos
3. ✅ Coletar feedback
4. ✅ Ajustar conforme necessário

---

## 📞 PRECISA DE AJUDA?

**Documentação completa:**
- `IMPLEMENTACAO-COMPLETA.md` - Resumo geral
- `.kiro/specs/gestao-administrativa-creditos/testing-guide.md` - Testes detalhados
- `.kiro/specs/gestao-administrativa-creditos/design.md` - Arquitetura técnica

**Console do navegador (F12):**
- Erros aparecem na aba "Console"
- Network mostra chamadas ao backend

**Supabase:**
- Logs das funções SQL
- Verificar se funções existem

---

**Bons testes!** 🚀
