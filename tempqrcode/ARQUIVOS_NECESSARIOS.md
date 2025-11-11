# 📦 ARQUIVOS NECESSÁRIOS - Sistema QR Code Completo

## 🎯 Visão Geral
Este documento lista TODOS os arquivos necessários para implementar o sistema completo de QR Code com confirmação de presença, scanner e lista de passageiros.

---

## 📁 ESTRUTURA DE ARQUIVOS

### 1️⃣ **SERVIÇOS** (`src/services/`)

#### `qrCodeService.ts` ✅
**Função:** Serviço principal para geração, validação e confirmação de QR codes
**Recursos:**
- Geração de QR codes em massa para viagem
- Validação de tokens
- Confirmação de presença via token
- Regeneração de tokens individuais
- Busca de estatísticas e tokens ativos
- Cache de QR codes no banco

**Dependências:**
```typescript
import QRCode from 'qrcode';
import { supabase } from '@/lib/supabase';
```

**Funções principais:**
- `generateQRCodesForViagem(viagemId)` - Gera QR codes para todos os passageiros
- `validateToken(token)` - Valida um token e retorna informações
- `confirmPresence(token, method)` - Confirma presença usando token
- `regenerateToken(viagemId, passageiroId)` - Regenera token específico
- `getQRCodeStats(viagemId)` - Busca estatísticas
- `getActiveTokens(viagemId)` - Lista tokens ativos
- `getQRCodesForViagem(viagemId)` - Busca QR codes existentes

---

### 2️⃣ **COMPONENTES** (`src/components/`)

#### `qr-scanner/QRScanner.tsx` ✅
**Função:** Componente de scanner de câmera para ler QR codes
**Recursos:**
- Acesso à câmera do dispositivo
- Detecção automática de QR codes
- Interface visual moderna com overlay
- Feedback visual de sucesso/erro
- Processamento em tempo real
- Suporte a câmera frontal e traseira

**Props:**
```typescript
interface QRScannerProps {
  viagemId: string;
  onibusId?: string; // Opcional - para restringir por ônibus
  onScanSuccess?: (result: ConfirmationResult) => void;
  onScanError?: (error: string) => void;
}
```

**Dependências:**
```typescript
import { BrowserQRCodeReader } from '@zxing/library';
import { qrCodeService } from '@/services/qrCodeService';
```

**Recursos visuais:**
- Área de foco com cantos animados
- Linha de escaneamento
- Overlay de resultado (sucesso/erro)
- Indicador de processamento
- Instruções de uso

---

#### `qr-code/QRCodeSection.tsx` ✅
**Função:** Seção de controle de QR codes na aba de presença (admin)
**Recursos:**
- Geração em massa de QR codes
- Envio automático via WhatsApp
- Visualização de QR codes gerados
- Regeneração individual
- Estatísticas de envio
- Preview de mensagens

**Localização:** Integrado na página de detalhes da viagem
**Acesso:** Apenas administradores

---

### 3️⃣ **PÁGINAS** (`src/pages/`)

#### `MeuQRCode.tsx` ✅
**Função:** Página mobile para o passageiro visualizar seu QR code
**Rota:** `/meu-qrcode/:token`
**Acesso:** Público (via link único)

**Recursos:**
- Exibição do QR code pessoal
- Informações da viagem
- Dados do passageiro
- Status da presença
- Download do QR code
- Compartilhamento
- Instruções de uso
- Validação de token expirado

**Layout:** Mobile-first, otimizado para celular

---

#### `ScannerPresenca.tsx` ✅
**Função:** Página de scanner para admin/responsável (autenticado)
**Rota:** `/dashboard/scanner/:viagemId/:onibusId?`
**Acesso:** Usuários autenticados

**Recursos:**
- Scanner de QR code integrado
- Estatísticas em tempo real
- Lista de confirmações recentes
- Filtro por ônibus (opcional)
- Informações da viagem
- Status de conexão

**Uso:** Admin ou responsável escaneia QR codes dos passageiros

---

#### `ScannerPresencaPublico.tsx` ✅
**Função:** Página de scanner público para responsáveis de ônibus
**Rota:** `/scanner-publico/:viagemId/:onibusId`
**Acesso:** Público (via link específico)

**Recursos:**
- Scanner de QR code
- Lista completa de passageiros do ônibus
- Confirmação manual (clique no passageiro)
- Filtros avançados:
  - Busca por nome/CPF/telefone
  - Status de presença
  - Cidade de embarque
  - Setor do Maracanã
  - Passeios
