-- =====================================================
-- CORRIGIR POLÍTICAS DE INSERÇÃO/ATUALIZAÇÃO
-- =====================================================
-- Adiciona políticas para permitir que usuários autenticados
-- possam inserir, atualizar e deletar pagamentos
-- =====================================================

-- 1. Permitir INSERT para usuários autenticados
CREATE POLICY "authenticated_insert_historico_pagamentos"
ON historico_pagamentos_categorizado
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 2. Permitir UPDATE para usuários autenticados
CREATE POLICY "authenticated_update_historico_pagamentos"
ON historico_pagamentos_categorizado
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. Permitir DELETE para usuários autenticados
CREATE POLICY "authenticated_delete_historico_pagamentos"
ON historico_pagamentos_categorizado
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- FAZER O MESMO PARA OUTRAS TABELAS QUE PODEM TER PROBLEMA
-- =====================================================

-- CLIENTES - Permitir operações para usuários autenticados
CREATE POLICY "authenticated_insert_clientes"
ON clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_clientes"
ON clientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_clientes"
ON clientes
FOR DELETE
TO authenticated
USING (true);

-- PASSAGEIRO_PASSEIOS - Permitir operações para usuários autenticados
CREATE POLICY "authenticated_insert_passageiro_passeios"
ON passageiro_passeios
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_passageiro_passeios"
ON passageiro_passeios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_passageiro_passeios"
ON passageiro_passeios
FOR DELETE
TO authenticated
USING (true);

-- VIAGEM_ONIBUS - Permitir operações para usuários autenticados
CREATE POLICY "authenticated_insert_viagem_onibus"
ON viagem_onibus
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_viagem_onibus"
ON viagem_onibus
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_viagem_onibus"
ON viagem_onibus
FOR DELETE
TO authenticated
USING (true);

-- VIAGEM_PASSAGEIROS - Permitir INSERT e DELETE para usuários autenticados
CREATE POLICY "authenticated_insert_viagem_passageiros"
ON viagem_passageiros
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_delete_viagem_passageiros"
ON viagem_passageiros
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
-- Execute para verificar se todas as políticas foram criadas:
/*
SELECT 
    tablename as "Tabela",
    policyname as "Política",
    cmd as "Operação",
    roles as "Roles"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'historico_pagamentos_categorizado',
    'clientes',
    'passageiro_passeios',
    'viagem_onibus',
    'viagem_passageiros'
)
ORDER BY tablename, cmd;
*/

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON POLICY "authenticated_insert_historico_pagamentos" ON historico_pagamentos_categorizado IS 
'Permite que usuários autenticados insiram pagamentos';

COMMENT ON POLICY "authenticated_update_historico_pagamentos" ON historico_pagamentos_categorizado IS 
'Permite que usuários autenticados atualizem pagamentos';

COMMENT ON POLICY "authenticated_delete_historico_pagamentos" ON historico_pagamentos_categorizado IS 
'Permite que usuários autenticados deletem pagamentos';
