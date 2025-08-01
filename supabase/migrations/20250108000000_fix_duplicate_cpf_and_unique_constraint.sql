-- =====================================================
-- CORRIGIR CPFs DUPLICADOS E CRIAR CONSTRAINT ÚNICA
-- =====================================================
-- Data: 08/01/2025
-- Objetivo: Resolver problema de CPFs duplicados e garantir unicidade

-- 1. Identificar e corrigir CPFs duplicados
-- Estratégia: manter o mais recente e gerar CPFs temporários ÚNICOS para os outros
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

-- 2. Remover índice se existir (para recriar corretamente)
DROP INDEX IF EXISTS idx_clientes_cpf_unique;

-- 3. Primeiro, lidar com CPFs vazios duplicados
WITH cpfs_vazios AS (
    SELECT id,
           ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM clientes 
    WHERE cpf IS NULL OR cpf = ''
)
UPDATE clientes 
SET cpf = 'EMPTY_' || LPAD(cpfs_vazios.rn::text, 6, '0')
FROM cpfs_vazios
WHERE clientes.id = cpfs_vazios.id;

-- 4. Agora criar constraint única (todos os CPFs são únicos)
ALTER TABLE clientes 
ADD CONSTRAINT clientes_cpf_unique 
UNIQUE (cpf);

-- 5. Criar índice parcial separado para performance (opcional)
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_partial
ON clientes (cpf) 
WHERE cpf IS NOT NULL AND cpf != '' AND cpf NOT LIKE 'TEMP_%' AND cpf NOT LIKE 'EMPTY_%';

-- 6. Comentário na tabela para documentar a mudança
COMMENT ON CONSTRAINT clientes_cpf_unique ON clientes IS 
'Garante que cada CPF seja único na tabela. CPFs temporários (TEMP_*) e vazios (EMPTY_*) foram gerados para resolver duplicatas.';

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se ainda existem CPFs duplicados (excluindo temporários)
DO $$
DECLARE
    duplicate_count INTEGER;
    temp_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT cpf
        FROM clientes 
        WHERE cpf IS NOT NULL AND cpf != '' AND cpf NOT LIKE 'TEMP_%'
        GROUP BY cpf 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    SELECT COUNT(*) INTO temp_count
    FROM clientes 
    WHERE cpf LIKE 'TEMP_%' OR cpf LIKE 'EMPTY_%';
    
    IF duplicate_count > 0 THEN
        RAISE EXCEPTION 'Ainda existem % CPFs duplicados após a limpeza', duplicate_count;
    ELSE
        RAISE NOTICE 'Sucesso: Nenhum CPF duplicado encontrado. % registros com CPF temporário/vazio criados.', temp_count;
    END IF;
END $$;

-- Verificar se a constraint foi criada
DO $$
DECLARE
    constraint_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'clientes'::regclass 
        AND conname = 'clientes_cpf_unique'
        AND contype = 'u'
    ) INTO constraint_exists;
    
    IF constraint_exists THEN
        RAISE NOTICE 'Sucesso: Constraint clientes_cpf_unique criada';
    ELSE
        RAISE EXCEPTION 'Erro: Constraint clientes_cpf_unique não foi criada';
    END IF;
END $$;