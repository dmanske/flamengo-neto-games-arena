-- Adicionar campo para URL das Regras de Viagem na tabela empresa_config
ALTER TABLE empresa_config 
ADD COLUMN IF NOT EXISTS regras_viagem_url TEXT DEFAULT 'https://regras-de-viagem-4kqyq4b.gamma.site/';

-- Comentário explicativo
COMMENT ON COLUMN empresa_config.regras_viagem_url IS 'URL da página de regras de viagem (pode ser iframe ou redirect)';
