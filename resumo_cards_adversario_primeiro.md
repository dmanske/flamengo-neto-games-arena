# Atualização dos Cards - Adversário Primeiro Fora do Rio

## ✅ Cards Atualizados

Todos os 4 componentes de cards de viagem foram atualizados para mostrar o escudo do adversário primeiro quando o jogo for fora do Rio de Janeiro:

### 1. CleanViagemCard ✅
- **Logos**: Adversário × Flamengo (fora do Rio) | Flamengo × Adversário (no Rio)
- **Título**: "Adversário × Flamengo" ou "Flamengo × Adversário"
- **Interface**: Adicionado campo `local_jogo?: string`

### 2. ModernViagemCard ✅
- **Logos**: Adversário × Flamengo (fora do Rio) | Flamengo × Adversário (no Rio)
- **Título**: "Adversário × Flamengo" ou "Flamengo × Adversário"
- **Interface**: Adicionado campo `local_jogo?: string`

### 3. PremiumViagemCard ✅
- **Logos**: Adversário × Flamengo (fora do Rio) | Flamengo × Adversário (no Rio)
- **Título**: "Adversário × Flamengo" ou "Flamengo × Adversário"
- **Interface**: Adicionado campo `local_jogo?: string`

### 4. ViagemCard ✅
- **Logos**: Adversário vs Flamengo (fora do Rio) | Flamengo vs Adversário (no Rio)
- **Título**: "Adversário vs Flamengo" ou "Flamengo vs Adversário"
- **Interface**: Adicionado campo `local_jogo?: string`

## Lógica Implementada

```typescript
// Para todos os cards, a lógica é:
{viagem.local_jogo && viagem.local_jogo !== "Rio de Janeiro" ? (
  // Mostrar: ADVERSÁRIO primeiro
  <>
    <LogoAdversario />
    <Separador />
    <LogoFlamengo />
  </>
) : (
  // Mostrar: FLAMENGO primeiro (padrão)
  <>
    <LogoFlamengo />
    <Separador />
    <LogoAdversario />
  </>
)}
```

## Comportamento Esperado

### Jogos no Rio de Janeiro:
- **Visual**: 🔴 Flamengo × 🔵 Adversário
- **Título**: "Flamengo × Adversário"

### Jogos Fora do Rio de Janeiro:
- **Visual**: 🔵 Adversário × 🔴 Flamengo
- **Título**: "Adversário × Flamengo"

## Como Testar

1. **Cadastre uma viagem no Rio de Janeiro**:
   - Local do jogo = "Rio de Janeiro"
   - Card deve mostrar: Flamengo × Adversário

2. **Cadastre uma viagem fora do Rio**:
   - Local do jogo = "São Paulo" (ou qualquer outra cidade)
   - Card deve mostrar: Adversário × Flamengo

3. **Verifique todos os tipos de card**:
   - CleanViagemCard (usado na página principal)
   - ModernViagemCard, PremiumViagemCard, ViagemCard (se usados em outras páginas)

## Consistência

Todos os 4 componentes de card agora seguem a mesma lógica:
- **Mandante** (time da casa) aparece primeiro
- **Visitante** aparece segundo
- Títulos refletem a ordem correta dos logos