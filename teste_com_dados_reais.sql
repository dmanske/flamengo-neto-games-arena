-- 🎯 TESTE COM DADOS REAIS (sabemos que existem 56 passeios)

-- 1. Ver alguns passeios cadastrados
SELECT 
    passeio_nome,
    status,
    valor_cobrado,
    viagem_passageiro_id
FROM passageiro_passeios 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Ver viagens (sem especificar coluna nome/destino)
SELECT * FROM viagens ORDER BY created_at DESC LIMIT 3;

-- 3. Ver passageiros com passeios (JOIN simples)
SELECT 
    vp.id as viagem_passageiro_id,
    c.nome as passageiro_nome,
    pp.passeio_nome,
    pp.valor_cobrado
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
ORDER BY c.nome
LIMIT 20;

-- 4. Contar passeios por viagem
SELECT 
    vp.viagem_id,
    COUNT(pp.id) as total_passeios
FROM viagem_passageiros vp
LEFT JOIN passageiro_passeios pp ON pp.viagem_passageiro_id = vp.id
GROUP BY vp.viagem_id
ORDER BY total_passeios DESC;