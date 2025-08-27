-- Debug: Investigar problema com foto do ônibus MOBUZZ - MOBUZZ - LEITO MASTER
-- Data: 2025-01-26

-- 1. Verificar todos os ônibus MOBUZZ cadastrados
SELECT 
    id,
    tipo_onibus,
    empresa,
    numero_identificacao,
    created_at
FROM onibus 
WHERE tipo_onibus ILIKE '%MOBUZZ%' OR empresa ILIKE '%MOBUZZ%'
ORDER BY created_at DESC;

-- 2. Verificar imagens disponíveis na tabela onibus_images
SELECT 
    id,
    tipo_onibus,
    empresa,
    image_url,
    onibus_id,
    created_at
FROM onibus_images 
WHERE tipo_onibus ILIKE '%MOBUZZ%' OR empresa ILIKE '%MOBUZZ%'
ORDER BY created_at DESC;

-- 3. Verificar se existe alguma imagem para "LEITO MASTER"
SELECT 
    id,
    tipo_onibus,
    empresa,
    image_url,
    onibus_id,
    created_at
FROM onibus_images 
WHERE tipo_onibus ILIKE '%LEITO%' OR tipo_onibus ILIKE '%MASTER%'
ORDER BY created_at DESC;

-- 4. Listar todos os tipos de ônibus únicos que têm imagem
SELECT DISTINCT 
    tipo_onibus,
    COUNT(*) as quantidade_imagens
FROM onibus_images 
GROUP BY tipo_onibus
ORDER BY tipo_onibus;

-- 5. Verificar se o problema é na correspondência exata do nome
-- Buscar ônibus com nome similar mas não exato
SELECT 
    o.id as onibus_id,
    o.tipo_onibus as onibus_tipo,
    o.empresa as onibus_empresa,
    oi.tipo_onibus as imagem_tipo,
    oi.image_url,
    CASE 
        WHEN o.tipo_onibus = oi.tipo_onibus THEN 'MATCH EXATO'
        ELSE 'SEM MATCH'
    END as status_match
FROM onibus o
LEFT JOIN onibus_images oi ON o.tipo_onibus = oi.tipo_onibus
WHERE o.tipo_onibus ILIKE '%MOBUZZ%' OR o.tipo_onibus ILIKE '%LEITO%'
ORDER BY o.tipo_onibus;

-- 6. Verificar todas as imagens disponíveis (para comparação)
SELECT 
    tipo_onibus,
    image_url,
    created_at
FROM onibus_images 
ORDER BY tipo_onibus;