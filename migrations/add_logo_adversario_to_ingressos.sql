-- Migration: Adicionar coluna logo_adversario à tabela ingressos
-- Data: 2025-01-25
-- Descrição: Adiciona suporte para armazenar URLs de logos dos adversários nos ingressos

-- Adicionar coluna logo_adversario à tabela ingressos
ALTER TABLE ingressos 
ADD COLUMN logo_adversario TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN ingressos.logo_adversario IS 'URL do logo do time adversário';

-- Criar índice para melhorar performance de consultas por adversário
CREATE INDEX IF NOT EXISTS idx_ingressos_adversario ON ingressos(adversario);

-- Opcional: Atualizar registros existentes com logos da tabela adversarios
-- (Descomente as linhas abaixo se quiser popular automaticamente)
/*
UPDATE ingressos 
SET logo_adversario = adversarios.logo_url
FROM adversarios 
WHERE ingressos.adversario = adversarios.nome 
AND ingressos.logo_adversario IS NULL;
*/