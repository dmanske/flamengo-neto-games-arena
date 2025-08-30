-- 🔍 TESTE: Despesas de uma viagem específica
-- Vamos testar com uma das viagens que tem despesas

-- ==========================================
-- 1. TESTAR COM VIAGEM QUE TEM DESPESAS
-- ==========================================

-- Teste com a viagem f6090941-c44c-46f9-9c2f-448f1385aea3 (que tem 3 despesas)
SELECT 
    'TESTE_DESPESAS' as tipo,
    id,
    fornecedor,
    categoria,
    valor,
    status,
    data_despesa,
    created_at
FROM viagem_despesas
WHERE viagem_id = 'f6090941-c44c-46f9-9c2f-448f1385aea3'
ORDER BY data_despesa DESC;

-- ==========================================
-- 2. VERIFICAR PERFORMANCE DESTA QUERY
-- ==========================================

EXPLAIN ANALYZE
SELECT *
FROM viagem_despesas
WHERE viagem_id = 'f6090941-c44c-46f9-9c2f-448f1385aea3'
ORDER BY data_despesa DESC;

-- ==========================================
-- 3. VERIFICAR RLS (ROW LEVEL SECURITY)
-- ==========================================

-- Verificar se há políticas RLS ativas na tabela
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename IN ('viagem_despesas', 'viagem_receitas');

-- Ver políticas RLS específicas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('viagem_despesas', 'viagem_receitas');

-- ==========================================
-- 4. SIMULAR A QUERY EXATA DO HOOK
-- ==========================================

-- Esta é EXATAMENTE a query que o useViagemFinanceiro executa
-- Teste com a viagem que tem despesas
SELECT *
FROM viagem_despesas
WHERE viagem_id = 'f6090941-c44c-46f9-9c2f-448f1385aea3'
ORDER BY data_despesa DESC;

-- ==========================================
-- 5. VERIFICAR PERMISSÕES DO USUÁRIO ATUAL
-- ==========================================

-- Ver qual usuário está executando
SELECT current_user, session_user;

-- Verificar permissões na tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'viagem_despesas';

-- ==========================================
-- 6. TESTE DE INSERÇÃO (para ver se há locks)
-- ==========================================

-- ATENÇÃO: Este é apenas um teste, vamos fazer rollback
BEGIN;

-- Tentar inserir uma despesa de teste
INSERT INTO viagem_despesas (
    viagem_id,
    fornecedor,
    categoria,
    valor,
    data_despesa
) VALUES (
    'f6090941-c44c-46f9-9c2f-448f1385aea3',
    'TESTE_DEBUG',
    'administrativo',
    1.00,
    CURRENT_DATE
);

-- Ver se a inserção funcionou
SELECT COUNT(*) as total_apos_insercao 
FROM viagem_despesas 
WHERE viagem_id = 'f6090941-c44c-46f9-9c2f-448f1385aea3';

-- ROLLBACK para não afetar os dados reais
ROLLBACK;

-- ==========================================
-- 7. VERIFICAR ESTATÍSTICAS DA TABELA
-- ==========================================

-- Ver estatísticas de uso da tabela
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserções,
    n_tup_upd as atualizações,
    n_tup_del as exclusões,
    n_live_tup as registros_ativos,
    n_dead_tup as registros_mortos,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE tablename = 'viagem_despesas';

-- ==========================================
-- INSTRUÇÕES:
-- ==========================================

/*
Execute este SQL e me passe os resultados.

Especialmente importante:
1. O resultado da query EXPLAIN ANALYZE (item 2)
2. As políticas RLS (item 3) 
3. O resultado da query exata do hook (item 4)
4. As permissões (item 5)

Com esses dados vou identificar se o problema é:
- Performance (query lenta)
- RLS bloqueando
- Permissões
- Locks na tabela
*/