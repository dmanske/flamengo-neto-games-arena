-- 🔍 INVESTIGAR: Por que só o Virginio aparece na viagem 21:30

-- Contar total de passageiros na viagem 21:30
SELECT 
    'Total passageiros viagem 21:30' as info,
    COUNT(*) as quantidade
FROM viagem_passageiros 
WHERE viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489';

-- Ver TODOS os registros da viagem 21:30 (incluindo possíveis problemas)
SELECT 
    vp.id,
    vp.cliente_id,
    c.nome,
    vp.setor_maracana,
    vp.status_pagamento,
    vp.observacoes,
    vp.created_at
FROM viagem_passageiros vp
LEFT JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489'
ORDER BY vp.created_at;

-- Verificar se os clientes ainda existem na tabela clientes
SELECT 
    'Clientes órfãos' as problema,
    COUNT(*) as quantidade
FROM viagem_passageiros vp
LEFT JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489'
AND c.id IS NULL;