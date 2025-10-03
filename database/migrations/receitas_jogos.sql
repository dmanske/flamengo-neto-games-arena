-- =====================================================
-- TABELA: receitas_jogos
-- DESCRIÇÃO: Armazena receitas manuais relacionadas a jogos específicos
-- =====================================================

-- Criar tabela receitas_jogos
CREATE TABLE IF NOT EXISTS receitas_jogos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    jogo_key TEXT NOT NULL, -- Formato: "adversario-YYYY-MM-DD-local" (ex: "palmeiras-2024-03-15-casa")
    tipo TEXT NOT NULL CHECK (tipo IN ('patrocinio', 'comissao', 'venda_extra', 'outros')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
    data_receita DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_receitas_jogos_jogo_key ON receitas_jogos(jogo_key);
CREATE INDEX IF NOT EXISTS idx_receitas_jogos_tipo ON receitas_jogos(tipo);
CREATE INDEX IF NOT EXISTS idx_receitas_jogos_data_receita ON receitas_jogos(data_receita);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_receitas_jogos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_receitas_jogos_updated_at
    BEFORE UPDATE ON receitas_jogos
    FOR EACH ROW
    EXECUTE FUNCTION update_receitas_jogos_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE receitas_jogos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver todas as receitas (ajustar conforme necessário)
CREATE POLICY "Usuários podem visualizar receitas_jogos" ON receitas_jogos
    FOR SELECT USING (true);

-- Política: Usuários podem inserir receitas
CREATE POLICY "Usuários podem inserir receitas_jogos" ON receitas_jogos
    FOR INSERT WITH CHECK (true);

-- Política: Usuários podem atualizar receitas
CREATE POLICY "Usuários podem atualizar receitas_jogos" ON receitas_jogos
    FOR UPDATE USING (true);

-- Política: Usuários podem deletar receitas
CREATE POLICY "Usuários podem deletar receitas_jogos" ON receitas_jogos
    FOR DELETE USING (true);

-- Comentários para documentação
COMMENT ON TABLE receitas_jogos IS 'Receitas manuais relacionadas a jogos específicos (patrocínios, comissões, vendas extras)';
COMMENT ON COLUMN receitas_jogos.jogo_key IS 'Chave do jogo no formato: adversario-YYYY-MM-DD-local';
COMMENT ON COLUMN receitas_jogos.tipo IS 'Tipo da receita: patrocinio, comissao, venda_extra, outros';
COMMENT ON COLUMN receitas_jogos.descricao IS 'Descrição detalhada da receita';
COMMENT ON COLUMN receitas_jogos.valor IS 'Valor da receita em reais';
COMMENT ON COLUMN receitas_jogos.data_receita IS 'Data em que a receita foi recebida';