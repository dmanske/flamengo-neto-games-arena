# 📍 Onde Adicionar o Sistema de QR Code

## 🎯 Arquivo: `src/pages/DetalhesViagem.tsx`

---

## PASSO 1: Adicionar Import (Linha ~35)

Procure pelos imports no topo do arquivo e adicione:

```typescript
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
```

**Onde adicionar:** Logo após os outros imports de componentes, por exemplo, depois de:
```typescript
import { WhatsAppMassaModal } from "@/components/whatsapp-massa/WhatsAppMassaModal";
```

---

## PASSO 2: Adicionar Nova Aba (Linha ~376)

### Encontre esta seção:
```typescript
<TabsList className="grid w-full grid-cols-3 mb-6">
  <TabsTrigger value="passageiros" className="flex items-center gap-2">
    <Users className="h-4 w-4" />
    Passageiros
  </TabsTrigger>
  <TabsTrigger value="financeiro" className="flex items-center gap-2">
    <DollarSign className="h-4 w-4" />
    Financeiro
  </TabsTrigger>
  <TabsTrigger value="presenca" className="flex items-center gap-2">
    <UserCheck className="h-4 w-4" />
    Presença
  </TabsTrigger>
</TabsList>
```

### ALTERE PARA (adicione a 4ª aba):

```typescript
<TabsList className="grid w-full grid-cols-4 mb-6">  {/* MUDOU: grid-cols-3 → grid-cols-4 */}
  <TabsTrigger value="passageiros" className="flex items-center gap-2">
    <Users className="h-4 w-4" />
    Passageiros
  </TabsTrigger>
  <TabsTrigger value="financeiro" className="flex items-center gap-2">
    <DollarSign className="h-4 w-4" />
    Financeiro
  </TabsTrigger>
  <TabsTrigger value="presenca" className="flex items-center gap-2">
    <UserCheck className="h-4 w-4" />
    Presença
  </TabsTrigger>
  <TabsTrigger value="qrcodes" className="flex items-center gap-2">  {/* NOVA ABA */}
    <QrCode className="h-4 w-4" />
    QR Codes
  </TabsTrigger>
</TabsList>
```

**IMPORTANTE:** Não esqueça de importar o ícone QrCode no topo:
```typescript
import { Users, DollarSign, UserCheck, UserX, TrendingUp, AlertCircle, QrCode } from "lucide-react";
```

---

## PASSO 3: Adicionar Conteúdo da Aba

### Encontre o final das outras abas (procure por `</TabsContent>` da aba "presenca")

### Adicione DEPOIS da última aba:

```typescript
        <TabsContent value="qrcodes" className="space-y-6">
          <QRCodeSection 
            viagemId={id || ''}
            viagem={viagem}
            passageiros={originalPassageiros}
            onUpdatePassageiros={() => fetchPassageiros(id || '')}
          />
        </TabsContent>
```

---

## 📋 RESUMO DAS MUDANÇAS

### 1. Import (linha ~35):
```typescript
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
```

### 2. Import do ícone (linha ~3):
```typescript
import { Users, DollarSign, UserCheck, UserX, TrendingUp, AlertCircle, QrCode } from "lucide-react";
```

### 3. TabsList (linha ~376):
```typescript
// ANTES:
<TabsList className="grid w-full grid-cols-3 mb-6">

// DEPOIS:
<TabsList className="grid w-full grid-cols-4 mb-6">
```

### 4. Nova aba (linha ~389):
```typescript
<TabsTrigger value="qrcodes" className="flex items-center gap-2">
  <QrCode className="h-4 w-4" />
  QR Codes
</TabsTrigger>
```

### 5. Conteúdo da aba (depois da última aba):
```typescript
<TabsContent value="qrcodes" className="space-y-6">
  <QRCodeSection 
    viagemId={id || ''}
    viagem={viagem}
    passageiros={originalPassageiros}
    onUpdatePassageiros={() => fetchPassageiros(id || '')}
  />
</TabsContent>
```

---

## ✅ CÓDIGO COMPLETO PARA COPIAR E COLAR

### No topo do arquivo (com os outros imports):
```typescript
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
```

### Alterar linha dos ícones:
```typescript
import { Users, DollarSign, UserCheck, UserX, TrendingUp, AlertCircle, QrCode } from "lucide-react";
```

### Alterar TabsList:
```typescript
<TabsList className="grid w-full grid-cols-4 mb-6">
  <TabsTrigger value="passageiros" className="flex items-center gap-2">
    <Users className="h-4 w-4" />
    Passageiros
  </TabsTrigger>
  <TabsTrigger value="financeiro" className="flex items-center gap-2">
    <DollarSign className="h-4 w-4" />
    Financeiro
  </TabsTrigger>
  <TabsTrigger value="presenca" className="flex items-center gap-2">
    <UserCheck className="h-4 w-4" />
    Presença
  </TabsTrigger>
  <TabsTrigger value="qrcodes" className="flex items-center gap-2">
    <QrCode className="h-4 w-4" />
    QR Codes
  </TabsTrigger>
</TabsList>
```

### Adicionar depois da última aba (procure o último `</TabsContent>`):
```typescript
<TabsContent value="qrcodes" className="space-y-6">
  <QRCodeSection 
    viagemId={id || ''}
    viagem={viagem}
    passageiros={originalPassageiros}
    onUpdatePassageiros={() => fetchPassageiros(id || '')}
  />
</TabsContent>
```

---

## 🎯 COMO ENCONTRAR OS LUGARES CERTOS

### Para encontrar onde adicionar o import:
1. Abra `src/pages/DetalhesViagem.tsx`
2. Procure por: `import { WhatsAppMassaModal }`
3. Adicione a linha do import logo abaixo

### Para encontrar onde adicionar a aba:
1. Procure por: `<TabsList className="grid w-full grid-cols-3`
2. Mude `grid-cols-3` para `grid-cols-4`
3. Adicione a nova aba antes de `</TabsList>`

### Para encontrar onde adicionar o conteúdo:
1. Procure por: `<TabsContent value="presenca"`
2. Role até encontrar o `</TabsContent>` correspondente
3. Adicione o novo `<TabsContent value="qrcodes">` logo depois

---

## 🐛 SE DER ERRO

### Erro: "QRCodeSection is not defined"
**Solução:** Você esqueceu de adicionar o import no topo do arquivo

### Erro: "QrCode is not defined"
**Solução:** Você esqueceu de adicionar `QrCode` na linha de import dos ícones do lucide-react

### Erro: "viagem is undefined"
**Solução:** Certifique-se de que está passando `viagem={viagem}` corretamente

### Erro: "fetchPassageiros is not a function"
**Solução:** Verifique se a função `fetchPassageiros` existe no componente

---

## ✅ PRONTO!

Depois de fazer essas mudanças:
1. Salve o arquivo
2. O servidor vai recarregar automaticamente
3. Acesse uma viagem
4. Você verá a nova aba "QR Codes"! 🎉

---

**Dica:** Se você tiver dúvidas, me mostre o código da sua página DetalhesViagem que eu te ajudo! 😊
