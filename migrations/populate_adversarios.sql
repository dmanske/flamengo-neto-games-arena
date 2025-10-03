-- Popular tabela adversarios com alguns times principais para teste
-- Execute este SQL no Supabase para adicionar adversários com logos

-- Primeiro, verificar se a tabela existe
-- CREATE TABLE IF NOT EXISTS adversarios (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   nome VARCHAR(255) UNIQUE NOT NULL,
--   logo_url TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Inserir alguns adversários principais
INSERT INTO adversarios (nome, logo_url) VALUES
  ('Palmeiras', 'https://logodetimes.com/times/palmeiras/logo-palmeiras-256.png'),
  ('Corinthians', 'https://logodetimes.com/times/corinthians/logo-corinthians-256.png'),
  ('São Paulo', 'https://logodetimes.com/times/sao-paulo/logo-sao-paulo-256.png'),
  ('Santos', 'https://logodetimes.com/times/santos/logo-santos-256.png'),
  ('Vasco', 'https://logodetimes.com/times/vasco/logo-vasco-256.png'),
  ('Botafogo', 'https://logodetimes.com/times/botafogo/logo-botafogo-256.png'),
  ('Fluminense', 'https://logodetimes.com/times/fluminense/logo-fluminense-256.png'),
  ('Atlético-MG', 'https://logodetimes.com/times/atletico-mg/logo-atletico-mg-256.png')
ON CONFLICT (nome) DO UPDATE SET
  logo_url = EXCLUDED.logo_url;

-- Verificar se os dados foram inseridos
SELECT nome, logo_url FROM adversarios ORDER BY nome;