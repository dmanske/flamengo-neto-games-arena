-- Criar tabela específica para viagens do sistema de ingressos
-- Esta tabela é independente da tabela 'viagens' principal

CREATE TABLE IF NOT EXISTS viagens_ingressos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  adversario VARCHAR(255) NOT NULL,
  data_jogo TIMESTAMPTZ NOT NULL,
  local_jogo VARCHAR(10) NOT NULL CHECK (local_jogo IN ('casa', 'fora')),
  logo_adversario TEXT,
  logo_flamengo TEXT DEFAULT 'https://logodetimes.com/times/flamengo/logo-flamengo-256.png',
  valor_padrao DECIMAL(10,2) DEFAULT 100.00,
  status VARCHAR(20) DEFAULT 'Ativa' CHECK (status IN ('Ativa', 'Finalizada', 'Cancelada')),
  editavel BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_viagens_ingressos_adversario ON viagens_ingressos(adversario);
CREATE INDEX IF NOT EXISTS idx_viagens_ingressos_data_jogo ON viagens_ingressos(data_jogo);
CREATE INDEX IF NOT EXISTS idx_viagens_ingressos_status ON viagens_ingressos(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_viagens_ingressos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viagens_ingressos_updated_at
    BEFORE UPDATE ON viagens_ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_viagens_ingressos_updated_at();

-- Comentários
COMMENT ON TABLE viagens_ingressos IS 'Tabela específica para viagens criadas pelo sistema de ingressos - independente da tabela viagens principal';
COMMENT ON COLUMN viagens_ingressos.editavel IS 'Indica se a viagem pode ser editada (true para viagens criadas pelo sistema de ingressos)';
COMMENT ON COLUMN viagens_ingressos.valor_padrao IS 'Valor padrão dos ingressos para esta viagem';