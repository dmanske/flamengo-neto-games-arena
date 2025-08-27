-- Script de debug para testar a função de deletar crédito
-- Execute este script no Supabase SQL Editor para debugar

-- 1. Verificar se existem créditos vinculados a viagens
SELECT 
  cc.id as credito_id,
  cc.valor_credito,
  cc.saldo_disponivel,
  c.nome as cliente_nome,
  cvv.viagem_id,
  cvv.passageiro_id,
  cvv.valor_utilizado,
  v.adversario,
  vp.id as viagem_passageiro_id,
  vp.status_pagamento,
  vp.pago_por_credito,
  vp.credito_origem_id
FROM cliente_creditos cc
LEFT JOIN clientes c ON c.id = cc.cliente_id
LEFT JOIN credito_viagem_vinculacoes cvv ON cvv.credito_id = cc.id
LEFT JOIN viagens v ON v.id = cvv.viagem_id
LEFT JOIN viagem_passageiros vp ON vp.cliente_id = cvv.passageiro_id AND vp.viagem_id = cvv.viagem_id
WHERE cc.saldo_disponivel < cc.valor_credito -- Créditos que foram utilizados
ORDER BY cc.created_at DESC;

-- 2. Verificar passageiros com crédito vinculado
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

-- 3. Verificar vinculações ativas
SELECT 
  cvv.*,
  c.nome as cliente_nome,
  v.adversario
FROM credito_viagem_vinculacoes cvv
JOIN cliente_creditos cc ON cc.id = cvv.credito_id
JOIN clientes c ON c.id = cc.cliente_id
JOIN viagens v ON v.id = cvv.viagem_id
ORDER BY cvv.data_vinculacao DESC;