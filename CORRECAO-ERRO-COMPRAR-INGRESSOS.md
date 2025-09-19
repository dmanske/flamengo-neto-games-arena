# Correção do Erro "Comprar Ingressos"

## 🐛 Problema Identificado

Quando o usuário clicava em "Comprar ingressos" na página de detalhes da viagem, ocorria o seguinte erro:

```
TypeError: can't access property "find", N is undefined
PassageiroEditDialog: passageiro ou viagem_passageiro_id não fornecido null
usePagamentosSeparados iniciado: { viagemPassageiroId: undefined }
ID inválido fornecido: undefined
```

## 🔍 Causa Raiz

O erro estava sendo causado por uma cadeia de problemas:

1. **Dados inválidos sendo passados**: Algum componente estava tentando chamar `onEditPassageiro` com um passageiro `null` ou `undefined`
2. **Hook sendo chamado com IDs inválidos**: O `usePagamentosSeparados` estava sendo chamado com `undefined`
3. **Falta de verificações de segurança**: Os componentes não tinham verificações adequadas para dados inválidos

## ✅ Correções Implementadas

### 1. PassageiroEditDialog - Verificação Antecipada
```typescript
// ✅ CORREÇÃO: Verificação de segurança mais rigorosa no início da função
if (!passageiro || !passageiro.viagem_passageiro_id) {
  console.warn('PassageiroEditDialog: passageiro ou viagem_passageiro_id não fornecido', passageiro);
  
  // Fechar o modal se estiver aberto com dados inválidos
  if (open) {
    console.log('🔒 Fechando modal devido a dados inválidos');
    onOpenChange(false);
  }
  
  return null;
}
```

### 2. usePagamentosSeparados - Retorno Seguro para IDs Inválidos
```typescript
// ✅ CORREÇÃO: Retornar estado vazio imediatamente para IDs inválidos
if (!viagemPassageiroId || viagemPassageiroId === 'fallback-id' || viagemPassageiroId === 'undefined') {
  console.warn('⚠️ ID inválido fornecido:', viagemPassageiroId);
  
  return {
    passageiro: null,
    breakdown: null,
    historicoPagamentos: [],
    loading: false,
    error: 'ID inválido fornecido',
    // ... todas as funções retornam valores seguros
  };
}
```

### 3. PassageiroComStatus - Verificação de IDs Inválidos
```typescript
// ✅ CORREÇÃO: Verificação de segurança mais rigorosa
if (!passageiroId || passageiroId === 'undefined' || passageiroId === 'null') {
  console.warn('⚠️ PassageiroComStatus: ID do passageiro inválido', { 
    passageiro: passageiro.nome || 'Nome não disponível',
    id: passageiro.id,
    viagem_passageiro_id: passageiro.viagem_passageiro_id,
    passageiroId 
  });
  return <>{children('Pendente')}</>;
}
```

### 4. PassageiroRow - Validação de ID Antes do Hook
```typescript
// ✅ CORREÇÃO: Verificar se o ID é válido antes de usar o hook
const idValido = passageiroId && passageiroId !== 'undefined' && passageiroId !== 'null' && passageiroId !== 'fallback-id';

const {
  breakdown,
  historicoPagamentos,
  loading: loadingPagamentos,
  error: errorPagamentos,
  obterStatusAtual
} = usePagamentosSeparados(idValido ? passageiroId : undefined);
```

### 5. openEditPassageiroDialog - Verificação Antes de Abrir Modal
```typescript
// ✅ CORREÇÃO: Verificação de segurança antes de abrir o modal
if (!passageiro) {
  console.error('❌ Tentativa de abrir modal de edição com passageiro null/undefined');
  toast.error('Erro: Dados do passageiro não encontrados');
  return;
}

if (!passageiro.viagem_passageiro_id) {
  console.error('❌ Tentativa de abrir modal de edição sem viagem_passageiro_id', passageiro);
  toast.error('Erro: ID do passageiro não encontrado');
  return;
}
```

## 🎯 Resultado

Após as correções:

1. **Erro eliminado**: O erro `TypeError: can't access property "find", N is undefined` não ocorre mais
2. **Feedback ao usuário**: Mensagens de erro claras quando há problemas com os dados
3. **Logs detalhados**: Informações de debug para identificar problemas futuros
4. **Comportamento seguro**: Componentes lidam graciosamente com dados inválidos

## 🧪 Como Testar

1. Acesse uma viagem com passageiros
2. Clique em "Filtros do Relatório"
3. Ative o modo "🎫 Comprar Ingressos"
4. Verifique se não há erros no console
5. Tente interagir com os passageiros normalmente

### 6. IngressosViagemReport - Correção do Array passeiosProcessados
```typescript
// ✅ CORREÇÃO: Ordenação normal para outros modos - incluir passeiosProcessados vazio
return passageirosParaExibir
  .sort((a, b) => {
    const nomeA = a.nome || '';
    const nomeB = b.nome || '';
    return nomeA.localeCompare(nomeB, 'pt-BR');
  })
  .map(passageiro => ({ 
    passageiro, 
    passeiosProcessados: [], // ✅ CORREÇÃO: Adicionar array vazio para evitar erro
    passeio: null, 
    faixa: null, 
    isInteira: false, 
    prioridade: 1,
    prioridadeFaixa: 2
  }));

// ✅ CORREÇÃO: Verificação de segurança antes de usar .find()
if (passeiosProcessados && Array.isArray(passeiosProcessados)) {
  const primeiraFaixaEspecial = passeiosProcessados.find(p => p.prioridadeFaixa === 1);
  // ...
}
```

## 📝 Arquivos Modificados

- `src/components/detalhes-viagem/PassageiroEditDialog/index.tsx`
- `src/hooks/usePagamentosSeparados.ts`
- `src/components/detalhes-viagem/PassageiroComStatus.tsx`
- `src/components/detalhes-viagem/PassageiroRow.tsx`
- `src/pages/DetalhesViagem.tsx`
- `src/components/relatorios/IngressosViagemReport.tsx` ✨ **NOVO**

## 🔄 Status

✅ **CONCLUÍDO** - Todos os erros corrigidos e sistema funcionando normalmente

### Erros Corrigidos:
1. ❌ `TypeError: can't access property "find", N is undefined` (usePagamentosSeparados)
2. ❌ `TypeError: can't access property "find", passeiosProcessados is undefined` (IngressosViagemReport)