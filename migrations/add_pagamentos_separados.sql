-- Migration: Adicionar estrutura para pagamentos separados
-- Task 19.1: Atualizar estrutura do banco

-- 0. Habilitar extensão uuid se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0.1. Adicionar colunas que faltam na tabela passeios existente
ALTER TABLE passeios ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE passeios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 0.2. Corrigir o default do ID se necessário
ALTER TABLE passeios ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 0.1. Remover duplicatas existentes (manter apenas a primeira ocorrência)
DELETE FROM passeios 
WHERE ctid NOT IN (
    SELECT MIN(ctid) 
    FROM passeios 
    GROUP BY nome
);

-- 0.2. Adicionar constraint UNIQUE no nome (agora sem duplicatas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'passeios_nome_unique'
    ) THEN
        ALTER TABLE passeios ADD CONSTRAINT passeios_nome_unique UNIQUE (nome);
    END IF;
END $$;

-- 0.3. Inserir dados iniciais dos passeios (especificando ID explicitamente)
INSERT INTO passeios (id, nome, valor, categoria, ativo) VALUES
-- Passeios Pagos à Parte
(uuid_generate_v4(), 'Cristo Redentor', 85.00, 'pago', true),
(uuid_generate_v4(), 'Pão de Açúcar', 120.00, 'pago', true),
(uuid_generate_v4(), 'Museu do Flamengo', 45.00, 'pago', true),
(uuid_generate_v4(), 'Aquário', 60.00, 'pago', true),
(uuid_generate_v4(), 'Roda-Gigante', 35.00, 'pago', true),
(uuid_generate_v4(), 'Museu do Amanhã', 30.00, 'pago', true),
(uuid_generate_v4(), 'Tour do Maracanã', 55.00, 'pago', true),
(uuid_generate_v4(), 'Rocinha', 40.00, 'pago', true),
(uuid_generate_v4(), 'Vidigal', 35.00, 'pago', true),
(uuid_generate_v4(), 'Tour da Gávea', 65.00, 'pago', true),
(uuid_generate_v4(), 'Parque Lage', 25.00, 'pago', true),
(uuid_generate_v4(), 'Museu do Mar', 40.00, 'pago', true),
-- Passeios Gratuitos
(uuid_generate_v4(), 'Lapa', 0, 'gratuito', true),
(uuid_generate_v4(), 'Escadaria Selarón', 0, 'gratuito', true),
(uuid_generate_v4(), 'Igreja Catedral Metropolitana', 0, 'gratuito', true),
(uuid_generate_v4(), 'Teatro Municipal', 0, 'gratuito', true),
(uuid_generate_v4(), 'Copacabana', 0, 'gratuito', true),
(uuid_generate_v4(), 'Ipanema', 0, 'gratuito', true),
(uuid_generate_v4(), 'Leblon', 0, 'gratuito', true),
(uuid_generate_v4(), 'Barra da Tijuca', 0, 'gratuito', true),
(uuid_generate_v4(), 'Boulevard Olímpico', 0, 'gratuito', true),
(uuid_generate_v4(), 'Cidade do Samba', 0, 'gratuito', true),
(uuid_generate_v4(), 'Pedra do Sal', 0, 'gratuito', true)
ON CONFLICT (nome) DO UPDATE SET
    valor = EXCLUDED.valor,
    categoria = EXCLUDED.categoria,
    ativo = EXCLUDED.ativo;

-- 0.4. Criar índices para a tabela passeios
CREATE INDEX IF NOT EXISTS idx_passeios_categoria ON passeios(categoria);
CREATE INDEX IF NOT EXISTS idx_passeios_ativo ON passeios(ativo);
CREATE INDEX IF NOT EXISTS idx_passeios_nome ON passeios(nome);

-- 1. Adicionar campos viagem_paga e passeios_pagos em viagem_passageiros
ALTER TABLE viagem_passageiros 
ADD COLUMN IF NOT EXISTS viagem_paga BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS passeios_pagos BOOLEAN DEFAULT false;

-- 1.1. Atualizar tabela passageiro_passeios para suportar valores
ALTER TABLE passageiro_passeios 
ADD COLUMN IF NOT EXISTS passeio_id UUID REFERENCES passeios(id),
ADD COLUMN IF NOT EXISTS valor_cobrado DECIMAL(10,2) DEFAULT 0;

-- 1.2. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_passageiro_passeios_passeio_id 
ON passageiro_passeios(passeio_id);

-- 2. Criar tabela de histórico de pagamentos categorizados
CREATE TABLE IF NOT EXISTS historico_pagamentos_categorizado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('viagem', 'passeios', 'ambos')),
  valor_pago DECIMAL(10,2) NOT NULL,
  data_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_viagem_passageiro 
