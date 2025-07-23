-- =====================================================
-- CONFIGURAÇÃO COM DADOS REAIS - SUAS VIAGENS
-- =====================================================

-- =====================================================
-- PASSO 1: ENCONTRAR SUAS VIAGENS EXISTENTES
-- =====================================================

-- Listar suas viagens mais recentes
SELECT 
    id,
    adversario,
    data_jogo,
    created_at,
    -- Contar passageiros
    (SELECT COUNT(*) FROM viagem_passageiros WHERE viagem_id = v.id) as total_passageiros,
    -- Calcular receita de passageiros
    (SELECT COALESCE(SUM(valor - COALESCE(desconto, 0)), 0) FROM viagem_passageiros WHERE viagem_id = v.id) as receita_passageiros
FROM viagens v
ORDER BY data_jogo DESC
LIMIT 10;

-- =====================================================
-- PASSO 2: ESCOLHER UMA VIAGEM E INSERIR DADOS
-- =====================================================

-- Copie o ID de uma viagem da query acima e cole abaixo
-- Exemplo: se o ID for '123e4567-e89b-12d3-a456-426614174000'

-- SUBSTITUA ESTE ID PELO ID REAL DA SUA VIAGEM:
\set viagem_id '123e4567-e89b-12d3-a456-426614174000'

-- OU use este método mais simples:
-- Pegue a viagem mais recente automaticamente
DO $$
DECLARE
    viagem_id_real UUID;
    viagem_nome TEXT;
BEGIN
    -- Pegar a viagem mais recente
    SELECT id, adversario INTO viagem_id_real, viagem_nome
    FROM viagens 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RAISE NOTICE 'Usando viagem: % (ID: %)', viagem_nome, viagem_id_real;
    
    -- Inserir receitas extras para esta viagem
    INSERT INTO viagem_receitas (viagem_id, descricao, categoria, valor, forma_pagamento, data_recebimento, observacoes) VALUES
    (viagem_id_real, 'Patrocínio Loja Rubro-Negra', 'patrocinio', 1200.00, 'pix', CURRENT_DATE - INTERVAL '5 days', 'Patrocínio para a viagem'),
    (viagem_id_real, 'Venda de Camisetas', 'vendas', 350.00, 'dinheiro', CURRENT_DATE - INTERVAL '3 days', 'Vendas durante a viagem'),
    (viagem_id_real, 'Passeio Cristo Redentor', 'extras', 600.00, 'cartao', CURRENT_DATE - INTERVAL '2 days', 'Passeio opcional');
    
    -- Inserir despesas para esta viagem
    INSERT INTO viagem_despesas (viagem_id, fornecedor, categoria, subcategoria, valor, forma_pagamento, data_despesa, observacoes) VALUES
    (viagem_id_real, 'Posto Ipiranga', 'transporte', 'combustivel', 750.00, 'cartao', CURRENT_DATE - INTERVAL '4 days', 'Combustível ida e volta'),
    (viagem_id_real, 'Hotel Centro RJ', 'hospedagem', 'hotel', 1800.00, 'transferencia', CURRENT_DATE - INTERVAL '3 days', 'Hospedagem do grupo'),
    (viagem_id_real, 'Restaurante Copacabana', 'alimentacao', 'almoco', 650.00, 'pix', CURRENT_DATE - INTERVAL '2 days', 'Almoço coletivo'),
    (viagem_id_real, 'Ingressos Maracanã', 'ingressos', 'estadio', 2400.00, 'transferencia', CURRENT_DATE - INTERVAL '1 day', 'Ingressos do jogo'),
    (viagem_id_real, 'Carlos - Motorista', 'pessoal', 'motorista', 500.00, 'pix', CURRENT_DATE, 'Pagamento motorista');
    
    RAISE NOTICE 'Dados financeiros inseridos com sucesso!';
END $$;

-- =====================================================
-- PASSO 3: VERIFICAR OS DADOS INSERIDOS
-- =====================================================

