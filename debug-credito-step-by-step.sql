-- Debug passo a passo para entender o problema

-- 1. Verificar se há créditos ativos
SELECT 'CRÉDITOS ATIVOS:' as debug_step;
SELECT 
  cc.id,
  cc.valor_credito,
  cc.saldo_disponivel,
  cc.status,
  c.nome as cliente_nome
FROM cliente_creditos cc
JOIN clientes c ON c.id = cc.cliente_id
WHERE cc.saldo_disponivel < cc.valor_credito
ORDER BY cc.created_at DESC;

-- 2. Verificar vinculações ativas
SELECT 'VINCULAÇÕES ATIVAS:' as debug_step;
SELECT 
  cvv.credito_id,
  cvv.viagem_id,
  cvv.passageiro_id,
  cvv.valor_utilizado,
  c.nome as cliente_nome,
  v.adversario
FROM credito_viagem_vinculacoes cvv
JOIN cliente_creditos cc ON cc.id = cvv.credito_id
JOIN clientes c ON c.id = cc.cliente_id
JOIN viagens v ON v.id = cvv.viagem_id
ORDER BY cvv.data_vinculacao DESC;

-- 3. Verificar passageiros com crédito
SELECT 'PASSAGEIROS COM CRÉDITO:' as debug_step;
SELECT 
  vp.id,
  vp.viagem_id,
  vp.cliente_id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  v.adversario
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE vp.pago_por_credito = true OR vp.credito_origem_id IS NOT NULL
ORDER BY vp.created_at DESC;

-- 4. Verificar se há inconsistências (passageiros com pago_por_credito=true mas sem vinculação)
SELECT 'INCONSISTÊNCIAS - Passageiros com pago_por_credito=true mas sem vinculação:' as debug_step;
SELECT 
  vp.id,
  vp.viagem_id,
  vp.cliente_id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.status_pagamento,
  v.adversario
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
LEFT JOIN credito_viagem_vinculacoes cvv ON cvv.credito_id = vp.credito_origem_id
                                         AND cvv.passageiro_id = vp.cliente_id
                                         AND cvv.viagem_id = vp.viagem_id
WHERE vp.pago_por_credito = true 
  AND cvv.id IS NULL; -- Não tem vinculação correspondente

-- 5. Verificar se há créditos órfãos (vinculações sem crédito)
SELECT 'VINCULAÇÕES ÓRFÃS - Vinculações sem crédito:' as debug_step;
SELECT 
  cvv.*,
  'CRÉDITO NÃO EXISTE' as problema
FROM credito_viagem_vinculacoes cvv
LEFT JOIN cliente_creditos cc ON cc.id = cvv.credito_id
WHERE cc.id IS NULL;