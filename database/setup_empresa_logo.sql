-- =====================================================
-- SETUP COMPLETO PARA LOGO DA EMPRESA
-- =====================================================
-- Execute este script para configurar tudo relacionado à logo da empresa

-- =====================================================
-- 1. CRIAR TABELA DE CONFIGURAÇÕES DA EMPRESA
-- =====================================================

CREATE TABLE IF NOT EXISTS empresa_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18),
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    logo_url VARCHAR(500),
    logo_bucket_path VARCHAR(500),
    site VARCHAR(255),
    instagram VARCHAR(255),
    facebook VARCHAR(255),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. CRIAR BUCKET PARA LOGOS (se não existir)
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. POLÍTICAS DE ACESSO PARA LOGOS
-- =====================================================

-- Política para permitir upload de logos (usuários autenticados)
CREATE POLICY "Usuários autenticados podem fazer upload de logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

-- Política para permitir visualização pública de logos
CREATE POLICY "Logos são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

-- Política para permitir atualização de logos (usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');

-- Política para permitir exclusão de logos (usuários autenticados)
CREATE POLICY "Usuários autenticados podem excluir logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- =====================================================
-- 4. INSERIR DADOS INICIAIS DA EMPRESA
-- =====================================================

INSERT INTO empresa_config (
    nome,
    nome_fantasia,
    email,
    telefone,
    whatsapp,
    endereco,
    cidade,
    estado,
    cep,
    descricao,
    ativo
) VALUES (
    'Sua Empresa de Viagens',
    'Viagens & Turismo',
    'contato@suaempresa.com',
    '(11) 99999-9999',
    '11999999999',
    'Rua das Viagens, 123',
    'São Paulo',
    'SP',
    '01234-567',
    'Empresa especializada em viagens para jogos de futebol e turismo esportivo.',
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. TRIGGER PARA UPDATED_AT
-- =====================================================

-- Criar função se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger
CREATE TRIGGER update_empresa_config_updated_at 
    BEFORE UPDATE ON empresa_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_empresa_config_ativo ON empresa_config(ativo);

-- =====================================================
-- 7. VERIFICAÇÕES
-- =====================================================

-- Verificar se a tabela foi criada
SELECT 'Tabela empresa_config criada com sucesso!' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'empresa_config'
);

-- Verificar se o bucket foi criado
SELECT 'Bucket logos criado com sucesso!' as status
WHERE EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'logos'
);

-- Verificar dados iniciais
SELECT 
    nome,
    nome_fantasia,
    email,
    'Dados iniciais inseridos com sucesso!' as status
FROM empresa_config 
WHERE ativo = true 
LIMIT 1;

-- =====================================================
-- 8. INSTRUÇÕES DE USO
-- =====================================================

/*
INSTRUÇÕES PARA USO:

1. Execute este script no SQL Editor do Supabase
2. Acesse o painel administrativo em /dashboard/empresa/configuracoes
3. Faça upload da logo da sua empresa
4. Preencha as informações da empresa
5. A logo aparecerá automaticamente no cadastro público

FUNCIONALIDADES IMPLEMENTADAS:
✅ Tabela para armazenar dados da empresa
✅ Bucket de storage para logos
✅ Políticas de segurança configuradas
✅ Componente React para upload de logo
✅ Hook para acessar dados da empresa
✅ Componente para exibir logo
✅ Integração com cadastro público
✅ Página de configurações no painel admin
✅ Menu de navegação atualizado

PRÓXIMOS PASSOS:
1. Personalize os dados iniciais da empresa
2. Faça upload da sua logo
3. Teste o cadastro público
4. Customize o visual conforme necessário
*/

-- =====================================================
-- SETUP CONCLUÍDO! ✅
-- =====================================================