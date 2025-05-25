-- Script para garantir que a coluna data_nascimento seja do tipo DATE
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o tipo atual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_nascimento';

-- 2. Se a coluna não for do tipo DATE, alterar o tipo
-- IMPORTANTE: Execute apenas se o tipo não for 'date'

-- Para PostgreSQL/Supabase, alterar para tipo DATE:
-- ALTER TABLE clientes ALTER COLUMN data_nascimento TYPE DATE USING data_nascimento::DATE;

-- 3. Verificar novamente após a alteração
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_nascimento';

-- 4. Testar inserção de uma data no formato correto
-- INSERT INTO clientes (nome, email, telefone, data_nascimento, como_conheceu) 
-- VALUES ('Teste Data', 'teste@email.com', '11999999999', '1990-05-15', 'Teste');

-- 5. Verificar se a data foi inserida corretamente
-- SELECT nome, data_nascimento FROM clientes WHERE nome = 'Teste Data';

-- 6. Remover o registro de teste
-- DELETE FROM clientes WHERE nome = 'Teste Data'; 