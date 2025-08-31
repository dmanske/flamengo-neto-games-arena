-- SQL simplificado para analisar os ingressos sem erros de estrutura
-- Execute este SQL para verificar o impacto dos ingressos

-- 1. RESUMO GERAL DOS INGRESSOS
SELECT 
    COUNT(*) as total_ingressos,
    COUNT(CASE WHEN situacao_financeira = 'pago' THEN 1 END) as ingressos_pagos,
    COUNT(CASE WHEN situacao_financeira = 'pendente' THEN 1 END) as ingressos_pendentes,
    COUNT(CASE WHEN situacao_financeira = 'cancelado' THEN 1 END) as ingressos_cancelados,
    SUM(valor_final) as receita_total,
    SUM(preco_custo) as custo_total,
    SUM(lucro) as lucro_total,
    ROUND(AVG(valor_final), 2) as preco_medio
FROM ingressos;

-- 2. INGRESSOS POR MÊS (últimos 6 meses)
SELECT 
    DATE_TRUNC('month', jogo_data) as mes,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_mes,
    SUM(preco_custo) as custo_mes,
    SUM(lucro) as lucro_mes,
    ROUND((SUM(lucro) * 100.0) / NULLIF(SUM(valor_final), 0), 2) as margem_percentual
FROM ingressos 
WHERE jogo_data >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY DATE_TRUNC('month', jogo_data)
ORDER BY mes DESC;

-- 3. INGRESSOS POR ADVERSÁRIO
SELECT 
    adversario,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_total,
    SUM(preco_custo) as custo_total,
    SUM(lucro) as lucro_total,
    ROUND(AVG(valor_final), 2) as preco_medio,
    ROUND((SUM(lucro) * 100.0) / NULLIF(SUM(valor_final), 0), 2) as margem_percentual
FROM ingressos
GROUP BY adversario
ORDER BY receita_total DESC;

-- 4. INGRESSOS POR STATUS FINANCEIRO
SELECT 
    situacao_financeira,
    COUNT(*) as quantidade,
    SUM(valor_final) as valor_total,
    ROUND(AVG(valor_final), 2) as valor_medio,
    ROUND((COUNT(*) * 100.0) / (SELECT COUNT(*) FROM ingressos), 2) as percentual
FROM ingressos
GROUP BY situacao_financeira
ORDER BY valor_total DESC;

-- 5. VERIFICAR SE HÁ HISTÓRICO DE PAGAMENTOS
SELECT 
    COUNT(*) as total_pagamentos,
    SUM(valor_pago) as total_valor_pago,
    COUNT(DISTINCT ingresso_id) as ingressos_com_pagamento,
    MIN(data_pagamento) as primeiro_pagamento,
    MAX(data_pagamento) as ultimo_pagamento
FROM historico_pagamentos_ingressos;

-- 6. FORMAS DE PAGAMENTO MAIS USADAS
SELECT 
    forma_pagamento,
    COUNT(*) as quantidade,
    SUM(valor_pago) as total_valor,
    ROUND(AVG(valor_pago), 2) as valor_medio
FROM historico_pagamentos_ingressos
GROUP BY forma_pagamento
ORDER BY total_valor DESC;

-- 7. INGRESSOS VINCULADOS A VIAGENS
SELECT 
    'COM_VIAGEM' as tipo,
    COUNT(*) as quantidade,
    SUM(valor_final) as receita
FROM ingressos 
WHERE viagem_id IS NOT NULL

UNION ALL

SELECT 
    'SEM_VIAGEM' as tipo,
    COUNT(*) as quantidade,
    SUM(valor_final) as receita
FROM ingressos 
WHERE viagem_id IS NULL;

-- 8. RECEITA POR LOCAL DO JOGO
SELECT 
    local_jogo,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_total,
    ROUND(AVG(valor_final), 2) as preco_medio
FROM ingressos
GROUP BY local_jogo
ORDER BY receita_total DESC;

-- 9. SETORES MAIS VENDIDOS
SELECT 
    setor_estadio,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_total,
    ROUND(AVG(valor_final), 2) as preco_medio
FROM ingressos
GROUP BY setor_estadio
ORDER BY total_ingressos DESC
LIMIT 10;