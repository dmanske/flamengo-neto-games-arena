-- =====================================================
-- ATUALIZAÇÃO: Custos reais dos passeios
-- DATA: 30/08/2025
-- OBJETIVO: Definir custos reais = preço de venda (exceto Museu do Flamengo)
-- =====================================================

-- 1. Atualizar todos os passeios pagos: custo = preço de venda
UPDATE passeios 
SET custo_operacional = valor 
WHERE categoria = 'pago';

-- 2. Exceção: Museu do Flamengo tem custo específico de R$ 55
UPDATE passeios 
SET custo_operacional = 55.00 
WHERE nome = 'Museu do Flamengo' AND categoria = 'pago';

-- 3. Verificar os resultados após atualização
SELECT 
    nome,
    valor as preco_venda,
    custo_operacional,
    (valor - custo_operacional) as lucro_unitario,
    CASE 
        WHEN valor > 0 THEN ROUND(((valor - custo_operacional) / valor * 100), 2)
        ELSE 0 
    END as margem_percentual,
    CASE 
        WHEN (valor - custo_operacional) < 0 THEN '🔴 PREJUÍZO'
        WHEN valor > 0 AND ((valor - custo_operacional) / valor * 100) < 20 THEN '🟡 MARGEM BAIXA'
        ELSE '🟢 MARGEM BOA'
    END as status_margem
FROM passeios 
WHERE categoria = 'pago'
ORDER BY nome;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Todos os passeios: custo = preço de venda (margem 0%)
-- - Museu do Flamengo: custo = R$ 55 (margem = (90-55)/90 = 38.89%)
-- - Apenas Museu do Flamengo terá lucro positivo
-- =====================================================

-- 4. Resumo final dos custos
SELECT 
    COUNT(*) as total_passeios_pagos,
    AVG(CASE WHEN valor > 0 THEN ((valor - custo_operacional) / valor * 100) ELSE 0 END) as margem_media,
    COUNT(CASE WHEN (valor - custo_operacional) < 0 THEN 1 END) as passeios_com_prejuizo,
    COUNT(CASE WHEN valor > 0 AND ((valor - custo_operacional) / valor * 100) < 20 AND (valor - custo_operacional) >= 0 THEN 1 END) as passeios_margem_baixa,
    COUNT(CASE WHEN valor > 0 AND ((valor - custo_operacional) / valor * 100) >= 20 THEN 1 END) as passeios_margem_boa
FROM passeios 
WHERE categoria = 'pago';

-- =====================================================
-- RESUMO ESPERADO:
-- - Total: 12 passeios pagos
-- - Margem Média: ~3.24% (apenas Museu do Flamengo com lucro)
-- - Prejuízos: 0
-- - Margem Baixa: 11 passeios (0% de margem)
-- - Margem Boa: 1 passeio (Museu do Flamengo com 38.89%)
-- =====================================================