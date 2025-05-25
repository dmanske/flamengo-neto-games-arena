# Guia de Timezone e Datas - Sistema Flamengo Neto Games Arena

## Visão Geral

Este sistema foi desenvolvido para operar no Brasil, utilizando o fuso horário UTC-3 (Horário de Brasília). Todas as datas são tratadas de forma consistente para evitar problemas de timezone.

## Configuração de Timezone

### Fuso Horário Padrão
- **UTC-3**: Horário de Brasília (padrão)
- **Locale**: pt-BR (Português do Brasil)

### Arquivos de Configuração
- `src/config/timezone.ts`: Configurações centralizadas de timezone
- `src/utils/dateUtils.ts`: Funções utilitárias para manipulação de datas

## Como as Datas São Tratadas

### 1. Armazenamento no Banco de Dados
- **Formato**: `YYYY-MM-DD` (ISO 8601 sem horário)
- **Exemplo**: `2024-01-15`
- **Vantagem**: Evita problemas de timezone ao armazenar apenas a data

### 2. Exibição para o Usuário
- **Formato**: `DD/MM/AAAA` (padrão brasileiro)
- **Exemplo**: `15/01/2024`
- **Com horário**: `DD/MM/AAAA HH:mm`

### 3. Input do Usuário
- **Formato aceito**: `DD/MM/AAAA`
- **Validação**: Automática com verificação de data válida
- **Formatação**: Automática durante a digitação

## Funções Principais

### Conversão de Datas
```typescript
// Converter data brasileira para ISO
convertBRDateToISO("15/01/2024") // retorna "2024-01-15"

// Converter ISO para data brasileira
convertISOToBRDate("2024-01-15") // retorna "15/01/2024"
```

### Validação
```typescript
// Validar data brasileira
isValidBRDate("15/01/2024") // retorna true
isValidBRDate("32/01/2024") // retorna false
```

### Formatação Segura
```typescript
// Criar data com horário seguro (meio-dia)
createSafeDate(new Date()) // evita problemas de timezone

// Formatar para exibição
formatBrazilianDate("2024-01-15") // retorna "15/01/2024"
formatBrazilianDate("2024-01-15T10:30:00", true) // retorna "15/01/2024 10:30"
```

## Problemas Comuns e Soluções

### 1. Data Aparecendo Incorreta
**Problema**: Data salva como 15/01/2024 aparece como 14/01/2024
**Causa**: Problema de timezone ao converter Date para string
**Solução**: Usar `convertBRDateToISO()` e `convertISOToBRDate()`

### 2. Validação de Data Falhando
**Problema**: Data válida sendo rejeitada
**Causa**: Formato incorreto ou validação inadequada
**Solução**: Usar `isValidBRDate()` para validação

### 3. Inconsistência entre Cadastro e Exibição
**Problema**: Data salva diferente da exibida
**Causa**: Conversões inconsistentes
**Solução**: Usar sempre as funções centralizadas do `dateUtils.ts`

## Boas Práticas

### 1. Sempre Use as Funções Centralizadas
```typescript
// ✅ Correto
import { convertBRDateToISO, convertISOToBRDate } from '@/utils/dateUtils';

// ❌ Evitar
const date = new Date(dateString).toISOString();
```

### 2. Validação Antes de Salvar
```typescript
// ✅ Correto
if (isValidBRDate(dateInput)) {
  const isoDate = convertBRDateToISO(dateInput);
  // salvar no banco
}
```

### 3. Formatação Consistente
```typescript
// ✅ Correto - usar configurações centralizadas
import { BRAZIL_CONFIG } from '@/config/timezone';
format(date, BRAZIL_CONFIG.DISPLAY.DATE_FORMAT, { locale: ptBR });

// ❌ Evitar - hardcoded
format(date, 'dd/MM/yyyy');
```

## Correção de Datas Existentes

O sistema inclui uma função para corrigir datas que foram salvas incorretamente:

```typescript
// Executar correção
const result = await fixExistingDates();
console.log(`${result.corrected} datas corrigidas`);
```

### Como Usar
1. Acesse a página de Clientes no dashboard
2. Clique no botão "Corrigir Datas"
3. Aguarde a conclusão do processo
4. Verifique o resultado no toast de notificação

## Configurações Avançadas

### Personalizar Formatos
Edite `src/config/timezone.ts` para personalizar formatos:

```typescript
export const BRAZIL_CONFIG = {
  DISPLAY: {
    DATE_FORMAT: 'dd/MM/yyyy',      // Formato de exibição
    DATETIME_FORMAT: 'dd/MM/yyyy HH:mm', // Com horário
    TIME_FORMAT: 'HH:mm',           // Apenas horário
  }
};
```

### Adicionar Novos Fusos
Para suportar outros fusos horários brasileiros:

```typescript
export const TIMEZONE_OFFSETS = {
  BRASILIA: -3,  // UTC-3
  ACRE: -5,      // UTC-5
  AMAZONAS: -4,  // UTC-4
};
```

## Testes

### Testar Conversões
```typescript
// Teste básico
console.assert(convertBRDateToISO("15/01/2024") === "2024-01-15");
console.assert(convertISOToBRDate("2024-01-15") === "15/01/2024");

// Teste de validação
console.assert(isValidBRDate("15/01/2024") === true);
console.assert(isValidBRDate("32/01/2024") === false);
```

## Suporte

Para dúvidas sobre timezone e datas:
1. Consulte este guia
2. Verifique os arquivos `dateUtils.ts` e `timezone.ts`
3. Execute a função de correção se necessário
4. Entre em contato com a equipe de desenvolvimento

---

**Última atualização**: Janeiro 2024
**Versão**: 1.0 