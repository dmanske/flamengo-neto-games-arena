# 🗄️ Instruções SQL para Supabase - Sistema de Créditos Pré-pagos

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard
- Vá para [supabase.com](https://supabase.com)
- Entre no seu projeto
- Clique em "SQL Editor" no menu lateral

### 2. Execute o Script Completo
Copie e cole o conteúdo do arquivo `database/migrations/wallet_system_complete.sql` no SQL Editor e execute.

**⚠️ IMPORTANTE**: Execute todo o script de uma vez. Ele já inclui todas as correções e otimizações necessárias.

### 3. Verificar se Funcionou
Após executar, você deve ver as seguintes mensagens de sucesso:
```
✅ Sistema de Carteira Digital criado com sucesso!
📊 Tabelas: cliente_wallet, wallet_transacoes, wallet_audit_logs
🔧 Funções: wallet_depositar(), wallet_usar_creditos()
📈 View: wallet_resumo_mensal
🔒 RLS habilitado em todas as tabelas
```

### 4. Verificar Tabelas Criadas
No menu "Table Editor", você deve ver as novas tabelas:
- `cliente_wallet`
- `wallet_transacoes` 
- `wallet_audit_logs`
- `wallet_resumo_mensal` (view materializada)

## 🧪 Testes Básicos (Opcional)

### Teste 1: Criar Carteira e Fazer Depósito
```sql
-- Substitua 'UUID_DO_CLIENTE' por um ID real de cliente
SELECT wallet_depositar(
  'UUID_DO_CLIENTE',
  100.00,
  'Teste de depósito inicial',
  'PIX',
  'admin'
);
```

### Teste 2: Verificar Saldo
```sql
SELECT * FROM cliente_wallet 
WHERE cliente_id = 'UUID_DO_CLIENTE';
```

### Teste 3: Usar Créditos
```sql
SELECT wallet_usar_creditos(
  'UUID_DO_CLIENTE',
  50.00,
  'Teste de uso de créditos',
  'TESTE-001',
  'admin'
);
```

### Teste 4: Ver Histórico
```sql
SELECT * FROM wallet_transacoes 
WHERE cliente_id = 'UUID_DO_CLIENTE'
ORDER BY created_at DESC;
```

## 🔍 Verificações de Integridade

### Verificar Índices
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename IN ('cliente_wallet', 'wallet_transacoes', 'wallet_audit_logs');
```

### Verificar Funções
```sql
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE 'wallet_%';
```

### Verificar RLS
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cliente_wallet', 'wallet_transacoes', 'wallet_audit_logs');
```

## 🚨 Possíveis Erros e Soluções

### Erro: "relation 'clientes' does not exist"
**Causa**: A tabela `clientes` não existe no seu banco
**Solução**: Ajuste a referência para a tabela correta de clientes no seu sistema

### Erro: "permission denied"
**Causa**: Usuário sem permissões administrativas
**Solução**: Execute como usuário admin do Supabase

### Erro: "function already exists"
**Causa**: Script executado mais de uma vez
**Solução**: Normal, as funções usam `CREATE OR REPLACE`

## 📊 Dados de Exemplo (Opcional)

Se quiser testar com dados fictícios:

```sql
-- Inserir alguns depósitos de teste (substitua UUIDs reais)
SELECT wallet_depositar('uuid-cliente-1', 500.00, 'Depósito inicial', 'PIX', 'admin');
SELECT wallet_depositar('uuid-cliente-2', 300.00, 'Recarga mensal', 'Dinheiro', 'admin');
SELECT wallet_depositar('uuid-cliente-3', 150.00, 'Depósito teste', 'Cartão', 'admin');

-- Usar alguns créditos
SELECT wallet_usar_creditos('uuid-cliente-1', 100.00, 'Viagem teste', 'VIAGEM-001', 'admin');
SELECT wallet_usar_creditos('uuid-cliente-2', 50.00, 'Passeio teste', 'PASSEIO-001', 'admin');
```

## 🔄 Refresh da View Materializada

A view é atualizada automaticamente, mas se precisar forçar:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY wallet_resumo_mensal;
```

## 🗑️ Remover Sistema (Se Necessário)

**⚠️ CUIDADO**: Isso apagará todos os dados!

```sql
-- Remover triggers
DROP TRIGGER IF EXISTS trigger_refresh_wallet_resumo ON wallet_transacoes;
DROP TRIGGER IF EXISTS trigger_wallet_updated_at ON cliente_wallet;

-- Remover funções
DROP FUNCTION IF EXISTS refresh_wallet_resumo();
DROP FUNCTION IF EXISTS update_wallet_updated_at();
DROP FUNCTION IF EXISTS wallet_usar_creditos(UUID, DECIMAL, TEXT, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS wallet_depositar(UUID, DECIMAL, TEXT, VARCHAR, VARCHAR);

-- Remover view
DROP MATERIALIZED VIEW IF EXISTS wallet_resumo_mensal;

-- Remover tabelas
DROP TABLE IF EXISTS wallet_audit_logs;
DROP TABLE IF EXISTS wallet_transacoes;
DROP TABLE IF EXISTS cliente_wallet;
```

## ✅ Checklist Final

- [ ] Script SQL executado sem erros
- [ ] Tabelas criadas (3 tabelas + 1 view)
- [ ] Funções criadas (4 funções)
- [ ] Índices criados (7 índices)
- [ ] RLS habilitado
- [ ] Teste básico funcionando

---

**Após executar o SQL, o sistema estará pronto para uso! 🚀**



**Próximo passo**: Integrar os componentes React na sua aplicação.