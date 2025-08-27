-- Script para testar a exclusão do crédito e verificar se o passageiro é removido
-- ANTES DE EXECUTAR: Verificar dados atuais

-- 1. Verificar dados ANTES da exclusão
SELECT 'ANTES DA EXCLUSÃO - Dados do crédito:' as status;
SELECT id, cliente_id, valor_credito, saldo_disponivel, status 
FROM cliente_creditos 
WHERE id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

SELECT 'ANTES DA EXCLUSÃO - Vinculações do crédito:' as status;
SELECT * FROM credito_viagem_vinculacoes 
WHERE credito_id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

SELECT 'ANTES DA EXCLUSÃO - Passageiro na viagem:' as status;
SELECT vp.id, vp.viagem_id, vp.cliente_id, c.nome, vp.pago_por_credito, vp.credito_origem_id, vp.status_pagamento
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
WHERE vp.credito_origem_id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

-- 2. EXECUTAR A FUNÇÃO DE EXCLUSÃO
SELECT 'EXECUTANDO EXCLUSÃO DO CRÉDITO...' as status;
SELECT delete_credito_with_cleanup('bf80daa3-61c9-4f36-b508-6fe0a504564c');

-- 3. Verificar dados DEPOIS da exclusão
SELECT 'DEPOIS DA EXCLUSÃO - Crédito ainda existe?:' as status;
SELECT COUNT(*) as credito_existe 
FROM cliente_creditos 
WHERE id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

SELECT 'DEPOIS DA EXCLUSÃO - Vinculações ainda existem?:' as status;
SELECT COUNT(*) as vinculacoes_existem 
FROM credito_viagem_vinculacoes 
WHERE credito_id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

SELECT 'DEPOIS DA EXCLUSÃO - Passageiro ainda está na viagem?:' as status;
SELECT COUNT(*) as passageiro_existe
FROM viagem_passageiros vp
WHERE vp.cliente_id = 'accd829d-563b-4c43-a297-ba04c696ba93' 
  AND vp.viagem_id = '3566e81a-ad4c-445e-a0c2-cb63a5915fe0';

SELECT 'DEPOIS DA EXCLUSÃO - Referências ao crédito em viagem_passageiros:' as status;
SELECT COUNT(*) as referencias_credito
FROM viagem_passageiros 
WHERE credito_origem_id = 'bf80daa3-61c9-4f36-b508-6fe0a504564c';

-- 4. Verificar se há outros passageiros na mesma viagem (para contexto)
SELECT 'CONTEXTO - Outros passageiros na viagem do Mirassol:' as status;
SELECT vp.id, c.nome, vp.status_pagamento, vp.pago_por_credito
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
WHERE vp.viagem_id = '3566e81a-ad4c-445e-a0c2-cb63a5915fe0'
ORDER BY c.nome;