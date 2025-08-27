-- Testar a função de deletar crédito diretamente

-- 1. Verificar estado atual
SELECT 'ESTADO ANTES:' as status;

SELECT 'Crédito:' as tipo, COUNT(*) as existe
FROM cliente_creditos 
WHERE id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Vinculação:' as tipo, COUNT(*) as existe
FROM credito_viagem_vinculacoes 
WHERE credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Passageiro:' as tipo, COUNT(*) as existe
FROM viagem_passageiros 
WHERE id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- 2. EXECUTAR A FUNÇÃO DIRETAMENTE
SELECT 'EXECUTANDO FUNÇÃO delete_credito_with_cleanup...' as status;

SELECT delete_credito_with_cleanup('b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee');

-- 3. Verificar estado após execução
SELECT 'ESTADO DEPOIS:' as status;

SELECT 'Crédito:' as tipo, COUNT(*) as existe
FROM cliente_creditos 
WHERE id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Vinculação:' as tipo, COUNT(*) as existe
FROM credito_viagem_vinculacoes 
WHERE credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Passageiro:' as tipo, COUNT(*) as existe
FROM viagem_passageiros 
WHERE id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- 4. Se o passageiro ainda existir, verificar seus dados
SELECT 'DADOS DO PASSAGEIRO (se ainda existir):' as status;
SELECT 
  vp.id,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento
FROM viagem_passageiros vp
WHERE vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4';