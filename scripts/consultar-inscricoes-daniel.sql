-- Script para consultar inscrições de viagem do Daniel Manske
-- Execute este primeiro para ver os dados antes de deletar

-- 1. Buscar o ID do cliente Daniel Manske
SELECT 
    id,
    nome,
    email,
    telefone,
    created_at
FROM clientes 
WHERE nome ILIKE '%daniel%' AND nome ILIKE '%manske%';

-- 2. Ver todas as inscrições de viagem do Daniel Manske
SELECT 
    vp.id as inscricao_id,
    c.nome as cliente_nome,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.status_pagamento,
    vp.forma_pagamento,
    vp.created_at as data_inscricao,
    vo.tipo_onibus,
    vo.empresa as empresa_onibus
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
LEFT JOIN viagem_onibus vo ON vp.onibus_id = vo.id
WHERE c.nome ILIKE '%daniel%' AND c.nome ILIKE '%manske%'
ORDER BY vp.created_at DESC;

-- 3. Ver parcelas relacionadas às inscrições do Daniel
SELECT 
    vpp.id as parcela_id,
    c.nome as cliente_nome,
    v.adversario,
    vpp.numero_parcela,
    vpp.total_parcelas,
    vpp.valor_parcela,
    vpp.data_vencimento,
    vpp.status,
    vpp.tipo_parcelamento
FROM viagem_passageiros_parcelas vpp
JOIN viagem_passageiros vp ON vpp.viagem_passageiro_id = vp.id
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE c.nome ILIKE '%daniel%' AND c.nome ILIKE '%manske%'
ORDER BY v.data_jogo DESC, vpp.numero_parcela;

-- 4. Contar total de inscrições
SELECT 
    COUNT(*) as total_inscricoes,
    SUM(vp.valor) as valor_total
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
WHERE c.nome ILIKE '%daniel%' AND c.nome ILIKE '%manske%';