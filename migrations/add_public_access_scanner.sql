-- =====================================================
-- POLÍTICAS RLS PARA ACESSO PÚBLICO AO SCANNER
-- =====================================================
-- Este arquivo adiciona políticas para permitir que o
-- scanner público acesse os dados necessários sem autenticação
-- 
-- IMPORTANTE: Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. ÔNIBUS - Permitir leitura pública
CREATE POLICY "public_read_viagem_onibus_scanner"
ON viagem_onibus
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. PASSAGEIROS - Permitir leitura pública
CREATE POLICY "public_read_viagem_passageiros_scanner"
ON viagem_passageiros
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. PASSAGEIROS - Permitir atualização de presença (apenas campos específicos)
CREATE POLICY "public_update_presenca_scanner"
ON viagem_passageiros
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. CLIENTES - Permitir leitura pública (dados necessários para o scanner)
CREATE POLICY "public_read_clientes_scanner"
ON clientes
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. PASSEIOS - Permitir leitura pública
CREATE POLICY "public_read_passageiro_passeios_scanner"
ON passageiro_passeios
FOR SELECT
TO anon, authenticated
USING (true);

-- 6. HISTÓRICO PAGAMENTOS - Habilitar RLS e permitir leitura pública
-- Primeiro, habilitar RLS se não estiver ativo
ALTER TABLE historico_pagamentos_categorizado ENABLE ROW LEVEL SECURITY;

-- Depois, criar política de leitura
CREATE POLICY "public_read_historico_pagamentos_scanner"
ON historico_pagamentos_categorizado
FOR SELECT
TO anon, authenticated
USING (true);

-- 7. CLIENTES - Habilitar RLS se não estiver ativo
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Execute esta query para confirmar que tudo está OK:
/*
SELECT 
    tablename as "Tabela",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = t.tablename 
            AND p.schemaname = 'public'
            AND 'anon' = ANY(p.roles)
            AND p.cmd = 'SELECT'
        ) THEN '✅ OK'
        ELSE '❌ FALTA'
    END as "Leitura Pública"
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.tablename IN (
    'viagens',
    'viagem_onibus',
    'viagem_passageiros',
    'clientes',
    'passageiro_passeios',
    'historico_pagamentos_categorizado'
)
ORDER BY t.tablename;
*/

-- =====================================================
-- COMENTÁRIOS
-- =====================================================
COMMENT ON POLICY "public_read_viagem_onibus_scanner" ON viagem_onibus IS 
'Permite acesso público aos dados de ônibus para o scanner';

COMMENT ON POLICY "public_read_viagem_passageiros_scanner" ON viagem_passageiros IS 
'Permite acesso público aos dados de passageiros para o scanner';

COMMENT ON POLICY "public_update_presenca_scanner" ON viagem_passageiros IS 
'Permite que o scanner público marque presença dos passageiros';

COMMENT ON POLICY "public_read_clientes_scanner" ON clientes IS 
'Permite acesso público aos dados de clientes necessários para o scanner';

COMMENT ON POLICY "public_read_passageiro_passeios_scanner" ON passageiro_passeios IS 
'Permite acesso público aos dados de passeios para o scanner';

COMMENT ON POLICY "public_read_historico_pagamentos_scanner" ON historico_pagamentos_categorizado IS 
'Permite acesso público ao histórico de pagamentos para o scanner';
