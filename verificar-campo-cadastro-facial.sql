-- Script para verificar se o campo cadastro_facial existe na tabela clientes

-- 1. Verificar se a coluna existe
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'cadastro_facial';

-- 2. Se a coluna não existir, execute este comando:
-- ALTER TABLE clientes ADD COLUMN cadastro_facial BOOLEAN DEFAULT FALSE;

-- 3. Verificar alguns registros para testar
SELECT id, nome, cadastro_facial 
FROM clientes 
LIMIT 5;

-- 4. Testar update manual (substitua o ID por um real)
-- UPDATE clientes SET cadastro_facial = true WHERE id = 'seu-id-aqui';