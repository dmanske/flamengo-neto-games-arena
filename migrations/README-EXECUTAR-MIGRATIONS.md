# Como Executar as Migrations

## ⚠️ IMPORTANTE: Execute estas migrations no Supabase

Para corrigir os problemas do sistema de ingressos, você precisa executar as seguintes migrations no seu banco de dados Supabase:

### 1. Migration da coluna logo_adversario (se ainda não executou)
```sql
-- Arquivo: migrations/add_logo_adversario_to_ingressos.sql
ALTER TABLE ingressos ADD COLUMN IF NOT EXISTS logo_adversario TEXT;
```

### 2. Migration da tabela de histórico de pagamentos (OBRIGATÓRIA)
```sql
-- Arquivo: migrations/create_historico_pagamentos_ingressos_table.sql
-- Execute TODO o conteúdo do arquivo create_historico_pagamentos_ingressos_table.sql
```

## Como executar no Supabase:

1. **Acesse o Supabase Dashboard**
   - Vá para https://supabase.com/dashboard
   - Selecione seu projeto

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute as migrations**
   - Copie e cole o conteúdo de `create_historico_pagamentos_ingressos_table.sql`
   - Clique em "Run" para executar
   - Verifique se não há erros

4. **Verifique se as tabelas foram criadas**
   - Vá para "Table Editor"
   - Confirme que a tabela `historico_pagamentos_ingressos` foi criada
   - Confirme que a coluna `logo_adversario` existe na tabela `ingressos`

## Verificação das Migrations

Após executar as migrations, você pode verificar se tudo está correto executando:

```sql
-- Verificar se a tabela historico_pagamentos_ingressos existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'historico_pagamentos_ingressos';

-- Verificar se a coluna logo_adversario existe na tabela ingressos
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'ingressos' 
AND column_name = 'logo_adversario';
```

## Problemas que serão resolvidos após executar as migrations:

✅ **Histórico de pagamentos funcionará**
✅ **Status de pagamento será atualizado corretamente**
✅ **Logos dos adversários serão salvos**
✅ **Sistema de ingressos funcionará completamente**

## ⚠️ ATENÇÃO

**SEM ESSAS MIGRATIONS O SISTEMA DE INGRESSOS NÃO FUNCIONARÁ CORRETAMENTE!**

A tabela `historico_pagamentos_ingressos` é essencial para:
- Registrar pagamentos
- Calcular status de pagamento
- Mostrar histórico de pagamentos
- Calcular resumos financeir