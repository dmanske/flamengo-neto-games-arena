-- =====================================================
-- TABELA: despesas_jogos
-- DESCRIÇÃO: Armazena despesas operacionais relacionadas a jogos específicos
-- =====================================================

-- Criar tabela despesas_jogos
CREATE TABLE IF NOT EXISTS despesas_jogos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    jogo_key TEXT NOT NULL, -- Formato: "adversario-YYYY-MM-DD-local" (ex: "palmeiras-2024-03-15-casa")
    tipo TEXT NOT NULL CHECK (tipo IN ('custo_ingresso', 'transporte', 'alimentacao', 'comissao', 'marketing', 'outros')),
    categoria TEXT NOT NULL CHECK (categoria IN ('fixa', 'variavel')),
    descricao TEXT NOT NULL,
    fornecedor TEXT,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_despesa DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_despesas_jogos_jogo_key ON despesas_jogos(jogo_key);
CREATE INDEX IF NOT EXISTS idx_despesas_jogos_tipo ON despesas_jogos(tipo);
CREATE INDEX IF NOT EXISTS idx_despesas_jogos_categoria ON despesas_jogos(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_jogos_data_despesa ON despesas_jogos(data_despesa);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_despesas_jogos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_despesas_jogos_updated_at
    BEFORE UPDATE ON despesas_jogos
    FOR EACH ROW
    EXECUTE FUNCTION update_despesas_jogos_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE despesas_jogos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver todas as despesas (ajustar conforme necessário)
CREATE POLICY "Usuários podem visualizar despesas_jogos" ON despesas_jogos
    FOR SELECT USING (true);

-- Política: Usuários podem inserir despesas
CREATE POLICY "Usuários podem inserir despesas_jogos" ON despesas_jogos
    FOR INSERT WITH CHECK (true);

-- Política: Usuários podem atualizar despesas
CREATE POLICY "Usuários podem atualizar despesas_jogos" ON despesas_jogos
    FOR UPDATE USING (true);

-- Política: Usuários podem deletar despesas
CREATE POLICY "Usuários podem deletar despesas_jogos" ON despesas_jogos
    FOR DELETE USING (true);

-- Comentários para documentação
COMMENT ON TABLE despesas_jogos IS 'Despesas operacionais relacionadas a jogos específicos';
COMMENT ON COLUMN despesas_jogos.jogo_key IS 'Chave do jogo no formato: adversario-YYYY-MM-DD-local';
COMMENT ON COLUMN despesas_jogos.tipo IS 'Tipo da despesa: custo_ingresso, transporte, alimentacao, comissao, marketing, outros';
COMMENT ON COLUMN despesas_jogos.categoria IS 'Categoria da despesa: fixa ou variavel';
COMMENT ON COLUMN despesas_jogos.descricao IS 'Descrição detalhada da despesa';
COMMENT ON COLUMN despesas_jogos.fornecedor IS 'Nome do fornecedor ou prestador de serviço';
COMMENT ON COLUMN despesas_jogos.valor IS 'Valor da despesa em reais';
COMMENT ON COLUMN despesas_jogos.data_despesa IS 'Data em que a despesa foi realizada';