-- Criar tabela de categorias financeiras
CREATE TABLE IF NOT EXISTS categorias_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(50) NOT NULL UNIQUE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  cor VARCHAR(7), -- hex color code
  icone VARCHAR(30),
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_tipo ON categorias_financeiras(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_ativa ON categorias_financeiras(ativa);
CREATE INDEX IF NOT EXISTS idx_categorias_financeiras_nome ON categorias_financeiras(nome);

-- Habilitar RLS (Row Level Security)
ALTER TABLE categorias_financeiras ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem ver e modificar todas as categorias
CREATE POLICY "Usuários autenticados podem gerenciar categorias" ON categorias_financeiras
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserir categorias padrão para receitas
INSERT INTO categorias_financeiras (nome, tipo, cor, icone) VALUES
('Pagamento de Viagem', 'receita', '#10b981', 'CreditCard'),
('Venda de Produtos', 'receita', '#3b82f6', 'ShoppingBag'),
('Serviços Extras', 'receita', '#8b5cf6', 'Star'),
('Patrocínio', 'receita', '#f59e0b', 'Award'),
('Outros Recebimentos', 'receita', '#6b7280', 'Plus')
ON CONFLICT (nome) DO NOTHING;

-- Inserir categorias padrão para despesas
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

-- Criar tabela de projeções de fluxo de caixa
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

-- Criar índices para projeções
CREATE INDEX IF NOT EXISTS idx_projecoes_mes_ano ON projecoes_fluxo_caixa(mes_ano);
CREATE INDEX IF NOT EXISTS idx_projecoes_created_at ON projecoes_fluxo_caixa(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_projecoes_updated_at 
    BEFORE UPDATE ON projecoes_fluxo_caixa 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS para projeções
ALTER TABLE projecoes_fluxo_caixa ENABLE ROW LEVEL SECURITY;

-- Política RLS para projeções
CREATE POLICY "Usuários autenticados podem gerenciar projeções" ON projecoes_fluxo_caixa
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE categorias_financeiras IS 'Tabela para armazenar categorias de receitas e despesas';
COMMENT ON COLUMN categorias_financeiras.nome IS 'Nome da categoria';
COMMENT ON COLUMN categorias_financeiras.tipo IS 'Tipo da categoria: receita ou despesa';
COMMENT ON COLUMN categorias_financeiras.cor IS 'Cor da categoria em formato hexadecimal';
COMMENT ON COLUMN categorias_financeiras.icone IS 'Nome do ícone da categoria';
COMMENT ON COLUMN categorias_financeiras.ativa IS 'Indica se a categoria está ativa para uso';

COMMENT ON TABLE projecoes_fluxo_caixa IS 'Tabela para armazenar projeções mensais de fluxo de caixa';
COMMENT ON COLUMN projecoes_fluxo_caixa.mes_ano IS 'Mês e ano da projeção (primeiro dia do mês)';
COMMENT ON COLUMN projecoes_fluxo_caixa.receitas_projetadas IS 'Valor projetado de receitas para o mês';
COMMENT ON COLUMN projecoes_fluxo_caixa.despesas_projetadas IS 'Valor projetado de despesas para o mês';
COMMENT ON COLUMN projecoes_fluxo_caixa.saldo_projetado IS 'Saldo projetado (receitas - despesas)';
COMMENT ON COLUMN projecoes_fluxo_caixa.receitas_realizadas IS 'Valor real de receitas do mês';
COMMENT ON COLUMN projecoes_fluxo_caixa.despesas_realizadas IS 'Valor real de despesas do mês';
COMMENT ON COLUMN projecoes_fluxo_caixa.saldo_realizado IS 'Saldo real (receitas - despesas)';