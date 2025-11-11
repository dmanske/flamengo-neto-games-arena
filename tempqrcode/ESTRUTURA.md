# 📁 Estrutura do Sistema de QR Code

## Visão Geral da Arquitetura

```
tempqrcode/
├── database/                          # Scripts SQL
│   ├── migrations/
│   │   └── create-qr-code-system-final-working.sql  # ⭐ PRINCIPAL
│   ├── fix_qr_code_updated_at.sql
│   ├── update_qr_function_hora_embarque.sql
│   └── add_qrcode_template.sql
│
├── src/
│   ├── services/
│   │   └── qrCodeService.ts           # ⭐ Serviço principal
│   │
│   ├── components/
│   │   ├── qr-code/
│   │   │   └── QRCodeSection.tsx      # ⭐ Interface admin
│   │   │
│   │   ├── qr-scanner/
│   │   │   ├── QRScanner.tsx          # Scanner completo
│   │   │   └── QRScannerSimple.tsx    # Scanner simplificado
│   │   │
│   │   └── configuracao/
│   │       └── ConfiguracaoMensagemQRCode.tsx  # Config mensagens
│   │
│   └── pages/
│       ├── MeuQRCode.tsx              # ⭐ Página do cliente
│       ├── ScannerPresenca.tsx        # ⭐ Scanner admin
│       ├── ScannerPresencaPublico.tsx # Scanner público
│       └── ScannerPublico.tsx         # Scanner público alt
│
├── docs/
│   └── SISTEMA_QR_CODE_INSTRUCOES.md  # Documentação completa
│
├── README.md                          # Documentação principal
├── INSTALACAO.md                      # Guia de instalação
├── ESTRUTURA.md                       # Este arquivo
└── package.json                       # Dependências
```

## 🗄️ Banco de Dados

### Tabelas Principais

#### `passageiro_qr_tokens`
Armazena os tokens e QR codes gerados.

```sql
CREATE TABLE passageiro_qr_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  qr_code_data TEXT,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

**Campos importantes:**
- `token`: Token único de 32 bytes (usado no QR code)
- `qr_code_data`: Base64 do QR code (cache)
- `expires_at`: Data de expiração (24h após evento)
- `used_at`: Quando foi usado (NULL = não usado)

#### `passageiro_confirmacoes`
Registra todas as confirmações de presença.

```sql
CREATE TABLE passageiro_confirmacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id) ON DELETE CASCADE,
  confirmation_method TEXT NOT NULL,
  confirmed_at TIMESTAMP DEFAULT NOW(),
  confirmed_by UUID REFERENCES auth.users(id),
  token_used TEXT REFERENCES passageiro_qr_tokens(token)
);
```

**Métodos de confirmação:**
- `manual`: Confirmação manual pelo admin
- `qr_code`: Escaneado pelo admin
- `qr_code_responsavel`: Escaneado pelo responsável do ônibus

### Views

#### `viagem_confirmacao_stats`
Estatísticas agregadas por viagem.

```sql
CREATE VIEW viagem_confirmacao_stats AS
SELECT 
  v.id as viagem_id,
  COUNT(DISTINCT vp.id) as total_passageiros,
  COUNT(DISTINCT pc.passageiro_id) as confirmados,
  COUNT(DISTINCT CASE WHEN pc.confirmation_method = 'qr_code' THEN pc.passageiro_id END) as confirmados_qr,
  COUNT(DISTINCT CASE WHEN pc.confirmation_method = 'manual' THEN pc.passageiro_id END) as confirmados_manual
