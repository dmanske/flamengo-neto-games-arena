-- Criar tabela de receitas
CREATE TABLE IF NOT EXISTS receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  categoria VARCHAR(50) NOT NULL,
  data_recebimento DATE NOT NULL,
  viagem_id UUID REFERENCES viagens(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  metodo_pagamento VARCHAR(30),
  status VARCHAR(20) DEFAULT 'recebido' CHECK (status IN ('recebido', 'pendente', 'cancelado')),
  observacoes TEXT,
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_receitas_data_recebimento ON receitas(data_recebimento);
CREATE INDEX IF NOT EXISTS idx_receitas_categoria ON receitas(categoria);
CREATE INDEX IF NOT EXISTS idx_receitas_status ON receitas(status);
CREATE INDEX IF NOT EXISTS idx_receitas_viagem_id ON receitas(viagem_id);
CREATE INDEX IF NOT EXISTS idx_receitas_cliente_id ON receitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_receitas_created_at ON receitas(created_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_receitas_updated_at 
    BEFORE UPDATE ON receitas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários autenticados podem ver e modificar todas as receitas
-- (ajustar conforme necessário para multi-tenancy)
CREATE POLICY "Usuários autenticados podem gerenciar receitas" ON receitas
    FOR ALL USING (auth.role() = 'authenticated');

-- Comentários para documentação
COMMENT ON TABLE receitas IS 'Tabela para armazenar todas as receitas do negócio';
COMMENT ON COLUMN receitas.descricao IS 'Descrição detalhada da receita';
COMMENT ON COLUMN receitas.valor IS 'Valor da receita em reais';
COMMENT ON COLUMN receitas.categoria IS 'Categoria da receita (ex: pagamento_viagem, venda_produto)';
COMMENT ON COLUMN receitas.data_recebimento IS 'Data em que a receita foi recebida';
COMMENT ON COLUMN receitas.viagem_id IS 'ID da viagem associada (opcional)';
COMMENT ON COLUMN receitas.cliente_id IS 'ID do cliente associado (opcional)';
COMMENT ON COLUMN receitas.metodo_pagamento IS 'Método de pagamento utilizado';
COMMENT ON COLUMN receitas.status IS 'Status da receita: recebido, pendente, cancelado';
COMMENT ON COLUMN receitas.comprovante_url IS 'URL do comprovante de pagamento';