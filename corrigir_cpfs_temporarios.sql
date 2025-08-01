-- =====================================================
-- CORRIGIR CPFs TEMPORÁRIOS APÓS MIGRAÇÃO
-- =====================================================
-- Este script ajuda a corrigir os CPFs temporários criados durante a limpeza

-- 1. Listar todos os registros com CPF temporário ou vazio
SELECT 
    id,
    nome,
    cpf as cpf_temporario,
    telefone,
    email,
    created_at,
    CASE 
        WHEN cpf LIKE 'TEMP_%' THEN 'CPF Duplicado'
        WHEN cpf LIKE 'EMPTY_%' THEN 'CPF Vazio'
        ELSE 'Outro'
    END as tipo_problema,
    'UPDATE clientes SET cpf = ''NOVO_CPF_AQUI'' WHERE id = ''' || id || ''';' as comando_update
FROM clientes 
WHERE cpf LIKE 'TEMP_%' OR cpf LIKE 'EMPTY_%'
ORDER BY created_at DESC;

-- 2. Exemplo de como atualizar um CPF temporário:
-- UPDATE clientes SET cpf = '12345678901' WHERE id = 'cf59909f-a0bf-4c79-a04d-06183db3e055';

-- 3. Verificar se um CPF já existe antes de atualizar:
-- SELECT COUNT(*) FROM clientes WHERE cpf = '12345678901';

-- 4. Para remover um registro com CPF temporário (se for duplicata desnecessária):
-- DELETE FROM clientes WHERE id = 'ID_DO_REGISTRO';

-- 5. Contar quantos CPFs temporários ainda existem:
SELECT 
    COUNT(*) as total_cpfs_temporarios,
    COUNT(CASE WHEN cpf LIKE 'TEMP_%' THEN 1 END) as cpfs_duplicados,
    COUNT(CASE WHEN cpf LIKE 'EMPTY_%' THEN 1 END) as cpfs_vazios
FROM clientes 
WHERE cpf LIKE 'TEMP_%' OR cpf LIKE 'EMPTY_%';

-- =====================================================
-- PROCESSO RECOMENDADO:
-- =====================================================
-- 1. Execute o SELECT do item 1 para ver todos os registros
-- 2. Para cada registro, decida:
--    a) Atualizar com CPF correto (se souber qual é)
--    b) Deletar o registro (se for duplicata desnecessária)
--    c) Deixar temporário por enquanto (se precisar investigar)
-- 3. Execute os comandos UPDATE ou DELETE conforme necessário
-- 4. Execute o SELECT do item 5 para verificar quantos ainda restam