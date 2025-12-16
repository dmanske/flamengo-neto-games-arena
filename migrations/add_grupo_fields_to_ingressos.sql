-- Migration: Adicionar campos de grupo na tabela ingressos
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar campos de grupo
ALTER TABLE ingressos 
ADD COLUMN IF NOT EXISTS grupo_nome TEXT,
ADD COLUMN IF NOT EXISTS grupo_cor TEXT;

-- 2. Criar índice para otimizar queries de agrupamento
CREATE INDEX IF NOT EXISTS idx_ingressos_grupo ON ingressos(grupo_nome, grupo_cor);

-- 3. Comentários para documentação
COMMENT ON COLUMN ingressos.grupo_nome IS 'Nome do grupo para agrupamento visual de ingressos (ex: Família Silva)';
COMMENT ON COLUMN ingressos.grupo_cor IS 'Cor hexadecimal do grupo (ex: #FF6B6B)';

-- Verificar se foi criado corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ingressos' 
AND column_name IN ('grupo_nome', 'grupo_cor');

-- ============================================
-- ROLLBACK (caso precise desfazer):
-- ============================================
-- DROP INDEX IF EXISTS idx_ingressos_grupo;
-- ALTER TABLE ingressos DROP COLUMN IF EXISTS grupo_nome, DROP COLUMN IF EXISTS grupo_cor;
