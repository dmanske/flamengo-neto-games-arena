-- Script para analisar problemas específicos de datas
-- Execute este script para entender exatamente o que está acontecendo

-- 1. Analisar o problema do fuso horário
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::text as timestamp_completo,
    data_nascimento::date as data_sem_hora,
    EXTRACT(day FROM data_nascimento) as dia_timestamp,
    EXTRACT(day FROM data_nascimento::date) as dia_date,
    CASE 
        WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
        THEN '❌ PROBLEMA DE FUSO'
        ELSE '✅ OK'
    END as status
FROM clientes 
WHERE data_nascimento IS NOT NULL 
ORDER BY data_nascimento DESC;

-- 2. Contar quantas datas têm problema
SELECT 
    COUNT(*) as total_datas,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
        THEN 1 
    END) as datas_com_problema,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento) = EXTRACT(day FROM data_nascimento::date) 
        THEN 1 
    END) as datas_corretas
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 3. Mostrar exemplos específicos do problema
SELECT 
    'Exemplo de problema' as descricao,
    data_nascimento as timestamp_original,
    data_nascimento::date as data_corrigida,
    CONCAT(
        EXTRACT(day FROM data_nascimento::date), '/',
        EXTRACT(month FROM data_nascimento::date), '/',
        EXTRACT(year FROM data_nascimento::date)
    ) as formato_brasileiro
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date)
LIMIT 5;

-- 4. Verificar se há datas futuras (erro de conversão)
SELECT 
    id,
    nome,
    data_nascimento,
    CASE 
        WHEN data_nascimento::date > CURRENT_DATE THEN '❌ DATA FUTURA'
        WHEN EXTRACT(year FROM data_nascimento) < 1900 THEN '❌ ANO MUITO ANTIGO'
        WHEN EXTRACT(year FROM data_nascimento) > EXTRACT(year FROM CURRENT_DATE) THEN '❌ ANO FUTURO'
        ELSE '✅ OK'
    END as validacao
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND (
    data_nascimento::date > CURRENT_DATE OR 
    EXTRACT(year FROM data_nascimento) < 1900 OR
    EXTRACT(year FROM data_nascimento) > EXTRACT(year FROM CURRENT_DATE)
); 