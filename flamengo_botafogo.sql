-- 🔥 SQL COMPLETO: Viagem Flamengo × Botafogo

-- 1. Encontrar a viagem Flamengo × Botafogo
SELECT 
    id,
    destino,
    data_viagem,
    valor_padrao,
    capacidade_onibus
FROM viagens 
WHERE destino ILIKE '%flamengo%botafogo%' 
   OR destino ILIKE '%botafogo%flamengo%'
   OR destino ILIKE '%fla%bot%'
ORDER BY data_viagem DESC;

-- 2. Ver TODOS os dados da viagem (substitua o ID encontrado acima)
-- SUBSTITUA 'VIAGEM_ID_AQUI' pelo ID real da viagem
WITH viagem_id AS (
    SELECT id FROM viagens 
    WHERE destino ILIKE '%flamengo%botafogo%' 
       OR destino ILIKE '%botafogo%flamengo%'
       OR destino ILIKE '%fla%bot%'
    ORDER BY data_viagem DESC 
    LIMIT 1
)
SELECT 
    v.id as viagem_id,
    v.destino,
    v.data_viagem,
    c.nome as passageiro_nome,
    vp.id as viagem_passageiro_id,
    vp.gratuito,
    vp.valor,
    vp.desconto,
    pp.passeio_nome,
    pp.status as passeio_status,
    pp.valor_cobrado
FROM viagens v
JOIN viagem_passageiros vp ON vp.viagem_id = v.id
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE v.id = (SELECT id FROM viagem_id)
ORDER BY c.nome, pp.passeio_nome;

-- 3. Resumo da viagem
WITH viagem_id AS (
    SELECT id FROM viagens 
    WHERE destino ILIKE '%flamengo%botafogo%' 
       OR destino ILIKE '%botafogo%flamengo%'
       OR destino ILIKE '%fla%bot%'
    ORDER BY data_viagem DESC 
    LIMIT 1
)
SELECT 
    'RESUMO DA VIAGEM' as info,
    COUNT(DISTINCT vp.id) as total_passageiros,
    COUNT(DISTINCT CASE WHEN pp.id IS NOT NULL THEN vp.id END) as passageiros_com_passeios,
    COUNT(pp.id) as total_passeios_escolhidos,
    COUNT(DISTINCT pp.passeio_nome) as tipos_passeios_diferentes
FROM viagens v
JOIN viagem_passageiros vp ON vp.viagem_id = v.id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE v.id = (SELECT id FROM viagem_id);

-- 4. Lista de passeios únicos escolhidos
WITH viagem_id AS (
    SELECT id FROM viagens 
    WHERE destino ILIKE '%flamengo%botafogo%' 
       OR destino ILIKE '%botafogo%flamengo%'
       OR destino ILIKE '%fla%bot%'
    ORDER BY data_viagem DESC 
    LIMIT 1
)
SELECT 
    pp.passeio_nome,
    COUNT(*) as quantos_escolheram,
    AVG(pp.valor_cobrado) as valor_medio,
    MIN(pp.valor_cobrado) as valor_min,
    MAX(pp.valor_cobrado) as valor_max
FROM passageiro_passeios pp
JOIN viagem_passageiros vp ON vp.id = pp.viagem_passageiro_id
WHERE vp.viagem_id = (SELECT id FROM viagem_id)
GROUP BY pp.passeio_nome
ORDER BY quantos_escolheram DESC;