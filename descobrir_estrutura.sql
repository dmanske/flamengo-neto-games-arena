-- 🔍 DESCOBRIR ESTRUTURA REAL DO BANCO

-- 1. Ver estrutura da tabela viagens
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'viagens' 
ORDER BY ordinal_position;

-- 2. Ver estrutura da tabela viagem_passageiros
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros' 
ORDER BY ordinal_position;

-- 3. Ver estrutura da tabela passageiro_passeios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'passageiro_passeios' 
ORDER BY ordinal_position;

-- 4. Ver estrutura da tabela clientes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- 5. Ver algumas viagens de exemplo (primeiras 3 colunas)
SELECT * FROM viagens ORDER BY created_at DESC LIMIT 3;

-- 6. Ver se existe tabela passeios
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'passeios' 
ORDER BY ordinal_position;

-- 7. Contar registros em cada tabela
SELECT 
    'viagens' as tabela, COUNT(*) as total FROM viagens
UNION ALL
SELECT 
    'viagem_passageiros' as tabela, COUNT(*) as total FROM viagem_passageiros
UNION ALL
SELECT 
    'passageiro_passeios' as tabela, COUNT(*) as total FROM passageiro_passeios
UNION ALL
SELECT 
    'clientes' as tabela, COUNT(*) as total FROM clientes;