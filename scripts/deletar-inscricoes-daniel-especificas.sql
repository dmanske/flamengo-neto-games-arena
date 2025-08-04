-- Script para deletar inscrições específicas do Daniel Manske
-- IDs: b6236a01-1c66-4e09-b99c-1613502474fc e 034060b9-8c9f-4aa4-9c51-26504edfa4fd

-- Primeiro, vamos verificar as inscrições antes de deletar
SELECT 
    vp.id as inscricao_id,
    c.nome as cliente_nome,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.status_pagamento,
    vp.forma_pagamento,
    vp.created_at as data_inscricao
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE vp.id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Deletar parcelas relacionadas primeiro (devido às foreign keys)
DELETE FROM viagem_passageiros_parcelas 
WHERE viagem_passageiro_id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Deletar relacionamentos de passeios (se existirem)
DELETE FROM passageiro_passeios 
WHERE viagem_passageiro_id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Deletar as inscrições principais
DELETE FROM viagem_passageiros 
WHERE id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Verificar se as inscrições foram deletadas
SELECT 
    vp.id as inscricao_id,
    c.nome as cliente_nome,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.status_pagamento,
    vp.forma_pagamento,
    vp.created_at as data_inscricao
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE vp.id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Se não retornar nenhum resultado, as inscrições foram deletadas com sucesso