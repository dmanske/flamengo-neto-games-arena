-- =====================================================
-- CORRIGIR CPFs DUPLICADOS ANTES DE CRIAR CONSTRAINT
-- =====================================================

-- 1. Verificar CPFs duplicados
SELECT cpf, COUNT(*) as total, 
       STRING_AGG(nome, ', ') as nomes,
       STRING_AGG(id::text, ', ') as ids
FROM clientes 
WHERE cpf IS NOT NULL AND cpf != ''
GROUP BY cpf 
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 2. Limpar CPFs duplicados automaticamente - manter apenas o mais recente
-- Gerar CPFs temporários ÚNICOS para os duplicados em vez de NULL
WITH duplicados AS (
    SELECT cpf, 
           ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY created_at DESC) as rn,
           id
    FROM clientes 
    WHERE cpf IS NOT NULL AND cpf != ''
),
cpfs_para_atualizar AS (
    SELECT id, 
           'TEMP_' || EXTRACT(EPOCH FROM NOW())::bigint || '_' || 
           SUBSTRING(MD5(id::text), 1, 8) as novo_cpf
    FROM duplicados 
    WHERE rn > 1
)
UPDATE clientes 
SET cpf = cpfs_para_atualizar.novo_cpf
FROM cpfs_para_atualizar
WHERE clientes.id = cpfs_para_atualizar.id;

-- 3. Verificar se ainda há duplicados (deve retornar vazio)
SELECT cpf, COUNT(*) as total
FROM clientes 
WHERE cpf IS NOT NULL AND cpf != ''
GROUP BY cpf 
HAVING COUNT(*) > 1;

-- 4. Remover índice se existir
DROP INDEX IF EXISTS idx_clientes_cpf_unique;

-- 5. Criar constraint única diretamente
ALTER TABLE clientes 
ADD CONSTRAINT clientes_cpf_unique 
UNIQUE (cpf);

-- 6. Criar índice parcial para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_partial
ON clientes (cpf) 
WHERE cpf IS NOT NULL AND cpf != '' AND cpf NOT LIKE 'TEMP_%';

-- 7. Verificar se a constraint foi criada e mostrar CPFs temporários
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'clientes'::regclass 
AND contype = 'u';

-- 8. Mostrar registros com CPF temporário (para correção manual posterior)
SELECT id, nome, cpf, telefone, email, created_at
FROM clientes 
WHERE cpf LIKE 'TEMP_%'
ORDER BY created_at DESC;