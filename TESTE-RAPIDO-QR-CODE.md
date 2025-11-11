# ⚡ Teste Rápido - Sistema de QR Code

## 🎯 OBJETIVO
Testar o sistema de QR Code em **5 minutos**!

---

## ✅ PASSO 1: EXECUTAR SQL (1 minuto)

### No Supabase:
1. Abra: https://supabase.com
2. Clique em **SQL Editor**
3. Clique em **New Query**
4. Copie TODO o arquivo: `database/migrations/create-qr-code-system.sql`
5. Cole no editor
6. Clique em **RUN** (ou Ctrl+Enter)
7. Aguarde a mensagem: ✅ **"Sistema de QR Code instalado com sucesso!"**

**✅ PRONTO!** Banco de dados configurado.

---

## ✅ PASSO 2: INTEGRAR COMPONENTE (2 minutos)

### Abra: `src/pages/DetalhesViagem.tsx`

### No topo do arquivo, adicione:
```typescript
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
```

### Dentro do JSX, adicione onde quiser:
```tsx
<QRCodeSection 
  viagemId={viagemId}
  viagem={viagem}
  passageiros={passageiros}
  onUpdatePassageiros={loadPassageiros}
/>
```

**Dica:** Se você tem abas (Tabs), adicione como uma nova aba chamada "QR Codes"

**✅ PRONTO!** Componente integrado.

---

## ✅ PASSO 3: TESTAR (2 minutos)

### 3.1 Iniciar o Servidor
```bash
npm run dev
```

### 3.2 Acessar uma Viagem
1. Faça login no sistema
2. Vá em **Dashboard → Viagens**
3. Clique em qualquer viagem que tenha passageiros

### 3.3 Gerar QR Codes
1. Procure pela aba/seção **"QR Codes"** ou **"Sistema de QR Codes"**
2. Clique no botão **"Gerar QR Codes"**
3. Aguarde alguns segundos
4. Você verá os QR codes gerados! 🎉

### 3.4 Testar Scanner
1. Clique na aba **"Scanner"**
2. Clique em **"Ativar Câmera"**
3. Permita o acesso à câmera
4. Aponte para um QR code (pode ser da tela mesmo)
5. A presença será confirmada automaticamente! ✅

**✅ PRONTO!** Sistema funcionando!

---

## 📱 TESTE COMPLETO (Opcional - 5 minutos)

### 4.1 Configurar Z-API
Adicione no arquivo `.env`:
```env
VITE_ZAPI_INSTANCE=sua-instancia
VITE_ZAPI_TOKEN=seu-token
```

**Reinicie o servidor:**
```bash
# Ctrl+C para parar
npm run dev
```

### 4.2 Enviar via WhatsApp
1. Na aba "Visão Geral"
2. Clique em **"Enviar (X)"** (onde X é o número de passageiros)
3. Aguarde o envio
4. Verifique o WhatsApp dos passageiros

### 4.3 Testar Página do Cliente
1. Abra o link recebido no WhatsApp
2. Ou acesse manualmente: `/meu-qrcode/TOKEN_AQUI`
3. Você verá o QR code em tela cheia
4. Teste escanear com o scanner do admin

**✅ PRONTO!** Teste completo realizado!

---

## 🎯 CHECKLIST DE TESTE

- [ ] SQL executado no Supabase (mensagem de sucesso)
- [ ] Componente adicionado em DetalhesViagem
- [ ] Servidor iniciado sem erros
- [ ] Aba/seção "QR Codes" aparece na viagem
- [ ] Botão "Gerar QR Codes" funciona
- [ ] QR codes são exibidos na lista
- [ ] Scanner de câmera abre
- [ ] Scanner detecta QR code
- [ ] Presença é confirmada automaticamente
- [ ] Estatísticas atualizam em tempo real

### Opcional (Z-API):
- [ ] Z-API configurada no .env
- [ ] Servidor reiniciado
- [ ] Envio via WhatsApp funciona
- [ ] Passageiro recebe link
- [ ] Página do cliente abre corretamente

---

## 🐛 PROBLEMAS COMUNS

### "Aba QR Codes não aparece"
**Solução:** Você precisa integrar o componente na página DetalhesViagem (veja PASSO 2)

### "Erro ao gerar QR codes"
**Solução:** Execute o SQL no Supabase (veja PASSO 1)

### "Câmera não funciona"
**Solução:** 
- Use HTTPS (obrigatório)
- Permita acesso à câmera no navegador
- Tente outro navegador (Chrome recomendado)

### "WhatsApp não envia"
**Solução:**
- Configure Z-API no .env (veja PASSO 4.1)
- Reinicie o servidor
- Verifique se instância está conectada

---

## 📊 O QUE VOCÊ DEVE VER

### Na Aba "Visão Geral":
```
┌─────────────────────────────────────┐
│ Sistema de QR Codes                 │
├─────────────────────────────────────┤
│                                     │
│  📊 Estatísticas:                   │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  10  │ │   5  │ │   5  │       │
│  │Gerados│ │Confir│ │Pend.│       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  🎯 Ações:                          │
│  [Gerar] [Regenerar] [Enviar (10)] │
│  [Baixar Todos] [Deletar Todos]    │
│                                     │
└─────────────────────────────────────┘
```

### Na Aba "Scanner":
```
┌─────────────────────────────────────┐
│ Scanner de QR Code                  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────┐     │
│  │                           │     │
│  │    📷 CÂMERA ATIVA        │     │
│  │                           │     │
│  │    [Quadrado de scan]     │     │
│  │                           │     │
│  └───────────────────────────┘     │
│                                     │
│  [Parar Scanner]                    │
│                                     │
└─────────────────────────────────────┘
```

### Na Aba "QR Codes":
```
┌─────────────────────────────────────┐
│ Lista de QR Codes                   │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐ ┌──────────┐         │
│  │ João     │ │ Maria    │         │
│  │ (11)9... │ │ (11)9... │         │
│  │ [QR IMG] │ │ [QR IMG] │         │
│  │ ✅Confir │ │ ⏰Pend.  │         │
│  └──────────┘ └──────────┘         │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎉 SUCESSO!

Se você viu tudo isso, o sistema está **100% funcional**! 🚀

### Próximos Passos:
1. ✅ Teste com passageiros reais
2. ✅ Configure mensagens personalizadas
3. ✅ Treine sua equipe
4. ✅ Use em produção!

---

## 📞 PRECISA DE AJUDA?

### Logs do Console:
Pressione **F12** e vá na aba **Console**
- 🔄 = Processando
- ✅ = Sucesso
- ❌ = Erro

### Toasts:
Mensagens aparecem no canto da tela com feedback visual

### Documentação:
- `SISTEMA-QR-CODE-INSTRUCOES.md` - Completo
- `INTEGRACAO-QR-CODE.md` - Integração
- `QR-CODE-RESUMO.md` - Resumo

---

**Tempo total:** 5 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)  
**Status:** ✅ Pronto para usar

**Bom teste! 🎉**
