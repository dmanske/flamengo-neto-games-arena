-- 🎯 TESTE COM A VIAGEM QUE TEM 47 PASSEIOS

-- 1. Ver estrutura da tabela passageiro_passeios (que não apareceu)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'passageiro_passeios' 
ORDER BY ordinal_position;

-- 2. Ver dados da viagem com 47 passeios
SELECT 
    c.nome as passageiro_nome,
    pp.passeio_nome,
    pp.status,
    pp.valor_cobrado,
    vp.gratuito
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = '3c6fa50c-e8df-4386-90cc-67b3a8b4204c'
ORDER BY c.nome, pp.passeio_nome
LIMIT 20;

-- 3. Ver dados da viagem Botafogo (6 passeios)
SELECT 
    c.nome as passageiro_nome,
    pp.passeio_nome,
    pp.status,
    pp.valor_cobrado,
    vp.gratuito
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13'
ORDER BY c.nome, pp.passeio_nome;

-- 4. Ver alguns registros brutos da passageiro_passeios
SELECT * FROM passageiro_passeios ORDER BY created_at DESC LIMIT 10;