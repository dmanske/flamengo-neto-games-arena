-- Adicionar campo nome_estadio na tabela viagens
-- Para jogos específicos (Grêmio/Inter) mostrar o nome do estádio

ALTER TABLE viagens 
ADD COLUMN nome_estadio TEXT;

-- Comentário explicativo
COMMENT ON COLUMN viagens.nome_estadio IS 'Nome do estádio para jogos específicos (ex: Arena do Grêmio, Estádio Beira-Rio)';

-- Atualizar jogos existentes do Grêmio e Inter com os nomes dos estádios
UPDATE viagens 
SET nome_estadio = 'Arena do Grêmio'
WHERE adversario ILIKE '%grêmio%' OR adversario ILIKE '%gremio%';

UPDATE viagens 
SET nome_estadio = 'Estádio Beira-Rio'
WHERE adversario ILIKE '%internacional%' OR adversario ILIKE '%inter%';

-- Verificar resultado
SELECT id, adversario, local_jogo, nome_estadio, setor_padrao 
FROM viagens 
WHERE nome_estadio IS NOT NULL
ORDER BY created_at DESC;