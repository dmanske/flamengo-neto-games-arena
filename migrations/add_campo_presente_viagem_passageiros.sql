-- =====================================================
-- MIGRAÇÃO: Adicionar campo 'presente' na tabela viagem_passageiros
-- DATA: 30/08/2025
-- OBJETIVO: Permitir controle de presença para relatórios
-- =====================================================

-- 1. Verificar se o campo já existe (evitar erro se já existir)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'viagem_passageiros' 
        AND column_name = 'presente'
    ) THEN
        -- 2. Adicionar campo presente (nullable para compatibilidade)
        ALTER TABLE viagem_passageiros 
        ADD COLUMN presente BOOLEAN DEFAULT NULL;
        
        -- 3. Adicionar comentário para documentação
        COMMENT ON COLUMN viagem_passageiros.presente IS 'Controle de presença: true=presente, false=ausente, null=não verificado';
        
        RAISE NOTICE 'Campo "presente" adicionado com sucesso à tabela viagem_passageiros';
    ELSE
        RAISE NOTICE 'Campo "presente" já existe na tabela viagem_passageiros';
    END IF;
END $$;

-- 4. Verificar se a migração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros' 
AND column_name = 'presente';

-- =====================================================
-- RESULTADO ESPERADO:
-- - Campo 'presente' adicionado (se não existia)
-- - Tipo: BOOLEAN
-- - Nullable: YES (para compatibilidade)
-- - Default: NULL
-- =====================================================