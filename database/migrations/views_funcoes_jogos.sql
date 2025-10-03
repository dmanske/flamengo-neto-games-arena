-- =====================================================
-- VIEWS E FUNÇÕES AUXILIARES PARA ANÁLISE FINANCEIRA DE JOGOS
-- DESCRIÇÃO: Views e funções para cálculos automáticos e analytics
-- =====================================================

-- =====================================================
-- VIEW: Resumo Financeiro por Jogo
-- =====================================================
CREATE OR REPLACE VIEW vw_resumo_financeiro_jogo AS
SELECT 
    -- Identificação do jogo
    CONCAT(i.adversario, '-', TO_CHAR(i.jogo_data, 'YYYY-MM-DD'), '-', i.local_jogo) as jogo_key,
    i.adversario,
    i.jogo_data,
    i.local_jogo,
    
    -- Métricas de ingressos
    COUNT(i.id) as total_ingressos,
    COUNT(CASE WHEN i.situacao_financeira = 'pago' THEN 1 END) as ingressos_pagos,
    COUNT(CASE WHEN i.situacao_financeira = 'pendente' THEN 1 END) as ingressos_pendentes,
    COUNT(CASE WHEN i.situacao_financeira = 'cancelado' THEN 1 END) as ingressos_cancelados,
    
    -- Receitas dos ingressos
    COALESCE(SUM(CASE WHEN i.situacao_financeira = 'pago' THEN i.valor_final ELSE 0 END), 0) as receita_ingressos_paga,
    COALESCE(SUM(CASE WHEN i.situacao_financeira = 'pendente' THEN i.valor_final ELSE 0 END), 0) as receita_ingressos_pendente,
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) as receita_ingressos_total,
    
    -- Custos dos ingressos
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) as custo_ingressos_total,
    
    -- Receitas manuais
    COALESCE(receitas_manuais.total_receitas_manuais, 0) as receitas_manuais,
    
    -- Despesas operacionais
    COALESCE(despesas_operacionais.total_despesas_operacionais, 0) as despesas_operacionais,
    
    -- Totais consolidados
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) + 
    COALESCE(receitas_manuais.total_receitas_manuais, 0) as receita_total,
    
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) + 
    COALESCE(despesas_operacionais.total_despesas_operacionais, 0) as custo_total,
    
    -- Lucro e margem
    (COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) + 
     COALESCE(receitas_manuais.total_receitas_manuais, 0)) - 
    (COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) + 
     COALESCE(despesas_operacionais.total_despesas_operacionais, 0)) as lucro_total,
    
    -- Ticket médio
    CASE 
        WHEN COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END) > 0 
        THEN COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) / 
             COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END)
        ELSE 0 
    END as ticket_medio

FROM ingressos i
LEFT JOIN (
    SELECT 
        jogo_key,
        SUM(valor) as total_receitas_manuais
    FROM receitas_jogos 
    GROUP BY jogo_key
) receitas_manuais ON CONCAT(i.adversario, '-', TO_CHAR(i.jogo_data, 'YYYY-MM-DD'), '-', i.local_jogo) = receitas_manuais.jogo_key
LEFT JOIN (
    SELECT 
        jogo_key,
        SUM(valor) as total_despesas_operacionais
    FROM despesas_jogos 
    GROUP BY jogo_key
) despesas_operacionais ON CONCAT(i.adversario, '-', TO_CHAR(i.jogo_data, 'YYYY-MM-DD'), '-', i.local_jogo) = despesas_operacionais.jogo_key
GROUP BY 
    i.adversario, 
    i.jogo_data, 
    i.local_jogo,
    receitas_manuais.total_receitas_manuais,
    despesas_operacionais.total_despesas_operacionais;

