-- =====================================================
-- DEBUG: Verificar QR Codes e Ônibus
-- =====================================================
-- Execute este SQL no Supabase SQL Editor para debugar
-- =====================================================

-- 1. Ver todos os passageiros com seus ônibus
SELECT 
  vp.id as viagem_passageiro_id,
  c.nome as passageiro_nome,
  vp.onibus_id,
  vo.numero_identificacao as onibus_numero,
  vo.tipo_onibus,
  v.adversario as viagem
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN viagem_onibus vo ON vo.id = vp.onibus_id
JOIN viagens v ON v.id = vp.viagem_id
ORDER BY vo.numero_identificacao, c.nome;

-- 2. Ver tokens QR code com informações do passageiro e ônibus
SELECT 
  pqt.token,
  c.nome as passageiro_nome,
  vp.onibus_id,
  vo.numero_identificacao as onibus_numero,
  pqt.expires_at,
  pqt.used_at,
  CASE 
    WHEN pqt.used_at IS NOT NULL THEN '✅ Usado'
    WHEN pqt.expires_at < NOW() THEN '⏰ Expirado'
    ELSE '🟢 Válido'
  END as status
FROM passageiro_qr_tokens pqt
JOIN viagem_passageiros vp ON vp.id = pqt.passageiro_id
JOIN clientes c ON c.id = vp.cliente_id
LEFT JOIN viagem_onibus vo ON vo.id = vp.onibus_id
ORDER BY vo.numero_identificacao, c.nome;

-- 3. Verificar se há passageiros SEM ônibus atribuído
SELECT 
  c.nome as passageiro_nome,
  v.adversario as viagem,
  vp.onibus_id,
  CASE 
    WHEN vp.onibus_id IS NULL THEN '❌ SEM ÔNIBUS'
    ELSE '✅ COM ÔNIBUS'
  END as status_onibus
FROM viagem_passageiros vp
JOIN clientes c ON c.id = vp.cliente_id
JOIN viagens v ON v.id = vp.viagem_id
WHERE vp.onibus_id IS NULL;

-- 4. Contar passageiros por ônibus
SELECT 
  vo.numero_identificacao as onibus,
  vo.tipo_onibus,
  COUNT(vp.id) as total_passageiros,
  COUNT(CASE WHEN vp.status_presenca = 'presente' THEN 1 END) as presentes
FROM viagem_onibus vo
LEFT JOIN viagem_passageiros vp ON vp.onibus_id = vo.id
GROUP BY vo.id, vo.numero_identificacao, vo.tipo_onibus
ORDER BY vo.numero_identificacao;

-- 5. Ver IDs dos ônibus (para comparar com a URL)
SELECT 
  id as onibus_id,
  numero_identificacao,
  tipo_onibus,
  empresa,
  viagem_id
FROM viagem_onibus
ORDER BY numero_identificacao;

-- =====================================================
-- TESTE ESPECÍFICO: Simular validação de um token
-- =====================================================
-- ⚠️ ESTE BLOCO É OPCIONAL - SÓ EXECUTE SE QUISER TESTAR UM TOKEN ESPECÍFICO
-- ⚠️ Descomente e substitua os valores antes de executar

/*
DO $$
DECLARE
  v_token TEXT := 'COLE_SEU_TOKEN_AQUI'; -- ⚠️ SUBSTITUA AQUI
  v_onibus_id UUID := 'COLE_SEU_ONIBUS_ID_AQUI'::UUID; -- ⚠️ SUBSTITUA AQUI
  v_passageiro_id UUID;
  v_passageiro_onibus_id UUID;
  v_passageiro_nome TEXT;
BEGIN
  -- Buscar passageiro do token
  SELECT passageiro_id INTO v_passageiro_id
  FROM passageiro_qr_tokens
  WHERE token = v_token;

  IF v_passageiro_id IS NULL THEN
    RAISE NOTICE '❌ Token não encontrado: %', v_token;
    RETURN;
  END IF;

  RAISE NOTICE '✅ Token encontrado! Passageiro ID: %', v_passageiro_id;

  -- Buscar ônibus do passageiro
  SELECT vp.onibus_id, c.nome
  INTO v_passageiro_onibus_id, v_passageiro_nome
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_passageiro_id;

  RAISE NOTICE '� Passuageiro: %', v_passageiro_nome;
  RAISE NOTICE '🚌 Ônibus do passageiro: %', v_passageiro_onibus_id;
  RAISE NOTICE '🚌 Ônibus do scanner: %', v_onibus_id;

  -- Comparar
  IF v_passageiro_onibus_id = v_onibus_id THEN
    RAISE NOTICE '✅ MATCH! Passageiro pertence ao ônibus correto';
  ELSE
    RAISE NOTICE '❌ NÃO MATCH! Passageiro está em outro ônibus';
  END IF;

  -- Mostrar informações detalhadas
  RAISE NOTICE '---';
  RAISE NOTICE 'Tipo do onibus_id do passageiro: %', pg_typeof(v_passageiro_onibus_id);
  RAISE NOTICE 'Tipo do onibus_id do scanner: %', pg_typeof(v_onibus_id);
  RAISE NOTICE 'São iguais? %', v_passageiro_onibus_id = v_onibus_id;
END $$;
*/

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Você deve ver:
-- 1. Lista de todos os passageiros com seus ônibus
-- 2. Lista de tokens QR code válidos
-- 3. Passageiros sem ônibus (se houver)
-- 4. Contagem por ônibus
-- 5. IDs dos ônibus para usar na URL
-- 6. Teste de validação (se você substituir os valores)
-- =====================================================
