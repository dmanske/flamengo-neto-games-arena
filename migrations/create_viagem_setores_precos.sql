-- Migration: Criar tabela para preços dos setores por viagem
-- Data: 2024-12-10
-- Descrição: Tabela para armazenar preços de custo e venda dos setores de ingressos por viagem

-- Criar tabela viagem_setores_precos
CREATE TABLE IF NOT EXISTS viagem_setores_precos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  setor_nome VARCHAR(100) NOT NULL,
  preco_custo DECIMAL(10,2) NOT NULL CHECK (preco_custo >= 0),
  preco_venda DECIMAL(10,2) NOT NULL CHECK (preco_venda >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar setores duplicados por viagem
  UNIQUE(viagem_id, setor_nome)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_viagem_setores_precos_viagem_id ON viagem_setores_precos(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_setores_precos_setor_nome ON viagem_setores_precos(setor_nome);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_viagem_setores_precos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viagem_setores_precos_updated_at
  BEFORE UPDATE ON viagem_setores_precos
  FOR EACH ROW
  EXECUTE FUNCTION update_viagem_setores_precos_updated_at();

-- Comentários na tabela
COMMENT ON TABLE viagem_setores_precos IS 'Preços de custo e venda dos setores de ingressos por viagem';
COMMENT ON COLUMN viagem_setores_precos.viagem_id IS 'ID da viagem (FK para viagens)';
COMMENT ON COLUMN viagem_setores_precos.setor_nome IS 'Nome do setor do Maracanã';
COMMENT ON COLUMN viagem_setores_precos.preco_custo IS 'Preço de custo do ingresso (valor pago ao fornecedor)';
COMMENT ON COLUMN viagem_setores_precos.preco_venda IS 'Preço de venda do ingresso (valor cobrado do cliente)';

-- Inserir alguns dados de exemplo (opcional - remover em produção)
-- INSERT INTO viagem_setores_precos (viagem_id, setor_nome, preco_custo, preco_venda) VALUES
-- ('uuid-da-viagem-exemplo', 'Setor Norte', 80.00, 120.00),
-- ('uuid-da-viagem-exemplo', 'Setor Sul', 100.00, 150.00),
-- ('uuid-da-viagem-exemplo', 'Maracanã Mais', 150.00, 200.00);

-- Verificar se a tabela foi criada corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_setores_precos'
ORDER BY ordinal_position;