-- Ver resumo da viagem com dados financeiros
SELECT 
    v.adversario,
    v.data_jogo,
    
    -- Receitas
    COALESCE((SELECT SUM(valor - COALESCE(desconto, 0)) FROM viagem_passageiros WHERE viagem_id = v.id), 0) as receitas_passageiros,
    COALESCE((SELECT SUM(valor) FROM viagem_receitas WHERE viagem_id = v.id AND status = 'recebido'), 0) as receitas_extras,
    
    -- Total receitas
    COALESCE((SELECT SUM(valor - COALESCE(desconto, 0)) FROM viagem_passageiros WHERE viagem_id = v.id), 0) + 
    COALESCE((SELECT SUM(valor) FROM viagem_receitas WHERE viagem_id = v.id AND status = 'recebido'), 0) as total_receitas,
    
    -- Despesas
    COALESCE((SELECT SUM(valor) FROM viagem_despesas WHERE viagem_id = v.id AND status = 'pago'), 0) as total_despesas,
    
    -- Lucro
    (COALESCE((SELECT SUM(valor - COALESCE(desconto, 0)) FROM viagem_passageiros WHERE viagem_id = v.id), 0) + 
     COALESCE((SELECT SUM(valor) FROM viagem_receitas WHERE viagem_id = v.id AND status = 'recebido'), 0)) - 
    COALESCE((SELECT SUM(valor) FROM viagem_despesas WHERE viagem_id = v.id AND status = 'pago'), 0) as lucro_liquido,
    
    -- Passageiros
    (SELECT COUNT(*) FROM viagem_passageiros WHERE viagem_id = v.id) as total_passageiros
    
FROM viagens v
ORDER BY v.created_at DESC
LIMIT 5;

-- =====================================================
-- PASSO 4: TESTAR INTEGRAÇÃO COM SISTEMA GERAL
-- =====================================================

-- Esta query simula o que o hook useFinanceiroGeral faz
SELECT 
    'RESUMO GERAL' as tipo,
    SUM(receitas) as total_receitas,
    SUM(despesas) as total_despesas,
    SUM(receitas) - SUM(despesas) as lucro_liquido,
    CASE 
        WHEN SUM(receitas) > 0 THEN ROUND(((SUM(receitas) - SUM(despesas)) / SUM(receitas)) * 100, 2)
        ELSE 0 
    END as margem_percentual
FROM (
    -- Receitas de passageiros
    SELECT 
        COALESCE(SUM(valor - COALESCE(desconto, 0)), 0) as receitas,
        0 as despesas
    FROM viagem_passageiros vp
    JOIN viagens v ON vp.viagem_id = v.id
    WHERE v.data_jogo >= CURRENT_DATE - INTERVAL '30 days'
    
    UNION ALL
    
    -- Receitas extras
    SELECT 
        COALESCE(SUM(valor), 0) as receitas,
        0 as despesas
    FROM viagem_receitas vr
    JOIN viagens v ON vr.viagem_id = v.id
    WHERE v.data_jogo >= CURRENT_DATE - INTERVAL '30 days'
    AND vr.status = 'recebido'
    
    UNION ALL
    
    -- Despesas
    SELECT 
        0 as receitas,
        COALESCE(SUM(valor), 0) as despesas
    FROM viagem_despesas vd
    JOIN viagens v ON vd.viagem_id = v.id
    WHERE v.data_jogo >= CURRENT_DATE - INTERVAL '30 days'
    AND vd.status = 'pago'
) totais;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================

/*
COMO USAR:

1. Execute a primeira query para ver suas viagens
2. Execute o bloco DO $$ para inserir dados na viagem mais recente
3. Execute as queries de verificação
4. Acesse o sistema web e vá em "Financeiro Geral"
5. Os dados aparecerão automaticamente!

PARA ADICIONAR MAIS DADOS:
- Use o formulário web na aba "Financeiro" de cada viagem
- Ou execute INSERTs manuais substituindo o viagem_id

CATEGORIAS DISPONÍVEIS:
Receitas: 'passageiro', 'patrocinio', 'vendas', 'extras'
Despesas: 'transporte', 'hospedagem', 'alimentacao', 'ingressos', 'pessoal', 'administrativo'
*/