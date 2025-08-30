-- 🔍 DEBUG: Problema com carregamento de despesas na aba financeiro
-- Data: 30/08/2025
-- Problema: Despesas demoram para carregar ou não carregam, diferente das receitas

-- ==========================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ==========================================

-- Verificar se a tabela viagem_despesas existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_despesas'
ORDER BY ordinal_position;

-- ==========================================
-- 2. VERIFICAR ÍNDICES (PERFORMANCE)
-- ==========================================

-- Verificar índices da tabela viagem_despesas
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'viagem_despesas'
ORDER BY indexname;

-- ==========================================
-- 3. COMPARAR COM TABELA DE RECEITAS
-- ==========================================

-- Verificar índices da tabela viagem_receitas (que funciona bem)
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'viagem_receitas'
ORDER BY indexname;

-- ==========================================
-- 4. VERIFICAR DADOS EXISTENTES
-- ==========================================

-- Contar registros em ambas as tabelas
SELECT 
    'viagem_despesas' as tabela, 
    COUNT(*) as total_registros,
    COUNT(DISTINCT viagem_id) as viagens_com_dados
FROM viagem_despesas
UNION ALL
SELECT 
    'viagem_receitas' as tabela, 
    COUNT(*) as total_registros,
    COUNT(DISTINCT viagem_id) as viagens_com_dados
FROM viagem_receitas;

-- ==========================================
-- 5. TESTAR QUERY ESPECÍFICA (SUBSTITUA O ID)
-- ==========================================

-- SUBSTITUA 'SEU_ID_DA_VIAGEM_AQUI' pelo ID real da viagem que está testando
-- Esta é a mesma query que o hook useViagemFinanceiro usa

SELECT *
FROM viagem_despesas
WHERE viagem_id = 'SEU_ID_DA_VIAGEM_AQUI'
ORDER BY data_despesa DESC;

-- ==========================================
-- 6. VERIFICAR PERFORMANCE DA QUERY
-- ==========================================

-- Analisar plano de execução da query de despesas
EXPLAIN ANALYZE
SELECT *
FROM viagem_despesas
WHERE viagem_id = 'SEU_ID_DA_VIAGEM_AQUI'
ORDER BY data_despesa DESC;

-- ==========================================
-- 7. COMPARAR COM QUERY DE RECEITAS
-- ==========================================

-- Analisar plano de execução da query de receitas (para comparação)
EXPLAIN ANALYZE
SELECT *
FROM viagem_receitas
WHERE viagem_id = 'SEU_ID_DA_VIAGEM_AQUI'
ORDER BY data_recebimento DESC;

-- ==========================================
-- 8. VERIFICAR FOREIGN KEYS E CONSTRAINTS
-- ==========================================

-- Verificar constraints das duas tabelas
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('viagem_despesas', 'viagem_receitas')
ORDER BY tc.table_name, tc.constraint_type;

-- ==========================================
-- 9. VERIFICAR DADOS DE EXEMPLO
-- ==========================================

-- Ver alguns registros de exemplo de cada tabela
SELECT 
    'DESPESAS' as tipo,
    id,
    viagem_id,
    fornecedor as descricao,
    categoria,
    valor,
    status,
    data_despesa as data_registro,
    created_at
FROM viagem_despesas
ORDER BY created_at DESC
LIMIT 5;

-- Ver alguns registros de receitas para comparação
SELECT 
    'RECEITAS' as tipo,
    id,
    viagem_id,
    descricao,
    categoria,
    valor,
    status,
    data_recebimento as data_registro,
    created_at
FROM viagem_receitas
ORDER BY created_at DESC
LIMIT 5;

-- ==========================================
-- 10. VERIFICAR LOCKS OU TRANSAÇÕES PENDENTES
-- ==========================================

-- Verificar se há locks na tabela viagem_despesas
SELECT 
    pg_class.relname,
    pg_locks.locktype,
    pg_locks.mode,
    pg_locks.granted,
    pg_stat_activity.query,
    pg_stat_activity.state
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
LEFT JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE pg_class.relname = 'viagem_despesas';

-- ==========================================
-- INSTRUÇÕES DE USO:
-- ==========================================

/*
1. Execute este SQL no seu banco de dados Supabase
2. SUBSTITUA 'SEU_ID_DA_VIAGEM_AQUI' pelo ID real de uma viagem que você está testando
3. Copie e cole os resultados aqui no chat
4. Vou analisar os resultados e identificar o problema

POSSÍVEIS CAUSAS:
- Índice faltando ou corrompido
- Query lenta devido ao volume de dados
- Problema de foreign key
- Lock na tabela
- Dados corrompidos
- Problema de permissão RLS (Row Level Security)
*/