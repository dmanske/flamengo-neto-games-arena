# Sistema de QR Code para Lista de Presença

Este pacote contém todos os arquivos necessários para implementar o sistema de QR Code em outro projeto.

## 📦 Conteúdo do Pacote

### 1. **Banco de Dados** (`database/`)
- `migrations/create-qr-code-system-final-working.sql` - Migration principal (EXECUTAR PRIMEIRO)
- `fix_qr_code_updated_at.sql` - Correção de timestamps
- `update_qr_function_hora_embarque.sql` - Atualização de funções
- `add_qrcode_template.sql` - Template de mensagem WhatsApp

### 2. **Serviços** (`src/services/`)
- `qrCodeService.ts` - Serviço principal de geração e validação de QR codes

### 3. **Componentes** (`src/components/`)
- `qr-code/QRCodeSection.tsx` - Seção de controle admin (gerar, enviar, estatísticas)
- `qr-scanner/QRScanner.tsx` - Scanner de câmera completo
- `qr-scanner/QRScannerSimple.tsx` - Scanner simplificado
- `configuracao/ConfiguracaoMensagemQRCode.tsx` - Configuração de mensagens

### 4. **Páginas** (`src/pages/`)
- `MeuQRCode.tsx` - Página mobile do cliente (mostra QR code)
- `ScannerPresenca.tsx` - Página de scanner para admin
- `ScannerPresencaPublico.tsx` - Scanner público
- `ScannerPublico.tsx` - Scanner público alternativo

### 5. **Documentação** (`docs/`)
- `SISTEMA_QR_CODE_INSTRUCOES.md` - Instruções completas de uso

## 🚀 Como Implementar

### Passo 1: Instalar Dependências
```bash
npm install qrcode @zxing/library
npm install --save-dev @types/qrcode
```

### Passo 2: Executar SQL no Supabase
1. Abra o Supabase Dashboard
2. Vá em "SQL Editor"
3. Execute o arquivo: `database/migrations/create-qr-code-system-final-working.sql`
4. Execute os outros arquivos SQL na ordem:
   - `database/fix_qr_code_updated_at.sql`
   - `database/update_qr_function_hora_embarque.sql`
   - `database/add_qrcode_template.sql`

### Passo 3: Copiar Arquivos
Copie os arquivos para as respectivas pastas do seu projeto:
- `src/services/qrCodeService.ts` → `src/services/`
- `src/components/qr-code/` → `src/components/`
- `src/components/qr-scanner/` → `src/components/`
- `src/pages/` → `src/pages/`

### Passo 4: Configurar Rotas
Adicione as rotas no seu `App.tsx` ou arquivo de rotas:

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

### Passo 5: Integrar na Interface Admin
No componente de detalhes da viagem, adicione a seção de QR Code:

```tsx
import QRCodeSection from '@/components/qr-code/QRCodeSection';

// Dentro do componente
<QRCodeSection viagemId={viagemId} />
```

## 🔧 Dependências Necessárias

### NPM Packages
```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    "@zxing/library": "^0.20.0"
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5"
  }
}
```

### Supabase
- PostgreSQL 14+
- Row Level Security (RLS) habilitado
- Funções SQL customizadas

### React/TypeScript
- React 18+
- TypeScript 5+
- React Router DOM

## 📱 Funcionalidades Incluídas

### Para Admin
- ✅ Gerar QR codes únicos para todos os passageiros
- ✅ Enviar QR codes via WhatsApp automaticamente
- ✅ Scanner de câmera integrado
- ✅ Visualizar confirmações em tempo real
- ✅ Filtrar por método de confirmação
- ✅ Estatísticas de uso dos QR codes

### Para Cliente
- ✅ Recebe QR code via WhatsApp
- ✅ Página mobile otimizada
- ✅ QR code sempre visível na tela
- ✅ Informações da viagem
- ✅ Status de confirmação em tempo real

### Segurança
- ✅ Tokens únicos e seguros (32 bytes)
- ✅ Expiração automática (24h após evento)
- ✅ Uso único (token invalidado após confirmação)
- ✅ Validação de permissões
- ✅ Logs de auditoria

## 🔐 Configuração de Segurança

O sistema já inclui:
- Row Level Security (RLS) configurado
- Políticas de acesso por usuário
- Validação de tokens
- Logs de auditoria

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas
- `passageiro_qr_tokens` - Armazena tokens e QR codes
- `passageiro_confirmacoes` - Registra confirmações de presença

### Views Criadas
- `viagem_confirmacao_stats` - Estatísticas por viagem
- `passageiro_confirmacao_details` - Detalhes completos

### Funções SQL
- `generate_qr_tokens_for_viagem()` - Gera tokens para viagem
- `validate_and_use_qr_token()` - Valida e usa token
- `get_qr_token_info()` - Busca informações do token

## 🎯 Fluxo de Uso

```
1. Admin gera QR codes
   ↓
2. QR codes enviados via WhatsApp
   ↓
3. Cliente abre link e mostra QR na tela
   ↓
4. Admin escaneia QR code com câmera
   ↓
5. Presença confirmada automaticamente
   ↓
6. Lista atualizada em tempo real
```

## 🐛 Troubleshooting

### Câmera não funciona
- Verificar permissões do navegador
- Usar HTTPS (necessário para câmera)
- Testar em diferentes navegadores

### QR codes não geram
- Verificar se SQL foi executado
- Verificar logs do console
- Verificar se há passageiros na viagem

### WhatsApp não envia
- Verificar configuração da API
- Verificar se instância está conectada
- Testar com modo simulação primeiro

## 📝 Notas Importantes

1. **HTTPS Obrigatório**: A câmera só funciona em HTTPS
2. **Permissões**: Usuário precisa permitir acesso à câmera
3. **Compatibilidade**: Testado em Chrome, Safari, Firefox
4. **Mobile First**: Interface otimizada para celular
5. **Tempo Real**: Usa Supabase Realtime para atualizações

## 💡 Customização

### Alterar Tempo de Expiração
No arquivo SQL, modifique:
```sql
p_expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours')
```

### Alterar Tamanho do QR Code
No `qrCodeService.ts`:
```typescript
const qrCodeBase64 = await QRCode.toDataURL(tokenData.token, {
  width: 400, // Altere aqui
  margin: 3,
  // ...
});
```

### Customizar Mensagem WhatsApp
Use o componente `ConfiguracaoMensagemQRCode.tsx` ou edite diretamente no banco.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação em `docs/SISTEMA_QR_CODE_INSTRUCOES.md`
2. Verifique os logs do console do navegador
3. Verifique os logs do Supabase

## 🎉 Pronto!

Após seguir todos os passos, seu sistema de QR Code estará funcionando!

---

**Desenvolvido com ❤️ para revolucionar sua lista de presença!**