FROM viagens v
LEFT JOIN viagem_passageiros vp ON v.id = vp.viagem_id
LEFT JOIN passageiro_confirmacoes pc ON vp.id = pc.passageiro_id
GROUP BY v.id;
```

#### `passageiro_confirmacao_details`
Detalhes completos de cada passageiro.

```sql
CREATE VIEW passageiro_confirmacao_details AS
SELECT 
  vp.id as passageiro_id,
  vp.viagem_id,
  c.nome as passageiro_nome,
  c.telefone,
  pc.confirmation_method,
  pc.confirmed_at,
  pqt.token,
  pqt.expires_at,
  pqt.used_at
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
LEFT JOIN passageiro_confirmacoes pc ON vp.id = pc.passageiro_id
LEFT JOIN passageiro_qr_tokens pqt ON vp.id = pqt.passageiro_id;
```

### Funções SQL

#### `generate_qr_tokens_for_viagem()`
Gera tokens para todos os passageiros de uma viagem.

```sql
CREATE OR REPLACE FUNCTION generate_qr_tokens_for_viagem(
  p_viagem_id UUID,
  p_created_by UUID DEFAULT NULL
) RETURNS TABLE (
  passageiro_id UUID,
  token TEXT,
  expires_at TIMESTAMP,
  passageiro_nome TEXT,
  passageiro_telefone TEXT
)
```

**Uso:**
```typescript
const { data } = await supabase.rpc('generate_qr_tokens_for_viagem', {
  p_viagem_id: viagemId,
  p_created_by: userId
});
```

#### `validate_and_use_qr_token()`
Valida e marca token como usado, confirmando presença.

```sql
CREATE OR REPLACE FUNCTION validate_and_use_qr_token(
  p_token TEXT,
  p_confirmation_method TEXT DEFAULT 'qr_code',
  p_confirmed_by UUID DEFAULT NULL
) RETURNS JSON
```

**Uso:**
```typescript
const { data } = await supabase.rpc('validate_and_use_qr_token', {
  p_token: token,
  p_confirmation_method: 'qr_code',
  p_confirmed_by: userId
});
```

#### `get_qr_token_info()`
Busca informações completas de um token.

```sql
CREATE OR REPLACE FUNCTION get_qr_token_info(
  p_token TEXT
) RETURNS JSON
```

**Uso:**
```typescript
const { data } = await supabase.rpc('get_qr_token_info', {
  p_token: token
});
```

## 🔧 Serviços

### `qrCodeService.ts`

Serviço principal que gerencia toda a lógica de QR codes.

**Métodos principais:**

```typescript
class QRCodeService {
  // Gera QR codes para uma viagem
  async generateQRCodesForViagem(viagemId: string): Promise<QRCodeData[]>
  
  // Valida um token
  async validateToken(token: string): Promise<TokenValidationResult>
  
  // Confirma presença com token
  async confirmPresence(token: string, method: string): Promise<ConfirmationResult>
  
  // Busca QR codes existentes
  async getQRCodesForViagem(viagemId: string): Promise<QRCodeData[]>
  
  // Busca estatísticas
  async getQRCodeStats(viagemId: string)
  
  // Lista tokens ativos
  async getActiveTokens(viagemId: string)
  
  // Regenera token de um passageiro
  async regenerateToken(viagemId: string, passageiroId: string): Promise<QRCodeData | null>
}
```

**Interfaces:**

```typescript
interface QRCodeData {
  token: string;
  qrCodeBase64: string;
  passageiro: {
    nome: string;
    telefone: string;
  };
}

interface TokenValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
  data?: {
    passageiro: { /* ... */ };
    viagem: { /* ... */ };
    onibus?: { /* ... */ };
    token_info: { /* ... */ };
  };
}

interface ConfirmationResult {
  success: boolean;
  error?: string;
  message: string;
  data?: { /* ... */ };
}
```

## 🎨 Componentes

### `QRCodeSection.tsx`
Interface principal para admin gerenciar QR codes.

**Props:**
```typescript
interface QRCodeSectionProps {
  viagemId: string;
}
```

**Funcionalidades:**
- Gerar QR codes para todos os passageiros
- Enviar QR codes via WhatsApp
- Visualizar estatísticas
- Abrir scanner
- Listar QR codes gerados

### `QRScanner.tsx`
Scanner de câmera completo com validação.

**Props:**
```typescript
interface QRScannerProps {
  viagemId: string;
  onibusId?: string;
  onScanSuccess?: (result: ConfirmationResult) => void;
  onScanError?: (error: string) => void;
}
```

**Funcionalidades:**
- Acesso à câmera do dispositivo
- Detecção automática de QR codes
- Validação em tempo real
- Feedback visual e sonoro
- Histórico de scans

### `QRScannerSimple.tsx`
Versão simplificada do scanner.

**Props:**
```typescript
interface QRScannerSimpleProps {
  onScan: (token: string) => void;
  onError?: (error: string) => void;
}
```

## 📱 Páginas

### `MeuQRCode.tsx`
Página mobile para o cliente visualizar seu QR code.

**Rota:** `/meu-qrcode/:token`

**Funcionalidades:**
- Exibe QR code em tela cheia
- Mostra informações da viagem
- Mostra dados do passageiro
- Status de confirmação
- Auto-refresh do QR code

### `ScannerPresenca.tsx`
Página de scanner para admin/responsável.

**Rotas:** 
- `/dashboard/scanner/:viagemId`
- `/dashboard/scanner/:viagemId/onibus/:onibusId`

**Funcionalidades:**
- Scanner de câmera
- Validação de tokens
- Confirmação de presença
- Filtros por ônibus
- Estatísticas em tempo real

### `ScannerPresencaPublico.tsx`
Scanner público (sem autenticação).

**Rota:** `/scanner-publico/:viagemId`

**Funcionalidades:**
- Scanner básico
- Validação de tokens
- Sem necessidade de login

## 🔐 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado:

```sql
-- Exemplo: passageiro_qr_tokens
ALTER TABLE passageiro_qr_tokens ENABLE ROW LEVEL SECURITY;

