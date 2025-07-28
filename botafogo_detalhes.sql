-- 🔥 DADOS COMPLETOS DA VIAGEM BOTAFOGO

-- 1. Dados da viagem Botafogo
SELECT 
    id,
    adversario,
    data_jogo,
    valor_padrao,
    capacidade_onibus,
    status_viagem
FROM viagens 
WHERE id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13';

-- 2. Passageiros da viagem Botafogo com seus passeios
SELECT 
    c.nome as passageiro_nome,
    vp.gratuito,
    vp.valor as valor_viagem,
    vp.desconto,
    pp.passeio_nome,
    pp.status as passeio_status,
    pp.valor_cobrado as valor_passeio
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13'
ORDER BY c.nome, pp.passeio_nome;

-- 3. Resumo dos passeios da viagem Botafogo
SELECT 
    pp.passeio_nome,
    COUNT(*) as quantos_escolheram,
    AVG(pp.valor_cobrado) as valor_medio,
    SUM(pp.valor_cobrado) as valor_total
FROM passageiro_passeios pp
JOIN viagem_passageiros vp ON vp.id = pp.viagem_passageiro_id
WHERE vp.viagem_id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13'
GROUP BY pp.passeio_nome
ORDER BY quantos_escolheram DESC;

-- 4. URL para testar no navegador
SELECT 
    'http://localhost:8081/dashboard/viagens/4b6b1a21-3557-439b-95dd-b495d4dc6b13' as url_botafogo;