-- =====================================================
-- ADIÇÃO DE FOREIGN KEYS - SISTEMA FINANCEIRO
-- =====================================================
-- Execute APÓS criar as tabelas principais
-- Verifica se as tabelas de referência existem antes de criar as FKs

-- =====================================================
-- 1. VERIFICAR TABELAS DE REFERÊNCIA
-- =====================================================

-- Verificar se a tabela 'viagens' existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagens') THEN
        RAISE NOTICE 'Tabela viagens encontrada ✅';
        
        -- Adicionar FK para viagem_receitas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_viagem_receitas_viagem_id'
        ) THEN
            ALTER TABLE viagem_receitas 
            ADD CONSTRAINT fk_viagem_receitas_viagem_id 
            FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK viagem_receitas → viagens criada ✅';
        END IF;
        
        -- Adicionar FK para viagem_despesas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_viagem_despesas_viagem_id'
        ) THEN
            ALTER TABLE viagem_despesas 
            ADD CONSTRAINT fk_viagem_despesas_viagem_id 
            FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK viagem_despesas → viagens criada ✅';
        END IF;
        
        -- Adicionar FK para viagem_orcamento
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_viagem_orcamento_viagem_id'
        ) THEN
            ALTER TABLE viagem_orcamento 
            ADD CONSTRAINT fk_viagem_orcamento_viagem_id 
            FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK viagem_orcamento → viagens criada ✅';
        END IF;
        
    ELSE
        RAISE WARNING 'Tabela viagens NÃO encontrada ❌ - FKs não criadas';
    END IF;
END $$;

-- =====================================================
-- 2. VERIFICAR TABELA VIAGEM_PASSAGEIROS
-- =====================================================

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagem_passageiros') THEN
        RAISE NOTICE 'Tabela viagem_passageiros encontrada ✅';
        
        -- Adicionar FK para viagem_cobranca_historico
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'fk_cobranca_historico_passageiro_id'
        ) THEN
            ALTER TABLE viagem_cobranca_historico 
            ADD CONSTRAINT fk_cobranca_historico_passageiro_id 
            FOREIGN KEY (viagem_passageiro_id) REFERENCES viagem_passageiros(id) ON DELETE CASCADE;
            RAISE NOTICE 'FK viagem_cobranca_historico → viagem_passageiros criada ✅';
        END IF;
        
    ELSE
        RAISE WARNING 'Tabela viagem_passageiros NÃO encontrada ❌ - FK não criada';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAÇÃO FINAL
-- =====================================================

-- Listar todas as foreign keys criadas
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- SCRIPT CONCLUÍDO ✅
-- =====================================================