-- Política de leitura
CREATE POLICY "Usuários podem ver tokens de suas viagens"
ON passageiro_qr_tokens FOR SELECT
USING (
  viagem_id IN (
    SELECT id FROM viagens 
    WHERE empresa_id = (SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid())
  )
);

-- Política de inserção
CREATE POLICY "Usuários podem criar tokens"
ON passageiro_qr_tokens FOR INSERT
WITH CHECK (
  viagem_id IN (
    SELECT id FROM viagens 
    WHERE empresa_id = (SELECT empresa_id FROM usuarios WHERE auth_id = auth.uid())
  )
);
```

### Validações

1. **Token único**: Cada token é único e não pode ser reutilizado
2. **Expiração**: Tokens expiram 24h após o evento
3. **Uso único**: Token é invalidado após primeira confirmação
4. **Permissões**: Apenas usuários autorizados podem gerar/validar
5. **Auditoria**: Todos os usos são registrados

## 🔄 Fluxo de Dados

### Geração de QR Codes

```
1. Admin clica "Gerar QR Codes"
   ↓
2. Frontend chama qrCodeService.generateQRCodesForViagem()
   ↓
3. Serviço chama função SQL generate_qr_tokens_for_viagem()
   ↓
4. SQL gera tokens únicos para cada passageiro
   ↓
5. Serviço gera imagens QR code (base64)
   ↓
6. QR codes salvos no banco (cache)
   ↓
7. Retorna array de QRCodeData
```

### Validação e Confirmação

```
1. Cliente mostra QR code na tela
   ↓
2. Admin escaneia com câmera
   ↓
3. Scanner detecta token
   ↓
4. Frontend chama qrCodeService.confirmPresence(token)
   ↓
5. Serviço chama função SQL validate_and_use_qr_token()
   ↓
6. SQL valida token (existe, não usado, não expirado)
   ↓
7. SQL marca token como usado
   ↓
8. SQL cria registro em passageiro_confirmacoes
   ↓
9. Retorna ConfirmationResult
   ↓
10. Frontend mostra feedback visual
```

## 📦 Dependências

### Principais
- `qrcode`: Geração de QR codes
- `@zxing/library`: Leitura de QR codes via câmera

### Peer Dependencies
- React 18+
- TypeScript 5+
- Supabase JS Client
- React Router DOM

## 🎯 Pontos de Integração

### 1. Supabase Client
```typescript
import { supabase } from '@/lib/supabase';
```

### 2. WhatsApp Service
```typescript
import { whatsappService } from '@/services/whatsappService';
```

### 3. Auth Context
```typescript
import { useAuth } from '@/contexts/AuthContext';
```

### 4. UI Components
```typescript
import { Button, Card, Dialog } from '@/components/ui';
```

## 📝 Notas de Implementação

1. **Tokens**: Gerados com `crypto.randomBytes(32).toString('hex')`
2. **QR Codes**: Formato base64 data URL
3. **Expiração**: Calculada como `data_jogo + 24 horas`
4. **Cache**: QR codes salvos no banco para performance
5. **Realtime**: Usa Supabase Realtime para atualizações

---

**Estrutura completa e documentada do sistema de QR Code!**
