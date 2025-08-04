-- Script para deletar uma inscrição específica do Daniel Manske
-- Mais seguro que deletar todas de uma vez

-- 1. Primeiro, veja todas as inscrições disponíveis
SELECT 
    vp.id as inscricao_id,
    c.nome as cliente_nome,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.status_pagamento,
    vp.created_at as data_inscricao
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE c.nome ILIKE '%daniel%' AND c.nome ILIKE '%manske%'
ORDER BY vp.created_at DESC;

-- 2. Para deletar uma inscrição específica, substitua 'INSCRICAO_ID_AQUI' pelo ID real
-- Exemplo: se o ID da inscrição for '123e4567-e89b-12d3-a456-426614174000'

-- DESCOMENTE E SUBSTITUA O ID ABAIXO:
-- 
-- BEGIN;
-- 
-- -- Deletar parcelas da inscrição específica
-- DELETE FROM viagem_passageiros_parcelas 
-- WHERE viagem_passageiro_id = 'INSCRICAO_ID_AQUI';
-- 
-- -- Deletar a inscrição específica
-- DELETE FROM viagem_passageiros 
-- WHERE id = 'INSCRICAO_ID_AQUI';
-- 
-- COMMIT;

-- EXEMPLO DE USO:
-- Se você quer deletar a inscrição com ID 'abc123', faça assim:
-- 
-- BEGIN;
-- DELETE FROM viagem_passageiros_parcelas WHERE viagem_passageiro_id = 'abc123';
-- DELETE FROM viagem_passageiros WHERE id = 'abc123';
-- COMMIT;