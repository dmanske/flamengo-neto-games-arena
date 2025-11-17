-- =====================================================
-- VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================
-- Execute este SQL no Supabase para verificar as políticas
-- atuais das tabelas usadas pelo scanner público
-- =====================================================

-- 1. Verificar se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'viagens',
    'viagem_onibus', 
    'viagem_passageiros',
    'clientes',
    'passageiro_passeios',
    'historico_pagamentos_categorizado'
)
ORDER BY tablename;

-- 2. Verificar políticas existentes para cada tabela
SELECT 
    schemaname,
    tablename,
    policyname as "Nome da Política",
    permissive as "Permissiva",
    roles as "Roles",
    cmd as "Comando",
    qual as "Condição USING",
    with_check as "Condição WITH CHECK"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'viagens',
    'viagem_onibus',
    'viagem_passageiros', 
    'clientes',
    'passageiro_passeios',
    'historico_pagamentos_categorizado'
)
ORDER BY tablename, policyname;

-- 3. Verificar especificamente políticas para role 'anon' (usuários não autenticados)
SELECT 
    tablename as "Tabela",
    policyname as "Política",
    cmd as "Operação",
    CASE 
        WHEN 'anon' = ANY(roles) THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as "Permite Anon"
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'viagens',
    'viagem_onibus',
    'viagem_passageiros',
    'clientes',
    'passageiro_passeios',
    'historico_pagamentos_categorizado'
)
ORDER BY tablename, cmd;

-- 4. Resumo: Quais tabelas permitem acesso público (anon)?
SELECT 
    t.tablename as "Tabela",
    t.rowsecurity as "RLS Ativo",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = t.tablename 
            AND p.schemaname = 'public'
            AND 'anon' = ANY(p.roles)
            AND p.cmd = 'SELECT'
        ) THEN '✅ Permite Leitura Pública'
        ELSE '❌ Bloqueia Leitura Pública'
    END as "Status Leitura",
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies p 
            WHERE p.tablename = t.tablename 
            AND p.schemaname = 'public'
            AND 'anon' = ANY(p.roles)
            AND p.cmd = 'UPDATE'
        ) THEN '✅ Permite Atualização Pública'
        ELSE '❌ Bloqueia Atualização Pública'
    END as "Status Atualização"
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

-- =====================================================
-- INTERPRETAÇÃO DOS RESULTADOS
-- =====================================================
-- 
-- Se alguma tabela mostrar "❌ Bloqueia Leitura Pública":
-- → O scanner público NÃO conseguirá ler os dados
-- → Você precisa executar o arquivo add_public_access_scanner.sql
--
-- Se "viagem_passageiros" mostrar "❌ Bloqueia Atualização Pública":
-- → O scanner NÃO conseguirá marcar presença
-- → Você precisa executar o arquivo add_public_access_scanner.sql
--
-- =====================================================
