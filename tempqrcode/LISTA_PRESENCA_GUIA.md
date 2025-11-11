# 📋 GUIA - Sistema de Lista de Presença com Scanner

## 🎯 O que você precisa implementar

Sistema completo de lista de presença com:
- ✅ Scanner de QR Code via câmera
- ✅ Confirmação manual (clique no passageiro)
- ✅ Lista completa de passageiros por ônibus
- ✅ Filtros avançados (busca, status, cidade, setor)
- ✅ Estatísticas em tempo real
- ✅ Sincronização automática

---

## 📦 ARQUIVOS NECESSÁRIOS

### 1. **Hooks** (`src/hooks/`)

#### ✅ `useListaPresenca.ts`
Hook para gerenciar lista de presença geral da viagem
- Busca todos os passageiros da viagem
- Calcula estatísticas (total, presentes, ausentes, taxa)
- Retorna dados detalhados dos passageiros

#### ✅ `useListaPresencaOnibus.ts`
Hook para gerenciar lista de presença específica de um ônibus
- Busca passageiros de um ônibus específico
- Função `togglePresenca()` para marcar/desmarcar presença
- Calcula estatísticas financeiras
- Gerencia estado de carregamento

#### ✅ `useDebounce.ts`
Hook para debounce na busca (evita muitas requisições)

---

### 2. **Componente Scanner** (`src/components/qr-scanner/`)

#### ✅ `QRScanner.tsx`
Componente completo de scanner de QR Code
- Acessa câmera do dispositivo
- Detecta QR codes automaticamente
- Confirma presença via `qrCodeService.confirmPresence()`
- Feedback visual de sucesso/erro

**Props:**
```typescript
interface QRScannerProps {
  viagemId: string;
  onibusId?: string;
  onScanSuccess?: (result: ConfirmationResult) => void;
  onScanError?: (error: string) => void;
}
```

---

### 3. **Página Principal** (`src/pages/`)

#### ✅ `ScannerPresencaPublico.tsx`
Página completa para responsáveis de ônibus

**Recursos:**
- Scanner de QR Code integrado
- Lista completa de passageiros
- Confirmação manual (clique no passageiro)
- Filtros avançados:
  - Busca por nome/CPF/telefone
  - Status de presença
  - Cidade de embarque
  - Setor do Maracanã
  - Passeios
- Estatísticas detalhadas
- Sincronização em tempo real

**Rota:** `/scanner-publico/:viagemId/:onibusId`

---

### 4. **Serviços** (`src/services/`)

#### ✅ `qrCodeService.ts`
Serviço para gerenciar QR codes
- `confirmPresence(token, method)` - Confirma presença via token

---

### 5. **Utilitários** (`src/utils/`)

#### ✅ `formatters.ts`
Funções de formatação
- `formatCPF()` - Formata CPF
- `formatPhone()` - Formata telefone
- `formatCurrency()` - Formata valores

---

## 🔄 FLUXO DE CONFIRMAÇÃO DE PRESENÇA

### Opção 1: Via Scanner (QR Code)
```
1. Responsável acessa /scanner-publico/:viagemId/:onibusId
2. Clica em "Iniciar Scanner"
3. Aponta câmera para QR code do passageiro
4. QRScanner detecta automaticamente
5. Chama qrCodeService.confirmPresence(token)
6. Presença confirmada ✅
7. Lista atualiza automaticamente
```

### Opção 2: Via Clique Manual
```
1. Responsável vê lista de passageiros
2. Clica no card do passageiro
3. Chama handleMarcarPresenca()
4. Atualiza banco de dados
5. Presença confirmada ✅
6. Card muda de cor (verde)
```

---

## 💻 EXEMPLO DE IMPLEMENTAÇÃO

### Página de Lista de Presença

```typescript
import { useListaPresencaOnibus } from '@/hooks/useListaPresencaOnibus';
import { QRScanner } from '@/components/qr-scanner/QRScanner';

const ScannerPresencaPublico = () => {
  const { viagemId, onibusId } = useParams();
  
  const {
    viagem,
    onibus,
    passageiros,
    estatisticas,
    loading,
    togglePresenca
  } = useListaPresencaOnibus(viagemId, onibusId);

  const handleMarcarPresenca = async (passageiro) => {
    const novoStatus = passageiro.status_presenca === 'presente' 
      ? 'pendente' 
      : 'presente';
    
    await togglePresenca(passageiro.viagem_passageiro_id, novoStatus);
  };

  return (
    <div>
      {/* Scanner */}
      <QRScanner
        viagemId={viagemId}
        onibusId={onibusId}
        onScanSuccess={() => refetch()}
      />

      {/* Lista de Passageiros */}
      {passageiros.map(passageiro => (
        <Card 
          key={passageiro.id}
          onClick={() => handleMarcarPresenca(passageiro)}
          className={passageiro.status_presenca === 'presente' ? 'bg-green-50' : ''}
        >
          <CardContent>
            <p>{passageiro.nome}</p>
            <Badge>
              {passageiro.status_presenca === 'presente' ? '✅ Presente' : '⏳ Pendente'}
            </Badge>
          </CardContent>
        </Card>
      ))}

      {/* Estatísticas */}
      <div>
        <p>Total: {estatisticas.total}</p>
        <p>Presentes: {estatisticas.presentes}</p>
        <p>Taxa: {estatisticas.taxa_presenca}%</p>
      </div>
    </div>
  );
};
```

