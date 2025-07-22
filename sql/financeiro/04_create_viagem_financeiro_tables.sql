-- =====================================================
-- SISTEMA FINANCEIRO DA VIAGEM - FASE 1
-- Tabelas para gestão financeira individual por viagem
-- =====================================================

-- Verificar se as tabelas base existem
DO $$ 
BEGIN
    -- Verificar se a tabela viagens existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'viagens') THEN
        RAISE EXCEPTION 'Tabela "viagens" não encontrada. Execute primeiro os scripts de criação das tabelas base.';
    END IF;
    
    -- Verificar se a tabela viagem_passageiros existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'viagem_passageiros') THEN
        RAISE EXCEPTION 'Tabela "viagem_passageiros" não encontrada. Execute primeiro os scripts de criação das tabelas base.';
    END IF;
END $$;

-- Receitas da viagem (além dos passageiros)
CREATE TABLE IF NOT EXISTS viagem_receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('passageiro', 'patrocinio', 'vendas', 'extras')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  forma_pagamento VARCHAR(30) DEFAULT 'Pix',
  status VARCHAR(20) DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente', 'cancelado')),
  data_recebimento DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Despesas da viagem
CREATE TABLE IF NOT EXISTS viagem_despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL,
  fornecedor VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('transporte', 'hospedagem', 'alimentacao', 'ingressos', 'pessoal', 'administrativo')),
  subcategoria VARCHAR(50),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  forma_pagamento VARCHAR(30) DEFAULT 'Pix',
  status VARCHAR(20) DEFAULT 'pago' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  data_despesa DATE NOT NULL,
  comprovante_url VARCHAR(500),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de cobrança
CREATE TABLE IF NOT EXISTS viagem_cobranca_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_passageiro_id UUID NOT NULL,
  tipo_contato VARCHAR(20) NOT NULL CHECK (tipo_contato IN ('whatsapp', 'email', 'telefone', 'presencial')),
  template_usado VARCHAR(50),
  mensagem_enviada TEXT,
  status_envio VARCHAR(20) DEFAULT 'enviado' CHECK (status_envio IN ('enviado', 'lido', 'respondido', 'erro')),
  data_tentativa TIMESTAMP DEFAULT NOW(),
  proximo_followup DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Orçamento da viagem (para comparação com realizado)
CREATE TABLE IF NOT EXISTS viagem_orcamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  subcategoria VARCHAR(50),
  descricao VARCHAR(255) NOT NULL,
  valor_orcado DECIMAL(10,2) NOT NULL CHECK (valor_orcado >= 0),
  valor_realizado DECIMAL(10,2) DEFAULT 0 CHECK (valor_realizado >= 0),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_viagem_id ON viagem_receitas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_categoria ON viagem_receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_viagem_receitas_status ON viagem_receitas(status);

CREATE INDEX IF NOT EXISTS idx_viagem_despesas_viagem_id ON viagem_despesas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_categoria ON viagem_despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_viagem_despesas_status ON viagem_despesas(status);

CREATE INDEX IF NOT EXISTS idx_viagem_cobranca_passageiro_id ON viagem_cobranca_historico(viagem_passageiro_id);
CREATE INDEX IF NOT EXISTS idx_viagem_cobranca_data ON viagem_cobranca_historico(data_tentativa);

CREATE INDEX IF NOT EXISTS idx_viagem_orcamento_viagem_id ON viagem_orcamento(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_orcamento_categoria ON viagem_orcamento(categoria);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_viagem_receitas_updated_at BEFORE UPDATE ON viagem_receitas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viagem_despesas_updated_at BEFORE UPDATE ON viagem_despesas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_viagem_orcamento_updated_at BEFORE UPDATE ON viagem_orcamento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Adicionar foreign keys após criar as tabelas
DO $$ 
BEGIN
    -- Foreign keys para viagem_receitas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'viagem_receitas_viagem_id_fkey'
    ) THEN
        ALTER TABLE viagem_receitas 
        ADD CONSTRAINT viagem_receitas_viagem_id_fkey 
        FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
    END IF;

    -- Foreign keys para viagem_despesas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'viagem_despesas_viagem_id_fkey'
    ) THEN
        ALTER TABLE viagem_despesas 
        ADD CONSTRAINT viagem_despesas_viagem_id_fkey 
        FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
    END IF;

    -- Foreign keys para viagem_cobranca_historico
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'viagem_cobranca_historico_viagem_passageiro_id_fkey'
    ) THEN
        ALTER TABLE viagem_cobranca_historico 
        ADD CONSTRAINT viagem_cobranca_historico_viagem_passageiro_id_fkey 
        FOREIGN KEY (viagem_passageiro_id) REFERENCES viagem_passageiros(id) ON DELETE CASCADE;
    END IF;

    -- Foreign keys para viagem_orcamento
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'viagem_orcamento_viagem_id_fkey'
    ) THEN
        ALTER TABLE viagem_orcamento 
        ADD CONSTRAINT viagem_orcamento_viagem_id_fkey 
        FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Comentários nas tabelas
COMMENT ON TABLE viagem_receitas IS 'Receitas específicas da viagem (patrocínios, vendas, extras)';
COMMENT ON TABLE viagem_despesas IS 'Despesas da viagem organizadas por categoria';
COMMENT ON TABLE viagem_cobranca_historico IS 'Histórico de tentativas de cobrança de passageiros';
COMMENT ON TABLE viagem_orcamento IS 'Orçamento planejado vs realizado da viagem';

-- Dados iniciais para categorias de despesas
INSERT INTO viagem_orcamento (viagem_id, categoria, subcategoria, descricao, valor_orcado) 
SELECT 
  id as viagem_id,
  'transporte' as categoria,
  'combustivel' as subcategoria,
  'Combustível para a viagem' as descricao,
  0 as valor_orcado
FROM viagens 
WHERE NOT EXISTS (
  SELECT 1 FROM viagem_orcamento 
  WHERE viagem_id = viagens.id AND categoria = 'transporte' AND subcategoria = 'combustivel'
);