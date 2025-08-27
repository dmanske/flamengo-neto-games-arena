-- Migration: Remover coluna tipo_credito da tabela cliente_creditos
-- Data: 2025-01-24
-- Descrição: Simplificar sistema de créditos removendo tipos específicos

-- Remover coluna tipo_credito (não é mais necessária)
ALTER TABLE cliente_creditos DROP COLUMN IF EXISTS tipo_credito;

-- Comentário para documentação
COMMENT ON TABLE cliente_creditos IS 'Tabela de créditos de viagem - simplificada sem tipos específicos';