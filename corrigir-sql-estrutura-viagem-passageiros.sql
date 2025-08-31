-- SQL para descobrir a estrutura correta da tabela viagem_passageiros
-- Execute este SQL primeiro para descobrir os campos corretos

-- 1. Verificar estrutura da tabela viagem_passageiros
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar alguns registros para entender os dados
SELECT *
FROM viagem_passageiros
LIMIT 5;

-- 3. Verificar estrutura da tabela passageiro_passeios
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'passageiro_passeios' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar alguns registros de passageiro_passeios
SELECT *
FROM passageiro_passeios
LIMIT 5;