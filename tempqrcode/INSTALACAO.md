# 🚀 Guia de Instalação Rápida

## Pré-requisitos
- Node.js 18+
- React 18+
- TypeScript 5+
- Supabase configurado
- WhatsApp API (Z-API ou Evolution API)

## Instalação em 5 Passos

### 1️⃣ Instalar Dependências
```bash
npm install qrcode @zxing/library
npm install --save-dev @types/qrcode
```

### 2️⃣ Executar SQL no Supabase
Acesse o Supabase Dashboard → SQL Editor e execute na ordem:

1. `database/migrations/create-qr-code-system-final-working.sql` ⚠️ **PRINCIPAL**
2. `database/fix_qr_code_updated_at.sql`
3. `database/update_qr_function_hora_embarque.sql`
4. `database/add_qrcode_template.sql`

### 3️⃣ Copiar Arquivos
```bash
# Copiar serviços
cp -r src/services/qrCodeService.ts seu-projeto/src/services/

# Copiar componentes
cp -r src/components/qr-code seu-projeto/src/components/
cp -r src/components/qr-scanner seu-projeto/src/components/
cp -r src/components/configuracao/ConfiguracaoMensagemQRCode.tsx seu-projeto/src/components/configuracao/

# Copiar páginas
cp -r src/pages/MeuQRCode.tsx seu-projeto/src/pages/
cp -r src/pages/ScannerPresenca.tsx seu-projeto/src/pages/
cp -r src/pages/ScannerPresencaPublico.tsx seu-projeto/src/pages/
```

### 4️⃣ Configurar Rotas
Adicione no seu arquivo de rotas (App.tsx):

```tsx
import MeuQRCode from '@/pages/MeuQRCode';
import ScannerPresenca from '@/pages/ScannerPresenca';
import ScannerPresencaPublico from '@/pages/ScannerPresencaPublico';

// Rotas públicas
<Route path="/meu-qrcode/:token" element={<MeuQRCode />} />
<Route path="/scanner-publico/:viagemId" element={<ScannerPresencaPublico />} />

// Rotas protegidas (admin)
<Route path="/dashboard/scanner/:viagemId" element={<ScannerPresenca />} />
<Route path="/dashboard/scanner/:viagemId/onibus/:onibusId" element={<ScannerPresenca />} />
```

### 5️⃣ Integrar na Interface
No componente de detalhes da viagem/evento:

```tsx
import QRCodeSection from '@/components/qr-code/QRCodeSection';

function DetalhesViagem() {
  const { viagemId } = useParams();
  
  return (
    <div>
      {/* Seus outros componentes */}
      
      {/* Adicionar seção de QR Code */}
      <QRCodeSection viagemId={viagemId} />
    </div>
  );
}
```

## ✅ Verificação

Após a instalação, verifique:

1. **SQL executado**: Verifique se as tabelas foram criadas
   ```sql
   SELECT * FROM passageiro_qr_tokens LIMIT 1;
   ```

2. **Dependências instaladas**: 
   ```bash
   npm list qrcode @zxing/library
   ```

3. **Rotas funcionando**: Acesse `/dashboard/scanner/teste`

4. **Componente renderizando**: Abra a página de detalhes da viagem

## 🎯 Teste Rápido

1. Abra uma viagem no dashboard
2. Vá na aba "Presença" ou onde adicionou o `QRCodeSection`
3. Clique em "Gerar QR Codes"
4. Clique em "Abrir Scanner"
5. Permita acesso à câmera
6. Escaneie um QR code gerado

## 🐛 Problemas Comuns

### Erro: "qrcode module not found"
```bash
npm install qrcode @types/qrcode
```

### Erro: "@zxing/library module not found"
```bash
npm install @zxing/library
```

### Erro: "Function generate_qr_tokens_for_viagem does not exist"
Execute novamente o SQL principal: `create-qr-code-system-final-working.sql`

### Câmera não funciona
- Use HTTPS (obrigatório)
- Permita acesso à câmera no navegador
- Teste em Chrome/Safari

## 📱 URLs Importantes

Após instalação, você terá:

- **Admin**: `/dashboard/viagem/{id}` → Aba "Presença"
- **Cliente**: `/meu-qrcode/{token}` (enviado via WhatsApp)
- **Scanner**: `/dashboard/scanner/{viagemId}`
- **Scanner por ônibus**: `/dashboard/scanner/{viagemId}/onibus/{onibusId}`

## 🎉 Pronto!

Sistema instalado e funcionando! Consulte o `README.md` para mais detalhes.

---

**Tempo estimado de instalação: 15-30 minutos**
