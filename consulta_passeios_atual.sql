-- Consulta para verificar todos os passeios cadastrados no sistema
SELECT 
    nome,
    valor,
    categoria,
    ativo
FROM passeios 
ORDER BY categoria DESC, valor DESC, nome ASC;