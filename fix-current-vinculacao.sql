-- Criar a vinculação que está faltando para o passageiro atual

-- 1. Buscar dados do passageiro atual
SELECT 'DADOS DO PASSAGEIRO ATUAL:' as debug;
SELECT 
  vp.id,
  vp.cliente_id,
  vp.viagem_id,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  c.nome as cliente_nome,
  v.adversario as viagem_nome
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE vp.id = '4e76ac62-8efd-48ea-9617-278682b7ab77';

-- 2. Criar a vinculação que está faltando
INSERT INTO credito_viagem_vinculacoes (
  credito_id,
  viagem_id,
  passageiro_id,
  valor_utilizado,
  data_vinculacao,
  observacoes
)
SELECT 
  vp.credito_origem_id,
  vp.viagem_id,
  vp.cliente_id,
  vp.valor_credito_utilizado,
  NOW(),
  'Vinculação recriada para corrigir inconsistência - passageiro atual'
FROM viagem_passageiros vp
WHERE vp.id = '4e76ac62-8efd-48ea-9617-278682b7ab77';

-- 3. Verificar se a vinculação foi criada
SELECT 'VINCULAÇÃO CRIADA:' as debug;
SELECT 
  cvv.*,
  c.nome as cliente_nome
FROM credito_viagem_vinculacoes cvv
JOIN cliente_creditos cc ON cc.id = cvv.credito_id
JOIN clientes c ON c.id = cc.cliente_id
WHERE cvv.credito_id = 'c3f1e91d-78ad-4060-8d57-b360a26666e3';

-- 4. Atualizar saldo do crédito
UPDATE cliente_creditos 
SET 
  saldo_disponivel = valor_credito - (
    SELECT COALESCE(SUM(valor_utilizado), 0) 
    FROM credito_viagem_vinculacoes 
    WHERE credito_id = 'c3f1e91d-78ad-4060-8d57-b360a26666e3'
  ),
  status = CASE 
    WHEN (valor_credito - (
      SELECT COALESCE(SUM(valor_utilizado), 0) 
      FROM credito_viagem_vinculacoes 
      WHERE credito_id = 'c3f1e91d-78ad-4060-8d57-b360a26666e3'
    )) = 0 THEN 'utilizado'
    WHEN (valor_credito - (
      SELECT COALESCE(SUM(valor_utilizado), 0) 
      FROM credito_viagem_vinculacoes 
      WHERE credito_id = 'c3f1e91d-78ad-4060-8d57-b360a26666e3'
    )) < valor_credito THEN 'parcial'
    ELSE 'disponivel'
  END
WHERE id = 'c3f1e91d-78ad-4060-8d57-b360a26666e3';

SELECT 'CORREÇÃO CONCLUÍDA! Agora você pode testar deletar o crédito.' as status;