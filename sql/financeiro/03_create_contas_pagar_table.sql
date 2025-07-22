-- Criar tabela de contas a pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  fornecedor VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado')),
  recorrente BOOLEAN DEFAULT FALSE,
  frequencia_recorrencia VARCHAR(20) CHECK (frequencia_recorrencia IN ('mensal', 'trimestral', 'semestral', 'anual')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_data_pagamento ON contas_pagar(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_categoria ON contas_pagar(categoria);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_fornecedor ON contas_pagar(fornecedor);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_recorrente ON contas_pagar(recorrente);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_created_at ON contas_pagar(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_contas_pagar_updated_at 
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar status automaticamente baseado na data de vencimento
CREATE OR REPLACE FUNCTION update_conta_pagar_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Se a data de pagamento foi preenchida, marcar como pago
    IF NEW.data_pagamento IS NOT NULL AND OLD.data_pagamento IS NULL THEN
        NEW.status = 'pago';
    -- Se passou da data de vencimento e não foi pago, marcar como vencido
    ELSIF NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL AND NEW.status = 'pendente' THEN
        NEW.status = 'vencido';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conta_pagar_status_trigger
    BEFORE UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_conta_pagar_status();

-- Função para criar contas recorrentes automaticamente
CREATE OR REPLACE FUNCTION criar_proxima_conta_recorrente()
RETURNS TRIGGER AS $$
DECLARE
    proxima_data DATE;
BEGIN
    -- Só criar próxima conta se foi marcada como paga e é recorrente
    IF NEW.status = 'pago' AND OLD.status != 'pago' AND NEW.recorrente = TRUE THEN
        -- Calcular próxima data baseada na frequência
        CASE NEW.frequencia_recorrencia
            WHEN 'mensal' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '1 month';
            WHEN 'trimestral' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '3 months';
            WHEN 'semestral' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '6 months';
            WHEN 'anual' THEN
                proxima_data := NEW.data_vencimento + INTERVAL '1 year';
            ELSE
                proxima_data := NEW.data_vencimento + INTERVAL '1 month';
        END CASE;
        
        -- Inserir nova conta com a próxima data de vencimento
        INSERT INTO contas_pagar (
            descricao, 
            valor, 
            data_vencimento, 
            fornecedor, 
            categoria, 
            recorrente, 
            frequencia_recorrencia,
            observacoes
        ) VALUES (
            NEW.descricao,
            NEW.valor,
            proxima_data,
            NEW.fornecedor,
            NEW.categoria,
            NEW.recorrente,
            NEW.frequencia_recorrencia,
            NEW.observacoes
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER criar_conta_recorrente_trigger
    AFTER UPDATE ON contas_pagar 
    FOR EACH ROW 
    EXECUTE FUNCTION criar_proxima_conta_recorrente();

-- Habilitar RLS (Row Level Security)
ALTER TABLE contas_pagar ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem ver e modificar todas as contas
CREATE POLICY "Usuários autenticados podem gerenciar contas a pagar" ON contas_pagar
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE contas_pagar IS 'Tabela para armazenar contas a pagar e compromissos financeiros';
COMMENT ON COLUMN contas_pagar.descricao IS 'Descrição da conta a pagar';
COMMENT ON COLUMN contas_pagar.valor IS 'Valor da conta em reais';
COMMENT ON COLUMN contas_pagar.data_vencimento IS 'Data de vencimento da conta';
COMMENT ON COLUMN contas_pagar.data_pagamento IS 'Data em que a conta foi paga (opcional)';
COMMENT ON COLUMN contas_pagar.fornecedor IS 'Nome do fornecedor/credor';
COMMENT ON COLUMN contas_pagar.categoria IS 'Categoria da conta (ex: aluguel, energia, telefone)';
COMMENT ON COLUMN contas_pagar.status IS 'Status da conta: pendente, pago, vencido, cancelado';
COMMENT ON COLUMN contas_pagar.recorrente IS 'Indica se a conta se repete periodicamente';
COMMENT ON COLUMN contas_pagar.frequencia_recorrencia IS 'Frequência de repetição: mensal, trimestral, semestral, anual';