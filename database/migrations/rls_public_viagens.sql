-- ========================================
-- POLÍTICA RLS PÚBLICA PARA LANDING PAGE
-- ========================================
-- Permite que visitantes anônimos vejam viagens
-- sem precisar estar logados no sistema
-- Data: 2025-01-27

-- 1. Remover política antiga se existir
DROP POLICY IF EXISTS "Permitir leitura pública de viagens" ON viagens;

-- 2. Criar política pública para leitura de viagens
CREATE POLICY "Permitir leitura pública de viagens"
ON viagens
FOR SELECT
TO anon, authenticated  -- Permite tanto usuários anônimos quanto autenticados
USING (true);  -- Permite ler todas as viagens

-- 3. Verificar se RLS está ativo (deve estar)
ALTER TABLE viagens ENABLE ROW LEVEL SECURITY;

-- ========================================
-- EXPLICAÇÃO
-- ========================================
-- Esta política permite que:
-- ✅ Visitantes da landing page vejam as viagens disponíveis
-- ✅ Sistema administrativo continue funcionando normalmente
-- ✅ Apenas LEITURA é permitida (SELECT)
-- ❌ Visitantes NÃO podem criar, editar ou deletar viagens
-- ❌ Dados sensíveis continuam protegidos por outras políticas

-- ========================================
-- TESTE
-- ========================================
-- Para testar se funcionou:
-- 1. Execute este SQL no Supabase
-- 2. Abra a landing page sem estar logado
-- 3. As viagens devem aparecer normalmente

-- ========================================
-- SEGURANÇA
-- ========================================
-- ✅ Seguro: Apenas leitura de dados públicos
-- ✅ Outras tabelas continuam protegidas
-- ✅ Operações de escrita continuam restritas
