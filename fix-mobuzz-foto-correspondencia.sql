-- Correção: Problema com foto do ônibus MOBUZZ - MOBUZZ - LEITO MASTER
-- Data: 2025-01-26

-- OPÇÃO 1: Atualizar o tipo_onibus na tabela onibus_images para corresponder ao ônibus
-- (Recomendado se o nome correto é "MOBUZZ - MOBUZZ - LEITO MASTER")
UPDATE onibus_images 
SET tipo_onibus = 'MOBUZZ - MOBUZZ - LEITO MASTER'
WHERE tipo_onibus = 'MOBUZZ - LEITO MASTER';

-- OPÇÃO 2: Atualizar o tipo_onibus na tabela onibus para corresponder à imagem
-- (Use esta se o nome correto é "MOBUZZ - LEITO MASTER")
-- UPDATE onibus 
-- SET tipo_onibus = 'MOBUZZ - LEITO MASTER'
-- WHERE tipo_onibus = 'MOBUZZ - MOBUZZ - LEITO MASTER';

-- Verificar se a correção funcionou
SELECT 
    o.id as onibus_id,
    o.tipo_onibus as onibus_tipo,
    o.empresa as onibus_empresa,
    oi.tipo_onibus as imagem_tipo,
    oi.image_url,
    CASE 
        WHEN o.tipo_onibus = oi.tipo_onibus THEN '✅ MATCH EXATO'
        ELSE '❌ SEM MATCH'
    END as status_match
FROM onibus o
LEFT JOIN onibus_images oi ON o.tipo_onibus = oi.tipo_onibus
WHERE o.tipo_onibus ILIKE '%MOBUZZ%' AND o.tipo_onibus ILIKE '%LEITO%'
ORDER BY o.tipo_onibus;