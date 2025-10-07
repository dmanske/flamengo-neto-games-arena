-- Script para atualizar a view com correção de fuso horário
-- Execute no Supabase SQL Editor

-- 1. Recriar a view com campo de data local
CREATE OR REPLACE VIEW vw_ingressos_pendentes_real AS
SELECT 
    i.*,
    c.nome as cliente_nome,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    calcular_valor_pendente_real(i.id) as valor_pendente_real,
    COALESCE(SUM(hpi.valor_pago), 0) as total_pago,
    COALESCE(hc.total_tentativas, 0) as total_tentativas_cobranca,
    hc.ultima_tentativa,
    -- Usar DATE() para comparação de datas ignorando timestamp e fuso horário
    DATE(i.jogo_data AT TIME ZONE 'America/Sao_Paulo') as jogo_data_local,
    CASE 
        WHEN calcular_valor_pendente_real(i.id) > 200 AND EXTRACT(DAY FROM NOW() - i.jogo_data) > 7 THEN 'alta'
        WHEN calcular_valor_pendente_real(i.id) > 100 OR EXTRACT(DAY FROM NOW() - i.jogo_data) > 3 THEN 'media'
        ELSE 'baixa'
    END as prioridade,
    GREATEST(0, EXTRACT(DAY FROM NOW() - i.jogo_data)) as dias_em_atraso
FROM ingressos i
LEFT JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN historico_pagamentos_ingressos hpi ON i.id = hpi.ingresso_id
LEFT JOIN (
    SELECT 
        ingresso_id,
        COUNT(*) as total_tentativas,
        MAX(data_envio) as ultima_tentativa
    FROM historico_cobrancas_ingressos
    GROUP BY ingresso_id
) hc ON i.id = hc.ingresso_id
WHERE i.situacao_financeira = 'pendente'
GROUP BY i.id, c.nome, c.telefone, c.email, hc.total_tentativas, hc.ultima_tentativa;

-- 2. Testar a view atualizada
SELECT 
    adversario,
    jogo_data,
    jogo_data_local,
    cliente_nome,
    valor_final,
    valor_pendente_real,
    total_pago,
    prioridade
FROM vw_ingressos_pendentes_real
WHERE adversario = 'Racing'
ORDER BY valor_pendente_real DESC;

-- 3. Verificar se a correção funcionou
SELECT 
    COUNT(*) as total_racing_pendentes,
    'ingressos do Racing na view atualizada' as descricao
FROM vw_ingressos_pendentes_real
WHERE adversario = 'Racing';

SELECT 'View atualizada com correção de fuso horário! ✅' as resultado;