- Estatísticas detalhadas:
  - Total de passageiros
  - Presentes/Pendentes/Ausentes
  - Taxa de presença
  - Resumo financeiro
  - Resumo por setor
- Sincronização em tempo real
- Informações financeiras dos passageiros
- Histórico de pagamentos

**Diferencial:** Página mais completa, específica para responsáveis de ônibus

---

### 4️⃣ **BANCO DE DADOS** (`database/`)

#### `migrations/create-qr-code-system.sql` ✅
**Função:** Script SQL completo para criar toda a estrutura do sistema

**Tabelas criadas:**
- `passageiro_qr_tokens` - Armazena tokens e QR codes
- `viagem_confirmacao_stats` - View com estatísticas

**Funções SQL:**
- `generate_qr_tokens_for_viagem()` - Gera tokens para viagem
- `get_qr_token_info()` - Busca informações do token
- `validate_and_use_qr_token()` - Valida e usa token
- `update_qr_code_updated_at()` - Atualiza timestamp

**Triggers:**
- Atualização automática de `updated_at`

**Políticas RLS:**
- Segurança para acesso aos tokens
- Permissões por usuário autenticado

---

### 5️⃣ **ROTAS** (`src/App.tsx`)

#### Rotas a adicionar:
```typescript
// Página pública do QR code (passageiro)
<Route path="/meu-qrcode/:token" element={<MeuQRCode />} />

// Scanner autenticado (admin)
<Route path="/dashboard/scanner/:viagemId" element={<ScannerPresenca />} />
<Route path="/dashboard/scanner/:viagemId/onibus/:onibusId" element={<ScannerPresenca />} />

// Scanner público (responsável de ônibus)
<Route path="/scanner-publico/:viagemId/:onibusId" element={<ScannerPresencaPublico />} />
```

---

### 6️⃣ **INTEGRAÇÃO COM WHATSAPP**

#### `whatsappService.ts` (extensão) ✅
**Função:** Envio de QR codes via WhatsApp

**Funções adicionadas:**
- `enviarQRCodesWhatsApp()` - Envia QR codes em massa
- `enviarQRCodeReal()` - Envia QR code individual
- `enviarQRCodeZAPI()` - Envio via Z-API
- `enviarQRCodeEvolution()` - Envio via Evolution API

**Formato da mensagem:**
- Texto personalizado com instruções
- Imagem do QR code anexada
- Link direto para visualização
- Informações da viagem

---

### 7️⃣ **HOOKS E UTILITÁRIOS**

#### Hooks necessários:
- `useRealtime` - Sincronização em tempo real
- `useDebounce` - Debounce para busca
- `useTimePrincipal` - Configuração esportiva

#### Utilitários:
- `formatters.ts` - Formatação de CPF, telefone, etc.

---

## 📦 DEPENDÊNCIAS NPM

### Instalar:
```bash
npm install qrcode @zxing/library
npm install @types/qrcode --save-dev
```

### Dependências:
- `qrcode` - Geração de QR codes
- `@zxing/library` - Leitura de QR codes via câmera
- `date-fns` - Formatação de datas
- `sonner` - Notificações toast

---

## 🔄 FLUXO COMPLETO

### 1. **Geração de QR Codes**
```
Admin → Aba "Presença" → Gerar QR Codes
↓
qrCodeService.generateQRCodesForViagem()
↓
Tokens salvos no banco
↓
QR codes gerados e cacheados
```

### 2. **Envio via WhatsApp**
```
Admin → Enviar via WhatsApp
↓
whatsappService.enviarQRCodesWhatsApp()
↓
Para cada passageiro:
  - Gera mensagem personalizada
  - Anexa imagem do QR code
  - Envia via Z-API ou Evolution
```

### 3. **Passageiro Recebe**
```
WhatsApp → Link /meu-qrcode/:token
↓
MeuQRCode.tsx carrega
↓
qrCodeService.validateToken()
↓
Exibe QR code + informações
```

### 4. **Confirmação de Presença**

#### Opção A: Scanner (Responsável)
```
Responsável → /scanner-publico/:viagemId/:onibusId
↓
QRScanner.tsx ativa câmera
↓
Escaneia QR code do passageiro
↓
qrCodeService.confirmPresence()
↓
Presença confirmada ✅
```

#### Opção B: Manual (Responsável)
```
Responsável → Lista de passageiros
↓
Clica no passageiro
↓
handleMarcarPresenca()
↓
Atualiza banco de dados
↓
Presença confirmada ✅
```

