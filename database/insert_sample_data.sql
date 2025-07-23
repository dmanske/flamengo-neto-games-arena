-- =====================================================
-- DADOS DE EXEMPLO - SISTEMA FINANCEIRO
-- =====================================================
-- Execute após criar as tabelas para testar a integração

-- =====================================================
-- 1. INSERIR RECEITAS DE EXEMPLO
-- =====================================================

-- Primeiro, vamos buscar um ID de viagem existente
-- (substitua pelo ID real de uma viagem do seu sistema)

-- Exemplo de receitas extras para uma viagem
INSERT INTO viagem_receitas (viagem_id, descricao, categoria, valor, forma_pagamento, data_recebimento, observacoes) VALUES
-- Substitua 'SEU_VIAGEM_ID_AQUI' pelo ID real de uma viagem
('SEU_VIAGEM_ID_AQUI', 'Patrocínio Empresa ABC', 'patrocinio', 1500.00, 'transferencia', '2025-01-15', 'Patrocínio para viagem contra o Vasco'),
('SEU_VIAGEM_ID_AQUI', 'Venda de Camisetas Personalizadas', 'vendas', 450.00, 'pix', '2025-01-16', 'Vendas durante a viagem'),
('SEU_VIAGEM_ID_AQUI', 'Passeio Extra - Cristo Redentor', 'extras', 800.00, 'cartao', '2025-01-17', 'Passeio opcional para 20 passageiros'),
('SEU_VIAGEM_ID_AQUI', 'Patrocínio Loja de Esportes XYZ', 'patrocinio', 1000.00, 'pix', '2025-01-18', 'Segundo patrocinador da viagem');

-- =====================================================
-- 2. INSERIR DESPESAS DE EXEMPLO
-- =====================================================

INSERT INTO viagem_despesas (viagem_id, fornecedor, categoria, subcategoria, valor, forma_pagamento, data_despesa, observacoes) VALUES
-- Substitua 'SEU_VIAGEM_ID_AQUI' pelo ID real de uma viagem
('SEU_VIAGEM_ID_AQUI', 'Posto Shell BR-101', 'transporte', 'combustivel', 850.00, 'cartao', '2025-01-15', 'Abastecimento ida'),
('SEU_VIAGEM_ID_AQUI', 'Pedágio Rio-Santos', 'transporte', 'pedagio', 120.00, 'dinheiro', '2025-01-15', 'Pedágios da viagem'),
('SEU_VIAGEM_ID_AQUI', 'Hotel Copacabana Palace', 'hospedagem', 'hotel', 2400.00, 'transferencia', '2025-01-16', 'Hospedagem para 40 passageiros'),
('SEU_VIAGEM_ID_AQUI', 'Restaurante Garota de Ipanema', 'alimentacao', 'almoco', 800.00, 'pix', '2025-01-16', 'Almoço do grupo'),
('SEU_VIAGEM_ID_AQUI', 'Maracanã - Ingressos', 'ingressos', 'estadio', 3200.00, 'transferencia', '2025-01-17', 'Ingressos setor especial'),
('SEU_VIAGEM_ID_AQUI', 'João Silva - Motorista', 'pessoal', 'motorista', 600.00, 'pix', '2025-01-17', 'Diária do motorista'),
('SEU_VIAGEM_ID_AQUI', 'Maria Santos - Guia', 'pessoal', 'guia', 400.00, 'pix', '2025-01-17', 'Guia turística local'),
('SEU_VIAGEM_ID_AQUI', 'Seguro Viagem Total', 'administrativo', 'seguro', 300.00, 'boleto', '2025-01-14', 'Seguro para todos os passageiros');

-- =====================================================
-- 3. INSERIR ORÇAMENTO DE EXEMPLO
-- =====================================================

