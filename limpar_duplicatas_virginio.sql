-- 🧹 LIMPAR: Duplicata do Virginio na viagem Internacional 21:30

-- Ver as duas entradas do Virginio
SELECT 
    id,
    cliente_id,
    setor_maracana,
    status_pagamento,
    valor,
    gratuito,
    observacoes,
    created_at
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489'
AND c.nome = 'Virginio do Nascimento Neto'
ORDER BY created_at;

-- Deletar a entrada duplicada (a mais recente com observação)
DELETE FROM viagem_passageiros 
WHERE viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489'
AND cliente_id IN (
    SELECT c.id FROM clientes c 
    WHERE c.nome = 'Virginio do Nascimento Neto'
)
AND observacoes IS NULL; -- Manter a original sem observação