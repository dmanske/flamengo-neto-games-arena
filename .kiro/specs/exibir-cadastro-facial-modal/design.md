# Design Document

## Visão Geral

Adicionar o status do cadastro facial no modal de detalhes dos ingressos, **exatamente igual** ao que já funciona na lista de passageiros dos ônibus. Implementação simples reutilizando componentes existentes.

## Arquitetura

### Componentes Necessários
- **IngressoCard** - Adicionar status abaixo do CPF
- **StatusCadastroFacial** - Componente já existente (reutilizar)
- **useCadastroFacial** - Hook já existente (reutilizar)

## Implementação

### Modificações no IngressoCard

**Arquivo:** `src/components/ingressos/IngressoCard.tsx`

**1. Adicionar imports:**
```tsx
import { useCadastroFacial } from '@/hooks/useCadastroFacial';
import { StatusCadastroFacial } from '@/components/ui/StatusCadastroFacial';
```

**2. Adicionar hook:**
```tsx
const { 
  cadastroFacialData, 
  loading: loadingCadastroFacial, 
  toggleCadastroFacial 
} = useCadastroFacial(
  ingresso.cliente?.id ? [ingresso.cliente.id] : []
);
```

**3. Adicionar componente abaixo do CPF:**
```tsx
{ingresso.cliente.cpf && (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">CPF:</span>
      <span className="font-mono">{formatCPF(ingresso.cliente.cpf)}</span>
    </div>
    <StatusCadastroFacial 
      clienteId={ingresso.cliente.id}
      cadastroFacialData={cadastroFacialData}
      loading={loadingCadastroFacial}
      onClick={toggleCadastroFacial}
    />
  </div>
)}
```

## Resultado Final

Após a implementação, o modal de ingressos terá:

```
[Foto] João da Silva
       Cliente

CPF: 123.456.789-00
✓ Facial OK  (clicável para alterar)

📞 (47) 99999-9999
```

**Simples assim!** 🎯 Igual ao que já funciona na lista de ônibus.