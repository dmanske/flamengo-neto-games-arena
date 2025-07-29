SELECT 
    c.nome,
    c.telefone,
    vp.setor_maracana,
    vp.status_pagamento,
    vp.valor,
    vp.cidade_embarque,
    vp.gratuito,
    vp.observacoes
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489'
ORDER BY c.nome;