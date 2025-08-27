-- Limpeza de vinculações órfãs e dados inconsistentes
-- Execute este script ANTES de testar a nova função

-- 1. Identificar e remover vinculações órfãs (sem crédito correspondente)
SELECT 'LIMPANDO VINCULAÇÕES ÓRFÃS...' as status;

DELETE FROM credito_viagem_vinculacoes 
WHERE credito_id NOT IN (
  SELECT id FROM cliente_creditos
);

-- Verificar quantas foram removidas
SELECT 'Vinculações órfãs removidas' as status;

-- 2. Identificar passageiros com referências a créditos inexistentes
SELECT 'LIMPANDO REFERÊNCIAS ÓRFÃS EM VIAGEM_PASSAGEIROS...' as status;

UPDATE viagem_passageiros 
SET 
  pago_por_credito = false,
  credito_origem_id = null,
  valor_credito_utilizado = null,
  status_pagamento = 'Pendente'
WHERE credito_origem_id IS NOT NULL 
  AND credito_origem_id NOT IN (
    SELECT id FROM cliente_creditos
  );

-- 3. Verificar estado atual após limpeza
SELECT 'ESTADO APÓS LIMPEZA:' as status;

-- Contar vinculações restantes
SELECT COUNT(*) as vinculacoes_restantes 
FROM credito_viagem_vinculacoes;

-- Contar passageiros com crédito
SELECT COUNT(*) as passageiros_com_credito 
FROM viagem_passageiros 
WHERE pago_por_credito = true OR credito_origem_id IS NOT NULL;

-- Listar créditos ativos
SELECT 
  cc.id,
  c.nome as cliente_nome,
  cc.valor_credito,
  cc.saldo_disponivel,
  cc.status,
  COUNT(cvv.id) as vinculacoes_count
FROM cliente_creditos cc
JOIN clientes c ON c.id = cc.cliente_id
LEFT JOIN credito_viagem_vinculacoes cvv ON cvv.credito_id = cc.id
GROUP BY cc.id, c.nome, cc.valor_credito, cc.saldo_disponivel, cc.status
ORDER BY cc.created_at DESC;