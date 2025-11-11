-- =====================================================
-- TESTE ESPECÍFICO: Validar QR Code vs Ônibus
-- =====================================================

-- CENÁRIO 1: Scanner do TAXI tentando ler QR do Virginio (Transfer)
-- Deve REJEITAR
DO $$
DECLARE
  v_token TEXT := 'OlDguybwzBzBoMv49f/9M89MQf1VAiNf';
  v_scanner_onibus_id UUID := 'e205739c-99d5-4600-8033-8cb370ef4f70'::UUID; -- Taxi
  v_passageiro_id UUID;
  v_passageiro_onibus_id UUID;
  v_passageiro_nome TEXT;
BEGIN
  RAISE NOTICE '=== TESTE 1: Scanner TAXI lendo QR do Virginio (Transfer) ===';
  
  -- Buscar passageiro do token
  SELECT passageiro_id INTO v_passageiro_id
  FROM passageiro_qr_tokens
  WHERE token = v_token;

  IF v_passageiro_id IS NULL THEN
    RAISE NOTICE '❌ Token não encontrado';
    RETURN;
  END IF;

  -- Buscar ônibus do passageiro
  SELECT vp.onibus_id, c.nome
  INTO v_passageiro_onibus_id, v_passageiro_nome
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_passageiro_id;

  RAISE NOTICE 'Passageiro: %', v_passageiro_nome;
  RAISE NOTICE 'Ônibus do passageiro: %', v_passageiro_onibus_id;
  RAISE NOTICE 'Ônibus do scanner: %', v_scanner_onibus_id;
  
  IF v_passageiro_onibus_id = v_scanner_onibus_id THEN
    RAISE NOTICE '✅ MATCH - Pode confirmar presença';
  ELSE
    RAISE NOTICE '❌ NÃO MATCH - Deve REJEITAR (passageiro de outro ônibus)';
  END IF;
  RAISE NOTICE '';
END $$;

-- CENÁRIO 2: Scanner do TAXI tentando ler QR do Arnaldo (Taxi)
-- Deve ACEITAR
DO $$
DECLARE
  v_token TEXT := 'JqTV6iYFUgunR85IBB7GIfeEvsjQ1Nfz';
  v_scanner_onibus_id UUID := 'e205739c-99d5-4600-8033-8cb370ef4f70'::UUID; -- Taxi
  v_passageiro_id UUID;
  v_passageiro_onibus_id UUID;
  v_passageiro_nome TEXT;
BEGIN
  RAISE NOTICE '=== TESTE 2: Scanner TAXI lendo QR do Arnaldo (Taxi) ===';
  
  SELECT passageiro_id INTO v_passageiro_id
  FROM passageiro_qr_tokens
  WHERE token = v_token;

  IF v_passageiro_id IS NULL THEN
    RAISE NOTICE '❌ Token não encontrado';
    RETURN;
  END IF;

  SELECT vp.onibus_id, c.nome
  INTO v_passageiro_onibus_id, v_passageiro_nome
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_passageiro_id;

  RAISE NOTICE 'Passageiro: %', v_passageiro_nome;
  RAISE NOTICE 'Ônibus do passageiro: %', v_passageiro_onibus_id;
  RAISE NOTICE 'Ônibus do scanner: %', v_scanner_onibus_id;
  
  IF v_passageiro_onibus_id = v_scanner_onibus_id THEN
    RAISE NOTICE '✅ MATCH - Pode confirmar presença';
  ELSE
    RAISE NOTICE '❌ NÃO MATCH - Deve REJEITAR';
  END IF;
  RAISE NOTICE '';
END $$;

-- CENÁRIO 3: Scanner do TRANSFER tentando ler QR do Virginio (Transfer)
-- Deve ACEITAR
DO $$
DECLARE
  v_token TEXT := 'OlDguybwzBzBoMv49f/9M89MQf1VAiNf';
  v_scanner_onibus_id UUID := 'fd8e3edb-96a1-42b6-970e-2430da45733c'::UUID; -- Transfer
  v_passageiro_id UUID;
  v_passageiro_onibus_id UUID;
  v_passageiro_nome TEXT;
BEGIN
  RAISE NOTICE '=== TESTE 3: Scanner TRANSFER lendo QR do Virginio (Transfer) ===';
  
  SELECT passageiro_id INTO v_passageiro_id
  FROM passageiro_qr_tokens
  WHERE token = v_token;

  IF v_passageiro_id IS NULL THEN
    RAISE NOTICE '❌ Token não encontrado';
    RETURN;
  END IF;

  SELECT vp.onibus_id, c.nome
  INTO v_passageiro_onibus_id, v_passageiro_nome
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_passageiro_id;

  RAISE NOTICE 'Passageiro: %', v_passageiro_nome;
  RAISE NOTICE 'Ônibus do passageiro: %', v_passageiro_onibus_id;
  RAISE NOTICE 'Ônibus do scanner: %', v_scanner_onibus_id;
  
  IF v_passageiro_onibus_id = v_scanner_onibus_id THEN
    RAISE NOTICE '✅ MATCH - Pode confirmar presença';
  ELSE
    RAISE NOTICE '❌ NÃO MATCH - Deve REJEITAR';
  END IF;
  RAISE NOTICE '';
END $$;

-- RESUMO
SELECT 
  'RESUMO' as tipo,
  'Se os testes acima mostraram MATCH/NÃO MATCH corretamente, a validação SQL está OK' as resultado;
