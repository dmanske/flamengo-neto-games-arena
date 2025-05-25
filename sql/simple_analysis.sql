-- Script simples para análise rápida dos problemas de timezone
-- Execute este script no SQL Editor do Supabase

-- 1. Buscar Virginio e Arnaldo
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_atual,
    EXTRACT(day FROM data_nascimento::date) as dia_correto,
    EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) as diferenca_dias
FROM clientes 
WHERE LOWER(nome) LIKE '%virginio%' 
   OR LOWER(nome) LIKE '%arnaldo%'
ORDER BY nome;

-- 2. Contar problemas por tipo
SELECT 
    COUNT(*) as total_clientes,
    COUNT(CASE WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 1 THEN 1 END) as diferenca_1_dia,
    COUNT(CASE WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 2 THEN 1 END) as diferenca_2_dias,
    COUNT(CASE WHEN EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) = 3 THEN 1 END) as diferenca_3_dias,
    COUNT(CASE WHEN EXTRACT(day FROM data_nascimento) = EXTRACT(day FROM data_nascimento::date) THEN 1 END) as sem_problema
FROM clientes 
WHERE data_nascimento IS NOT NULL;

-- 3. Mostrar alguns exemplos de cada problema
SELECT 
    id,
    nome,
    data_nascimento,
    data_nascimento::date as data_corrigida,
    EXTRACT(day FROM data_nascimento) as dia_atual,
    EXTRACT(day FROM data_nascimento::date) as dia_correto,
    EXTRACT(day FROM data_nascimento::date) - EXTRACT(day FROM data_nascimento) as diferenca
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date)
ORDER BY diferenca DESC, nome
LIMIT 10;

-- 4. Verificar timezone do servidor
SELECT 
    name,
    setting
FROM pg_settings 
WHERE name = 'timezone';

-- 5. Quantos registros seriam corrigidos
SELECT 
    COUNT(*) as total_para_corrigir
FROM clientes 
WHERE data_nascimento IS NOT NULL 
AND EXTRACT(day FROM data_nascimento) != EXTRACT(day FROM data_nascimento::date); 