-- =====================================================
-- VIEW: Analytics por Setor
-- =====================================================
CREATE OR REPLACE VIEW vw_analytics_setor_jogo AS
SELECT 
    -- Identificação
    CONCAT(i.adversario, '-', TO_CHAR(i.jogo_data, 'YYYY-MM-DD'), '-', i.local_jogo) as jogo_key,
    i.adversario,
    i.jogo_data,
    i.local_jogo,
    i.setor_estadio,
    
    -- Métricas por setor
    COUNT(i.id) as quantidade_total,
    COUNT(CASE WHEN i.situacao_financeira = 'pago' THEN 1 END) as quantidade_paga,
    COUNT(CASE WHEN i.situacao_financeira = 'pendente' THEN 1 END) as quantidade_pendente,
    
    -- Receitas por setor
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) as receita_total,
    COALESCE(SUM(CASE WHEN i.situacao_financeira = 'pago' THEN i.valor_final ELSE 0 END), 0) as receita_paga,
    COALESCE(SUM(CASE WHEN i.situacao_financeira = 'pendente' THEN i.valor_final ELSE 0 END), 0) as receita_pendente,
    
    -- Custos por setor
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) as custo_total,
    
    -- Lucro por setor
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) as lucro_total,
    
    -- Preços médios
    CASE 
        WHEN COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END) > 0 
        THEN COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) / 
             COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END)
        ELSE 0 
    END as preco_medio_venda,
    
    CASE 
        WHEN COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END) > 0 
        THEN COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0) / 
             COUNT(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN 1 END)
        ELSE 0 
    END as preco_medio_custo,
    
    -- Margem percentual
    CASE 
        WHEN COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) > 0
        THEN ((COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0) - 
               COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN COALESCE(i.preco_custo, 0) ELSE 0 END), 0)) / 
              COALESCE(SUM(CASE WHEN i.situacao_financeira IN ('pago', 'pendente') THEN i.valor_final ELSE 0 END), 0)) * 100
        ELSE 0 
    END as margem_percentual

FROM ingressos i
GROUP BY 
    i.adversario, 
    i.jogo_data, 
    i.local_jogo,
    i.setor_estadio
ORDER BY receita_total DESC;

