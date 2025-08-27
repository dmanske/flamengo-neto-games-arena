-- Verificar qual passageiro ainda está na viagem do Mirassol

SELECT 'PASSAGEIRO QUE AINDA ESTÁ NA VIAGEM:' as debug;

SELECT 
  vp.id,
  c.nome,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento,
  vp.valor,
  vp.desconto,
  CASE 
    WHEN vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4' THEN '🎯 ESTE É O LEONARDO!'
    ELSE '❓ OUTRO PASSAGEIRO'
  END as identificacao
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE v.adversario = 'Mirassol'
ORDER BY c.nome;

-- Verificar se é realmente o Leonardo Keller
SELECT 'VERIFICAÇÃO ESPECÍFICA DO LEONARDO:' as debug;

SELECT 
  CASE WHEN COUNT(*) > 0 THEN '❌ LEONARDO AINDA ESTÁ NA VIAGEM' 
       ELSE '✅ LEONARDO FOI REMOVIDO' 
  END as resultado
FROM viagem_passageiros vp
WHERE vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4';

-- Se ainda estiver lá, mostrar seus dados atuais
SELECT 'DADOS ATUAIS DO LEONARDO (se ainda estiver):' as debug;

SELECT 
  vp.id,
  vp.pago_por_credito,
  vp.credito_origem_id,
  vp.valor_credito_utilizado,
  vp.status_pagamento
FROM viagem_passageiros vp
WHERE vp.id = 'ea126263-2807-4925-94bf-3a78845c76e4';