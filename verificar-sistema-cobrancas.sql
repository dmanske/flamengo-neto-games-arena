-- Script para verificar se o sistema de cobranças está funcionando
-- Execute no Supabase SQL Editor

-- 1. Verificar se a view existe
SELECT 
    'View vw_ingressos_pendentes_real' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'vw_ingressos_pendentes_real'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;

-- 2. Verificar se há ingressos pendentes
SELECT 
    COUNT(*) as total_ingressos_pendentes,
    'ingressos com situacao_financeira = pendente' as descricao
FROM ingressos 
WHERE situacao_financeira = 'pendente';

-- 3. Verificar se há pagamentos registrados
SELECT 
    COUNT(*) as total_pagamentos,
    'pagamentos registrados na tabela historico_pagamentos_ingressos' as descricao
FROM historico_pagamentos_ingressos;

-- 4. Testar a view (se existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'vw_ingressos_pendentes_real'
    ) THEN
        -- Executar query na view
        RAISE NOTICE 'Testando view vw_ingressos_pendentes_real...';
        
        -- Mostrar alguns dados da view
        PERFORM * FROM vw_ingressos_pendentes_real LIMIT 5;
        
        RAISE NOTICE 'View funcionando corretamente!';
    ELSE
        RAISE NOTICE 'View vw_ingressos_pendentes_real não existe!';
    END IF;
END $$;

-- 5. Verificar ingressos com pagamentos parciais
SELECT 
    i.id,
    c.nome as cliente_nome,
    i.adversario,
    i.valor_final,
    COALESCE(SUM(p.valor_pago), 0) as total_pago,
    i.valor_final - COALESCE(SUM(p.valor_pago), 0) as saldo_devedor,
    i.situacao_financeira
FROM ingressos i
LEFT JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN historico_pagamentos_ingressos p ON i.id = p.ingresso_id
WHERE i.situacao_financeira = 'pendente'
GROUP BY i.id, c.nome, i.adversario, i.valor_final, i.situacao_financeira
ORDER BY saldo_devedor DESC
LIMIT 10;

-- 6. Verificar se a função calcular_valor_pendente_real existe
SELECT 
    'Função calcular_valor_pendente_real' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'calcular_valor_pendente_real'
    ) THEN '✅ Existe' ELSE '❌ Não existe' END as status;

-- 7. Testar a função (se existir)
DO $$
DECLARE
    v_ingresso_id UUID;
    v_valor_pendente DECIMAL(10,2);
BEGIN
    -- Pegar um ingresso pendente para testar
    SELECT id INTO v_ingresso_id 
    FROM ingressos 
    WHERE situacao_financeira = 'pendente' 
    LIMIT 1;
    
    IF v_ingresso_id IS NOT NULL THEN
        -- Testar a função
        SELECT calcular_valor_pendente_real(v_ingresso_id) INTO v_valor_pendente;
        RAISE NOTICE 'Função calcular_valor_pendente_real funcionando! Valor: %', v_valor_pendente;
    ELSE
        RAISE NOTICE 'Nenhum ingresso pendente encontrado para testar a função';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao testar função: %', SQLERRM;
END $$;

SELECT 'Verificação concluída! ✅' as resultado;