-- Adicionar campo de status de presença na tabela viagem_passageiros
ALTER TABLE viagem_passageiros 
ADD COLUMN status_presenca VARCHAR(20) DEFAULT 'pendente' CHECK (status_presenca IN ('pendente', 'presente', 'ausente'));

-- Criar índice para melhor performance
CREATE INDEX idx_viagem_passageiros_status_presenca ON viagem_passageiros(status_presenca);

-- Comentário explicativo
COMMENT ON COLUMN viagem_passageiros.status_presenca IS 'Status de presença do passageiro: pendente, presente, ausente';