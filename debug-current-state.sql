-- Verificar estado atual após tentativa de deletar crédito

SELECT 'ESTADO ATUAL DO SISTEMA:' as debug;

-- 1. Verificar se há créditos ativos
SELECT 'CRÉDITOS EXISTENTES:' as tipo;
SELECT 
  cc.id,
  c.nome as cliente_nome,
  cc.valor_credito,
  cc.saldo_disponivel,
  cc.status
FROM cliente_creditos cc
JOIN clientes c ON c.id = cc.cliente_id
ORDER BY cc.created_at DESC
LIMIT 5;

-- 2. Verificar vinculações ativas
SELECT 'VINCULAÇÕES ATIVAS:' as tipo;
SELECT 
  cvv.credito_id,
  cvv.viagem_id,
  cvv.passageiro_id,
  cvv.valor_utilizado,
  c.nome as cliente_nome
FROM credito_viagem_vinculacoes cvv
JOIN cliente_creditos cc ON cc.id = cvv.credito_id
JOIN clientes c ON c.id = cc.cliente_id
ORDER BY cvv.data_vinculacao DESC
LIMIT 5;

-- 3. Verificar passageiros na viagem do Mirassol
SELECT 'PASSAGEIROS NA VIAGEM MIRASSOL:' as tipo;
SELECT 
  vp.id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  CASE 
    WHEN vp.id = '4e76ac62-8efd-48ea-9617-278682b7ab77' THEN '🎯 ESTE É O ATUAL!'
    ELSE '❓ OUTRO'
  END as identificacao
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE v.adversario = 'Mirassol'
ORDER BY c.nome;

-- 4. Verificar se o passageiro atual tem crédito válido
SELECT 'VERIFICAÇÃO DO PASSAGEIRO ATUAL:' as tipo;
SELECT 
  vp.id as passageiro_id,
  vp.credito_origem_id,
  CASE WHEN cc.id IS NOT NULL THEN '✅ CRÉDITO EXISTE' ELSE '❌ CRÉDITO NÃO EXISTE' END as credito_status,
  CASE WHEN cvv.id IS NOT NULL THEN '✅ VINCULAÇÃO EXISTE' ELSE '❌ VINCULAÇÃO NÃO EXISTE' END as vinculacao_status
FROM viagem_passageiros vp
LEFT JOIN cliente_creditos cc ON cc.id = vp.credito_origem_id
LEFT JOIN credito_viagem_vinculacoes cvv ON cvv.credito_id = vp.credito_origem_id 
                                         AND cvv.passageiro_id = vp.cliente_id
                                         AND cvv.viagem_id = vp.viagem_id
WHERE vp.id = '4e76ac62-8efd-48ea-9617-278682b7ab77';