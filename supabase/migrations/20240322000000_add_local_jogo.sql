-- Adiciona coluna de local do jogo
ALTER TABLE viagens ADD COLUMN local_jogo TEXT NOT NULL DEFAULT 'Rio de Janeiro';

-- Adicionar comentário para documentação
COMMENT ON COLUMN viagens.local_jogo IS 'Cidade onde o jogo será realizado';