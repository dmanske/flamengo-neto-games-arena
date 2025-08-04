-- ⚠️ SCRIPT DE DELEÇÃO ESPECÍFICA ⚠️
-- Deletar inscrições específicas do Daniel Manske
-- IDs: b6236a01-1c66-4e09-b99c-1613502474fc e 034060b9-8c9f-4aa4-9c51-26504edfa4fd

-- Começar uma transação para poder fazer rollback se necessário
BEGIN;

-- 1. Verificar as inscrições que serão deletadas
SELECT 'INSCRIÇÕES QUE SERÃO DELETADAS:' as aviso;
SELECT 
    vp.id as inscricao_id,
    c.nome as cliente_nome,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.status_pagamento,
    vp.forma_pagamento
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE vp.id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- 2. Verificar parcelas que serão deletadas
SELECT 'PARCELAS QUE SERÃO DELETADAS:' as aviso;
SELECT 
    vpp.id as parcela_id,
    vpp.numero_parcela,
    vpp.valor_parcela,
    vpp.status,
    c.nome as cliente_nome,
    v.adversario
FROM viagem_passageiros_parcelas vpp
JOIN viagem_passageiros vp ON vpp.viagem_passageiro_id = vp.id
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
WHERE vpp.viagem_passageiro_id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- 3. EXECUTAR DELEÇÕES (descomente as linhas abaixo quando tiver certeza)

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

-- 4. Verificar se as inscrições foram deletadas (deve retornar 0 linhas)
SELECT 'VERIFICAÇÃO FINAL:' as aviso;
SELECT COUNT(*) as inscricoes_restantes
FROM viagem_passageiros 
WHERE id IN (
    'b6236a01-1c66-4e09-b99c-1613502474fc',
    '034060b9-8c9f-4aa4-9c51-26504edfa4fd'
);

-- Confirmar as mudanças
COMMIT;

-- Se algo der errado, você pode fazer ROLLBACK em vez de COMMIT