ON historico_pagamentos_categorizado(viagem_passageiro_id);

CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_categoria 
ON historico_pagamentos_categorizado(categoria);

CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_data 
ON historico_pagamentos_categorizado(data_pagamento);

-- 4. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_historico_pagamentos_updated_at ON historico_pagamentos_categorizado;
CREATE TRIGGER update_historico_pagamentos_updated_at
    BEFORE UPDATE ON historico_pagamentos_categorizado
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Criar função para atualizar status automático baseado em pagamentos
CREATE OR REPLACE FUNCTION atualizar_status_pagamento_automatico()
RETURNS TRIGGER AS $$
DECLARE
    passageiro_record RECORD;
    total_viagem DECIMAL(10,2);
    total_passeios DECIMAL(10,2);
    valor_total_passageiro DECIMAL(10,2);
    novo_status TEXT;
BEGIN
    -- Buscar dados do passageiro
    SELECT vp.*, 
           COALESCE(vp.valor, 0) - COALESCE(vp.desconto, 0) as valor_liquido
    INTO passageiro_record
    FROM viagem_passageiros vp 
    WHERE vp.id = NEW.viagem_passageiro_id;
    
    -- Calcular total pago por categoria
    SELECT 
        COALESCE(SUM(CASE WHEN categoria IN ('viagem', 'ambos') THEN valor_pago ELSE 0 END), 0) as viagem,
        COALESCE(SUM(CASE WHEN categoria IN ('passeios', 'ambos') THEN valor_pago ELSE 0 END), 0) as passeios
    INTO total_viagem, total_passeios
    FROM historico_pagamentos_categorizado 
    WHERE viagem_passageiro_id = NEW.viagem_passageiro_id;
    
    -- Calcular valor total dos passeios do passageiro
    SELECT COALESCE(SUM(pp.valor_cobrado), 0)
    INTO valor_total_passageiro
    FROM passageiro_passeios pp
    WHERE pp.viagem_passageiro_id = NEW.viagem_passageiro_id;
    
    -- Atualizar flags de pagamento
    UPDATE viagem_passageiros 
    SET 
        viagem_paga = (total_viagem >= passageiro_record.valor_liquido),
        passeios_pagos = (total_passeios >= valor_total_passageiro)
    WHERE id = NEW.viagem_passageiro_id;
    
    -- Determinar novo status geral
    IF (total_viagem >= passageiro_record.valor_liquido) AND (total_passeios >= valor_total_passageiro) THEN
        novo_status = 'Pago Completo';
    ELSIF (total_viagem >= passageiro_record.valor_liquido) AND (valor_total_passageiro = 0) THEN
        novo_status = 'Pago Completo';
    ELSIF (total_viagem >= passageiro_record.valor_liquido) THEN
        novo_status = 'Viagem Paga';
    ELSIF (total_passeios >= valor_total_passageiro) AND (valor_total_passageiro > 0) THEN
        novo_status = 'Passeios Pagos';
    ELSE
        novo_status = 'Pendente';
    END IF;
    
    -- Atualizar status geral
    UPDATE viagem_passageiros 
    SET status_pagamento = novo_status
    WHERE id = NEW.viagem_passageiro_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Criar trigger para atualização automática de status
DROP TRIGGER IF EXISTS trigger_atualizar_status_pagamento ON historico_pagamentos_categorizado;
CREATE TRIGGER trigger_atualizar_status_pagamento
    AFTER INSERT OR UPDATE OR DELETE ON historico_pagamentos_categorizado
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_pagamento_automatico();

-- 8. Comentários para documentação
COMMENT ON TABLE historico_pagamentos_categorizado IS 'Histórico de pagamentos categorizados por viagem e passeios';
COMMENT ON COLUMN viagem_passageiros.viagem_paga IS 'Flag indicando se a parte da viagem foi paga';
COMMENT ON COLUMN viagem_passageiros.passeios_pagos IS 'Flag indicando se os passeios foram pagos';
COMMENT ON COLUMN historico_pagamentos_categorizado.categoria IS 'Categoria do pagamento: viagem, passeios ou ambos';

-- 9. Migrar dados existentes (opcional - manter compatibilidade)
-- Atualizar registros existentes baseado no status atual
UPDATE viagem_passageiros 
SET 
    viagem_paga = CASE 
        WHEN status_pagamento IN ('Pago', 'Pago Completo') THEN true 
        ELSE false 
    END,
    passeios_pagos = CASE 
        WHEN status_pagamento IN ('Pago', 'Pago Completo') THEN true 
        ELSE false 
    END
WHERE viagem_paga IS NULL OR passeios_pagos IS NULL;