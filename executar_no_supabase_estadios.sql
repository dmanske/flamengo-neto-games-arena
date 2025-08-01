-- ========================================
-- ADICIONAR CAMPO NOME_ESTADIO NA TABELA VIAGENS
-- Execute este SQL no Supabase SQL Editor
-- ========================================

-- 1. Adicionar campo nome_estadio na tabela viagens
ALTER TABLE viagens 
ADD COLUMN IF NOT EXISTS nome_estadio TEXT;

-- 2. Comentário explicativo
COMMENT ON COLUMN viagens.nome_estadio IS 'Nome do estádio para jogos específicos (ex: Arena do Grêmio, Estádio Beira-Rio)';

-- 3. Atualizar viagens existentes com os nomes dos estádios baseado no adversário
UPDATE viagens SET nome_estadio = 'Arena do Grêmio' WHERE adversario = 'Grêmio';
UPDATE viagens SET nome_estadio = 'Estádio Beira-Rio' WHERE adversario = 'Internacional';
UPDATE viagens SET nome_estadio = 'Estádio Nilton Santos (Engenhão)' WHERE adversario = 'Botafogo';
UPDATE viagens SET nome_estadio = 'Estádio São Januário' WHERE adversario = 'Vasco da Gama';
UPDATE viagens SET nome_estadio = 'Allianz Parque' WHERE adversario = 'Palmeiras';
UPDATE viagens SET nome_estadio = 'Estádio do Morumbi' WHERE adversario = 'São Paulo';
UPDATE viagens SET nome_estadio = 'Neo Química Arena' WHERE adversario = 'Corinthians';
UPDATE viagens SET nome_estadio = 'Vila Belmiro' WHERE adversario = 'Santos';
UPDATE viagens SET nome_estadio = 'Estádio Nabi Abi Chedid' WHERE adversario = 'Red Bull Bragantino';
UPDATE viagens SET nome_estadio = 'Estádio José Maria de Campos Maia' WHERE adversario = 'Mirassol';
UPDATE viagens SET nome_estadio = 'Estádio Alfredo Jaconi' WHERE adversario = 'Juventude';
UPDATE viagens SET nome_estadio = 'Arena MRV' WHERE adversario = 'Atlético Mineiro';
UPDATE viagens SET nome_estadio = 'Estádio Mineirão' WHERE adversario = 'Cruzeiro';
UPDATE viagens SET nome_estadio = 'Arena Fonte Nova' WHERE adversario = 'Bahia';
UPDATE viagens SET nome_estadio = 'Arena Castelão' WHERE adversario = 'Fortaleza';
UPDATE viagens SET nome_estadio = 'Ilha do Retiro' WHERE adversario = 'Sport';
UPDATE viagens SET nome_estadio = 'Estádio Manoel Barradas (Barradão)' WHERE adversario = 'Vitória';
UPDATE viagens SET nome_estadio = 'Arena Castelão' WHERE adversario = 'Ceará';

-- 4. Para jogos no Rio de Janeiro (Flamengo e Fluminense), deixar nome_estadio como NULL
UPDATE viagens SET nome_estadio = NULL WHERE adversario IN ('Flamengo', 'Fluminense') OR local_jogo = 'Rio de Janeiro';

-- 5. Verificar resultado da atualização
SELECT 
    id, 
    adversario, 
    local_jogo, 
    nome_estadio, 
    setor_padrao,
    data_jogo
FROM viagens 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Ver estatísticas dos estádios atualizados
SELECT 
    nome_estadio,
    COUNT(*) as total_viagens
FROM viagens 
WHERE nome_estadio IS NOT NULL
GROUP BY nome_estadio
ORDER BY total_viagens DESC;