-- Script para corrigir datas no formato timestamp para DATE no Supabase
-- Execute este script APENAS se encontrar datas em formato timestamp

-- 1. Backup das datas atuais (recomendado)
CREATE TABLE IF NOT EXISTS clientes_backup_datas AS 
SELECT id, nome, data_nascimento 
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 2. Corrigir datas que estão em formato timestamp
-- Este script converte timestamps para o formato DATE (YYYY-MM-DD)
UPDATE clientes 
SET data_nascimento = DATE(data_nascimento)
WHERE data_nascimento IS NOT NULL 
AND data_nascimento::text LIKE '%T%';

-- 3. Verificar se a correção funcionou
SELECT 
    id,
    nome,
    data_nascimento,
    CASE 
        WHEN data_nascimento::text ~ '^\d{4}-\d{2}-\d{2}$' THEN '✅ Correto'
        ELSE '❌ Ainda precisa correção'
    END as status
FROM clientes 
WHERE data_nascimento IS NOT NULL
ORDER BY status, nome;

-- 4. Contar quantas datas foram corrigidas
SELECT 
    COUNT(*) as total_clientes_com_data,
    COUNT(CASE WHEN data_nascimento::text ~ '^\d{4}-\d{2}-\d{2}$' THEN 1 END) as datas_corretas,
    COUNT(CASE WHEN data_nascimento::text NOT LIKE '^\d{4}-\d{2}-\d{2}$' THEN 1 END) as datas_incorretas
FROM clientes 
WHERE data_nascimento IS NOT NULL; 