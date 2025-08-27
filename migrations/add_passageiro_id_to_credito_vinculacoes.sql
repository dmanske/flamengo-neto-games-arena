-- Migration: Adicionar passageiro_id à tabela credito_viagem_vinculacoes
-- Data: 2025-01-24
-- Descrição: Permitir identificar qual passageiro utilizou o crédito

-- Adicionar coluna passageiro_id
ALTER TABLE credito_viagem_vinculacoes 
ADD COLUMN passageiro_id uuid REFERENCES clientes(id);

-- Criar índice para melhor performance
CREATE INDEX idx_credito_vinculacoes_passageiro_id 
ON credito_viagem_vinculacoes(passageiro_id);

-- Comentário para documentação
COMMENT ON COLUMN credito_viagem_vinculacoes.passageiro_id IS 'ID do passageiro que utilizou o crédito (beneficiário)';