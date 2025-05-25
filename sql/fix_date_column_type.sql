-- Script para corrigir o tipo da coluna data_nascimento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. PRIMEIRO: Fazer backup dos dados atuais
CREATE TABLE IF NOT EXISTS clientes_backup_datas_completo AS 
SELECT 
    id, 
    nome, 
    data_nascimento,
    data_nascimento::text as data_original_texto
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 2. Verificar o tipo atual da coluna
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_nascimento';

-- 3. Mostrar algumas datas problemáticas para análise
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_atual,
    EXTRACT(day FROM data_nascimento::date) as dia_correto
FROM clientes 
WHERE data_nascimento IS NOT NULL 
ORDER BY data_nascimento DESC
LIMIT 10;

-- 4. ALTERAR O TIPO DA COLUNA (CUIDADO: Execute apenas uma vez!)
-- DESCOMENTE a linha abaixo quando estiver pronto:
-- ALTER TABLE clientes ALTER COLUMN data_nascimento TYPE DATE USING data_nascimento::DATE;

-- 5. Verificar se a alteração funcionou
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND column_name = 'data_nascimento';

-- 6. Verificar se as datas foram corrigidas
SELECT 
    id,
    nome,
    data_nascimento,
    EXTRACT(day FROM data_nascimento) as dia,
    EXTRACT(month FROM data_nascimento) as mes,
    EXTRACT(year FROM data_nascimento) as ano
FROM clientes 
WHERE data_nascimento IS NOT NULL 
ORDER BY data_nascimento DESC
LIMIT 10; 