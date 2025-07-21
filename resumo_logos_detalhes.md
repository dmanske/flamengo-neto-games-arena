# Atualização dos Logos nos Detalhes da Viagem

## ✅ Componentes Atualizados

### 1. Cards de Viagem (já feito anteriormente)
- `CleanViagemCard.tsx` ✅
- `ModernViagemCard.tsx` ✅

### 2. Layouts de Detalhes da Viagem
- `ModernViagemDetailsLayout.tsx` ✅
- `GlassViagemDetailsLayout.tsx` ✅
- `ViagemHeader.tsx` ✅

## 🎯 Lógica Implementada

### Quando o jogo é FORA do Rio de Janeiro:
- **Ordem dos logos**: Adversário × Flamengo
- **Título**: "Adversário × Flamengo"
- **Posição**: Time da casa (adversário) aparece primeiro

### Quando o jogo é NO Rio de Janeiro:
- **Ordem dos logos**: Flamengo × Adversário  
- **Título**: "Flamengo × Adversário"
- **Posição**: Flamengo (time da casa) aparece primeiro

## 🔧 Mudanças Técnicas

### Interfaces Atualizadas:
- Adicionado campo `local_jogo?: string` em todas as interfaces
- Mantida compatibilidade com dados existentes

### Renderização Condicional:
```typescript
{viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
  // Adversário × Flamengo
) : (
  // Flamengo × Adversário
)}
```

### Componentes Afetados:
1. **Cards na listagem** - Mostram ordem correta
2. **Página de detalhes** - Header e layouts respeitam a ordem
3. **Títulos** - Texto do confronto segue a mesma lógica

## 🧪 Como Testar:

1. **Crie uma viagem com local "São Paulo"**:
   - Cards devem mostrar: Adversário × Flamengo
   - Detalhes devem mostrar: Adversário × Flamengo

2. **Crie uma viagem com local "Rio de Janeiro"**:
   - Cards devem mostrar: Flamengo × Adversário
   - Detalhes devem mostrar: Flamengo × Adversário

3. **Viagens existentes sem local_jogo**:
   - Devem funcionar normalmente como Flamengo × Adversário

## 📋 Resultado Final:

- ✅ Cards respeitam mando de campo
- ✅ Detalhes respeitam mando de campo  
- ✅ Títulos consistentes em toda aplicação
- ✅ Compatibilidade com dados existentes
- ✅ Interface intuitiva para o usuário