-- =====================================================
-- DIAGNÓSTICO: Verificar tabelas de cobrança
-- =====================================================

-- 1. Verificar se a tabela historico_cobrancas_ingressos existe
SELECT 
    'Tabela historico_cobrancas_ingressos' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'historico_cobrancas_ingressos'
    ) THEN '✅ Existe' 
    ELSE '❌ NÃO EXISTE' END as status;

-- 2. Ver estrutura da tabela (se existir)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'historico_cobrancas_ingressos'
ORDER BY ordinal_position;

-- 3. Verificar se a função registrar_cobranca_ingresso existe
SELECT 
    'Função registrar_cobranca_ingresso' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
        AND routine_schema = 'public'
    ) THEN '✅ Existe' 
    ELSE '❌ NÃO EXISTE' END as status;

-- 4. Ver definição da função (se existir)
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'registrar_cobranca_ingresso'
AND routine_schema = 'public';

-- 5. Verificar triggers existentes na tabela
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'historico_cobrancas_ingressos';

-- 6. Ver dados existentes na tabela (se houver)
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT tipo_cobranca) as tipos_diferentes,
    string_agg(DISTINCT tipo_cobranca, ', ') as tipos_existentes
FROM historico_cobrancas_ingressos;

-- 7. Ver últimos registros (se houver)
SELECT 
    id,
    tipo_cobranca,
    mensagem_enviada,
    observacoes,
    data_envio,
    created_at
FROM historico_cobrancas_ingressos 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Testar a função manualmente (se existir)
-- DESCOMENTE PARA TESTAR:
/*
SELECT registrar_cobranca_ingresso(
    '64086a49-2a87-4b96-8ffc-096145b0d065'::UUID,
    'whatsapp_manual',
    'Teste de mensagem',
    'Teste de observação',
    'Sistema'
) as teste_resultado;
*/

-- 9. Verificar se existe tabela de ingressos
SELECT 
    'Tabela ingressos' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'ingressos'
    ) THEN '✅ Existe' 
    ELSE '❌ NÃO EXISTE' END as status;

-- 10. Verificar se o ingresso específico existe
SELECT 
    COUNT(*) as ingresso_existe
FROM ingressos 
WHERE id = '64086a49-2a87-4b96-8ffc-096145b0d065';

SELECT '🔍 Diagnóstico completo executado!' as resultado;