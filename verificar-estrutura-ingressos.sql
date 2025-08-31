-- SQL para verificar estrutura da tabela ingressos e dados para integração com Financeiro Geral
-- Execute este SQL no Supabase para verificar se os ingressos estão implementados

-- 1. Verificar se a tabela ingressos existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'ingressos' 
AND table_schema = 'public';

-- 2. Se existir, mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ingressos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela ingressos
SELECT 
    COUNT(*) as total_ingressos,
    COUNT(CASE WHEN situacao_financeira = 'pago' THEN 1 END) as ingressos_pagos,
    COUNT(CASE WHEN situacao_financeira = 'pendente' THEN 1 END) as ingressos_pendentes,
    SUM(valor_final) as receita_total_ingressos,
    SUM(CASE WHEN situacao_financeira = 'pago' THEN valor_final ELSE 0 END) as receita_paga,
    SUM(CASE WHEN situacao_financeira = 'pendente' THEN valor_final ELSE 0 END) as receita_pendente
FROM ingressos;

-- 4. Verificar se existe tabela de histórico de pagamentos de ingressos
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'historico_pagamentos_ingressos' 
AND table_schema = 'public';

-- 5. Se existir, verificar dados de pagamentos
SELECT 
    COUNT(*) as total_pagamentos,
    SUM(valor_pago) as total_valor_pago,
    MIN(data_pagamento) as primeiro_pagamento,
    MAX(data_pagamento) as ultimo_pagamento
FROM historico_pagamentos_ingressos;

-- 6. Verificar ingressos por período (últimos 3 meses)
SELECT 
    DATE_TRUNC('month', jogo_data) as mes,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_mes,
    SUM(preco_custo) as custo_mes,
    SUM(lucro) as lucro_mes
FROM ingressos 
WHERE jogo_data >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY DATE_TRUNC('month', jogo_data)
ORDER BY mes DESC;

-- 7. Verificar se ingressos estão vinculados a viagens
SELECT 
    COUNT(*) as total_ingressos,
    COUNT(viagem_id) as ingressos_com_viagem,
    COUNT(*) - COUNT(viagem_id) as ingressos_sem_viagem
FROM ingressos;

-- 8. Verificar receitas de ingressos por viagem (se houver vinculação)
SELECT 
    v.adversario,
    v.data_jogo,
    COUNT(i.id) as total_ingressos,
    SUM(i.valor_final) as receita_ingressos,
    SUM(i.preco_custo) as custo_ingressos,
    SUM(i.lucro) as lucro_ingressos
FROM viagens v
LEFT JOIN ingressos i ON v.id = i.viagem_id
WHERE i.id IS NOT NULL
GROUP BY v.id, v.adversario, v.data_jogo
ORDER BY v.data_jogo DESC
LIMIT 10;

-- 9. Verificar formas de pagamento mais usadas
SELECT 
    forma_pagamento,
    COUNT(*) as quantidade,
    SUM(valor_pago) as total_valor
FROM historico_pagamentos_ingressos
GROUP BY forma_pagamento
ORDER BY total_valor DESC;

-- 10. Verificar adversários com mais ingressos vendidos
SELECT 
    adversario,
    COUNT(*) as total_ingressos,
    SUM(valor_final) as receita_total,
    AVG(valor_final) as preco_medio
FROM ingressos
GROUP BY adversario
ORDER BY receita_total DESC
LIMIT 10;