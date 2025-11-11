# 🔗 Como Integrar o QR Code na Página de Detalhes da Viagem

## 📍 Onde Adicionar

Você precisa adicionar o componente `QRCodeSection` na página **DetalhesViagem**.

---

## 📝 Código para Adicionar

### 1. Importar o Componente

No início do arquivo `src/pages/DetalhesViagem.tsx`, adicione:

```typescript
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
```

### 2. Adicionar o Componente na Interface

Dentro do JSX da página, adicione o componente onde você quiser que apareça.

**Sugestão 1: Como uma nova aba**

Se você já tem abas (Tabs) na página, adicione uma nova aba:

```tsx
<TabsList>
  <TabsTrigger value="info">Informações</TabsTrigger>
  <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
  <TabsTrigger value="qrcodes">QR Codes</TabsTrigger> {/* NOVA ABA */}
  <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
</TabsList>

{/* ... outras abas ... */}

<TabsContent value="qrcodes">
  <QRCodeSection 
    viagemId={viagemId}
    viagem={viagem}
    passageiros={passageiros}
    onUpdatePassageiros={loadPassageiros}
  />
</TabsContent>
```

**Sugestão 2: Como uma seção separada**

Se você não tem abas, adicione como uma seção:

```tsx
{/* Suas outras seções */}

{/* Seção de QR Codes */}
<div className="mt-6">
  <QRCodeSection 
    viagemId={viagemId}
    viagem={viagem}
    passageiros={passageiros}
    onUpdatePassageiros={loadPassageiros}
  />
</div>
```

---

## 🎯 Props Necessárias

O componente `QRCodeSection` precisa de 4 props:

```typescript
interface QRCodeSectionProps {
  viagemId: string;           // ID da viagem
  viagem: any;                // Objeto da viagem (com adversario, data_jogo, etc)
  passageiros: any[];         // Array de passageiros da viagem
  onUpdatePassageiros: () => void;  // Função para recarregar passageiros
}
```

### Exemplo de Uso:

```tsx
<QRCodeSection 
  viagemId={viagemId}                    // ID da viagem atual
  viagem={viagem}                        // Dados da viagem
  passageiros={passageiros}              // Lista de passageiros
  onUpdatePassageiros={loadPassageiros}  // Função que recarrega passageiros
/>
```

---

## 📋 Checklist de Integração

- [ ] Importar o componente `QRCodeSection`
- [ ] Adicionar o componente na página (aba ou seção)
- [ ] Passar as 4 props necessárias
- [ ] Verificar se `viagemId`, `viagem` e `passageiros` estão disponíveis
- [ ] Verificar se `onUpdatePassageiros` é uma função válida
- [ ] Testar a página

---

## 🎨 Exemplo Completo

```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRCodeSection } from '@/components/qr-code/QRCodeSection';
import { supabase } from '@/lib/supabase';

export default function DetalhesViagem() {
  const { id: viagemId } = useParams();
  const [viagem, setViagem] = useState<any>(null);
  const [passageiros, setPassageiros] = useState<any[]>([]);

  useEffect(() => {
    loadViagem();
    loadPassageiros();
  }, [viagemId]);

  const loadViagem = async () => {
    const { data } = await supabase
      .from('viagens')
      .select('*')
      .eq('id', viagemId)
      .single();
    
    setViagem(data);
  };

  const loadPassageiros = async () => {
    const { data } = await supabase
      .from('viagem_passageiros')
      .select(`
        *,
        clientes (nome, telefone, cpf)
      `)
      .eq('viagem_id', viagemId);
    
    setPassageiros(data || []);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Detalhes da Viagem</h1>
      
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
          <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          {/* Conteúdo de informações */}
        </TabsContent>

        <TabsContent value="passageiros">
          {/* Lista de passageiros */}
        </TabsContent>

        <TabsContent value="qrcodes">
          {viagemId && viagem && (
            <QRCodeSection 
              viagemId={viagemId}
              viagem={viagem}
              passageiros={passageiros}
              onUpdatePassageiros={loadPassageiros}
            />
          )}
        </TabsContent>

        <TabsContent value="financeiro">
          {/* Informações financeiras */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## ⚠️ Importante

1. **Certifique-se** de que `viagemId` está disponível (via `useParams` ou props)
2. **Certifique-se** de que `viagem` tem os campos: `adversario`, `data_jogo`, `local`
3. **Certifique-se** de que `passageiros` é um array (pode ser vazio)
4. **Certifique-se** de que `onUpdatePassageiros` é uma função que recarrega os passageiros

---

## 🎉 Pronto!

Depois de adicionar o componente, você verá:
- ✅ Uma nova aba "QR Codes" (ou seção)
- ✅ Botões para gerar, enviar, baixar e deletar QR codes
- ✅ Scanner de câmera integrado
- ✅ Lista de todos os QR codes gerados

---

**Dica:** Se você não sabe onde adicionar exatamente, me mostre o código da sua página `DetalhesViagem.tsx` que eu te ajudo! 😊
