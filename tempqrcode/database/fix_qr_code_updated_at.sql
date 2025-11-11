-- =====================================================
-- FIX: Remover referência a updated_at na função validate_and_use_qr_token
-- =====================================================

-- A função estava tentando atualizar updated_at que não existe na tabela viagem_passageiros
-- Vamos recriar a função sem essa coluna

-- Primeiro, dropar a função existente
DROP FUNCTION IF EXISTS validate_and_use_qr_token(text, text, uuid);

-- Recriar a função corrigida
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
BEGIN
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
  
  IF v_passageiro_record.status_presenca = 'presente' THEN
    RETURN json_build_object('success', false, 'error', 'ALREADY_CONFIRMED', 'message', 'Presença já confirmada');
  END IF;
  
  -- Marcar token como usado
  UPDATE passageiro_qr_tokens 
  SET used_at = NOW() 
  WHERE id = v_token_record.id;
  
  -- Confirmar presença (SEM updated_at)
  UPDATE viagem_passageiros
  SET 
    status_presenca = 'presente',
    confirmation_method = p_confirmation_method,
    confirmed_by = p_confirmed_by
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
      'confirmed_at', NOW(),
      'confirmation_method', p_confirmation_method
    )
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONCLUÍDO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Função validate_and_use_qr_token corrigida!';
  RAISE NOTICE '🔧 Removida referência à coluna updated_at que não existe';
END $$;
