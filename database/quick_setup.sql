-- =====================================================
-- SETUP RÁPIDO - SUAS VIAGENS REAIS
-- =====================================================
-- Execute este script para começar a usar AGORA!

-- 1️⃣ PRIMEIRO: Veja suas viagens
SELECT 
    id,
    adversario,
    data_jogo,
    (SELECT COUNT(*) FROM viagem_passageiros WHERE viagem_id = v.id) as passageiros
FROM viagens v
ORDER BY data_jogo DESC
LIMIT 5;

-- 2️⃣ SEGUNDO: Copie um ID da query acima e cole aqui
-- SUBSTITUA pelo ID real da sua viagem:
-- Exemplo: '123e4567-e89b-12d3-a456-426614174000'

-- 3️⃣ TERCEIRO: Execute estes INSERTs com o ID real

-- RECEITAS EXTRAS (substitua o ID):
INSERT INTO viagem_receitas (viagem_id, descricao, categoria, valor, forma_pagamento, data_recebimento) VALUES
('SEU_ID_AQUI', 'Patrocínio Local', 'patrocinio', 1000.00, 'pix', CURRENT_DATE - 1),
('SEU_ID_AQUI', 'Venda Produtos', 'vendas', 300.00, 'dinheiro', CURRENT_DATE);

-- DESPESAS (substitua o ID):
INSERT INTO viagem_despesas (viagem_id, fornecedor, categoria, valor, forma_pagamento, data_despesa) VALUES
('SEU_ID_AQUI', 'Posto Combustível', 'transporte', 800.00, 'cartao', CURRENT_DATE - 2),
('SEU_ID_AQUI', 'Hotel', 'hospedagem', 1500.00, 'transferencia', CURRENT_DATE - 1),
('SEU_ID_AQUI', 'Restaurante', 'alimentacao', 600.00, 'pix', CURRENT_DATE);

-- 4️⃣ QUARTO: Verificar se funcionou
SELECT 
    v.adversario,
    -- Receitas passageiros
    COALESCE((SELECT SUM(valor) FROM viagem_passageiros WHERE viagem_id = v.id), 0) as receitas_passageiros,
    -- Receitas extras
    COALESCE((SELECT SUM(valor) FROM viagem_receitas WHERE viagem_id = v.id), 0) as receitas_extras,
    -- Despesas
    COALESCE((SELECT SUM(valor) FROM viagem_despesas WHERE viagem_id = v.id), 0) as despesas,
    -- Lucro
    COALESCE((SELECT SUM(valor) FROM viagem_passageiros WHERE viagem_id = v.id), 0) + 
    COALESCE((SELECT SUM(valor) FROM viagem_receitas WHERE viagem_id = v.id), 0) - 
    COALESCE((SELECT SUM(valor) FROM viagem_despesas WHERE viagem_id = v.id), 0) as lucro
FROM viagens v
WHERE v.id = 'SEU_ID_AQUI';

-- ✅ PRONTO! Agora acesse o sistema web:
-- 1. Vá para uma viagem → aba "Financeiro"
-- 2. Ou vá para "Financeiro Geral" no menu
-- 3. Os dados aparecerão automaticamente!