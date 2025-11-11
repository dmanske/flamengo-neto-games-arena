-- =====================================================
-- ADICIONAR HORA DE EMBARQUE AO SISTEMA DE QR CODE
-- =====================================================
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. ADICIONAR COLUNA hora_embarque NA TABELA viagem_passageiros
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'viagem_passageiros' 
    AND column_name = 'hora_embarque'
  ) THEN
    ALTER TABLE viagem_passageiros 
    ADD COLUMN hora_embarque TIMESTAMP WITH TIME ZONE;
    
    RAISE NOTICE '✅ Coluna hora_embarque adicionada com sucesso!';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna hora_embarque já existe';
  END IF;
END $$;

-- 2. ADICIONAR CAMPOS NA TABELA passageiro_qr_tokens
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'passageiro_qr_tokens' 
    AND column_name = 'confirmation_method'
  ) THEN
    ALTER TABLE passageiro_qr_tokens 
    ADD COLUMN confirmation_method VARCHAR(20);
    
    RAISE NOTICE '✅ Coluna confirmation_method adicionada!';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna confirmation_method já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'passageiro_qr_tokens' 
    AND column_name = 'confirmed_by'
  ) THEN
    ALTER TABLE passageiro_qr_tokens 
    ADD COLUMN confirmed_by UUID REFERENCES auth.users(id);
    
    RAISE NOTICE '✅ Coluna confirmed_by adicionada!';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna confirmed_by já existe';
  END IF;
END $$;

-- 3. ATUALIZAR FUNÇÃO validate_and_use_qr_token
-- =====================================================

CREATE OR REPLACE FUNCTION validate_and_use_qr_token(
  p_token TEXT,
  p_confirmation_method TEXT DEFAULT 'qr_code',
  p_confirmed_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_token_record RECORD;
  v_passageiro_record RECORD;
  v_viagem_record RECORD;
  v_onibus_record RECORD;
  v_hora_embarque TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Registrar hora do embarque (timezone do Brasil)
  v_hora_embarque := NOW() AT TIME ZONE 'America/Sao_Paulo';
  
  -- Buscar token
  SELECT * INTO v_token_record FROM passageiro_qr_tokens WHERE token = p_token;
  
  IF v_token_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'TOKEN_NOT_FOUND', 'message', 'QR Code inválido');
  END IF;
  
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'TOKEN_ALREADY_USED', 'message', 'QR Code já utilizado');
  END IF;
  
  IF v_token_record.expires_at < NOW() THEN
    RETURN json_build_object('success', false, 'error', 'TOKEN_EXPIRED', 'message', 'QR Code expirado');
  END IF;
  
  -- Buscar passageiro
  SELECT vp.*, c.nome, c.telefone, c.cpf
  INTO v_passageiro_record
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_token_record.passageiro_id;
  
  -- Buscar viagem
  SELECT * INTO v_viagem_record FROM viagens WHERE id = v_token_record.viagem_id;
  
  -- Buscar ônibus (se houver)
  IF v_passageiro_record.onibus_id IS NOT NULL THEN
    SELECT * INTO v_onibus_record FROM viagem_onibus WHERE id = v_passageiro_record.onibus_id;
  END IF;
  
  IF v_passageiro_record.status_presenca = 'presente' THEN
    RETURN json_build_object('success', false, 'error', 'ALREADY_CONFIRMED', 'message', 'Presença já confirmada');
  END IF;
  
  -- Marcar token como usado
  UPDATE passageiro_qr_tokens 
  SET 
    used_at = v_hora_embarque,
    confirmation_method = p_confirmation_method,
    confirmed_by = p_confirmed_by
  WHERE id = v_token_record.id;
  
  -- Confirmar presença E registrar hora de embarque
  UPDATE viagem_passageiros
  SET 
    status_presenca = 'presente', 
    confirmation_method = p_confirmation_method, 
    confirmed_by = p_confirmed_by,
    confirmed_at = v_hora_embarque,
    hora_embarque = v_hora_embarque  -- REGISTRA HORA DE EMBARQUE!
  WHERE id = v_token_record.passageiro_id;
  
  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Presença confirmada com sucesso!',
    'data', json_build_object(
      'passageiro', json_build_object(
        'nome', v_passageiro_record.nome,
        'telefone', v_passageiro_record.telefone,
        'cidade_embarque', v_passageiro_record.cidade_embarque,
        'setor_maracana', v_passageiro_record.setor_maracana
      ),
      'viagem', json_build_object(
        'adversario', v_viagem_record.adversario,
        'data_jogo', v_viagem_record.data_jogo
      ),
      'onibus', CASE 
        WHEN v_onibus_record IS NOT NULL THEN
          json_build_object(
            'numero_identificacao', v_onibus_record.numero_identificacao,
            'tipo_onibus', v_onibus_record.tipo_onibus,
            'empresa', v_onibus_record.empresa
          )
        ELSE NULL
      END,
      'confirmed_at', v_hora_embarque,
      'hora_embarque', v_hora_embarque,  -- Incluir na resposta
      'confirmation_method', p_confirmation_method
    )
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONCLUÍDO! ✅
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Hora de embarque adicionada ao sistema de QR Code!';
  RAISE NOTICE '📋 Mudanças:';
  RAISE NOTICE '   • Coluna hora_embarque adicionada em viagem_passageiros';
  RAISE NOTICE '   • Função validate_and_use_qr_token atualizada';
  RAISE NOTICE '   • Hora de embarque registrada automaticamente ao escanear QR code';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Pronto para usar!';
END $$;
