# ⚡ Início Rápido - 5 Minutos

Guia ultra-rápido para ter o sistema funcionando em 5 minutos.

## 🚀 Passo a Passo

### 1️⃣ Instalar (1 min)

```bash
npm install qrcode @zxing/library @types/qrcode
```

### 2️⃣ SQL (2 min)

1. Abra: https://app.supabase.com → Seu Projeto → SQL Editor
2. Cole e execute: `database/migrations/create-qr-code-system-final-working.sql`
3. Aguarde: "Success. No rows returned"

### 3️⃣ Copiar Arquivos (1 min)

```bash
# Copiar tudo de uma vez
cp -r tempqrcode/src/* seu-projeto/src/
```

### 4️⃣ Adicionar Rotas (30 seg)

No seu `App.tsx`:

```tsx
import MeuQRCode from '@/pages/MeuQRCode';
import ScannerPresenca from '@/pages/ScannerPresenca';

// Adicione estas rotas:
<Route path="/meu-qrcode/:token" element={<MeuQRCode />} />
<Route path="/dashboard/scanner/:viagemId" element={<ScannerPresenca />} />
```

### 5️⃣ Integrar (30 seg)

No componente de detalhes da viagem:

```tsx
import QRCodeSection from '@/components/qr-code/QRCodeSection';

// Adicione onde quiser:
<QRCodeSection viagemId={viagemId} />
```

## ✅ Pronto!

Agora você tem:
- ✅ Botão "Gerar QR Codes"
- ✅ Botão "Abrir Scanner"
- ✅ Botão "Enviar WhatsApp"
- ✅ Estatísticas em tempo real

## 🧪 Testar

1. Abra uma viagem
2. Clique "Gerar QR Codes"
3. Clique "Abrir Scanner"
4. Permita câmera
5. Escaneie um QR code
6. ✅ Presença confirmada!

## 📱 URLs

- **Cliente**: `/meu-qrcode/{token}`
- **Scanner**: `/dashboard/scanner/{viagemId}`

## 🐛 Problemas?

### Erro: "Module not found"
```bash
npm install
```

### Erro: "Function does not exist"
Execute o SQL novamente

### Câmera não funciona
Use HTTPS: `https://localhost:3000`

## 📚 Próximos Passos

- Leia: `README.md` (documentação completa)
- Leia: `INSTALACAO.md` (guia detalhado)
- Leia: `EXEMPLOS.md` (casos de uso)

## 💡 Dica

Para desenvolvimento local com HTTPS:

```bash
# Opção 1: Vite
npm run dev -- --host --https

# Opção 2: Proxy SSL
npx local-ssl-proxy --source 3001 --target 3000
```

---

**Sistema funcionando em 5 minutos! 🎉**
