-- =====================================================
-- LIMPEZA: Remover tipos de cobrança desnecessários
-- Manter apenas whatsapp_manual e whatsapp_api
-- =====================================================

-- 1. Verificar tipos existentes
SELECT 
    tipo_cobranca,
    COUNT(*) as quantidade
FROM historico_cobrancas_ingressos 
GROUP BY tipo_cobranca
ORDER BY quantidade DESC;

-- 2. Atualizar tipos antigos para whatsapp_manual (se existirem)
UPDATE historico_cobrancas_ingressos 
SET tipo_cobranca = 'whatsapp_manual'
WHERE tipo_cobranca IN ('whatsapp', 'telefone', 'presencial', 'outros');

-- 3. Verificar se há registros com email (manter se houver)
SELECT COUNT(*) as emails_existentes 
FROM historico_cobrancas_ingressos 
WHERE tipo_cobranca = 'email';

-- 4. Verificar resultado final
SELECT 
    tipo_cobranca,
    COUNT(*) as quantidade
FROM historico_cobrancas_ingressos 
GROUP BY tipo_cobranca
ORDER BY quantidade DESC;

-- 5. Verificar se a função está funcionando
SELECT 
    'Teste da função registrar_cobranca_ingresso' as teste,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
        AND routine_schema = 'public'
    ) THEN '✅ Função existe e está pronta' 
    ELSE '❌ Função não encontrada - execute o SQL de correção primeiro' END as status;