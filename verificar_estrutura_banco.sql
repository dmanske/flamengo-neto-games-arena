-- 🔍 VERIFICAR ESTRUTURA DAS TABELAS
-- Execute este SQL para me mostrar as colunas disponíveis

-- Estrutura da tabela viagens
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'viagens' 
ORDER BY ordinal_position;

-- Estrutura da tabela viagem_passageiros  
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros' 
ORDER BY ordinal_position;

-- Estrutura da tabela clientes
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clientes' 
ORDER BY ordinal_position;

-- Ver algumas viagens de exemplo
SELECT * FROM viagens LIMIT 5;

-- Ver alguns passageiros de exemplo
SELECT * FROM viagem_passageiros LIMIT 5;