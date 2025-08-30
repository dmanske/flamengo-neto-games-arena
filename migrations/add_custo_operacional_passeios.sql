-- =====================================================
-- MIGRAÇÃO: Adicionar campo custo_operacional na tabela passeios
-- DATA: 30/08/2025
-- OBJETIVO: Permitir configuração de custos para cálculo de lucro real
-- =====================================================

-- 1. Adicionar campo custo_operacional na tabela passeios
ALTER TABLE passeios 
ADD COLUMN custo_operacional DECIMAL(10,2) DEFAULT 0 NOT NULL;

-- 2. Adicionar comentário para documentação
COMMENT ON COLUMN passeios.custo_operacional IS 'Custo operacional do passeio (entrada, transporte, guia, etc.) para cálculo de lucro real';

-- 3. Atualizar alguns custos iniciais como exemplo (valores estimados)
-- Você pode ajustar estes valores na interface depois
UPDATE passeios SET custo_operacional = 45.00 WHERE nome = 'Cristo Redentor';
UPDATE passeios SET custo_operacional = 40.00 WHERE nome = 'Pão de Açúcar';
UPDATE passeios SET custo_operacional = 20.00 WHERE nome = 'Museu do Flamengo';
UPDATE passeios SET custo_operacional = 35.00 WHERE nome = 'Aquário';
UPDATE passeios SET custo_operacional = 25.00 WHERE nome = 'Roda-Gigante';
UPDATE passeios SET custo_operacional = 15.00 WHERE nome = 'Museu do Amanhã';
UPDATE passeios SET custo_operacional = 30.00 WHERE nome = 'Tour do Maracanã';
UPDATE passeios SET custo_operacional = 35.00 WHERE nome = 'Rocinha';
UPDATE passeios SET custo_operacional = 30.00 WHERE nome = 'Vidigal';
UPDATE passeios SET custo_operacional = 55.00 WHERE nome = 'Rocinha + Vidigal';
UPDATE passeios SET custo_operacional = 45.00 WHERE nome = 'Tour da Gávea';
UPDATE passeios SET custo_operacional = 25.00 WHERE nome = 'Museu do Mar';

-- 4. Verificar se a migração foi aplicada corretamente
SELECT 
    nome,
    valor as preco_venda,
    custo_operacional,
    (valor - custo_operacional) as lucro_unitario,
    CASE 
        WHEN valor > 0 THEN ROUND(((valor - custo_operacional) / valor * 100), 2)
        ELSE 0 
    END as margem_percentual
FROM passeios 
WHERE categoria = 'pago'
ORDER BY nome;

-- =====================================================
-- RESULTADO ESPERADO:
-- - Campo custo_operacional adicionado com sucesso
-- - Valores iniciais configurados para teste
-- - Query de verificação mostra lucros e margens
-- =====================================================