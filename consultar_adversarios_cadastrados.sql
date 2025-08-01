-- SQL para consultar todos os adversários cadastrados
-- Execute este comando e me envie o resultado

SELECT 
    id,
    nome,
    logo_url
FROM adversarios 
ORDER BY nome;

-- Também vamos ver se há adversários únicos nas viagens já criadas
-- que podem não estar na tabela adversarios

SELECT DISTINCT 
    adversario as nome_adversario
FROM viagens 
WHERE adversario IS NOT NULL 
  AND adversario != ''
ORDER BY adversario;