---

## 🎨 COMPONENTES UI NECESSÁRIOS

### shadcn/ui components:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Badge`
- `Input`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`

### Ícones (lucide-react):
- `Camera`, `CameraOff`
- `QrCode`
- `Users`, `CheckCircle`, `XCircle`, `Clock`, `AlertCircle`
- `Download`, `Share2`, `ArrowLeft`
- `Filter`, `Search`, `MapPin`, `Ticket`, `TrendingUp`
- `RotateCcw`

---

## 🔐 SEGURANÇA

### Tokens:
- UUID único por passageiro
- Expiração automática (30 dias padrão)
- Uso único (marcado como usado após confirmação)
- Validação de viagem e ônibus

### Rotas:
- `/meu-qrcode/:token` - Pública (validação por token)
- `/dashboard/scanner/*` - Autenticada (requer login)
- `/scanner-publico/*` - Pública (link específico por ônibus)

### RLS (Row Level Security):
- Políticas no Supabase
- Acesso controlado por usuário
- Validação de permissões

---

## 📊 ESTATÍSTICAS E RELATÓRIOS

### Métricas disponíveis:
- Total de passageiros
- Presentes / Pendentes / Ausentes
- Taxa de presença (%)
- Confirmações por método (QR code vs Manual)
- Resumo financeiro
- Resumo por setor
- Resumo por cidade
- Histórico de confirmações

### Views do banco:
- `viagem_confirmacao_stats` - Estatísticas agregadas
- `passageiro_confirmacao_details` - Detalhes completos

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO

### Fase 1: Base
1. ✅ Criar tabela `passageiro_qr_tokens`
2. ✅ Criar funções SQL
3. ✅ Implementar `qrCodeService.ts`

### Fase 2: Geração
4. ✅ Criar componente `QRCodeSection.tsx`
5. ✅ Integrar na página de viagem
6. ✅ Testar geração de QR codes

### Fase 3: Visualização
7. ✅ Criar página `MeuQRCode.tsx`
8. ✅ Adicionar rota pública
9. ✅ Testar acesso via link

### Fase 4: Scanner
10. ✅ Criar componente `QRScanner.tsx`
11. ✅ Criar página `ScannerPresenca.tsx`
12. ✅ Criar página `ScannerPresencaPublico.tsx`
13. ✅ Testar confirmação via scanner

### Fase 5: WhatsApp
14. ✅ Estender `whatsappService.ts`
15. ✅ Implementar envio de imagens
16. ✅ Testar envio em massa

### Fase 6: Refinamento
17. ✅ Adicionar filtros avançados
18. ✅ Implementar realtime
19. ✅ Adicionar estatísticas
20. ✅ Testes finais

---

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Arquivos principais:
- [ ] `src/services/qrCodeService.ts`
- [ ] `src/components/qr-scanner/QRScanner.tsx`
- [ ] `src/components/qr-code/QRCodeSection.tsx`
- [ ] `src/pages/MeuQRCode.tsx`
- [ ] `src/pages/ScannerPresenca.tsx`
- [ ] `src/pages/ScannerPresencaPublico.tsx`
- [ ] `database/migrations/create-qr-code-system.sql`

### Integrações:
- [ ] Rotas no `App.tsx`
- [ ] Extensão do `whatsappService.ts`
- [ ] Aba "Presença" na página de viagem

### Testes:
- [ ] Geração de QR codes
- [ ] Validação de tokens
- [ ] Scanner de câmera
- [ ] Confirmação de presença
- [ ] Envio via WhatsApp
- [ ] Sincronização realtime

---

## 🎯 RESULTADO FINAL

### Para o Admin:
- Gera QR codes em massa
- Envia via WhatsApp automaticamente
- Visualiza estatísticas em tempo real
- Acessa scanner integrado

### Para o Passageiro:
- Recebe QR code via WhatsApp
- Visualiza em página mobile otimizada
- Baixa ou compartilha QR code
- Vê status da presença

### Para o Responsável:
- Acessa scanner público
- Confirma presença via QR code ou manual
- Visualiza lista completa do ônibus
- Filtra e busca passageiros
- Acompanha estatísticas em tempo real

---

## 📞 SUPORTE

Se tiver dúvidas sobre algum arquivo específico, consulte:
- `LEIA-ME-PRIMEIRO.md` - Visão geral
- `INSTALACAO.md` - Guia de instalação
- `ESTRUTURA.md` - Estrutura detalhada
- `EXEMPLOS.md` - Exemplos de código
