-- =====================================================
-- SCRIPT CONSOLIDADO - MÓDULO FINANCEIRO
-- Execute este arquivo completo no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CRIAR FUNÇÃO DE UPDATE TIMESTAMP (se não existir)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 2. CRIAR TABELA DE RECEITAS
-- =====================================================
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

-- Índices para receitas
CREATE INDEX IF NOT EXISTS idx_receitas_data_recebimento ON receitas(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_status ON receitas(status);
CREATE INDEX IF NOT EXISTS idx_receitas_viagem_id ON receitas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_receitas_cliente_id ON receitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_receitas_created_at ON receitas(created_at);

-- Trigger para receitas
DROP TRIGGER IF EXISTS update_receitas_updated_at ON receitas;
CREATE TRIGGER update_receitas_updated_at 
    BEFORE UPDATE ON receitas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS para receitas
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar receitas" ON receitas;
CREATE POLICY "Usuários autenticados podem gerenciar receitas" ON receitas
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. CRIAR TABELA DE DESPESAS
-- =====================================================
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

-- Índices para despesas
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_data_pagamento ON despesas(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(status);
CREATE INDEX IF NOT EXISTS idx_despesas_viagem_id ON despesas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(fornecedor);
CREATE INDEX IF NOT EXISTS idx_despesas_created_at ON despesas(created_at);

-- Trigger para despesas
DROP TRIGGER IF EXISTS update_despesas_updated_at ON despesas;
CREATE TRIGGER update_despesas_updated_at 
    BEFORE UPDATE ON despesas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status de despesas
CREATE OR REPLACE FUNCTION update_despesa_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a data de pagamento foi preenchida, marcar como pago
    IF NEW.data_pagamento IS NOT NULL AND OLD.data_pagamento IS NULL THEN
        NEW.status = 'pago';
    -- Se passou da data de vencimento e não foi pago, marcar como vencido
    ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL AND NEW.status = 'pendente' THEN
        NEW.status = 'vencido';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_despesa_status_trigger ON despesas;
CREATE TRIGGER update_despesa_status_trigger
    BEFORE UPDATE ON despesas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_despesa_status();

-- RLS para despesas
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar despesas" ON despesas;
CREATE POLICY "Usuários autenticados podem gerenciar despesas" ON despesas
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. CRIAR TABELA DE CONTAS A PAGAR
-- =====================================================
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

-- Índices para contas a pagar
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_pagamento ON contas_pagar(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_recorrente ON contas_pagar(recorrente);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_created_at ON contas_pagar(created_at);

-- Trigger para contas a pagar
DROP TRIGGER IF EXISTS update_contas_pagar_updated_at ON contas_pagar;
CREATE TRIGGER update_contas_pagar_updated_at 
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar status de contas a pagar
CREATE OR REPLACE FUNCTION update_conta_pagar_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a data de pagamento foi preenchida, marcar como pago
    IF NEW.data_pagamento IS NOT NULL AND OLD.data_pagamento IS NULL THEN
        NEW.status = 'pago';
    -- Se passou da data de vencimento e não foi pago, marcar como vencido
    ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL AND NEW.status = 'pendente' THEN
        NEW.status = 'vencido';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_conta_pagar_status_trigger ON contas_pagar;
CREATE TRIGGER update_conta_pagar_status_trigger
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_conta_pagar_status();

-- Função para criar contas recorrentes
CREATE OR REPLACE FUNCTION criar_proxima_conta_recorrente()
RETURNS TRIGGER AS $$
DECLARE
    proxima_data DATE;
BEGIN
    -- Só criar próxima conta se foi marcada como paga e é recorrente
    IF NEW.status = 'pago' AND OLD.status != 'pago' AND NEW.recorrente = TRUE THEN
        -- Calcular próxima data baseada na frequência
        CASE NEW.frequencia_recorrencia
            WHEN 'mensal' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '1 month';
            WHEN 'trimestral' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '3 months';
            WHEN 'semestral' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '6 months';
            WHEN 'anual' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '1 year';
            ELSE
                proxima_data := NEW.data_vencimento + INTERVAL '1 month';
        END CASE;
        
        -- Inserir nova conta com a próxima data de vencimento
        INSERT INTO contas_pagar (
            descricao, 
            valor, 
            data_vencimento, 
            fornecedor, 
            categoria, 
            recorrente, 
            frequencia_recorrencia,
            observacoes
        ) VALUES (
            NEW.descricao,
            NEW.valor,
            proxima_data,
            NEW.fornecedor,
            NEW.categoria,
            NEW.recorrente,
            NEW.frequencia_recorrencia,
            NEW.observacoes
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS criar_conta_recorrente_trigger ON contas_pagar;
CREATE TRIGGER criar_conta_recorrente_trigger
    AFTER UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION criar_proxima_conta_recorrente();

-- RLS para contas a pagar
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar contas a pagar" ON contas_pagar;
CREATE POLICY "Usuários autenticados podem gerenciar contas a pagar" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. CRIAR TABELA DE CATEGORIAS FINANCEIRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(7), -- hex color code
  icone VARCHAR(30),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para categorias
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_ativa ON categorias_financeiras(ativa);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_nome ON categorias_financeiras(nome);

-- RLS para categorias
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar categorias" ON categorias_financeiras;
CREATE POLICY "Usuários autenticados podem gerenciar categorias" ON categorias_financeiras
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. CRIAR TABELA DE PROJEÇÕES DE FLUXO DE CAIXA
-- =====================================================
CREATE TABLE IF NOT EXISTS projecoes_fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes_ano DATE NOT NULL,
  receitas_projetadas DECIMAL(10,2) DEFAULT 0,
  despesas_projetadas DECIMAL(10,2) DEFAULT 0,
  saldo_projetado DECIMAL(10,2) DEFAULT 0,
  receitas_realizadas DECIMAL(10,2) DEFAULT 0,
  despesas_realizadas DECIMAL(10,2) DEFAULT 0,
  saldo_realizado DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mes_ano)
);

-- Índices para projeções
CREATE INDEX IF NOT EXISTS idx_projecoes_mes_ano ON projecoes_fluxo_caixa(mes_ano);
CREATE INDEX IF NOT EXISTS idx_projecoes_created_at ON projecoes_fluxo_caixa(created_at);

-- Trigger para projeções
DROP TRIGGER IF EXISTS update_projecoes_updated_at ON projecoes_fluxo_caixa;
CREATE TRIGGER update_projecoes_updated_at 
    BEFORE UPDATE ON projecoes_fluxo_caixa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS para projeções
ALTER TABLE projecoes_fluxo_caixa ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar projeções" ON projecoes_fluxo_caixa;
CREATE POLICY "Usuários autenticados podem gerenciar projeções" ON projecoes_fluxo_caixa
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 7. INSERIR CATEGORIAS PADRÃO
-- =====================================================

-- Categorias de receita
INSERT INTO categorias_financeiras (nome, tipo, cor, icone) VALUES
('Pagamento de Viagem', 'receita', '#10b981', 'CreditCard'),
('Venda de Produtos', 'receita', '#3b82f6', 'ShoppingBag'),
('Serviços Extras', 'receita', '#8b5cf6', 'Star'),
('Patrocínio', 'receita', '#f59e0b', 'Award'),
('Outros Recebimentos', 'receita', '#6b7280', 'Plus')
ON CONFLICT (nome) DO NOTHING;

-- Categorias de despesa
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

-- =====================================================
-- 8. CRIAR CONTROLE POR VIAGEM E CLIENTE
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
  referencia_id UUID,
  referencia_tipo VARCHAR(20),
  saldo_anterior DECIMAL(10,2) DEFAULT 0,
  saldo_atual DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_viagem_id ON pagamentos_viagem(viagem_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_cliente_id ON pagamentos_viagem(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_viagem_status ON pagamentos_viagem(status);

CREATE INDEX IF NOT EXISTS idx_parcelas_pagamento_viagem_id ON parcelas_pagamento(pagamento_viagem_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_data_pagamento ON parcelas_pagamento(data_pagamento);

CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_viagem_id ON orcamento_viagem(viagem_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_viagem_categoria ON orcamento_viagem(categoria);

CREATE INDEX IF NOT EXISTS idx_extrato_cliente_cliente_id ON extrato_cliente(cliente_id);
CREATE INDEX IF NOT EXISTS idx_extrato_cliente_viagem_id ON extrato_cliente(viagem_id);

-- Triggers para atualizar timestamps
CREATE TRIGGER update_pagamentos_viagem_updated_at 
    BEFORE UPDATE ON pagamentos_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamento_viagem_updated_at 
    BEFORE UPDATE ON orcamento_viagem 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

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

-- =====================================================
-- 9. VERIFICAR INSTALAÇÃO
-- =====================================================
SELECT 
    'Tabelas criadas com sucesso!' as status,
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'receitas', 'despesas', 'contas_pagar', 'categorias_financeiras', 
    'projecoes_fluxo_caixa', 'pagamentos_viagem', 'parcelas_pagamento', 
    'orcamento_viagem', 'extrato_cliente'
)
ORDER BY tablename;

-- =====================================================
-- 9. VERIFICAR INSTALAÇÃO COMPLETA
-- =====================================================
SELECT 
    'Todas as tabelas financeiras criadas com sucesso!' as status,
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'receitas', 
    'despesas', 
    'contas_pagar', 
    'categorias_financeiras', 
    'projecoes_fluxo_caixa',
    'pagamentos_viagem',
    'parcelas_pagamento',
    'orcamento_viagem',
    'extrato_cliente'
)
ORDER BY tablename;

-- Verificar views criadas
SELECT 
    'Views financeiras criadas!' as status,
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE viewname IN (
    'view_resumo_financeiro_viagem',
    'view_saldo_cliente'
)
ORDER BY viewname;