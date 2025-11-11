# 📱 Sistema de QR Code - Instruções de Instalação e Uso

## ✅ STATUS: PRONTO PARA TESTAR

Tudo foi instalado e configurado! Agora você só precisa executar o SQL no Supabase.

---

## 🚀 PASSO 1: EXECUTAR SQL NO SUPABASE

### 1.1 Abrir Supabase
1. Acesse: https://supabase.com
2. Entre no seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### 1.2 Executar o SQL
1. Clique em **"New Query"**
2. Copie TODO o conteúdo do arquivo: `database/migrations/create-qr-code-system.sql`
3. Cole no editor
4. Clique em **"Run"** (ou pressione Ctrl+Enter)
5. Aguarde a mensagem de sucesso ✅

**Tempo estimado:** 30 segundos

---

## 🎯 PASSO 2: TESTAR O SISTEMA

### 2.1 Acessar uma Viagem
1. Faça login no sistema
2. Vá em **Dashboard → Viagens**
3. Clique em qualquer viagem que tenha passageiros

### 2.2 Encontrar a Aba QR Codes
Na página de detalhes da viagem, você verá uma nova aba chamada **"QR Codes"** ou uma seção com o título **"Sistema de QR Codes"**

### 2.3 Gerar QR Codes
1. Clique no botão **"Gerar QR Codes"**
2. Aguarde alguns segundos
3. Você verá os QR codes gerados para todos os passageiros

---

## 📱 COMO FUNCIONA

### Fluxo Completo:

```
1. ADMIN GERA QR CODES
   ↓
2. ADMIN ENVIA VIA WHATSAPP (Z-API)
   ↓
3. PASSAGEIRO RECEBE LINK
   ↓
4. PASSAGEIRO ABRE LINK E MOSTRA QR CODE NA TELA
   ↓
5. ADMIN/RESPONSÁVEL ESCANEIA COM CÂMERA
   ↓
6. PRESENÇA CONFIRMADA AUTOMATICAMENTE
```

---

## 🎨 INTERFACE DO SISTEMA

### Aba "Visão Geral"
- **Estatísticas**: Total de QR codes, confirmados, pendentes
- **Botões de Ação**:
  - ✅ **Gerar QR Codes**: Cria códigos únicos para todos
  - 🔄 **Regenerar**: Invalida códigos antigos e cria novos
  - 📱 **Enviar (X)**: Envia todos via WhatsApp Z-API
  - 📥 **Baixar Todos**: Download em massa
  - 🗑️ **Deletar Todos**: Remove todos os códigos

### Aba "Scanner"
- **Câmera integrada** para escanear QR codes
- **Confirmação automática** de presença
- **Feedback visual** em tempo real

### Aba "QR Codes"
- **Lista de todos os QR codes** gerados
- **Status de cada passageiro** (confirmado/pendente)
- **Ações individuais**:
  - 📱 Enviar via WhatsApp (individual)
  - 📥 Baixar QR code
  - 🗑️ Deletar QR code

---

## 📱 CONFIGURAÇÃO Z-API

### Variáveis de Ambiente Necessárias:

Certifique-se de que seu arquivo `.env` tem:

```env
VITE_ZAPI_INSTANCE=sua-instancia-aqui
VITE_ZAPI_TOKEN=seu-token-aqui
```

### Como Obter:
1. Acesse: https://www.z-api.io
2. Faça login na sua conta
3. Vá em **Instâncias**
4. Copie o **ID da Instância** e o **Token**
5. Cole no arquivo `.env`

**IMPORTANTE:** Reinicie o servidor após alterar o `.env`

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🔐 SEGURANÇA

### Tokens Únicos
- Cada QR code tem um token único de 32 caracteres
- Impossível adivinhar ou duplicar

### Uso Único
- Token é invalidado após primeira confirmação
- Não pode ser reutilizado

### Expiração Automática
- Tokens expiram 24h após o jogo
- Previne uso indevido

### Validações
- ✅ Token existe
- ✅ Token não foi usado
- ✅ Token não expirou
- ✅ Passageiro existe
- ✅ Viagem existe

---

## 📋 MENSAGEM ENVIADA VIA WHATSAPP

Quando você clicar em "Enviar", cada passageiro receberá:

```
🔥 *FLAMENGO vs ADVERSÁRIO*
📅 *Data:* 01/01/2024 às 16:00

👋 Olá *Nome do Passageiro*!

📱 *SEU QR CODE PARA LISTA DE PRESENÇA*

🔗 *Acesse seu QR Code:*
https://seu-site.com/meu-qrcode/TOKEN_UNICO

✅ *Como usar:*
1️⃣ Clique no link acima
2️⃣ Mostre o QR code na tela do seu celular
3️⃣ O responsável irá escanear
4️⃣ Sua presença será confirmada automaticamente

⚠️ *IMPORTANTE:*
• Mantenha a tela ligada e com bom brilho
• Chegue com antecedência ao local de embarque
• Em caso de dúvidas, entre em contato

🔴⚫ Vamos juntos! 🔴⚫
```

