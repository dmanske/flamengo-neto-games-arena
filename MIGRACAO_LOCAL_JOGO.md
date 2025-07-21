# Migração: Adicionar Campo Local do Jogo

## Arquivo de Migração Criado
- `supabase/migrations/20240322000000_add_local_jogo.sql`

## Para Aplicar a Migração

### Opção 1: Via Supabase CLI (se instalado)
```bash
supabase db push
```

### Opção 2: Via Dashboard do Supabase
1. Acesse o Dashboard do Supabase
2. Vá para "SQL Editor"
3. Execute o seguinte comando:

```sql
-- Adiciona coluna de local do jogo
ALTER TABLE viagens ADD COLUMN local_jogo TEXT NOT NULL DEFAULT 'Rio de Janeiro';

-- Adicionar comentário para documentação
COMMENT ON COLUMN viagens.local_jogo IS 'Cidade onde o jogo será realizado';
```

## Funcionalidades Implementadas

### 1. ✅ Campo Local do Jogo no Cadastro
- Campo padrão: "Rio de Janeiro"
- Opções pré-definidas: Rio de Janeiro, São Paulo, Belo Horizonte, etc.
- Opção "Outra cidade" para entrada manual
- Botão "Voltar" para retornar às opções pré-definidas

### 2. ✅ Cards de Viagem Atualizados
- **Data do Jogo**: Mostra data e hora completas
- **Data da Viagem**: Mostra data e hora da saída
- **Local do Jogo**: Mostra a cidade onde será o jogo
- Layout melhorado com labels mais claros

### 3. ✅ Integração com Banco
- Campo `local_jogo` adicionado ao schema
- Valor padrão configurado
- Inserção automática no banco de dados

## Teste das Funcionalidades

1. **Cadastrar Nova Viagem**:
   - Campo "Local do Jogo" deve aparecer após "Data e Hora da Saída"
   - Valor padrão deve ser "Rio de Janeiro"
   - Teste a opção "Outra cidade"

2. **Visualizar Cards**:
   - Cards devem mostrar data do jogo, data da viagem e local
   - Layout deve estar organizado e legível

3. **Banco de Dados**:
   - Após aplicar a migração, cadastre uma viagem
   - Verifique se o campo `local_jogo` foi salvo corretamente