-- Criar tabela para histórico de pagamentos dos créditos
CREATE TABLE IF NOT EXISTS credito_pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credito_id UUID NOT NULL REFERENCES cliente_creditos(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10,2) NOT NULL CHECK (valor_pago > 0),
  data_pagamento DATE NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_credito_pagamentos_credito_id ON credito_pagamentos(credito_id);
CREATE INDEX IF NOT EXISTS idx_credito_pagamentos_data_pagamento ON credito_pagamentos(data_pagamento);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_credito_pagamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credito_pagamentos_updated_at
  BEFORE UPDATE ON credito_pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_credito_pagamentos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE credito_pagamentos ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações (ajustar conforme necessário)
CREATE POLICY "Permitir todas as operações em credito_pagamentos" ON credito_pagamentos
  FOR ALL USING (true);

-- Comentários para documentação
COMMENT ON TABLE credito_pagamentos IS 'Histórico de pagamentos dos créditos de viagem dos clientes';
COMMENT ON COLUMN credito_pagamentos.id IS 'Identificador único do pagamento';
COMMENT ON COLUMN credito_pagamentos.credito_id IS 'Referência ao crédito (cliente_creditos.id)';
COMMENT ON COLUMN credito_pagamentos.valor_pago IS 'Valor pago nesta parcela/pagamento';
COMMENT ON COLUMN credito_pagamentos.data_pagamento IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN credito_pagamentos.forma_pagamento IS 'Forma de pagamento utilizada (dinheiro, pix, cartao_credito, etc.)';
COMMENT ON COLUMN credito_pagamentos.observacoes IS 'Observações adicionais sobre o pagamento';
COMMENT ON COLUMN credito_pagamentos.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN credito_pagamentos.updated_at IS 'Data da última atualização do registro';