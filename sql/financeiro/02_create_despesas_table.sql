-- Criar tabela de despesas
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

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_data_pagamento ON despesas(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_despesas_categoria ON despesas(categoria);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON despesas(status);
CREATE INDEX IF NOT EXISTS idx_despesas_viagem_id ON despesas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON despesas(fornecedor);
CREATE INDEX IF NOT EXISTS idx_despesas_created_at ON despesas(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_despesas_updated_at 
    BEFORE UPDATE ON despesas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar status automaticamente baseado na data de vencimento
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

CREATE TRIGGER update_despesa_status_trigger
    BEFORE UPDATE ON despesas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_despesa_status();

-- Habilitar RLS (Row Level Security)
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem ver e modificar todas as despesas
CREATE POLICY "Usuários autenticados podem gerenciar despesas" ON despesas
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE despesas IS 'Tabela para armazenar todas as despesas do negócio';
COMMENT ON COLUMN despesas.descricao IS 'Descrição detalhada da despesa';
COMMENT ON COLUMN despesas.valor IS 'Valor da despesa em reais';
COMMENT ON COLUMN despesas.categoria IS 'Categoria da despesa (ex: combustivel, alimentacao, hospedagem)';
COMMENT ON COLUMN despesas.data_vencimento IS 'Data de vencimento da despesa';
COMMENT ON COLUMN despesas.data_pagamento IS 'Data em que a despesa foi paga (opcional)';
COMMENT ON COLUMN despesas.viagem_id IS 'ID da viagem associada (opcional)';
COMMENT ON COLUMN despesas.fornecedor IS 'Nome do fornecedor/prestador de serviço';
COMMENT ON COLUMN despesas.status IS 'Status da despesa: pendente, pago, vencido, cancelado';
COMMENT ON COLUMN despesas.comprovante_url IS 'URL do comprovante de pagamento';