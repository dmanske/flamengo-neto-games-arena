-- Script para corrigir datas específicas mencionadas
-- Execute este script após analisar os problemas

-- 1. Verificar a data específica que você mencionou (1987-06-02)
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::text as timestamp_completo,
    data_nascimento::date as data_corrigida,
    CONCAT(
        EXTRACT(day FROM data_nascimento::date), '/',
        EXTRACT(month FROM data_nascimento::date), '/',
        EXTRACT(year FROM data_nascimento::date)
    ) as formato_brasileiro_correto
FROM clientes 
WHERE data_nascimento::text LIKE '1987-06-02%';

-- 2. Verificar sua data (dia 10 que aparece como 9)
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::text as timestamp_completo,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_errado,
    EXTRACT(day FROM data_nascimento::date) as dia_correto,
    CONCAT(
        EXTRACT(day FROM data_nascimento::date), '/',
        EXTRACT(month FROM data_nascimento::date), '/',
        EXTRACT(year FROM data_nascimento::date)
    ) as formato_brasileiro_correto
FROM clientes 
WHERE EXTRACT(day FROM data_nascimento) = 9 
AND EXTRACT(day FROM data_nascimento::date) = 10
ORDER BY data_nascimento DESC
LIMIT 5;

-- 3. Corrigir TODAS as datas de uma vez (EXECUTE APENAS APÓS BACKUP!)
-- DESCOMENTE as linhas abaixo quando estiver pronto:

-- UPDATE clientes 
-- SET data_nascimento = data_nascimento::date
-- WHERE data_nascimento IS NOT NULL;

-- 4. Verificar se a correção funcionou
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
--     ) as formato_brasileiro
-- FROM clientes 
-- WHERE data_nascimento IS NOT NULL 
-- ORDER BY data_nascimento DESC
-- LIMIT 10;

-- 5. Contar quantas datas foram corrigidas
-- SELECT 
--     COUNT(*) as total_datas_corrigidas,
--     MIN(data_nascimento) as data_mais_antiga,
--     MAX(data_nascimento) as data_mais_recente
-- FROM clientes 
-- WHERE data_nascimento IS NOT NULL; 