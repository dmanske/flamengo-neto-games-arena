-- Limpar o passageiro órfão do Leonardo Keller

SELECT 'LIMPANDO PASSAGEIRO ÓRFÃO...' as status;

-- Verificar dados antes
SELECT 'ANTES:' as momento, vp.id, c.nome, vp.pago_por_credito, vp.credito_origem_id
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
WHERE vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- Remover o passageiro órfão
DELETE FROM viagem_passageiros 
WHERE id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- Verificar se foi removido
SELECT 'DEPOIS:' as momento, 
       CASE WHEN COUNT(*) = 0 THEN '✅ PASSAGEIRO REMOVIDO' 
            ELSE '❌ AINDA EXISTE' 
       END as resultado
FROM viagem_passageiros 
WHERE id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- Verificar quantos passageiros restam na viagem
SELECT 'PASSAGEIROS NA VIAGEM MIRASSOL:' as status, COUNT(*) as quantidade
FROM viagem_passageiros vp
JOIN viagens v ON v.id = vp.viagem_id
WHERE v.adversario = 'Mirassol';

SELECT 'LIMPEZA CONCLUÍDA!' as status;