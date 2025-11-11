# 💡 Exemplos de Uso

Este arquivo contém exemplos práticos de como usar o sistema de QR Code.

## 📋 Índice

1. [Uso Básico](#uso-básico)
2. [Integração com Interface Admin](#integração-com-interface-admin)
3. [Customização](#customização)
4. [Casos de Uso Avançados](#casos-de-uso-avançados)
5. [Integração com WhatsApp](#integração-com-whatsapp)

## Uso Básico

### 1. Gerar QR Codes

```typescript
import { qrCodeService } from '@/services/qrCodeService';

async function gerarQRCodes(viagemId: string) {
  try {
    const qrCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
    
    console.log(`✅ ${qrCodes.length} QR codes gerados!`);
    
    // qrCodes é um array de:
    // {
    //   token: string,
    //   qrCodeBase64: string,
    //   passageiro: { nome: string, telefone: string }
    // }
    
    return qrCodes;
  } catch (error) {
    console.error('❌ Erro ao gerar QR codes:', error);
    throw error;
  }
}
```

### 2. Validar Token

```typescript
import { qrCodeService } from '@/services/qrCodeService';

async function validarToken(token: string) {
  try {
    const result = await qrCodeService.validateToken(token);
    
    if (result.valid) {
      console.log('✅ Token válido!');
      console.log('Passageiro:', result.data?.passageiro.nome);
      console.log('Viagem:', result.data?.viagem.adversario);
    } else {
      console.log('❌ Token inválido:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao validar token:', error);
    throw error;
  }
}
```

### 3. Confirmar Presença

```typescript
import { qrCodeService } from '@/services/qrCodeService';

async function confirmarPresenca(token: string) {
  try {
    const result = await qrCodeService.confirmPresence(token, 'qr_code');
    
    if (result.success) {
      console.log('✅ Presença confirmada!');
      console.log('Passageiro:', result.data?.passageiro.nome);
      console.log('Confirmado em:', result.data?.confirmed_at);
    } else {
      console.log('❌ Erro:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Erro ao confirmar presença:', error);
    throw error;
  }
}
```

## Integração com Interface Admin

### Exemplo 1: Componente de Detalhes da Viagem

```tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import QRCodeSection from '@/components/qr-code/QRCodeSection';

export default function DetalhesViagem() {
  const { viagemId } = useParams();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalhes da Viagem</h1>
      
      {/* Suas outras seções */}
      <div className="mb-6">
        {/* Informações da viagem */}
      </div>
      
      {/* Seção de QR Code */}
      <QRCodeSection viagemId={viagemId!} />
      
      {/* Outras seções */}
    </div>
  );
}
```

### Exemplo 2: Aba de Presença

```tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QRCodeSection from '@/components/qr-code/QRCodeSection';

export default function ViagemTabs({ viagemId }: { viagemId: string }) {
  return (
    <Tabs defaultValue="info">
      <TabsList>
        <TabsTrigger value="info">Informações</TabsTrigger>
        <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
        <TabsTrigger value="presenca">Presença</TabsTrigger>
        <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info">
        {/* Conteúdo de informações */}
      </TabsContent>
      
      <TabsContent value="passageiros">
        {/* Lista de passageiros */}
      </TabsContent>
      
      <TabsContent value="presenca">
        <QRCodeSection viagemId={viagemId} />
      </TabsContent>
      
      <TabsContent value="financeiro">
        {/* Informações financeiras */}
      </TabsContent>
    </Tabs>
  );
}
```

### Exemplo 3: Modal de QR Code

```tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCodeSection from '@/components/qr-code/QRCodeSection';

export default function QRCodeModal({ viagemId }: { viagemId: string }) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        Gerenciar QR Codes
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>QR Codes da Viagem</DialogTitle>
          </DialogHeader>
          
          <QRCodeSection viagemId={viagemId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Customização

### Exemplo 1: QR Code Personalizado

```typescript
import QRCode from 'qrcode';

async function gerarQRCodePersonalizado(token: string) {
  const qrCodeBase64 = await QRCode.toDataURL(token, {
    width: 600,              // Tamanho maior
    margin: 4,               // Margem maior
    color: {
      dark: '#E31937',       // Vermelho (cor do time)
      light: '#FFFFFF'       // Branco
    },
    errorCorrectionLevel: 'H' // Alta correção de erros
  });
  
  return qrCodeBase64;
}
```

### Exemplo 2: Scanner com Callback Customizado

```tsx
import React from 'react';
import QRScanner from '@/components/qr-scanner/QRScanner';
import { toast } from 'sonner';

export default function ScannerCustomizado({ viagemId }: { viagemId: string }) {
  const handleScanSuccess = (result: any) => {
    toast.success(`✅ ${result.data?.passageiro.nome} confirmado!`);
    
    // Sua lógica customizada
    console.log('Confirmação:', result);
    
    // Atualizar lista, enviar notificação, etc.
  };
  
  const handleScanError = (error: string) => {
    toast.error(`❌ ${error}`);
  };
  
  return (
    <QRScanner
      viagemId={viagemId}
      onScanSuccess={handleScanSuccess}
      onScanError={handleScanError}
    />
  );
}
```

### Exemplo 3: Página do Cliente Customizada

```tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { qrCodeService } from '@/services/qrCodeService';

export default function MeuQRCodeCustomizado() {
  const { token } = useParams();
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadQRCode() {
      try {
        const result = await qrCodeService.validateToken(token!);
        setQrData(result);
      } catch (error) {
        console.error('Erro ao carregar QR code:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadQRCode();
  }, [token]);
  
  if (loading) return <div>Carregando...</div>;
  if (!qrData?.valid) return <div>QR Code inválido</div>;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 to-black p-6">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-xl p-6">
        {/* Logo do time */}
        <img 
          src={qrData.data?.viagem.logo_flamengo} 
          alt="Logo" 
          className="w-24 h-24 mx-auto mb-4"
        />
        
        {/* Informações */}
        <h1 className="text-2xl font-bold text-center mb-2">
          {qrData.data?.passageiro.nome}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {qrData.data?.viagem.adversario}
        </p>
        
        {/* QR Code */}
        <div className="bg-white p-4 rounded-lg border-4 border-red-600">
          <img 
            src={qrData.data?.qr_code_base64} 
            alt="QR Code" 
            className="w-full"
          />
        </div>
        
        {/* Instruções */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Mostre este QR Code na entrada do ônibus</p>
        </div>
      </div>
    </div>
  );
}
```

## Casos de Uso Avançados

### Exemplo 1: Geração em Lote com Progresso

```tsx
import React, { useState } from 'react';
import { qrCodeService } from '@/services/qrCodeService';
import { Progress } from '@/components/ui/progress';

export default function GeracaoEmLote({ viagemIds }: { viagemIds: string[] }) {
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  
  async function gerarTodos() {
    setGenerating(true);
    setProgress(0);
    
    for (let i = 0; i < viagemIds.length; i++) {
      try {
        await qrCodeService.generateQRCodesForViagem(viagemIds[i]);
        setProgress(((i + 1) / viagemIds.length) * 100);
      } catch (error) {
        console.error(`Erro na viagem ${viagemIds[i]}:`, error);
      }
    }
    
    setGenerating(false);
  }
  
  return (
    <div>
      <button onClick={gerarTodos} disabled={generating}>
        Gerar QR Codes para {viagemIds.length} viagens
      </button>
      
      {generating && (
        <div className="mt-4">
          <Progress value={progress} />
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(progress)}% concluído
          </p>
        </div>
      )}
    </div>
  );
}
```

### Exemplo 2: Scanner com Filtro por Ônibus

```tsx
import React, { useState } from 'react';
import QRScanner from '@/components/qr-scanner/QRScanner';
import { Select } from '@/components/ui/select';

export default function ScannerPorOnibus({ viagemId, onibuses }: any) {
  const [onibusId, setOnibusId] = useState<string | null>(null);
  
  return (
    <div>
      <Select value={onibusId} onValueChange={setOnibusId}>
        <option value="">Todos os ônibus</option>
        {onibuses.map((onibus: any) => (
          <option key={onibus.id} value={onibus.id}>
            {onibus.numero_identificacao}
          </option>
        ))}
      </Select>
      
      <QRScanner
        viagemId={viagemId}
        onibusId={onibusId || undefined}
      />
    </div>
  );
}
```

### Exemplo 3: Estatísticas em Tempo Real

```tsx
import React, { useEffect, useState } from 'react';
import { qrCodeService } from '@/services/qrCodeService';
import { supabase } from '@/lib/supabase';

export default function EstatisticasTempoReal({ viagemId }: { viagemId: string }) {
  const [stats, setStats] = useState<any>(null);
  
  useEffect(() => {
    // Carregar estatísticas iniciais
    loadStats();
    
    // Subscrever a mudanças em tempo real
    const subscription = supabase
      .channel('confirmacoes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'passageiro_confirmacoes',
          filter: `viagem_id=eq.${viagemId}`
        },
        () => {
          loadStats(); // Recarregar quando houver mudanças
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [viagemId]);
  
  async function loadStats() {
    const data = await qrCodeService.getQRCodeStats(viagemId);
    setStats(data);
  }
  
  if (!stats) return <div>Carregando...</div>;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Total</p>
        <p className="text-3xl font-bold">{stats.total_passageiros}</p>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Confirmados</p>
        <p className="text-3xl font-bold text-green-600">
          {stats.confirmados}
        </p>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">Via QR Code</p>
        <p className="text-3xl font-bold text-blue-600">
          {stats.confirmados_qr}
        </p>
      </div>
    </div>
  );
}
```

## Integração com WhatsApp

### Exemplo 1: Envio Simples

```typescript
import { whatsappService } from '@/services/whatsappService';
import { qrCodeService } from '@/services/qrCodeService';

async function enviarQRCodesWhatsApp(viagemId: string) {
  try {
    // Gerar QR codes
    const qrCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
    
    // Enviar para cada passageiro
    for (const qrCode of qrCodes) {
      const mensagem = `
Olá ${qrCode.passageiro.nome}! 👋

Seu QR Code para a viagem está pronto! 🎫

Acesse o link abaixo para visualizar:
${window.location.origin}/meu-qrcode/${qrCode.token}

⚠️ Importante:
- Mostre este QR Code na entrada do ônibus
- Mantenha seu celular carregado
- Chegue com antecedência

Nos vemos lá! 🔴⚫
      `.trim();
      
      await whatsappService.sendMessage(
        qrCode.passageiro.telefone,
        mensagem
      );
    }
    
    console.log(`✅ ${qrCodes.length} mensagens enviadas!`);
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    throw error;
  }
}
```

### Exemplo 2: Envio com Imagem

```typescript
async function enviarQRCodeComImagem(viagemId: string) {
  const qrCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
  
  for (const qrCode of qrCodes) {
    // Enviar imagem do QR code
    await whatsappService.sendImage(
      qrCode.passageiro.telefone,
      qrCode.qrCodeBase64,
      `QR Code - ${qrCode.passageiro.nome}`
    );
    
    // Enviar mensagem com link
    const link = `${window.location.origin}/meu-qrcode/${qrCode.token}`;
    await whatsappService.sendMessage(
      qrCode.passageiro.telefone,
      `Acesse também pelo link: ${link}`
    );
  }
}
```

### Exemplo 3: Envio com Template

```typescript
async function enviarComTemplate(viagemId: string, templateId: string) {
  const qrCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
  
  for (const qrCode of qrCodes) {
    await whatsappService.sendTemplate(
      qrCode.passageiro.telefone,
      templateId,
      {
        nome: qrCode.passageiro.nome,
        link: `${window.location.origin}/meu-qrcode/${qrCode.token}`,
        qrcode_image: qrCode.qrCodeBase64
      }
    );
  }
}
```

## Dicas e Boas Práticas

### 1. Tratamento de Erros

```typescript
async function gerarComTratamento(viagemId: string) {
  try {
    const qrCodes = await qrCodeService.generateQRCodesForViagem(viagemId);
    return { success: true, data: qrCodes };
  } catch (error: any) {
    console.error('Erro:', error);
    
    if (error.message.includes('Nenhum passageiro')) {
      return { success: false, error: 'NO_PASSENGERS' };
    }
    
    if (error.message.includes('Permission denied')) {
      return { success: false, error: 'NO_PERMISSION' };
    }
    
    return { success: false, error: 'UNKNOWN_ERROR' };
  }
}
```

### 2. Loading States

```tsx
function ComponenteComLoading() {
  const [loading, setLoading] = useState(false);
  
  async function gerar() {
    setLoading(true);
    try {
      await qrCodeService.generateQRCodesForViagem(viagemId);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <button onClick={gerar} disabled={loading}>
      {loading ? 'Gerando...' : 'Gerar QR Codes'}
    </button>
  );
}
```

### 3. Cache e Performance

```typescript
// Cache em memória
const qrCodeCache = new Map<string, any>();

async function getQRCodesComCache(viagemId: string) {
  if (qrCodeCache.has(viagemId)) {
    return qrCodeCache.get(viagemId);
  }
  
  const qrCodes = await qrCodeService.getQRCodesForViagem(viagemId);
  qrCodeCache.set(viagemId, qrCodes);
  
  return qrCodes;
}
```

---

**Mais exemplos e casos de uso na documentação completa!**