-- =====================================================
-- FUNÇÃO: Calcular ROI por Setor
-- =====================================================
CREATE OR REPLACE FUNCTION calcular_roi_setor_jogo(p_jogo_key TEXT)
RETURNS TABLE (
    setor TEXT,
    investimento DECIMAL(10,2),
    retorno DECIMAL(10,2),
    roi_percentual DECIMAL(5,2),
    classificacao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.setor_estadio as setor,
        a.custo_total as investimento,
        a.receita_total as retorno,
        CASE 
            WHEN a.custo_total > 0 
            THEN ROUND(((a.receita_total - a.custo_total) / a.custo_total * 100)::DECIMAL, 2)
            ELSE 0 
        END as roi_percentual,
        CASE 
            WHEN a.custo_total > 0 AND ((a.receita_total - a.custo_total) / a.custo_total * 100) >= 50 THEN 'Excelente'
            WHEN a.custo_total > 0 AND ((a.receita_total - a.custo_total) / a.custo_total * 100) >= 20 THEN 'Bom'
            WHEN a.custo_total > 0 AND ((a.receita_total - a.custo_total) / a.custo_total * 100) >= 0 THEN 'Regular'
            ELSE 'Prejuízo'
        END as classificacao
    FROM vw_analytics_setor_jogo a
    WHERE a.jogo_key = p_jogo_key
    ORDER BY roi_percentual DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNÇÃO: Comparar Jogo com Média Histórica
-- =====================================================
CREATE OR REPLACE FUNCTION comparar_jogo_com_media(p_jogo_key TEXT)
RETURNS TABLE (
    metrica TEXT,
    valor_jogo DECIMAL(10,2),
    media_historica DECIMAL(10,2),
    diferenca_percentual DECIMAL(5,2),
    performance TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH jogo_atual AS (
        SELECT * FROM vw_resumo_financeiro_jogo WHERE jogo_key = p_jogo_key
    ),
    media_historica AS (
        SELECT 
            AVG(receita_total) as avg_receita,
            AVG(custo_total) as avg_custo,
            AVG(lucro_total) as avg_lucro,
            AVG(ticket_medio) as avg_ticket,
            AVG(total_ingressos) as avg_ingressos
        FROM vw_resumo_financeiro_jogo 
        WHERE jogo_key != p_jogo_key
    )
    SELECT 
        'Receita Total'::TEXT as metrica,
        ja.receita_total as valor_jogo,
        mh.avg_receita as media_historica,
        CASE 
            WHEN mh.avg_receita > 0 
            THEN ROUND(((ja.receita_total - mh.avg_receita) / mh.avg_receita * 100)::DECIMAL, 2)
            ELSE 0 
        END as diferenca_percentual,
        CASE 
            WHEN mh.avg_receita > 0 AND ja.receita_total > mh.avg_receita THEN 'Acima da Média'
            WHEN mh.avg_receita > 0 AND ja.receita_total < mh.avg_receita THEN 'Abaixo da Média'
            ELSE 'Na Média'
        END as performance
    FROM jogo_atual ja, media_historica mh
    
    UNION ALL
    
    SELECT 
        'Lucro Total'::TEXT,
        ja.lucro_total,
        mh.avg_lucro,
        CASE 
            WHEN mh.avg_lucro > 0 
            THEN ROUND(((ja.lucro_total - mh.avg_lucro) / mh.avg_lucro * 100)::DECIMAL, 2)
            ELSE 0 
        END,
        CASE 
            WHEN mh.avg_lucro > 0 AND ja.lucro_total > mh.avg_lucro THEN 'Acima da Média'
            WHEN mh.avg_lucro > 0 AND ja.lucro_total < mh.avg_lucro THEN 'Abaixo da Média'
            ELSE 'Na Média'
        END
    FROM jogo_atual ja, media_historica mh
    
    UNION ALL
    
    SELECT 
        'Ticket Médio'::TEXT,
        ja.ticket_medio,
        mh.avg_ticket,
        CASE 
            WHEN mh.avg_ticket > 0 
            THEN ROUND(((ja.ticket_medio - mh.avg_ticket) / mh.avg_ticket * 100)::DECIMAL, 2)
            ELSE 0 
        END,
        CASE 
            WHEN mh.avg_ticket > 0 AND ja.ticket_medio > mh.avg_ticket THEN 'Acima da Média'
            WHEN mh.avg_ticket > 0 AND ja.ticket_medio < mh.avg_ticket THEN 'Abaixo da Média'
            ELSE 'Na Média'
        END
    FROM jogo_atual ja, media_historica mh;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Atualizar estatísticas quando ingresso muda
-- =====================================================
CREATE OR REPLACE FUNCTION trigger_atualizar_stats_jogo()
RETURNS TRIGGER AS $$
BEGIN
    -- Este trigger pode ser usado para invalidar cache ou atualizar estatísticas
    -- Por enquanto, apenas registra a mudança
    -- Implementar conforme necessário
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela ingressos (se necessário)
-- CREATE TRIGGER trigger_ingressos_stats_update
--     AFTER INSERT OR UPDATE OR DELETE ON ingressos
--     FOR EACH ROW
--     EXECUTE FUNCTION trigger_atualizar_stats_jogo();

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON VIEW vw_resumo_financeiro_jogo IS 'Resumo financeiro consolidado por jogo com receitas, custos e lucros';
COMMENT ON VIEW vw_analytics_setor_jogo IS 'Analytics detalhados por setor do estádio para cada jogo';
COMMENT ON FUNCTION calcular_roi_setor_jogo IS 'Calcula ROI e classificação de performance por setor';
COMMENT ON FUNCTION comparar_jogo_com_media IS 'Compara métricas do jogo com a média histórica de outros jogos';