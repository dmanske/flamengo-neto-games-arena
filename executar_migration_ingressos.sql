-- Script para executar no Supabase SQL Editor
-- Corrige o erro da coluna viagem_ingressos_id na tabela ingressos

-- 1. Primeiro, verificar se as tabelas existem
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name IN ('ingressos', 'viagens_ingressos', 'clientes', 'viagens')
AND table_schema = 'public'
ORDER BY table_name;

-- 2. Executar a migration completa
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

-- 3. Adicionar coluna viagem_ingressos_id se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ingressos' 
    AND column_name = 'viagem_ingressos_id'
  ) THEN
    ALTER TABLE ingressos 
    ADD COLUMN viagem_ingressos_id UUID REFERENCES viagens_ingressos(id) ON DELETE SET NULL;
    RAISE NOTICE 'Coluna viagem_ingressos_id adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'Coluna viagem_ingressos_id já existe!';
  END IF;
END $$;

-- 4. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_ingressos_cliente_id ON ingressos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_viagem_id ON ingressos(viagem_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_viagem_ingressos_id ON ingressos(viagem_ingressos_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_jogo_data ON ingressos(jogo_data);
CREATE INDEX IF NOT EXISTS idx_ingressos_adversario ON ingressos(adversario);
CREATE INDEX IF NOT EXISTS idx_ingressos_situacao_financeira ON ingressos(situacao_financeira);

-- 5. Criar trigger para atualizar updated_at automaticamente
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

-- 6. Habilitar RLS (Row Level Security)
ALTER TABLE ingressos ENABLE ROW LEVEL SECURITY;

-- 7. Criar política RLS para permitir todas as operações
DROP POLICY IF EXISTS "Permitir todas as operações em ingressos" ON ingressos;
CREATE POLICY "Permitir todas as operações em ingressos" 
ON ingressos
FOR ALL 
USING (true)
WITH CHECK (true);

-- 8. Verificar se a migration foi aplicada corretamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ingressos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Verificar se a referência para viagens_ingressos foi criada
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'ingressos'
    AND kcu.column_name = 'viagem_ingressos_id';

SELECT 'Migration executada com sucesso! ✅' as status;