INSERT INTO viagem_orcamento (viagem_id, categoria, subcategoria, valor_orcado, valor_realizado, observacoes) VALUES
-- Substitua 'SEU_VIAGEM_ID_AQUI' pelo ID real de uma viagem
('SEU_VIAGEM_ID_AQUI', 'transporte', 'combustivel', 1000.00, 850.00, 'Economia no combustível'),
('SEU_VIAGEM_ID_AQUI', 'transporte', 'pedagio', 150.00, 120.00, 'Menos pedágios que o esperado'),
('SEU_VIAGEM_ID_AQUI', 'hospedagem', 'hotel', 2500.00, 2400.00, 'Desconto negociado'),
('SEU_VIAGEM_ID_AQUI', 'alimentacao', 'almoco', 900.00, 800.00, 'Cardápio mais econômico'),
('SEU_VIAGEM_ID_AQUI', 'ingressos', 'estadio', 3500.00, 3200.00, 'Desconto para grupo'),
('SEU_VIAGEM_ID_AQUI', 'pessoal', 'motorista', 600.00, 600.00, 'Conforme orçado'),
('SEU_VIAGEM_ID_AQUI', 'pessoal', 'guia', 500.00, 400.00, 'Guia com desconto'),
('SEU_VIAGEM_ID_AQUI', 'administrativo', 'seguro', 300.00, 300.00, 'Conforme orçado');

-- =====================================================
-- 4. SCRIPT PARA ENCONTRAR ID DE VIAGEM REAL
-- =====================================================

-- Execute este comando primeiro para encontrar um ID de viagem:
SELECT id, adversario, data_jogo 
FROM viagens 
ORDER BY created_at DESC 
LIMIT 5;

-- Copie um dos IDs retornados e substitua 'SEU_VIAGEM_ID_AQUI' nos INSERTs acima

-- =====================================================
-- 5. VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Verificar receitas inseridas
SELECT 
    vr.descricao,
    vr.categoria,
    vr.valor,
    v.adversario
FROM viagem_receitas vr
JOIN viagens v ON vr.viagem_id = v.id
ORDER BY vr.created_at DESC;

-- Verificar despesas inseridas
SELECT 
    vd.fornecedor,
    vd.categoria,
    vd.subcategoria,
    vd.valor,
    v.adversario
FROM viagem_despesas vd
JOIN viagens v ON vd.viagem_id = v.id
ORDER BY vd.created_at DESC;

-- Verificar orçamento
SELECT 
    vo.categoria,
    vo.subcategoria,
    vo.valor_orcado,
    vo.valor_realizado,
    (vo.valor_orcado - vo.valor_realizado) as economia,
    v.adversario
FROM viagem_orcamento vo
JOIN viagens v ON vo.viagem_id = v.id
ORDER BY vo.categoria;

-- =====================================================
-- 6. RESUMO FINANCEIRO DA VIAGEM
-- =====================================================

-- Query para ver o resumo completo de uma viagem
SELECT 
    v.adversario,
    v.data_jogo,
    
    -- Receitas de passageiros
    COALESCE(SUM(DISTINCT vp.valor - COALESCE(vp.desconto, 0)), 0) as receitas_passageiros,
    
    -- Receitas extras
    COALESCE(SUM(DISTINCT vr.valor), 0) as receitas_extras,
    
    -- Total receitas
    COALESCE(SUM(DISTINCT vp.valor - COALESCE(vp.desconto, 0)), 0) + 
    COALESCE(SUM(DISTINCT vr.valor), 0) as total_receitas,
    
    -- Total despesas
    COALESCE(SUM(DISTINCT vd.valor), 0) as total_despesas,
    
    -- Lucro
    (COALESCE(SUM(DISTINCT vp.valor - COALESCE(vp.desconto, 0)), 0) + 
     COALESCE(SUM(DISTINCT vr.valor), 0)) - 
    COALESCE(SUM(DISTINCT vd.valor), 0) as lucro_liquido

FROM viagens v
LEFT JOIN viagem_passageiros vp ON v.id = vp.viagem_id
LEFT JOIN viagem_receitas vr ON v.id = vr.viagem_id AND vr.status = 'recebido'
LEFT JOIN viagem_despesas vd ON v.id = vd.viagem_id AND vd.status = 'pago'
GROUP BY v.id, v.adversario, v.data_jogo
ORDER BY v.data_jogo DESC;

-- =====================================================
-- DADOS DE EXEMPLO PRONTOS! ✅
-- =====================================================
-- 1. Execute a query para encontrar um ID de viagem
-- 2. Substitua 'SEU_VIAGEM_ID_AQUI' pelo ID real
-- 3. Execute os INSERTs
-- 4. Teste a integração no sistema