-- Criar tabela de passeios dos passageiros
CREATE TABLE passageiro_passeios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  viagem_passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id) ON DELETE CASCADE,
  passeio_nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Adicionar índices
CREATE INDEX idx_passageiro_passeios_viagem_passageiro_id ON passageiro_passeios(viagem_passageiro_id);
CREATE INDEX idx_passageiro_passeios_status ON passageiro_passeios(status);

-- Trigger para atualizar updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON passageiro_passeios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 