-- Verificar passageiros órfãos (criados via crédito mas sem vinculação)

-- 1. Passageiros com pago_por_credito=true mas sem vinculação ativa
SELECT 'PASSAGEIROS ÓRFÃOS - Com pago_por_credito=true mas sem vinculação:' as debug_step;
SELECT 
  vp.id,
  vp.viagem_id,
  vp.cliente_id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  v.adversario,
  'ÓRFÃO - SEM VINCULAÇÃO' as problema
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
LEFT JOIN credito_viagem_vinculacoes cvv ON cvv.passageiro_id = vp.cliente_id 
                                         AND cvv.viagem_id = vp.viagem_id
WHERE vp.pago_por_credito = true 
  AND cvv.id IS NULL;

-- 2. Passageiros com credito_origem_id mas crédito não existe
SELECT 'PASSAGEIROS COM CRÉDITO INEXISTENTE:' as debug_step;
SELECT 
  vp.id,
  vp.viagem_id,
  vp.cliente_id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  v.adversario,
  'CRÉDITO NÃO EXISTE' as problema
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
LEFT JOIN cliente_creditos cc ON cc.id = vp.credito_origem_id
WHERE vp.credito_origem_id IS NOT NULL 
  AND cc.id IS NULL;

-- 3. Todos os passageiros da viagem do Mirassol (para contexto)
SELECT 'TODOS OS PASSAGEIROS DA VIAGEM MIRASSOL:' as debug_step;
SELECT 
  vp.id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  vp.valor,
  vp.desconto,
  CASE 
    WHEN vp.pago_por_credito = true AND vp.credito_origem_id IS NULL THEN '⚠️ ÓRFÃO'
    WHEN vp.credito_origem_id IS NOT NULL THEN '💳 COM CRÉDITO'
    ELSE '✅ NORMAL'
  END as status_debug
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE v.adversario = 'Mirassol'
ORDER BY c.nome;