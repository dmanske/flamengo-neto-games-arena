# Design Document - Sistema de Cadastramento Facial

## Overview

O sistema de cadastramento facial é uma funcionalidade simples que permite marcar se um cliente já possui cadastramento facial realizado. A informação é armazenada no cadastro do cliente e exibida de forma discreta na lista de passageiros para facilitar a conferência durante as viagens.

## Architecture

### Abordagem Minimalista
- **Não interfere** no funcionamento atual do sistema
- **Adiciona apenas** um campo booleano ao cadastro de clientes
- **Exibe informação** de forma sutil na interface
- **Reutiliza** dados existentes sem criar novas tabelas

### Fluxo de Dados
```
Cliente Cadastro → Campo cadastro_facial (boolean) → Banco de Dados
                                                   ↓
Lista de Passageiros ← Consulta dados do cliente ← Viagem
```

## Components and Interfaces

### 1. Alteração no Banco de Dados
**Tabela:** `clientes`
**Novo campo:** `cadastro_facial BOOLEAN DEFAULT FALSE`

### 2. Componentes a Modificar

#### ClienteForm.tsx
- **Localização:** Seção "Dados Pessoais"
- **Componente:** Checkbox simples
- **Label:** "Possui cadastramento facial"
- **Posição:** Após PersonalInfoFields

#### ClienteFormSchema.ts
- **Adicionar:** `cadastro_facial: z.boolean().optional()`
- **Default:** `false`

#### PassageiroRow.tsx
- **Localização:** Abaixo do CPF na célula correspondente
- **Exibição:** Texto pequeno com ícone
- **Estados:**
  - `✓ Facial OK` (verde) quando `cadastro_facial = true`
  - `⚠ Facial pendente` (amarelo) quando `cadastro_facial = false`

### 3. Novos Componentes (Opcionais)

#### CadastroFacialIndicator.tsx
```tsx
interface CadastroFacialIndicatorProps {
  temCadastro: boolean;
  size?: 'sm' | 'md';
}
```

## Data Models

### Cliente (Atualizado)
```typescript
interface Cliente {
  // ... campos existentes
  cadastro_facial?: boolean; // 🆕 NOVO CAMPO
}
```

### ClienteFormData (Atualizado)
```typescript
interface ClienteFormData {
  // ... campos existentes
  cadastro_facial?: boolean; // 🆕 NOVO CAMPO
}
```

### Consulta de Passageiros (Sem alteração)
- Os dados já vêm através do relacionamento `clientes`
- Acesso via `passageiro.clientes?.cadastro_facial`

## Error Handling

### Cenários de Erro
1. **Campo não definido:** Tratar como `false` (não possui cadastro)
2. **Dados inconsistentes:** Fallback para estado "pendente"
3. **Erro na consulta:** Não exibir indicador (graceful degradation)

### Implementação
```typescript
const temCadastroFacial = passageiro.clientes?.cadastro_facial ?? false;
```

## Testing Strategy

### Testes Unitários (Opcionais)
1. **ClienteForm:** Verificar se checkbox funciona corretamente
2. **PassageiroRow:** Testar exibição dos diferentes estados
3. **Schema:** Validar campo opcional

### Testes de Integração
1. **Salvar cliente:** Verificar se campo é persistido
2. **Carregar passageiros:** Confirmar que dados são exibidos
3. **Migração:** Testar adição do campo sem quebrar dados existentes

### Testes Manuais
1. **Cadastro novo:** Marcar/desmarcar checkbox
2. **Edição:** Alterar status de cliente existente
3. **Lista:** Verificar exibição correta na lista de passageiros
4. **Viagens futuras:** Confirmar que informação persiste

## Implementation Notes

### Ordem de Implementação
1. **Migração do banco:** Adicionar campo `cadastro_facial`
2. **Schema:** Atualizar validação do formulário
3. **Formulário:** Adicionar checkbox no cadastro
4. **Lista:** Exibir indicador na PassageiroRow
5. **Testes:** Validar funcionamento

### Considerações Técnicas
- **Compatibilidade:** Campo opcional não quebra dados existentes
- **Performance:** Sem impacto (usa dados já carregados)
- **UX:** Informação discreta, não intrusiva
- **Manutenibilidade:** Código simples e direto

### Estilos CSS
```css
.cadastro-facial-ok {
  color: #16a34a; /* green-600 */
  font-size: 0.75rem; /* text-xs */
}

.cadastro-facial-pendente {
  color: #d97706; /* amber-600 */
  font-size: 0.75rem; /* text-xs */
}
```

## Migration Script

```sql
-- Adicionar campo cadastro_facial à tabela clientes
ALTER TABLE clientes 
ADD COLUMN cadastro_facial BOOLEAN DEFAULT FALSE;

-- Comentário para documentação
COMMENT ON COLUMN clientes.cadastro_facial IS 'Indica se o cliente já possui cadastramento facial realizado';
```

## Future Enhancements (Fora do Escopo)

- Filtros por status de cadastramento facial
- Relatórios com estatísticas
- Data do cadastramento facial
- Integração com sistemas externos de reconhecimento facial
- Notificações para clientes sem cadastro