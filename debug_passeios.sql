-- 🔍 QUERY PARA DEBUG DOS PASSEIOS
-- Execute no Supabase SQL Editor substituindo 'SEU_VIAGEM_ID' pelo ID real

-- 1. Ver estrutura completa dos dados (igual ao que o hook carrega)
SELECT 
    vp.id as viagem_passageiro_id,
    c.nome as passageiro_nome,
    vp.gratuito,
    pp.passeio_nome,
    pp.status,
    pp.valor_cobrado,
    CASE 
        WHEN vp.gratuito = true THEN 0 
        ELSE COALESCE(pp.valor_cobrado, 0) 
    END as valor_final_calculado
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = 'SEU_VIAGEM_ID'
ORDER BY c.nome, pp.passeio_nome;

-- 2. Contar dados para diagnóstico
SELECT 
    COUNT(DISTINCT vp.id) as total_passageiros,
    COUNT(DISTINCT CASE WHEN pp.id IS NOT NULL THEN vp.id END) as passageiros_com_passeios,
    COUNT(pp.id) as total_registros_passeios,
    COUNT(CASE WHEN pp.passeio_nome IS NOT NULL AND pp.passeio_nome != '' THEN 1 END) as passeios_com_nome_valido
FROM viagem_passageiros vp
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = 'SEU_VIAGEM_ID';

-- 3. Ver passageiros SEM passeios (para identificar problema)
SELECT 
    c.nome as passageiro_sem_passeios,
    vp.id as viagem_passageiro_id,
    vp.gratuito
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = 'SEU_VIAGEM_ID'
AND pp.id IS NULL
ORDER BY c.nome;

-- 4. Listar viagens disponíveis (para você pegar um ID real)
SELECT 
    id,
    nome,
    data_viagem,
    (SELECT COUNT(*) FROM viagem_passageiros WHERE viagem_id = v.id) as total_passageiros,
    (SELECT COUNT(*) FROM passageiro_passeios pp 
     JOIN viagem_passageiros vp ON vp.id = pp.viagem_passageiro_id 
     WHERE vp.viagem_id = v.id) as total_passeios
FROM viagens v
ORDER BY data_viagem DESC
LIMIT 10;