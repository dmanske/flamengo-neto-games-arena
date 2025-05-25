-- Script para verificar e ajustar a coluna data_nascimento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o tipo atual da coluna
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_nascimento';

-- 2. Verificar algumas datas existentes para entender o formato atual
SELECT 
    id,
    nome,
    data_nascimento,
    typeof(data_nascimento) as tipo_data
FROM clientes 
WHERE data_nascimento IS NOT NULL 
LIMIT 10;

-- 3. Se a coluna estiver como TIMESTAMP ou TIMESTAMPTZ, alterar para DATE
-- DESCOMENTE a linha abaixo se necessário:
-- ALTER TABLE clientes ALTER COLUMN data_nascimento TYPE DATE;

-- 4. Verificar datas que podem estar em formato incorreto
SELECT 
    id,
    nome,
    data_nascimento,
    CASE 
        WHEN data_nascimento::text LIKE '%T%' THEN 'Timestamp (precisa correção)'
        WHEN data_nascimento::text ~ '^\d{4}-\d{2}-\d{2}$' THEN 'Formato correto (YYYY-MM-DD)'
        ELSE 'Formato desconhecido'
    END as status_formato
FROM clientes 
WHERE data_nascimento IS NOT NULL
ORDER BY status_formato, nome; 