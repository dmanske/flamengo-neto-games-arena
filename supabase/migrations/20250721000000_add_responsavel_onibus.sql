-- Adiciona campo para marcar passageiro como responsável do ônibus
ALTER TABLE viagem_passageiros ADD COLUMN is_responsavel_onibus BOOLEAN DEFAULT FALSE;

-- Cria índice para consultas mais rápidas
CREATE INDEX idx_viagem_passageiros_responsavel ON viagem_passageiros(is_responsavel_onibus);