-- =====================================================
-- MIGRAÇÃO SIMPLIFICADA - MÓDULO FINANCEIRO COMPLETO
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- 1. Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(7),
  icone VARCHAR(30),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  categoria VARCHAR(50) NOT NULL,
  data_recebimento DATE NOT NULL,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  metodo_pagamento VARCHAR(30),
  status VARCHAR(20) DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente', 'cancelado')),
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de despesas
CREATE TABLE IF NOT EXISTS despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  categoria VARCHAR(50) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  fornecedor VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  metodo_pagamento VARCHAR(30),
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de contas a pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  fornecedor VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia_recorrencia VARCHAR(20) CHECK (frequencia_recorrencia IN ('mensal', 'trimestral', 'semestral', 'anual')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de pagamentos por viagem
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

-- 7. Tabela de parcelas de pagamento
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

-- 8. Tabela de orçamento por viagem
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

-- 9. Tabela de extrato do cliente
CREATE TABLE IF NOT EXISTS extrato_cliente (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('debito', 'credito')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  descricao TEXT NOT NULL,
  data_transacao DATE NOT NULL,
  referencia_id UUID,
  referencia_tipo VARCHAR(20),
  saldo_anterior DECIMAL(10,2) DEFAULT 0,
  saldo_atual DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Criar índices
CREATE INDEX IF NOT EXISTS idx_receitas_data_recebimento ON receitas(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_viagem_id ON receitas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_receitas_cliente_id ON receitas(cliente_id);

CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_viagem_id ON despesas(viagem_id);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria);

CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_viagem_id ON pagamentos_viagem(viagem_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_cliente_id ON pagamentos_viagem(cliente_id);

CREATE INDEX IF NOT EXISTS idx_parcelas_pagamento_viagem_id ON parcelas_pagamento(pagamento_viagem_id);

CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_viagem_id ON orcamento_viagem(viagem_id);

CREATE INDEX IF NOT EXISTS idx_extrato_cliente_cliente_id ON extrato_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_extrato_cliente_viagem_id ON extrato_cliente(viagem_id);

-- 11. Criar triggers para timestamps
CREATE TRIGGER update_receitas_updated_at 
    BEFORE UPDATE ON receitas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at 
    BEFORE UPDATE ON despesas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contas_pagar_updated_at 
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagamentos_viagem_updated_at 
    BEFORE UPDATE ON pagamentos_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamento_viagem_updated_at 
    BEFORE UPDATE ON orcamento_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Habilitar RLS
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamento_viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE extrato_cliente ENABLE ROW LEVEL SECURITY;

-- 13. Criar políticas RLS
CREATE POLICY "Usuários autenticados podem gerenciar categorias" ON categorias_financeiras
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar receitas" ON receitas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar despesas" ON despesas
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar contas a pagar" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar pagamentos viagem" ON pagamentos_viagem
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar parcelas" ON parcelas_pagamento
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar orçamento viagem" ON orcamento_viagem
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem gerenciar extrato cliente" ON extrato_cliente
    FOR ALL USING (auth.role() = 'authenticated');

-- 14. Inserir categorias padrão
INSERT INTO categorias_financeiras (nome, tipo, cor, icone) VALUES
('Pagamento de Viagem', 'receita', '#10b981', 'CreditCard'),
('Venda de Produtos', 'receita', '#3b82f6', 'ShoppingBag'),
('Serviços Extras', 'receita', '#8b5cf6', 'Star'),
('Patrocínio', 'receita', '#f59e0b', 'Award'),
('Outros Recebimentos', 'receita', '#6b7280', 'Plus')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO categorias_financeiras (nome, tipo, cor, icone) VALUES
('Aluguel de Ônibus', 'despesa', '#ef4444', 'Bus'),
('Combustível', 'despesa', '#f97316', 'Fuel'),
('Alimentação', 'despesa', '#84cc16', 'UtensilsCrossed'),
('Hospedagem', 'despesa', '#06b6d4', 'Bed'),
('Pedágio', 'despesa', '#8b5cf6', 'Road'),
('Manutenção', 'despesa', '#64748b', 'Wrench'),
('Seguro', 'despesa', '#dc2626', 'Shield'),
('Taxas e Impostos', 'despesa', '#7c2d12', 'Receipt'),
('Marketing', 'despesa', '#be185d', 'Megaphone'),
('Outros Gastos', 'despesa', '#6b7280', 'Minus')
ON CONFLICT (nome) DO NOTHING;

-- 15. Criar views úteis
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

-- 16. Verificar instalação
SELECT 
    'Sistema financeiro instalado com sucesso!' as status,
    COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_name IN (
    'categorias_financeiras',
    'receitas', 
    'despesas', 
    'contas_pagar',
    'pagamentos_viagem',
    'parcelas_pagamento',
    'orcamento_viagem',
    'extrato_cliente'
);

SELECT 
    'Views criadas com sucesso!' as status,
    COUNT(*) as total_views
FROM information_schema.views 
WHERE table_name IN (
    'view_resumo_financeiro_viagem',
    'view_saldo_cliente'
);

-- Fim da migração
SELECT 'Migração concluída! Você pode começar a usar o sistema financeiro.' as resultado;