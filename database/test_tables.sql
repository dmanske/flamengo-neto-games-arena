-- =====================================================
-- TESTE DAS TABELAS FINANCEIRAS
-- =====================================================

-- 1. Verificar estrutura das tabelas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY table_name, ordinal_position;

-- 2. Verificar constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc
WHERE tc.table_name IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tc.table_name, tc.constraint_type;

-- 3. Verificar índices
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tablename, indexname;

-- 4. Contar registros (deve ser 0 inicialmente)
SELECT 
    'viagem_receitas' as tabela, COUNT(*) as registros FROM viagem_receitas
UNION ALL
SELECT 
    'viagem_despesas' as tabela, COUNT(*) as registros FROM viagem_despesas
UNION ALL
SELECT 
    'viagem_cobranca_historico' as tabela, COUNT(*) as registros FROM viagem_cobranca_historico
UNION ALL
SELECT 
    'viagem_orcamento' as tabela, COUNT(*) as registros FROM viagem_orcamento;

-- =====================================================
-- RESULTADO ESPERADO:
-- - 4 tabelas criadas
-- - Múltiplos índices por tabela
-- - Constraints de CHECK funcionando
-- - 0 registros inicialmente
-- =====================================================