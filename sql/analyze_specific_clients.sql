-- Script para analisar clientes específicos (Virginio e Arnaldo)
-- Execute este script e me envie os resultados

-- 1. Buscar Virginio e Arnaldo especificamente
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::text as timestamp_completo,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_atual_timestamp,
    EXTRACT(day FROM data_nascimento::date) as dia_correto_date,
    EXTRACT(month FROM data_nascimento) as mes,
    EXTRACT(year FROM data_nascimento) as ano,
    CASE 
        WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
        THEN CONCAT('❌ DIFERENÇA: ', 
                   EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento), 
                   ' dias')
        ELSE '✅ OK'
    END as problema_timezone,
    CONCAT(
        EXTRACT(day FROM data_nascimento::date), '/',
        EXTRACT(month FROM data_nascimento::date), '/',
        EXTRACT(year FROM data_nascimento::date)
    ) as data_brasileira_correta
FROM clientes 
WHERE LOWER(nome) LIKE '%virginio%' 
   OR LOWER(nome) LIKE '%arnaldo%'
ORDER BY nome;

-- 2. Analisar padrões de diferença de dias
SELECT 
    'Análise de diferenças' as tipo,
    COUNT(*) as total_clientes,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 1 
        THEN 1 
    END) as diferenca_1_dia,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 2 
        THEN 1 
    END) as diferenca_2_dias,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 3 
        THEN 1 
    END) as diferenca_3_dias,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento) = EXTRACT(day FROM data_nascimento::date) 
        THEN 1 
    END) as sem_diferenca
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 3a. Exemplos de diferença de 1 dia
SELECT 
    'Diferença de 1 dia' as tipo_problema,
    id,
    nome,
    data_nascimento::text as timestamp_original,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_errado,
    EXTRACT(day FROM data_nascimento::date) as dia_correto
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 1
LIMIT 3;

-- 3b. Exemplos de diferença de 2 dias
SELECT 
    'Diferença de 2 dias' as tipo_problema,
    id,
    nome,
    data_nascimento::text as timestamp_original,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_errado,
    EXTRACT(day FROM data_nascimento::date) as dia_correto
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 2
LIMIT 3;

-- 3c. Exemplos de diferença de 3 dias
SELECT 
    'Diferença de 3 dias' as tipo_problema,
    id,
    nome,
    data_nascimento::text as timestamp_original,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_errado,
    EXTRACT(day FROM data_nascimento::date) as dia_correto
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 3
LIMIT 3;

-- 4. Verificar o timezone atual do banco
SELECT 
    name,
    setting,
    short_desc
FROM pg_settings 
WHERE name IN ('timezone', 'log_timezone');

-- 5. Mostrar como as datas estão sendo interpretadas
SELECT 
    'Análise de timezone' as info,
    NOW() as hora_atual_servidor,
    NOW()::date as data_atual_servidor,
    EXTRACT(timezone_hour FROM NOW()) as offset_horas,
    EXTRACT(timezone_minute FROM NOW()) as offset_minutos;

-- 6a. Clientes recentes (últimos 30 dias)
SELECT 
    'Clientes recentes (últimos 30 dias)' as categoria,
    COUNT(*) as total,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
        THEN 1 
    END) as com_problema_timezone
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND created_at >= NOW() - INTERVAL '30 days';

-- 6b. Clientes antigos (mais de 30 dias)
SELECT 
    'Clientes antigos (mais de 30 dias)' as categoria,
    COUNT(*) as total,
    COUNT(CASE 
        WHEN EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date) 
        THEN 1 
    END) as com_problema_timezone
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND (created_at < NOW() - INTERVAL '30 days' OR created_at IS NULL); 