---

## 🎨 INTERFACE VISUAL

### Card de Passageiro

**Pendente:**
```
┌─────────────────────────────────┐
│ 👤 João Silva                   │
│ 📱 (11) 98765-4321             │
│ 📍 São Paulo - Setor Norte     │
│ ⏳ Pendente                     │
└─────────────────────────────────┘
```

**Presente:**
```
┌─────────────────────────────────┐
│ 👤 Maria Santos          ✅     │
│ 📱 (21) 99876-5432             │
│ 📍 Rio de Janeiro - Sul        │
│ ✅ Presente - 14:30            │
└─────────────────────────────────┘
```

### Scanner

```
┌─────────────────────────────────┐
│     📷 Scanner QR Code          │
│                                 │
│   ┌─────────────────────┐      │
│   │                     │      │
│   │   [QR CODE AREA]    │      │
│   │                     │      │
│   └─────────────────────┘      │
│                                 │
│  Posicione o QR Code aqui      │
│                                 │
│  [🚀 Iniciar Scanner]          │
└─────────────────────────────────┘
```

---

## 📊 ESTATÍSTICAS DISPONÍVEIS

### Presença
- Total de passageiros
- Presentes
- Pendentes
- Ausentes
- Taxa de presença (%)

### Financeiro
- Pagamentos completos
- Pendências financeiras
- Valor total pendente
- Cortesias (brindes)

### Por Setor
- Resumo por setor do Maracanã
- Taxa de presença por setor

---

## 🔍 FILTROS DISPONÍVEIS

### Busca
- Nome do passageiro
- CPF
- Telefone
- Cidade de embarque

### Status
- Todos
- Presentes
- Pendentes
- Ausentes

### Cidade
- Todas
- Lista dinâmica de cidades

### Setor
- Todos
- Lista dinâmica de setores

### Passeios
- Todos
- Com passeios
- Sem passeios
- Por passeio específico

---

## 🚀 COMO USAR

### 1. Instalar dependências
```bash
npm install qrcode @zxing/library
```

### 2. Copiar arquivos
- ✅ `src/hooks/useListaPresenca.ts`
- ✅ `src/hooks/useListaPresencaOnibus.ts`
- ✅ `src/hooks/useDebounce.ts`
- ✅ `src/components/qr-scanner/QRScanner.tsx`
- ✅ `src/pages/ScannerPresencaPublico.tsx`
- ✅ `src/services/qrCodeService.ts`
- ✅ `src/utils/formatters.ts`

### 3. Adicionar rota
```typescript
// App.tsx
<Route 
  path="/scanner-publico/:viagemId/:onibusId" 
  element={<ScannerPresencaPublico />} 
/>
```

### 4. Testar
1. Acesse `/scanner-publico/{viagemId}/{onibusId}`
2. Veja a lista de passageiros
3. Clique em um passageiro para marcar presença
4. Ou use o scanner para ler QR codes

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Arquivos
- [ ] `useListaPresenca.ts` copiado
- [ ] `useListaPresencaOnibus.ts` copiado
- [ ] `useDebounce.ts` copiado
- [ ] `QRScanner.tsx` copiado
- [ ] `ScannerPresencaPublico.tsx` copiado
- [ ] `qrCodeService.ts` copiado
- [ ] `formatters.ts` copiado

### Configuração
- [ ] Dependências instaladas
- [ ] Rota adicionada no App.tsx
- [ ] Banco de dados configurado

### Testes
- [ ] Lista de passageiros carrega
- [ ] Clique manual funciona
- [ ] Scanner detecta QR codes
- [ ] Estatísticas atualizam
- [ ] Filtros funcionam

---

## 🎯 RESULTADO FINAL

Você terá uma página completa onde o responsável do ônibus pode:

1. **Ver todos os passageiros** do ônibus dele
2. **Marcar presença manualmente** clicando no passageiro
3. **Escanear QR codes** dos passageiros via câmera
4. **Filtrar e buscar** passageiros facilmente
5. **Acompanhar estatísticas** em tempo real
6. **Ver informações financeiras** de cada passageiro

Tudo sincronizado automaticamente! 🚀

---

## 📞 DÚVIDAS?

Consulte os arquivos na pasta `tempqrcode/`:
- `LEIA-ME-PRIMEIRO.md` - Visão geral completa
- `ARQUIVOS_NECESSARIOS.md` - Lista detalhada de arquivos
- `EXEMPLOS.md` - Exemplos de código
