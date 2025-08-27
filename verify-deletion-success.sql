-- Verificar se a exclusão funcionou completamente

SELECT 'VERIFICAÇÃO FINAL:' as status;

-- 1. Crédito foi deletado?
SELECT 'Crédito deletado:' as item, 
       CASE WHEN COUNT(*) = 0 THEN '✅ SIM' ELSE '❌ NÃO' END as resultado
FROM cliente_creditos 
WHERE id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

-- 2. Vinculação foi removida?
SELECT 'Vinculação removida:' as item,
       CASE WHEN COUNT(*) = 0 THEN '✅ SIM' ELSE '❌ NÃO' END as resultado
FROM credito_viagem_vinculacoes 
WHERE credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

-- 3. Passageiro foi removido?
SELECT 'Passageiro removido:' as item,
       CASE WHEN COUNT(*) = 0 THEN '✅ SIM' ELSE '❌ NÃO' END as resultado
FROM viagem_passageiros 
WHERE id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- 4. Histórico foi removido?
SELECT 'Histórico removido:' as item,
       CASE WHEN COUNT(*) = 0 THEN '✅ SIM' ELSE '❌ NÃO' END as resultado
FROM credito_historico 
WHERE credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

-- 5. Verificar se há outros passageiros na viagem (contexto)
SELECT 'Outros passageiros na viagem:' as item, COUNT(*) as quantidade
FROM viagem_passageiros vp
JOIN viagens v ON v.id = vp.viagem_id
WHERE v.adversario = 'Mirassol';