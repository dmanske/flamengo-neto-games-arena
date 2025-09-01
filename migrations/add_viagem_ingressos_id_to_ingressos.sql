-- Migration: Adicionar coluna viagem_ingressos_id à tabela ingressos
-- Autor: Sistema
-- Data: 2025-01-31
-- Descrição: Adiciona referência para a tabela viagens_ingressos na tabela ingressos

-- Verificar se a tabela ingressos existe, se não, criar
CREATE TABLE IF NOT EXISTS ingressos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  
  -- Dados do jogo
  jogo_data TIMESTAMPTZ NOT NULL,
  adversario VARCHAR(255) NOT NULL,
  logo_adversario TEXT,
  local_jogo VARCHAR(10) NOT NULL CHECK (local_jogo IN ('casa', 'fora')),
  setor_estadio VARCHAR(255) NOT NULL,
  
  -- Controle financeiro
  preco_custo DECIMAL(10,2) NOT NULL CHECK (preco_custo >= 0),
  preco_venda DECIMAL(10,2) NOT NULL CHECK (preco_venda >= 0),
  desconto DECIMAL(10,2) DEFAULT 0 CHECK (desconto >= 0),
  valor_final DECIMAL(10,2) GENERATED ALWAYS AS (preco_venda - desconto) STORED,
  lucro DECIMAL(10,2) GENERATED ALWAYS AS (preco_venda - desconto - preco_custo) STORED,
  margem_percentual DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN (preco_venda - desconto) > 0 
      THEN ((preco_venda - desconto - preco_custo) / (preco_venda - desconto)) * 100
      ELSE 0 
    END
  ) STORED,
  
  -- Status e controle
  situacao_financeira VARCHAR(20) DEFAULT 'pendente' CHECK (situacao_financeira IN ('pendente', 'pago', 'cancelado')),
  observacoes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar coluna viagem_ingressos_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingressos' 
    AND column_name = 'viagem_ingressos_id'
  ) THEN
    ALTER TABLE ingressos 
    ADD COLUMN viagem_ingressos_id UUID REFERENCES viagens_ingressos(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON ingressos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_viagem_id ON ingressos(viagem_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_viagem_ingressos_id ON ingressos(viagem_ingressos_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_jogo_data ON ingressos(jogo_data);
CREATE INDEX IF NOT EXISTS idx_ingressos_adversario ON ingressos(adversario);
CREATE INDEX IF NOT EXISTS idx_ingressos_situacao_financeira ON ingressos(situacao_financeira);

-- Criar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ingressos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ingressos_updated_at ON ingressos;
CREATE TRIGGER trigger_update_ingressos_updated_at
    BEFORE UPDATE ON ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_ingressos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE ingressos ENABLE ROW LEVEL SECURITY;

-- Criar política RLS para permitir todas as operações (ajustar conforme necessário)
DROP POLICY IF EXISTS "Permitir todas as operações em ingressos" ON ingressos;
CREATE POLICY "Permitir todas as operações em ingressos" 
ON ingressos
FOR ALL 
USING (true)
WITH CHECK (true);

-- Comentários para documentação
COMMENT ON TABLE ingressos IS 'Tabela para armazenar ingressos vendidos separadamente das viagens';
COMMENT ON COLUMN ingressos.id IS 'Identificador único do ingresso';
COMMENT ON COLUMN ingressos.cliente_id IS 'Referência ao cliente que comprou o ingresso';
COMMENT ON COLUMN ingressos.viagem_id IS 'Referência à viagem (se vinculado a uma viagem)';
COMMENT ON COLUMN ingressos.viagem_ingressos_id IS 'Referência à viagem específica do sistema de ingressos';
COMMENT ON COLUMN ingressos.jogo_data IS 'Data e hora do jogo';
COMMENT ON COLUMN ingressos.adversario IS 'Nome do time adversário';
COMMENT ON COLUMN ingressos.logo_adversario IS 'URL do logo do time adversário';
COMMENT ON COLUMN ingressos.local_jogo IS 'Local do jogo (casa ou fora)';
COMMENT ON COLUMN ingressos.setor_estadio IS 'Setor do estádio onde fica o ingresso';
COMMENT ON COLUMN ingressos.preco_custo IS 'Preço de custo do ingresso';
COMMENT ON COLUMN ingressos.preco_venda IS 'Preço de venda do ingresso';
COMMENT ON COLUMN ingressos.desconto IS 'Desconto aplicado ao ingresso';
COMMENT ON COLUMN ingressos.valor_final IS 'Valor final do ingresso (calculado automaticamente)';
COMMENT ON COLUMN ingressos.lucro IS 'Lucro do ingresso (calculado automaticamente)';
COMMENT ON COLUMN ingressos.margem_percentual IS 'Margem percentual de lucro (calculada automaticamente)';
COMMENT ON COLUMN ingressos.situacao_financeira IS 'Situação financeira do ingresso';
COMMENT ON COLUMN ingressos.observacoes IS 'Observações sobre o ingresso';
COMMENT ON COLUMN ingressos.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN ingressos.updated_at IS 'Data da última atualização do registro';