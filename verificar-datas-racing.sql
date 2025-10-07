-- Script para verificar as datas dos ingressos do Racing
-- Execute no Supabase SQL Editor

-- 1. Verificar todos os ingressos do Racing
SELECT 
    id,
    cliente_id,
    adversario,
    jogo_data,
    DATE(jogo_data) as data_apenas,
    local_jogo,
    situacao_financeira,
    valor_final
FROM ingressos 
WHERE adversario ILIKE '%Racing%'
ORDER BY jogo_data;

-- 2. Verificar se há ingressos do Racing na data que está sendo buscada
SELECT 
    COUNT(*) as total_ingressos,
    'ingressos do Racing em 2025-10-23' as descricao
FROM ingressos 
WHERE adversario ILIKE '%Racing%' 
AND DATE(jogo_data) = '2025-10-23';

-- 3. Verificar todas as datas de jogos do Racing
SELECT DISTINCT
    DATE(jogo_data) as data_jogo,
    local_jogo,
    COUNT(*) as total_ingressos,
    COUNT(CASE WHEN situacao_financeira = 'pendente' THEN 1 END) as pendentes
FROM ingressos 
WHERE adversario ILIKE '%Racing%'
GROUP BY DATE(jogo_data), local_jogo
ORDER BY data_jogo;

-- 4. Verificar se há diferença no nome do adversário
SELECT DISTINCT
    adversario,
    COUNT(*) as total_ingressos
FROM ingressos 
WHERE adversario ILIKE '%Racing%'
GROUP BY adversario;

-- 5. Testar a view com os dados reais do Racing
SELECT *
FROM vw_ingressos_pendentes_real
WHERE adversario ILIKE '%Racing%'
LIMIT 10;

SELECT 'Verificação das datas do Racing concluída! ✅' as resultado;