-- 🎯 VIAGENS PARA TESTAR NO FRONT-END

-- Viagem com 47 passeios
SELECT 
    id,
    adversario,
    data_jogo,
    'http://localhost:8081/dashboard/viagens/' || id as url_para_testar
FROM viagens 
WHERE id = '3c6fa50c-e8df-4386-90cc-67b3a8b4204c';

-- Viagem Botafogo (6 passeios)
SELECT 
    id,
    adversario,
    data_jogo,
    'http://localhost:8081/dashboard/viagens/' || id as url_para_testar
FROM viagens 
WHERE id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13';

-- Ver alguns passageiros da viagem com 47 passeios
SELECT 
    c.nome as passageiro_nome,
    COUNT(pp.id) as total_passeios,
    STRING_AGG(pp.passeio_nome, ', ') as passeios_escolhidos
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = '3c6fa50c-e8df-4386-90cc-67b3a8b4204c'
GROUP BY c.nome, vp.id
ORDER BY total_passeios DESC
LIMIT 10;