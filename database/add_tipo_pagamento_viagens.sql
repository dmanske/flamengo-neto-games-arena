-- Migration: Adicionar tipo de pagamento às viagens
-- Data: 2025-01-26
-- Descrição: Adiciona campo para controlar diferentes tipos de pagamento por viagem

-- Adicionar coluna tipo_pagamento na tabela viagens
ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS tipo_pagamento VARCHAR(20) DEFAULT 'livre';

-- Adicionar comentário para documentar os valores possíveis
COMMENT ON COLUMN viagens.tipo_pagamento IS 'Tipo de pagamento da viagem: livre, parcelado_flexivel, parcelado_obrigatorio';

-- Criar índice para otimizar consultas por tipo de pagamento
CREATE INDEX IF NOT EXISTS idx_viagens_tipo_pagamento ON viagens(tipo_pagamento);

-- Adicionar constraint para validar valores permitidos
ALTER TABLE viagens 
ADD CONSTRAINT IF NOT EXISTS check_tipo_pagamento 
CHECK (tipo_pagamento IN ('livre', 'parcelado_flexivel', 'parcelado_obrigatorio'));

-- Adicionar campos opcionais para configuração de pagamento
ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS exige_pagamento_completo BOOLEAN DEFAULT false;

ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS dias_antecedencia INTEGER DEFAULT 5;

ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS permite_viagem_com_pendencia BOOLEAN DEFAULT true;

-- Comentários para documentar os novos campos
COMMENT ON COLUMN viagens.exige_pagamento_completo IS 'Se true, cliente deve estar 100% pago antes da viagem';
COMMENT ON COLUMN viagens.dias_antecedencia IS 'Quantos dias antes da viagem o pagamento deve estar completo';
COMMENT ON COLUMN viagens.permite_viagem_com_pendencia IS 'Se false, bloqueia embarque com pendências';

-- Atualizar viagens existentes com configuração padrão baseada no comportamento atual
UPDATE viagens 
SET 
  tipo_pagamento = 'livre',
  exige_pagamento_completo = false,
  dias_antecedencia = 5,
  permite_viagem_com_pendencia = true
WHERE tipo_pagamento IS NULL;