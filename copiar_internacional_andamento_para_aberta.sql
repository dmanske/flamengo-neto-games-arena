INSERT INTO viagem_passageiros (
    viagem_id,
    cliente_id,
    setor_maracana,
    status_pagamento,
    valor,
    forma_pagamento,
    desconto,
    cidade_embarque,
    status_presenca,
    is_responsavel_onibus,
    viagem_paga,
    passeios_pagos,
    gratuito,
    created_at
)
SELECT 
    '26a1b3cc-4aae-4949-96c8-dad4606bf489',
    vp.cliente_id,
    vp.setor_maracana,
    'Pendente',
    vp.valor,
    vp.forma_pagamento,
    vp.desconto,
    vp.cidade_embarque,
    'pendente',
    false,
    false,
    false,
    vp.gratuito,
    NOW()
FROM viagem_passageiros vp
WHERE vp.viagem_id = 'c19386e6-69b4-4ea9-8eba-d1a434d078ba'
AND NOT EXISTS (
    SELECT 1 FROM viagem_passageiros vp2 
    WHERE vp2.viagem_id = '26a1b3cc-4aae-4949-96c8-dad4606bf489' 
    AND vp2.cliente_id = vp.cliente_id
);