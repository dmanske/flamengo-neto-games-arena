-- Migration para atualizar valores dos passeios
-- Data: 08/01/2025
-- Descrição: Correção dos valores dos passeios conforme nova tabela de preços

-- 1. Atualizar valores dos passeios existentes
UPDATE passeios SET valor = 128.00 WHERE nome = 'Cristo Redentor';
UPDATE passeios SET valor = 155.00 WHERE nome = 'Pão de Açúcar';
UPDATE passeios SET valor = 90.00 WHERE nome = 'Museu do Flamengo';
UPDATE passeios SET valor = 140.00 WHERE nome = 'Aquário';
UPDATE passeios SET valor = 79.00 WHERE nome = 'Roda-Gigante';
-- Museu do Amanhã mantém R$ 30,00 (sem alteração)
UPDATE passeios SET valor = 89.00 WHERE nome = 'Tour do Maracanã';
UPDATE passeios SET valor = 90.00 WHERE nome = 'Rocinha';
UPDATE passeios SET valor = 90.00 WHERE nome = 'Vidigal';
UPDATE passeios SET valor = 90.00 WHERE nome = 'Tour da Gávea';
UPDATE passeios SET valor = 25.00 WHERE nome = 'Museu do Mar';

-- 2. Mover Parque Lage para gratuito
UPDATE passeios SET valor = 0, categoria = 'gratuito' WHERE nome = 'Parque Lage';

-- 3. Adicionar novo passeio "Rocinha + Vidigal"
INSERT INTO passeios (id, nome, valor, categoria, ativo) VALUES
(uuid_generate_v4(), 'Rocinha + Vidigal', 130.00, 'pago', true)
ON CONFLICT (nome) DO UPDATE SET
    valor = EXCLUDED.valor,
    categoria = EXCLUDED.categoria,
    ativo = EXCLUDED.ativo;

-- 4. Verificar se as atualizações foram aplicadas corretamente
-- (Esta query é apenas para verificação - pode ser removida em produção)
SELECT nome, valor, categoria 
FROM passeios 
WHERE categoria = 'pago' 
ORDER BY valor DESC;