-- 📋 CONSULTA: Viagens em Andamento
-- Visualizar viagens ativas para identificar quais copiar

SELECT 
    v.id,
    v.adversario,
    v.data_jogo,
    v.status_viagem,
    v.local_jogo,
    v.capacidade_onibus,
    COUNT(vp.cliente_id) as total_passageiros,
    STRING_AGG(DISTINCT c.nome, ', ' ORDER BY c.nome LIMIT 3) as alguns_passageiros
FROM viagens v
LEFT JOIN viagem_passageiros vp ON v.id = vp.viagem_id
LEFT JOIN clientes c ON vp.cliente_id = c.id
WHERE v.status_viagem IN ('Em andamento', 'Aberta')
GROUP BY v.id, v.adversario, v.data_jogo, v.status_viagem, v.local_jogo, v.capacidade_onibus
ORDER BY v.data_jogo DESC;

-- 🔍 DETALHES: Passageiros de uma viagem específica do Botafogo
-- Esta é a viagem que tem passageiros para copiar
SELECT 
    vp.cliente_id,
    c.nome,
    c.telefone,
    vp.cidade_embarque,
    vp.setor_maracana,
    vp.observacoes,
    vp.onibus_id
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = '4b6b1a21-3557-439b-95dd-b495d4dc6b13' -- Viagem Botafogo
ORDER BY c.nome;