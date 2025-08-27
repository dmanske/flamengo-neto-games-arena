    -- Script para identificar passageiros com status incorreto após deleção de parcelas

    -- 1. Buscar passageiros que podem ter status incorreto
    SELECT 
        vp.id as passageiro_id,
        c.nome,
        vp.status_pagamento,
        vp.valor,
        vp.desconto,
        (vp.valor - COALESCE(vp.desconto, 0)) as valor_viagem,
        vp.pago_por_credito,
        vp.valor_credito_utilizado,
        -- Calcular total pago em parcelas
        COALESCE(parcelas.total_parcelas, 0) as total_parcelas,
        -- Calcular valor dos passeios
        COALESCE(passeios.valor_passeios, 0) as valor_passeios,
        -- Valor total devido
        (vp.valor - COALESCE(vp.desconto, 0)) + COALESCE(passeios.valor_passeios, 0) as valor_total_devido,
        -- Total pago (parcelas + crédito)
        COALESCE(parcelas.total_parcelas, 0) + 
        CASE WHEN vp.pago_por_credito THEN COALESCE(vp.valor_credito_utilizado, 0) ELSE 0 END as total_pago,
        v.adversario
    FROM viagem_passageiros vp
    JOIN clientes c ON c.id = vp.cliente_id
    JOIN viagens v ON v.id = vp.viagem_id
    LEFT JOIN (
        SELECT 
            viagem_passageiro_id,
            SUM(valor_parcela) as total_parcelas
        FROM viagem_passageiros_parcelas
        GROUP BY viagem_passageiro_id
    ) parcelas ON parcelas.viagem_passageiro_id = vp.id
    LEFT JOIN (
        SELECT 
            viagem_passageiro_id,
            SUM(valor_cobrado) as valor_passeios
        FROM passageiro_passeios
        GROUP BY viagem_passageiro_id
    ) passeios ON passeios.viagem_passageiro_id = vp.id
    WHERE vp.status_pagamento = 'Pago Completo'
    ORDER BY c.nome;

    -- 2. Identificar casos específicos onde o status pode estar errado
    SELECT 
        '🚨 POSSÍVEL PROBLEMA:' as alerta,
        c.nome,
        vp.status_pagamento,
        'Total Pago: R$ ' || (
            COALESCE(parcelas.total_parcelas, 0) + 
            CASE WHEN vp.pago_por_credito THEN COALESCE(vp.valor_credito_utilizado, 0) ELSE 0 END
        ) as total_pago,
        'Total Devido: R$ ' || (
            (vp.valor - COALESCE(vp.desconto, 0)) + COALESCE(passeios.valor_passeios, 0)
        ) as total_devido
    FROM viagem_passageiros vp
    JOIN clientes c ON c.id = vp.cliente_id
    LEFT JOIN (
        SELECT 
            viagem_passageiro_id,
            SUM(valor_parcela) as total_parcelas
        FROM viagem_passageiros_parcelas
        GROUP BY viagem_passageiro_id
    ) parcelas ON parcelas.viagem_passageiro_id = vp.id
    LEFT JOIN (
        SELECT 
            viagem_passageiro_id,
            SUM(valor_cobrado) as valor_passeios
        FROM passageiro_passeios
        GROUP BY viagem_passageiro_id
    ) passeios ON passeios.viagem_passageiro_id = vp.id
    WHERE vp.status_pagamento = 'Pago Completo'
    AND (
        COALESCE(parcelas.total_parcelas, 0) + 
        CASE WHEN vp.pago_por_credito THEN COALESCE(vp.valor_credito_utilizado, 0) ELSE 0 END
    ) < (
        (vp.valor - COALESCE(vp.desconto, 0)) + COALESCE(passeios.valor_passeios, 0)
    )
    ORDER BY c.nome;