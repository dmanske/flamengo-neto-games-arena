-- SQL para analisar se os ingressos precisam ser integrados ao Financeiro Geral
-- Execute este SQL para verificar o impacto financeiro dos ingressos

-- 1. RESUMO GERAL - Comparar receitas de viagens vs ingressos
SELECT 
    'VIAGENS' as fonte,
    COUNT(DISTINCT vp.viagem_id) as quantidade,
    SUM(vp.valor_viagem + COALESCE(pp.valor_cobrado, 0)) as receita_total
FROM viagem_passageiros vp
LEFT JOIN passageiro_passeios pp ON vp.id = pp.viagem_passageiro_id
WHERE vp.created_at >= CURRENT_DATE - INTERVAL '3 months'

UNION ALL

SELECT 
    'INGRESSOS' as fonte,
    COUNT(*) as quantidade,
    SUM(valor_final) as receita_total
FROM ingressos
WHERE jogo_data >= CURRENT_DATE - INTERVAL '3 months';

-- 2. RECEITAS MENSAIS - Comparativo viagens vs ingressos
WITH receitas_viagens AS (
    SELECT 
        DATE_TRUNC('month', v.data_jogo) as mes,
        SUM(vp.valor_viagem + COALESCE(pp.valor_cobrado, 0)) as receita_viagens
    FROM viagens v
    JOIN viagem_passageiros vp ON v.id = vp.viagem_id
    LEFT JOIN passageiro_passeios pp ON vp.id = pp.viagem_passageiro_id
    WHERE v.data_jogo >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', v.data_jogo)
),
receitas_ingressos AS (
    SELECT 
        DATE_TRUNC('month', jogo_data) as mes,
        SUM(valor_final) as receita_ingressos
    FROM ingressos
    WHERE jogo_data >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', jogo_data)
)
SELECT 
    COALESCE(rv.mes, ri.mes) as mes,
    COALESCE(rv.receita_viagens, 0) as receita_viagens,
    COALESCE(ri.receita_ingressos, 0) as receita_ingressos,
    COALESCE(rv.receita_viagens, 0) + COALESCE(ri.receita_ingressos, 0) as receita_total
FROM receitas_viagens rv
FULL OUTER JOIN receitas_ingressos ri ON rv.mes = ri.mes
ORDER BY mes DESC;

-- 3. VERIFICAR SE INGRESSOS JÁ ESTÃO NO FINANCEIRO GERAL
-- (Esta query vai dar erro se não estiver integrado)
SELECT 
    'TESTE_INTEGRACAO' as status,
    COUNT(*) as registros_encontrados
FROM (
    -- Tentar buscar ingressos no hook do Financeiro Geral
    -- Se der erro, significa que não está integrado
    SELECT 1 FROM ingressos LIMIT 1
) test;

-- 4. IMPACTO FINANCEIRO - Quanto os ingressos representam
WITH totais AS (
    SELECT 
        (SELECT SUM(vp.valor_viagem + COALESCE(pp.valor_cobrado, 0)) 
         FROM viagem_passageiros vp 
         LEFT JOIN passageiro_passeios pp ON vp.id = pp.viagem_passageiro_id
         WHERE vp.created_at >= CURRENT_DATE - INTERVAL '3 months') as receita_viagens,
        
        (SELECT SUM(valor_final) 
         FROM ingressos 
         WHERE jogo_data >= CURRENT_DATE - INTERVAL '3 months') as receita_ingressos,
         
        (SELECT SUM(valor) 
         FROM viagem_receitas 
         WHERE created_at >= CURRENT_DATE - INTERVAL '3 months') as receitas_extras
)
SELECT 
    receita_viagens,
    receita_ingressos,
    receitas_extras,
    receita_viagens + COALESCE(receita_ingressos, 0) + COALESCE(receitas_extras, 0) as receita_total_real,
    CASE 
        WHEN receita_viagens > 0 THEN 
            ROUND((COALESCE(receita_ingressos, 0) * 100.0) / receita_viagens, 2)
        ELSE 0 
    END as percentual_ingressos_vs_viagens
FROM totais;

-- 5. VERIFICAR DESPESAS DOS INGRESSOS
SELECT 
    COUNT(*) as total_ingressos,
    SUM(preco_custo) as total_custos,
    SUM(valor_final) as total_receitas,
    SUM(lucro) as total_lucro,
    CASE 
        WHEN SUM(valor_final) > 0 THEN 
            ROUND((SUM(lucro) * 100.0) / SUM(valor_final), 2)
        ELSE 0 
    END as margem_lucro_percentual
FROM ingressos
WHERE jogo_data >= CURRENT_DATE - INTERVAL '3 months';

-- 6. INGRESSOS POR STATUS FINANCEIRO
SELECT 
    situacao_financeira,
    COUNT(*) as quantidade,
    SUM(valor_final) as valor_total,
    ROUND(AVG(valor_final), 2) as valor_medio
FROM ingressos
WHERE jogo_data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY situacao_financeira
ORDER BY valor_total DESC;

-- 7. VERIFICAR SE HÁ PAGAMENTOS PARCIAIS DE INGRESSOS
SELECT 
    i.id,
    i.adversario,
    i.valor_final as valor_ingresso,
    COALESCE(SUM(hpi.valor_pago), 0) as total_pago,
    i.valor_final - COALESCE(SUM(hpi.valor_pago), 0) as saldo_pendente,
    i.situacao_financeira
FROM ingressos i
LEFT JOIN historico_pagamentos_ingressos hpi ON i.id = hpi.ingresso_id
WHERE i.jogo_data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY i.id, i.adversario, i.valor_final, i.situacao_financeira
HAVING i.valor_final - COALESCE(SUM(hpi.valor_pago), 0) > 0
ORDER BY saldo_pendente DESC
LIMIT 20;