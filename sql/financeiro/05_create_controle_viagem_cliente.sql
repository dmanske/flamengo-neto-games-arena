-- =====================================================
-- CONTROLE FINANCEIRO POR VIAGEM E CLIENTE
-- =====================================================

-- Tabela para controlar pagamentos de passageiros por viagem
CREATE TABLE IF NOT EXISTS pagamentos_viagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  valor_total DECIMAL(10,2) NOT NULL CHECK (valor_total > 0),
  valor_pago DECIMAL(10,2) DEFAULT 0 CHECK (valor_pago >= 0),
  valor_pendente DECIMAL(10,2) GENERATED ALWAYS AS (valor_total - valor_pago) STORED,
  data_vencimento DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'parcial', 'vencido', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(viagem_id, cliente_id)
);

-- Tabela para registrar parcelas/pagamentos individuais
CREATE TABLE IF NOT EXISTS parcelas_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pagamento_viagem_id UUID NOT NULL REFERENCES pagamentos_viagem(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_pagamento DATE NOT NULL,
  metodo_pagamento VARCHAR(30),
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para orçamento/custos planejados por viagem
CREATE TABLE IF NOT EXISTS orcamento_viagem (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  valor_planejado DECIMAL(10,2) NOT NULL CHECK (valor_planejado >= 0),
  valor_real DECIMAL(10,2) DEFAULT 0 CHECK (valor_real >= 0),
  status VARCHAR(20) DEFAULT 'planejado' CHECK (status IN ('planejado', 'executado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico financeiro do cliente (extrato)
CREATE TABLE IF NOT EXISTS extrato_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('debito', 'credito')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data_transacao DATE NOT NULL,
  referencia_id UUID, -- ID da receita, despesa ou pagamento relacionado
  referencia_tipo VARCHAR(20), -- 'receita', 'despesa', 'pagamento'
  saldo_anterior DECIMAL(10,2) DEFAULT 0,
  saldo_atual DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_viagem_id ON pagamentos_viagem(viagem_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_cliente_id ON pagamentos_viagem(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_status ON pagamentos_viagem(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_data_vencimento ON pagamentos_viagem(data_vencimento);

CREATE INDEX IF NOT EXISTS idx_parcelas_pagamento_viagem_id ON parcelas_pagamento(pagamento_viagem_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_data_pagamento ON parcelas_pagamento(data_pagamento);

CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_viagem_id ON orcamento_viagem(viagem_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_categoria ON orcamento_viagem(categoria);
CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_status ON orcamento_viagem(status);

CREATE INDEX IF NOT EXISTS idx_extrato_cliente_cliente_id ON extrato_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_extrato_cliente_viagem_id ON extrato_cliente(viagem_id);
CREATE INDEX IF NOT EXISTS idx_extrato_cliente_data ON extrato_cliente(data_transacao);
CREATE INDEX IF NOT EXISTS idx_extrato_cliente_tipo ON extrato_cliente(tipo);

-- Triggers para atualizar timestamps
CREATE TRIGGER update_pagamentos_viagem_updated_at 
    BEFORE UPDATE ON pagamentos_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamento_viagem_updated_at 
    BEFORE UPDATE ON orcamento_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status do pagamento baseado no valor pago
CREATE OR REPLACE FUNCTION update_pagamento_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar status baseado no valor pago
    IF NEW.valor_pago >= NEW.valor_total THEN
        NEW.status = 'pago';
    ELSIF NEW.valor_pago > 0 THEN
        NEW.status = 'parcial';
    ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.valor_pago = 0 THEN
        NEW.status = 'vencido';
    ELSE
        NEW.status = 'pendente';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pagamento_status_trigger
    BEFORE UPDATE ON pagamentos_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_pagamento_status();

-- Função para atualizar valor pago quando uma parcela é adicionada
CREATE OR REPLACE FUNCTION update_valor_pago_parcela()
RETURNS TRIGGER AS $$
DECLARE
    total_pago DECIMAL(10,2);
    pagamento_id UUID;
BEGIN
    -- Determinar o ID do pagamento baseado na operação
    IF TG_OP = 'DELETE' THEN
        pagamento_id = OLD.pagamento_viagem_id;
    ELSE
        pagamento_id = NEW.pagamento_viagem_id;
    END IF;
    
    -- Calcular total pago para este pagamento
    SELECT COALESCE(SUM(valor), 0) INTO total_pago
    FROM parcelas_pagamento 
    WHERE pagamento_viagem_id = pagamento_id;
    
    -- Atualizar valor pago no pagamento principal
    UPDATE pagamentos_viagem 
    SET valor_pago = total_pago
    WHERE id = pagamento_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_valor_pago_parcela_trigger
    AFTER INSERT OR UPDATE OR DELETE ON parcelas_pagamento 
    FOR EACH ROW 
    EXECUTE FUNCTION update_valor_pago_parcela();

-- Função para criar entrada no extrato do cliente (removida por enquanto para evitar conflitos)
-- Esta função será implementada quando necessário

-- RLS (Row Level Security)
ALTER TABLE pagamentos_viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE extrato_cliente ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários autenticados podem gerenciar pagamentos viagem" ON pagamentos_viagem
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar parcelas" ON parcelas_pagamento
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar orçamento viagem" ON orcamento_viagem
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar extrato cliente" ON extrato_cliente
    FOR ALL USING (auth.role() = 'authenticated');

-- Views úteis para relatórios
CREATE OR REPLACE VIEW view_resumo_financeiro_viagem AS
SELECT 
    v.id as viagem_id,
    v.adversario,
    v.data_jogo,
    COALESCE(v.valor_padrao, 0) as preco_passagem,
    
    -- Receitas
    COALESCE(SUM(pv.valor_total), 0) as receita_prevista,
    COALESCE(SUM(pv.valor_pago), 0) as receita_recebida,
    COALESCE(SUM(pv.valor_pendente), 0) as receita_pendente,
    
    -- Despesas
    COALESCE(SUM(ov.valor_planejado), 0) as despesa_planejada,
    COALESCE(SUM(ov.valor_real), 0) as despesa_real,
    
    -- Lucro
    COALESCE(SUM(pv.valor_pago), 0) - COALESCE(SUM(ov.valor_real), 0) as lucro_real,
    COALESCE(SUM(pv.valor_total), 0) - COALESCE(SUM(ov.valor_planejado), 0) as lucro_previsto,
    
    -- Contadores
    COUNT(DISTINCT pv.cliente_id) as total_passageiros,
    COUNT(DISTINCT CASE WHEN pv.status = 'pago' THEN pv.cliente_id END) as passageiros_pagos,
    COUNT(DISTINCT CASE WHEN pv.status = 'pendente' THEN pv.cliente_id END) as passageiros_pendentes
    
FROM viagens v
LEFT JOIN pagamentos_viagem pv ON v.id = pv.viagem_id
LEFT JOIN orcamento_viagem ov ON v.id = ov.viagem_id
GROUP BY v.id, v.adversario, v.data_jogo, v.valor_padrao;

CREATE OR REPLACE VIEW view_saldo_cliente AS
SELECT 
    c.id as cliente_id,
    c.nome,
    c.email,
    COALESCE(ec.saldo_atual, 0) as saldo_atual,
    CASE 
        WHEN COALESCE(ec.saldo_atual, 0) > 0 THEN 'devedor'
        WHEN COALESCE(ec.saldo_atual, 0) < 0 THEN 'credor'
        ELSE 'quitado'
    END as situacao,
    ec.created_at as ultima_movimentacao
FROM clientes c
LEFT JOIN LATERAL (
    SELECT saldo_atual, created_at
    FROM extrato_cliente 
    WHERE cliente_id = c.id 
    ORDER BY created_at DESC 
    LIMIT 1
) ec ON true;

-- Comentários para documentação
COMMENT ON TABLE pagamentos_viagem IS 'Controla pagamentos de passageiros por viagem';
COMMENT ON TABLE parcelas_pagamento IS 'Registra parcelas/pagamentos individuais';
COMMENT ON TABLE orcamento_viagem IS 'Orçamento e custos planejados vs reais por viagem';
COMMENT ON TABLE extrato_cliente IS 'Histórico financeiro completo do cliente';
COMMENT ON VIEW view_resumo_financeiro_viagem IS 'Resumo financeiro completo por viagem';
COMMENT ON VIEW view_saldo_cliente IS 'Saldo atual e situação de cada cliente';