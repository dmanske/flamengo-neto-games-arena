-- Script para corrigir problemas de timezone nas datas
-- Execute APENAS após analisar os resultados do script anterior

-- 1. BACKUP OBRIGATÓRIO antes de qualquer correção
CREATE TABLE IF NOT EXISTS clientes_backup_timezone_fix AS 
SELECT 
    id, 
    nome, 
    data_nascimento,
    data_nascimento::text as timestamp_original,
    created_at
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 2. Verificar quantos registros serão afetados
SELECT 
    'Registros que serão corrigidos' as info,
    COUNT(*) as total_para_corrigir
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date);

-- 3. Mostrar preview da correção (SEM ALTERAR ainda)
SELECT 
    id,
    nome,
    data_nascimento as antes,
    data_nascimento::date as depois,
    CONCAT(
        EXTRACT(day FROM data_nascimento), '/',
        EXTRACT(month FROM data_nascimento), '/',
        EXTRACT(year FROM data_nascimento)
    ) as data_antes_brasileira,
    CONCAT(
        EXTRACT(day FROM data_nascimento::date), '/',
        EXTRACT(month FROM data_nascimento::date), '/',
        EXTRACT(year FROM data_nascimento::date)
    ) as data_depois_brasileira
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date)
ORDER BY nome
LIMIT 10;

-- 4. CORREÇÃO PRINCIPAL - Descomente quando estiver pronto
-- ATENÇÃO: Execute apenas uma vez!

-- UPDATE clientes 
-- SET data_nascimento = data_nascimento::date
-- WHERE data_nascimento IS NOT NULL 
-- AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date);

-- 5. Verificação pós-correção (descomente após executar o UPDATE)
-- SELECT 
--     'Verificação pós-correção' as status,
--     COUNT(*) as total_registros,
--     COUNT(CASE 
--         WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
--         THEN 1 
--     END) as ainda_com_problema,
--     COUNT(CASE 
--         WHEN EXTRACT(day FROM data_nascimento) = EXTRACT(day FROM data_nascimento::date) 
--         THEN 1 
--     END) as corrigidos
-- FROM clientes 
-- WHERE data_nascimento IS NOT NULL;

-- 6. Verificar Virginio e Arnaldo especificamente após correção
-- SELECT 
--     id,
--     nome,
--     data_nascimento,
--     EXTRACT(day FROM data_nascimento) as dia,
--     EXTRACT(month FROM data_nascimento) as mes,
--     EXTRACT(year FROM data_nascimento) as ano,
--     CONCAT(
--         EXTRACT(day FROM data_nascimento), '/',
--         EXTRACT(month FROM data_nascimento), '/',
--         EXTRACT(year FROM data_nascimento)
--     ) as data_brasileira
-- FROM clientes 
-- WHERE LOWER(nome) LIKE '%virginio%' 
--    OR LOWER(nome) LIKE '%arnaldo%'
-- ORDER BY nome;

-- 7. Rollback (se necessário) - Use apenas se algo der errado
-- UPDATE clientes 
-- SET data_nascimento = backup.data_nascimento
-- FROM clientes_backup_timezone_fix backup
-- WHERE clientes.id = backup.id; 