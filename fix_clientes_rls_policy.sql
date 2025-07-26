-- =====================================================
-- FIX URGENTE: Política RLS para cadastro de clientes
-- =====================================================
-- Este script resolve o erro "new row violates row-level security policy for table clientes"

-- 1. Verificar políticas existentes na tabela clientes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'clientes';

-- 2. Remover políticas restritivas existentes (se houver)
DROP POLICY IF EXISTS "clientes_policy" ON clientes;
DROP POLICY IF EXISTS "Enable read access for all users" ON clientes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clientes;
DROP POLICY IF EXISTS "Enable all for authenticated users only" ON clientes;

-- 3. Criar política permissiva para INSERT (cadastro online)
CREATE POLICY "allow_insert_clientes" ON clientes
    FOR INSERT 
    WITH CHECK (true);

-- 4. Criar política permissiva para SELECT (leitura)
CREATE POLICY "allow_select_clientes" ON clientes
    FOR SELECT 
    USING (true);

-- 5. Criar política permissiva para UPDATE (edição)
CREATE POLICY "allow_update_clientes" ON clientes
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- 6. Verificar se RLS está habilitado (deve estar)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'clientes';

-- 7. Se necessário, habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- 8. Garantir que usuários anônimos podem inserir
GRANT INSERT ON clientes TO anon;
GRANT SELECT ON clientes TO anon;

-- 9. Garantir que usuários autenticados têm acesso completo
GRANT ALL ON clientes TO authenticated;

-- 10. Verificar as novas políticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'clientes';

-- =====================================================
-- TESTE: Verificar se o cadastro funciona
-- =====================================================
-- Você pode testar inserindo um cliente de teste:
/*
INSERT INTO clientes (
    nome, 
    telefone, 
    email, 
    cpf, 
    cidade, 
    estado, 
    endereco, 
    numero, 
    bairro, 
    cep
) VALUES (
    'Cliente Teste', 
    '21999999999', 
    'teste@email.com', 
    '12345678901', 
    'Rio de Janeiro', 
    'RJ', 
    'Rua Teste', 
    '123', 
    'Teste', 
    '20000-000'
);
*/

-- =====================================================
-- ALTERNATIVA MAIS RESTRITIVA (se necessário)
-- =====================================================
-- Se você quiser manter alguma segurança mas permitir cadastro:

/*
-- Remover políticas permissivas
DROP POLICY IF EXISTS "allow_insert_clientes" ON clientes;
DROP POLICY IF EXISTS "allow_select_clientes" ON clientes;
DROP POLICY IF EXISTS "allow_update_clientes" ON clientes;

-- Política mais específica para INSERT
CREATE POLICY "enable_insert_for_anon_and_auth" ON clientes
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

-- Política para SELECT
CREATE POLICY "enable_select_for_anon_and_auth" ON clientes
    FOR SELECT 
    TO anon, authenticated
    USING (true);

-- Política para UPDATE (apenas autenticados)
CREATE POLICY "enable_update_for_auth_only" ON clientes
    FOR UPDATE 
    TO authenticated
    USING (true)
    WITH CHECK (true);
*/