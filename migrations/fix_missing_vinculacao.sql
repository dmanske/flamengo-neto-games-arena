-- Corrigir vinculação faltante do Leonardo Keller

-- 1. Verificar dados atuais
SELECT 'DADOS ANTES DA CORREÇÃO:' as status;

SELECT 'Passageiro:' as tipo, vp.id, c.nome, vp.pago_por_credito, vp.credito_origem_id, vp.valor_credito_utilizado
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
WHERE vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4';

SELECT 'Crédito:' as tipo, cc.id, cc.valor_credito, cc.saldo_disponivel, cc.status
FROM cliente_creditos cc
WHERE cc.id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Vinculação existe?:' as tipo, COUNT(*) as count
FROM credito_viagem_vinculacoes cvv
WHERE cvv.credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee'
  AND cvv.passageiro_id = 'accd829d-563b-4c43-a297-ba04c696ba93'
  AND cvv.viagem_id = '3566e81a-ad4c-445e-a0c2-cb63a5915fe0';

-- 2. Criar a vinculação que está faltando
INSERT INTO credito_viagem_vinculacoes (
  credito_id,
  viagem_id,
  passageiro_id,
  valor_utilizado,
  data_vinculacao,
  observacoes
) VALUES (
  'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee',  -- credito_id
  '3566e81a-ad4c-445e-a0c2-cb63a5915fe0',  -- viagem_id (Mirassol)
  'accd829d-563b-4c43-a297-ba04c696ba93',  -- passageiro_id (Leonardo Keller)
  1020.00,                                  -- valor_utilizado
  NOW(),                                    -- data_vinculacao
  'Vinculação recriada para corrigir inconsistência'
);

-- 3. Atualizar o saldo do crédito
UPDATE cliente_creditos 
SET 
  saldo_disponivel = valor_credito - 1020.00,
  status = CASE 
    WHEN (valor_credito - 1020.00) = 0 THEN 'utilizado'
    WHEN (valor_credito - 1020.00) < valor_credito THEN 'parcial'
    ELSE 'disponivel'
  END
WHERE id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

-- 4. Verificar dados após correção
SELECT 'DADOS APÓS CORREÇÃO:' as status;

SELECT 'Crédito corrigido:' as tipo, cc.id, cc.valor_credito, cc.saldo_disponivel, cc.status
FROM cliente_creditos cc
WHERE cc.id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Vinculação criada:' as tipo, cvv.*
FROM credito_viagem_vinculacoes cvv
WHERE cvv.credito_id = 'b3e9cc73-b478-4aa9-bc5d-2fdf79b574ee';

SELECT 'Agora podemos testar a exclusão!' as status;