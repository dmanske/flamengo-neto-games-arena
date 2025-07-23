-- Execute este SQL no seu banco de dados para adicionar as foreign keys

-- 1. Adicionar FK para viagem_receitas
ALTER TABLE viagem_receitas 
ADD CONSTRAINT fk_viagem_receitas_viagem_id 
FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;

-- 2. Adicionar FK para viagem_despesas  
ALTER TABLE viagem_despesas 
ADD CONSTRAINT fk_viagem_despesas_viagem_id 
FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;

-- 3. Adicionar FK para viagem_orcamento
ALTER TABLE viagem_orcamento 
ADD CONSTRAINT fk_viagem_orcamento_viagem_id 
FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;

-- 4. Adicionar FK para viagem_cobranca_historico
ALTER TABLE viagem_cobranca_historico 
ADD CONSTRAINT fk_cobranca_historico_passageiro_id 
FOREIGN KEY (viagem_passageiro_id) REFERENCES viagem_passageiros(id) ON DELETE CASCADE;

-- Verificar se as FKs foram criadas
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tc.table_name;