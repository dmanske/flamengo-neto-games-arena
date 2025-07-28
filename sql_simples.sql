-- 🚀 TESTE RÁPIDO: Ver se há passeios cadastrados

-- 1. Listar últimas viagens com contagem de passeios
SELECT 
    v.id,
    v.nome as viagem_nome,
    v.data_viagem,
    COUNT(DISTINCT vp.id) as total_passageiros,
    COUNT(pp.id) as total_passeios_escolhidos
FROM viagens v
LEFT JOIN viagem_passageiros vp ON vp.viagem_id = v.id
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
GROUP BY v.id, v.nome, v.data_viagem
ORDER BY v.data_viagem DESC
LIMIT 5;

-- 2. Se encontrar uma viagem com passeios > 0, use o ID dela aqui:
-- Substitua 'VIAGEM_ID_AQUI' pelo ID de uma viagem que tem passeios

SELECT 
    c.nome as passageiro,
    pp.passeio_nome,
    pp.status,
    pp.valor_cobrado
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = 'VIAGEM_ID_AQUI'
ORDER BY c.nome, pp.passeio_nome;