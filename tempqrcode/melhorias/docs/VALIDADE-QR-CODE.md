# ⏰ Validade do QR Code - Sistema de Presença

## Tempo de Validade Atual

### 📅 **24 horas após o jogo**

O QR code é válido até **24 horas depois da data/hora do jogo**.

## Como Funciona

### Exemplo Prático:
```
Jogo: Flamengo vs Palmeiras
Data: 15/11/2025 às 21:30

QR Code gerado em: 10/11/2025 às 10:00
QR Code expira em: 16/11/2025 às 21:30 (24h após o jogo)
```

### Cálculo da Expiração:
```sql
-- No banco de dados (função generate_qr_tokens_for_viagem)
v_expires_at := v_data_jogo + INTERVAL '24 hours';
```

## Estados do QR Code

### ✅ Válido
- Token existe no sistema
- Não foi usado ainda (`used_at` é NULL)
- Não expirou (`expires_at` > agora)
- **Pode ser escaneado**

### ❌ Inválido - Token Usado
- QR code já foi escaneado anteriormente
- Campo `used_at` tem data/hora
- Mensagem: "QR Code já utilizado"
- **Não pode ser usado novamente**

### ⏰ Inválido - Token Expirado
- Passou de 24h após o jogo
- `expires_at` < agora
- Mensagem: "QR Code expirado"
- **Precisa gerar novo QR code**

### 🚫 Inválido - Token Não Encontrado
- Token não existe no banco
- QR code de outra viagem ou inválido
- Mensagem: "QR Code inválido"

## Validações no Sistema

### Ao Escanear (função `validate_and_use_qr_token`):
```sql
1. ✓ Token existe?
   ❌ Não → "QR Code inválido"

2. ✓ Token já foi usado?
   ❌ Sim → "QR Code já utilizado"

3. ✓ Token está dentro da validade?
   ❌ Não → "QR Code expirado"

4. ✓ Presença já confirmada?
   ❌ Sim → "Presença já confirmada"

5. ✅ Tudo OK → Confirma presença!
```

## Como Alterar o Tempo de Validade

### Opção 1: Alterar para 48 horas
```sql
-- No arquivo: database/migrations/create-qr-code-system.sql
-- Linha 130, alterar de:
v_expires_at := v_data_jogo + INTERVAL '24 hours';

-- Para:
v_expires_at := v_data_jogo + INTERVAL '48 hours';
```

### Opção 2: Alterar para 7 dias
```sql
v_expires_at := v_data_jogo + INTERVAL '7 days';
```

### Opção 3: Alterar para 1 semana antes até 1 dia depois
```sql
-- Válido desde 7 dias antes até 24h depois do jogo
v_expires_at := v_data_jogo + INTERVAL '24 hours';
-- E adicionar validação de data mínima
IF NOW() < (v_data_jogo - INTERVAL '7 days') THEN
  RAISE EXCEPTION 'QR Code só pode ser gerado 7 dias antes do jogo';
END IF;
```

## Recomendações

### ✅ Tempo Ideal: 24-48 horas após o jogo
**Por quê?**
- Permite confirmar presença durante o embarque
- Permite confirmar presença atrasada (até 24h depois)
- Não fica válido por tempo demais (segurança)
- Evita uso indevido em outras viagens

### ⚠️ Não Recomendado: Muito tempo (7+ dias)
**Problemas:**
- QR code pode ser compartilhado indevidamente
- Menos seguro
- Pode causar confusão em viagens próximas

### ⚠️ Não Recomendado: Muito pouco (só no dia)
**Problemas:**
- Se o passageiro chegar atrasado, não consegue confirmar
- Menos flexibilidade
- Mais reclamações

## Informações Técnicas

### Tabela: `passageiro_qr_tokens`
```sql
CREATE TABLE passageiro_qr_tokens (
  id UUID PRIMARY KEY,
  viagem_id UUID NOT NULL,
  passageiro_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- ⏰ Data de expiração
  created_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,              -- 🔒 Quando foi usado
  qr_code_data TEXT
);
```

### Campos Importantes:
- **expires_at**: Data/hora de expiração (24h após o jogo)
- **used_at**: NULL = não usado, com data = já usado
- **token**: Código único de 32 caracteres (base64)

## Perguntas Frequentes

### 1. O passageiro pode usar o QR code mais de uma vez?
❌ **Não.** Após escanear, o campo `used_at` é preenchido e o QR code fica inválido.

### 2. E se o passageiro perder o QR code?
✅ Você pode:
- Reenviar o QR code via WhatsApp (mesmo QR, se ainda válido)
- Regenerar todos os QR codes (invalida os antigos)
- Marcar presença manualmente clicando no card do passageiro

### 3. Posso gerar QR codes com antecedência?
✅ **Sim!** Pode gerar semanas antes. A validade é calculada baseada na **data do jogo**, não na data de geração.

### 4. O que acontece se regenerar os QR codes?
⚠️ **Todos os QR codes antigos são deletados** e novos são criados. Os passageiros precisarão receber os novos QR codes.

### 5. Como saber quando um QR code expira?
✅ Use a função `get_qr_token_info(token)` que retorna:
```json
{
  "valid": true,
  "data": {
    "token_info": {
      "expires_at": "2025-11-16T21:30:00Z",
      "created_at": "2025-11-10T10:00:00Z"
    }
  }
}
```

---

**Resumo:** QR code válido por **24 horas após o jogo** ⏰
**Status:** Configuração atual do sistema ✅
**Data:** 11/11/2025
