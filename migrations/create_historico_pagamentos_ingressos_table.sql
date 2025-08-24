-- Migration: Criar tabela historico_pagamentos_ingressos
-- Data: 2025-01-25
-- Descrição: Tabela para armazenar o histórico de pagamentos dos ingressos

-- Criar tabela historico_pagamentos_ingressos
CREATE TABLE IF NOT EXISTS historico_pagamentos_ingressos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ingresso_id UUID NOT NULL REFERENCES ingressos(id) ON DELETE CASCADE,
    valor_pago DECIMAL(10,2) NOT NULL CHECK (valor_pago > 0),
    data_pagamento DATE NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL CHECK (forma_pagamento IN (
        'dinheiro', 
        'pix', 
        'cartao_credito', 
        'cartao_debito', 
        'transferencia', 
        'boleto',
        'outros'
    )),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_ingressos_ingresso_id 
ON historico_pagamentos_ingressos(ingresso_id);

CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_ingressos_data_pagamento 
ON historico_pagamentos_ingressos(data_pagamento);

CREATE INDEX IF NOT EXISTS idx_historico_pagamentos_ingressos_forma_pagamento 
ON historico_pagamentos_ingressos(forma_pagamento);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_historico_pagamentos_ingressos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_historico_pagamentos_ingressos_updated_at
    BEFORE UPDATE ON historico_pagamentos_ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_historico_pagamentos_ingressos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE historico_pagamentos_ingressos ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir todas as operações (ajustar conforme necessário)
CREATE POLICY "Permitir todas as operações em historico_pagamentos_ingressos" 
ON historico_pagamentos_ingressos
FOR ALL 
USING (true)
WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE historico_pagamentos_ingressos IS 'Histórico de pagamentos dos ingressos vendidos separadamente das viagens';
COMMENT ON COLUMN historico_pagamentos_ingressos.id IS 'Identificador único do pagamento';
COMMENT ON COLUMN historico_pagamentos_ingressos.ingresso_id IS 'Referência ao ingresso pago';
COMMENT ON COLUMN historico_pagamentos_ingressos.valor_pago IS 'Valor pago neste pagamento específico';
COMMENT ON COLUMN historico_pagamentos_ingressos.data_pagamento IS 'Data em que o pagamento foi realizado';
COMMENT ON COLUMN historico_pagamentos_ingressos.forma_pagamento IS 'Forma de pagamento utilizada';
COMMENT ON COLUMN historico_pagamentos_ingressos.observacoes IS 'Observações sobre o pagamento';
COMMENT ON COLUMN historico_pagamentos_ingressos.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN historico_pagamentos_ingressos.updated_at IS 'Data da última atualização do registro';