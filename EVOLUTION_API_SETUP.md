# 🚀 Configuração Evolution API - Flamengo Viagens

## ✅ Você já tem Evolution API instalada!

Agora só precisa configurar no nosso sistema:

## 📋 Passo a Passo

### 1. **Obter Informações da Evolution API**

Acesse sua Evolution API (geralmente `http://localhost:8080`) e anote:

- **URL da API**: `http://localhost:8080` (ou sua URL)
- **API Key**: Encontre nas configurações da Evolution
- **Nome da Instância**: Crie uma nova ou use existente

### 2. **Criar Instância (se não tiver)**

Na interface da Evolution API:
1. Vá em **Instâncias**
2. Clique em **Criar Nova Instância**
3. Nome sugerido: `flamengo-viagens`
4. Configure e conecte com WhatsApp (QR Code)

### 3. **Configurar Variáveis de Ambiente**

Crie/edite o arquivo `.env` na raiz do projeto:

```bash
# Evolution API Configuration
VITE_EVOLUTION_API_URL=http://localhost:8080
VITE_EVOLUTION_API_KEY=sua_api_key_aqui
VITE_EVOLUTION_INSTANCE_NAME=flamengo-viagens
```

### 4. **Testar Configuração**

1. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra uma viagem
3. Clique no botão **Chat** de um passageiro
4. Digite uma mensagem e envie
5. **Deve enviar automaticamente via WhatsApp!** 🎉

## 🔧 Exemplo de Configuração

```bash
# Arquivo .env
VITE_EVOLUTION_API_URL=http://localhost:8080
VITE_EVOLUTION_API_KEY=B6D9F2A8-3C4E-4F5A-8B7C-1D2E3F4G5H6I
VITE_EVOLUTION_INSTANCE_NAME=flamengo-viagens

# Suas outras configurações...
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_key_supabase
```

## 🎯 Como Funciona

1. **Usuário digita mensagem** no chat
2. **Sistema chama Evolution API** automaticamente
3. **Evolution API envia** via WhatsApp conectado
4. **Mensagem chega** no WhatsApp do cliente
5. **Cliente responde** normalmente no WhatsApp dele

## 🔍 Troubleshooting

### Erro: "Evolution API não configurada"
- ✅ Verifique se as variáveis estão no `.env`
- ✅ Reinicie o servidor (`npm run dev`)

### Erro: "Erro HTTP 401"
- ✅ Verifique se a API Key está correta
- ✅ Verifique se a instância existe

### Erro: "Erro HTTP 404"
- ✅ Verifique se a URL está correta
- ✅ Verifique se a Evolution API está rodando

### Mensagem não chega
- ✅ Verifique se a instância está conectada (QR Code)
- ✅ Verifique se o número está correto (com DDD)

## 🎉 Vantagens da Evolution API

- ✅ **Gratuita** - Sem custos por mensagem
- ✅ **Fácil** - Interface simples
- ✅ **Completa** - Suporte a texto, imagem, áudio
- ✅ **Estável** - Funciona muito bem
- ✅ **Local** - Roda no seu servidor

## 📱 Próximos Passos

Depois que configurar, você pode:

1. **Receber mensagens** - Configurar webhook
2. **Enviar imagens** - Adicionar suporte a mídia
3. **Grupos** - Enviar para grupos do WhatsApp
4. **Automação** - Respostas automáticas

## 🆘 Precisa de Ajuda?

Me mande:
1. **URL da sua Evolution API**
2. **Print da tela de instâncias**
3. **Erro que está aparecendo**

E eu te ajudo a configurar! 😊