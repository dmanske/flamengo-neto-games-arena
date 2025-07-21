-- SQL para atualizar setores de jogos fora do Rio de Janeiro
-- Execute este comando no SQL Editor do Supabase

-- Primeiro, vamos ver quais viagens temos fora do Rio de Janeiro
SELECT id, adversario, local_jogo, setor_padrao 
FROM viagens 
WHERE local_jogo IS NOT NULL 
  AND local_jogo != 'Rio de Janeiro'
  AND setor_padrao IN ('Norte', 'Sul', 'Leste', 'Oeste', 'Maracanã Mais');

-- Atualizar viagens fora do Rio de Janeiro para usar "Setor padrão do estádio visitante"
UPDATE viagens 
SET setor_padrao = 'Setor padrão do estádio visitante'
WHERE local_jogo IS NOT NULL 
  AND local_jogo != 'Rio de Janeiro'
  AND setor_padrao IN ('Norte', 'Sul', 'Leste', 'Oeste', 'Maracanã Mais');

-- Verificar o resultado da atualização
SELECT id, adversario, local_jogo, setor_padrao 
FROM viagens 
WHERE local_jogo IS NOT NULL 
  AND local_jogo != 'Rio de Janeiro';

-- Opcional: Se você quiser definir "Sem ingresso" para algumas viagens específicas
-- Descomente e ajuste conforme necessário:
-- UPDATE viagens 
-- SET setor_padrao = 'Sem ingresso'
-- WHERE local_jogo IS NOT NULL 
--   AND local_jogo != 'Rio de Janeiro'
--   AND adversario IN ('Nome do Time 1', 'Nome do Time 2'); -- Substitua pelos nomes dos times