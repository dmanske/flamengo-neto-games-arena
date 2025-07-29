-- 🔄 SCRIPT: Copiar Passageiros do Botafogo para o Internacional
-- Baseado nos dados reais do seu banco

-- PASSO 1: Ver as viagens do Internacional disponíveis
SELECT 
    id, 
    adversario, 
    data_jogo, 
    status_viagem,
    capacidade_onibus,
    COUNT(vp.cliente_id) as passageiros_atuais
FROM viagens v
LEFT JOIN viagem_passageiros vp ON v.id = vp.viagem_id
WHERE adversario = 'Internacional'
GROUP BY v.id, v.adversario, v.data_jogo, v.status_viagem, v.capacidade_onibus
ORDER BY data_jogo;

-- PASSO 2: Copiar passageiros do Botafogo para o Internacional
-- ⚠️ Escolha qual viagem do Internacional usar como destino:
-- Opção 1: c19386e6-69b4-4ea9-8eba-d1a434d078ba (13/08 12:00 - Em andamento)
-- Opção 2: 26a1b3cc-4aae-4949-96c8-dad4606bf489 (13/08 21:30 - Aberta)

DO $$
DECLARE
    viagem_origem_uuid UUID := '4b6b1a21-3557-439b-95dd-b495d4dc6b13'; -- Viagem Botafogo
    viagem_destino_uuid UUID := 'c19386e6-69b4-4ea9-8eba-d1a434d078ba'; -- ⚠️ ESCOLHA: Internacional 12:00
    -- viagem_destino_uuid UUID := '26a1b3cc-4aae-4949-96c8-dad4606bf489'; -- ⚠️ OU: Internacional 21:30
    cidade_embarque_padrao TEXT := 'Blumenau'; -- Mesmo padrão das outras
    setor_padrao TEXT := 'Sem ingresso'; -- Padrão do Internacional
    contador INTEGER := 0;
BEGIN
    -- Inserir passageiros na viagem do Internacional
    INSERT INTO viagem_passageiros (
        viagem_id,
        cliente_id,
        setor_maracana,
        status_pagamento,
        valor,
        forma_pagamento,
        desconto,
        onibus_id,
        cidade_embarque,
        observacoes,
        status_presenca,
        is_responsavel_onibus,
        viagem_paga,
        passeios_pagos,
        gratuito,
        created_at
    )
    SELECT 
        viagem_destino_uuid,
        vp.cliente_id,
        setor_padrao,           -- Setor padrão Internacional
        'Pendente',             -- Status padrão
        990.00,                 -- Valor padrão Internacional
        'Pix',                  -- Forma padrão
        0,                      -- Sem desconto
        NULL,                   -- Ônibus será definido depois
        cidade_embarque_padrao, -- Blumenau
        COALESCE(vp.observacoes, '') || 
        CASE 
            WHEN vp.observacoes IS NOT NULL AND vp.observacoes != '' 
            THEN ' | Copiado da viagem Botafogo'
            ELSE 'Copiado da viagem Botafogo'
        END,
        'pendente',             -- Status presença
        false,                  -- Não é responsável
        false,                  -- Viagem não paga
        false,                  -- Passeios não pagos
        false,                  -- Não é gratuito
        NOW()
    FROM viagem_passageiros vp
    WHERE vp.viagem_id = viagem_origem_uuid
    AND NOT EXISTS (
        -- Evitar duplicatas
        SELECT 1 FROM viagem_passageiros vp2 
        WHERE vp2.viagem_id = viagem_destino_uuid 
        AND vp2.cliente_id = vp.cliente_id
    );
    
    GET DIAGNOSTICS contador = ROW_COUNT;
    
    RAISE NOTICE '✅ Copiados % passageiros da viagem Botafogo para Internacional', contador;
END $$;

-- PASSO 3: Verificar resultado
SELECT 
    'BOTAFOGO (origem)' as viagem,
    v.adversario,
    v.data_jogo,
    COUNT(vp.cliente_id) as total_passageiros
FROM viagens v
JOIN viagem_passageiros vp ON v.id = vp.viagem_id
WHERE v.id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13'
GROUP BY v.adversario, v.data_jogo

UNION ALL

SELECT 
    'INTERNACIONAL (destino)' as viagem,
    v.adversario,
    v.data_jogo,
    COUNT(vp.cliente_id) as total_passageiros
FROM viagens v
JOIN viagem_passageiros vp ON v.id = vp.viagem_id
WHERE v.id = 'c19386e6-69b4-4ea9-8eba-d1a434d078ba' -- ⚠️ Ajuste se escolher a outra viagem
GROUP BY v.adversario, v.data_jogo;