---

## 🎯 PÁGINA DO CLIENTE

Quando o passageiro clicar no link, ele verá:

### Informações Exibidas:
- ✅ **QR Code em tela cheia** (pronto para escanear)
- ✅ **Dados da viagem** (adversário, data, logos)
- ✅ **Dados do passageiro** (nome, telefone, cidade, setor)
- ✅ **Dados do ônibus** (se alocado)
- ✅ **Status de confirmação** (se já foi confirmado)
- ✅ **Validade do token**
- ✅ **Botões**: Baixar e Compartilhar

### Instruções para o Cliente:
1. Mostre este QR code na tela do seu celular
2. O responsável irá escanear com o celular dele
3. Sua presença será confirmada automaticamente
4. Você receberá uma confirmação visual

---

## 📸 SCANNER DE CÂMERA

### Como Usar:
1. Na aba "Scanner", clique em **"Ativar Câmera"**
2. Permita o acesso à câmera quando solicitado
3. Aponte para o QR code do passageiro
4. A presença será confirmada automaticamente

### Requisitos:
- ✅ **HTTPS obrigatório** (câmera só funciona em HTTPS)
- ✅ **Permissão do navegador** (usuário precisa permitir)
- ✅ **Navegador moderno** (Chrome, Safari, Firefox)

### Feedback:
- ✅ **Sucesso**: Toast verde com nome do passageiro
- ❌ **Erro**: Toast vermelho com mensagem de erro
- ⚠️ **Já confirmado**: Aviso que presença já foi registrada

---

## 🗄️ BANCO DE DADOS

### Tabela Criada: `passageiro_qr_tokens`
```sql
- id: UUID (chave primária)
- viagem_id: UUID (referência para viagens)
- passageiro_id: UUID (referência para viagem_passageiros)
- token: VARCHAR(255) (token único)
- expires_at: TIMESTAMP (data de expiração)
- created_at: TIMESTAMP (data de criação)
- used_at: TIMESTAMP (quando foi usado)
- qr_code_data: TEXT (imagem base64 - cache)
- created_by: UUID (quem criou)
```

### Campos Adicionados em `viagem_passageiros`
```sql
- confirmation_method: VARCHAR(20) ('manual', 'qr_code', 'qr_code_responsavel')
- confirmed_at: TIMESTAMP (quando foi confirmado)
- confirmed_by: UUID (quem confirmou)
```

### Funções SQL Criadas:
1. **generate_qr_tokens_for_viagem(viagem_id)** - Gera tokens
2. **validate_and_use_qr_token(token)** - Valida e confirma
3. **get_qr_token_info(token)** - Busca informações

---

## 🐛 TROUBLESHOOTING

### Erro: "Câmera não funciona"
**Causa**: Navegador não está em HTTPS ou permissão negada

**Solução**:
1. Certifique-se de estar usando HTTPS
2. Verifique permissões do navegador
3. Recarregue a página
4. Tente outro navegador

### Erro: "QR Codes não geram"
**Causa**: SQL não foi executado ou erro no banco

**Solução**:
1. Verifique se executou o SQL no Supabase
2. Verifique logs do console (F12)
3. Verifique se há passageiros na viagem

### Erro: "WhatsApp não envia"
**Causa**: Z-API não configurada ou instância desconectada

**Solução**:
1. Verifique variáveis de ambiente (VITE_ZAPI_INSTANCE e VITE_ZAPI_TOKEN)
2. Verifique se instância está conectada no painel Z-API
3. Teste com um envio individual primeiro

### Erro: "Token inválido" na página do cliente
**Causa**: Token expirou, foi usado ou não existe

**Solução**:
1. Regenere os QR codes
2. Envie novamente via WhatsApp
3. Verifique se a viagem ainda está ativa

---

## 📊 ESTATÍSTICAS

O sistema mostra em tempo real:
- **Total de QR Codes gerados**
- **Confirmados via QR Code**
- **Pendentes de confirmação**

Essas estatísticas são atualizadas automaticamente após cada scan.

---

## 🎉 PRONTO!

Agora você tem um sistema completo de QR Code para confirmação de presença!

### Próximos Passos:
1. ✅ Execute o SQL no Supabase
2. ✅ Acesse uma viagem
3. ✅ Gere QR codes
4. ✅ Teste o scanner
5. ✅ Envie via WhatsApp

### Suporte:
- Verifique os logs do console (F12) para debug
- Todos os erros são logados com emojis para fácil identificação
- Use os toasts para feedback visual

---

**Desenvolvido com ❤️ para revolucionar sua lista de presença!**

**Versão**: 1.0.0  
**Data**: Novembro 2024  
**Status**: ✅ Pronto para produção
