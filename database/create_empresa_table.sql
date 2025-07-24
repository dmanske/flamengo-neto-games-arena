-- =====================================================
-- TABELA DE INFORMAÇÕES DA EMPRESA
-- =====================================================
-- Armazena informações da empresa/organização incluindo logo

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
-- INSERIR DADOS INICIAIS DA EMPRESA
-- =====================================================
-- Insere um registro inicial que pode ser editado depois

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
-- TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_empresa_config_updated_at 
    BEFORE UPDATE ON empresa_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_empresa_config_ativo ON empresa_config(ativo);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a tabela foi criada
SELECT * FROM empresa_config WHERE ativo = true LIMIT 1;