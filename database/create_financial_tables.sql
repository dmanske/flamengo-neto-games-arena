-- =====================================================
-- SISTEMA FINANCEIRO DA VIAGEM - CRIAÇÃO DE TABELAS
-- =====================================================
-- Data: Janeiro 2025
-- Objetivo: Criar estrutura completa para gestão financeira

-- =====================================================
-- 1. TABELA DE RECEITAS DA VIAGEM
-- =====================================================
-- Armazena todas as receitas extras além dos passageiros
-- (patrocínios, vendas, extras, etc.)

CREATE TABLE IF NOT EXISTS viagem_receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id UUID NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('passageiro', 'patrocinio', 'vendas', 'extras')),
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    forma_pagamento VARCHAR(30) CHECK (forma_pagamento IN ('pix', 'cartao', 'dinheiro', 'transferencia', 'boleto')),
    status VARCHAR(20) DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente', 'cancelado')),
    data_recebimento DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE DESPESAS DA VIAGEM
-- =====================================================
-- Armazena todas as despesas organizadas por categoria

CREATE TABLE IF NOT EXISTS viagem_despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id UUID NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('transporte', 'hospedagem', 'alimentacao', 'ingressos', 'pessoal', 'administrativo')),
    subcategoria VARCHAR(50),
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    forma_pagamento VARCHAR(30) CHECK (forma_pagamento IN ('pix', 'cartao', 'dinheiro', 'transferencia', 'boleto')),
    status VARCHAR(20) DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
    data_despesa DATE NOT NULL,
    comprovante_url VARCHAR(500),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE HISTÓRICO DE COBRANÇA
-- =====================================================
-- Registra todas as tentativas de cobrança

CREATE TABLE IF NOT EXISTS viagem_cobranca_historico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_passageiro_id UUID NOT NULL,
    tipo_contato VARCHAR(20) NOT NULL CHECK (tipo_contato IN ('whatsapp', 'email', 'telefone', 'presencial')),
    template_usado VARCHAR(50),
    status_envio VARCHAR(20) DEFAULT 'enviado' CHECK (status_envio IN ('enviado', 'lido', 'respondido', 'erro')),
    data_tentativa TIMESTAMP DEFAULT NOW(),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE ORÇAMENTO DA VIAGEM
-- =====================================================
-- Controla orçado vs realizado por categoria

CREATE TABLE IF NOT EXISTS viagem_orcamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viagem_id UUID NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(50),
    valor_orcado DECIMAL(10,2) NOT NULL CHECK (valor_orcado >= 0),
    valor_realizado DECIMAL(10,2) DEFAULT 0 CHECK (valor_realizado >= 0),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para viagem_receitas
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_viagem_id ON viagem_receitas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_categoria ON viagem_receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_data ON viagem_receitas(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_status ON viagem_receitas(status);

-- Índices para viagem_despesas
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_viagem_id ON viagem_despesas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_categoria ON viagem_despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_data ON viagem_despesas(data_despesa);
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_status ON viagem_despesas(status);

-- Índices para viagem_cobranca_historico
CREATE INDEX IF NOT EXISTS idx_cobranca_historico_passageiro ON viagem_cobranca_historico(viagem_passageiro_id);
CREATE INDEX IF NOT EXISTS idx_cobranca_historico_data ON viagem_cobranca_historico(data_tentativa);

-- Índices para viagem_orcamento
CREATE INDEX IF NOT EXISTS idx_viagem_orcamento_viagem_id ON viagem_orcamento(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_orcamento_categoria ON viagem_orcamento(categoria);

-- =====================================================
-- 6. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_viagem_receitas_updated_at 
    BEFORE UPDATE ON viagem_receitas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viagem_despesas_updated_at 
    BEFORE UPDATE ON viagem_despesas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_viagem_orcamento_updated_at 
    BEFORE UPDATE ON viagem_orcamento 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir algumas receitas de exemplo (descomente se necessário)
/*
INSERT INTO viagem_receitas (viagem_id, descricao, categoria, valor, forma_pagamento, data_recebimento) VALUES
('exemplo-uuid-viagem', 'Patrocínio Empresa XYZ', 'patrocinio', 1500.00, 'transferencia', '2025-01-15'),
('exemplo-uuid-viagem', 'Venda de Camisetas', 'vendas', 300.00, 'pix', '2025-01-16'),
('exemplo-uuid-viagem', 'Passeio Extra Cristo', 'extras', 800.00, 'cartao', '2025-01-17');
*/

-- Inserir algumas despesas de exemplo (descomente se necessário)
/*
INSERT INTO viagem_despesas (viagem_id, fornecedor, categoria, subcategoria, valor, forma_pagamento, data_despesa) VALUES
('exemplo-uuid-viagem', 'Posto Shell BR', 'transporte', 'combustivel', 850.00, 'cartao', '2025-01-15'),
('exemplo-uuid-viagem', 'Hotel Copacabana', 'hospedagem', 'hotel', 1200.00, 'transferencia', '2025-01-16'),
('exemplo-uuid-viagem', 'Restaurante Garota de Ipanema', 'alimentacao', 'almoco', 600.00, 'pix', '2025-01-17');
*/

-- =====================================================
-- 8. VERIFICAÇÃO DE CRIAÇÃO
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tablename;

-- Verificar se os índices foram criados
SELECT 
    indexname,
    tablename
FROM pg_indexes 
WHERE tablename IN ('viagem_receitas', 'viagem_despesas', 'viagem_cobranca_historico', 'viagem_orcamento')
ORDER BY tablename, indexname;

-- =====================================================
-- SCRIPT CONCLUÍDO ✅
-- =====================================================
-- Execute este script no seu banco PostgreSQL
-- Todas as tabelas serão criadas com segurança (IF NOT EXISTS)
-- Índices otimizados para performance
-- Triggers para controle de updated_at
-- Constraints para integridade dos dados