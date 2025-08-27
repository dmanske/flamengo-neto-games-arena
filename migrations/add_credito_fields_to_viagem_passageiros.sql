-- Migration: Adicionar campos de crédito na tabela viagem_passageiros
-- Data: 2024-08-24
-- Descrição: Adiciona campos para rastrear pagamentos via crédito

-- Adicionar campos para controle de crédito
ALTER TABLE viagem_passageiros 
ADD COLUMN IF NOT EXISTS pago_por_credito BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS credito_origem_id UUID REFERENCES cliente_creditos(id),
ADD COLUMN IF NOT EXISTS valor_credito_utilizado DECIMAL(10,2) DEFAULT 0;

-- Adicionar comentários para documentação
COMMENT ON COLUMN viagem_passageiros.pago_por_credito IS 'Indica se o pagamento foi feito via crédito antecipado';
COMMENT ON COLUMN viagem_passageiros.credito_origem_id IS 'ID do crédito que foi utilizado para pagar esta viagem';
COMMENT ON COLUMN viagem_passageiros.valor_credito_utilizado IS 'Valor do crédito que foi utilizado para esta viagem';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_viagem_passageiros_credito_origem 
ON viagem_passageiros(credito_origem_id) 
WHERE credito_origem_id IS NOT NULL;

-- Atualizar RLS policy se necessário (manter as existentes)
-- As políticas RLS existentes já cobrem estes campos