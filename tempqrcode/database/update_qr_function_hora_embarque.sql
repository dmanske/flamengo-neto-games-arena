-- Atualizar função validate_and_use_qr_token para registrar hora_embarque
-- Esta função é chamada quando um QR Code é escaneado ou presença é marcada

CREATE OR REPLACE FUNCTION validate_and_use_qr_token(
  p_token TEXT,
  p_confirmation_method TEXT DEFAULT 'qr_code',
  p_confirmed_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  SELECT * INTO v_token_record
  FROM passageiro_qr_tokens
  WHERE token = p_token;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TOKEN_NOT_FOUND',
      'message', '❌ QR Code inválido ou não encontrado'
    );
  END IF;
  
  -- Verificar se já foi usado
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TOKEN_ALREADY_USED',
      'message', '⚠️ Este QR Code já foi utilizado'
    );
  END IF;
  
  -- Verificar expiração
  IF v_token_record.expires_at < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'TOKEN_EXPIRED',
      'message', '⏰ QR Code expirado'
    );
  END IF;
  
  -- Buscar dados do passageiro
  SELECT vp.*, c.nome, c.telefone, c.cpf
  INTO v_passageiro_record
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_token_record.passageiro_id;
  
  -- Buscar dados da viagem
  SELECT * INTO v_viagem_record
  FROM viagens
  WHERE id = v_token_record.viagem_id;
  
  -- Buscar dados do ônibus (se houver)
  IF v_passageiro_record.onibus_id IS NOT NULL THEN
    SELECT * INTO v_onibus_record
    FROM viagem_onibus
    WHERE id = v_passageiro_record.onibus_id;
  END IF;
  
  -- Atualizar passageiro: marcar presença E registrar hora de embarque
  UPDATE viagem_passageiros
  SET 
    status_presenca = 'presente',
    hora_embarque = v_hora_embarque,  -- NOVA COLUNA!
    updated_at = NOW()
  WHERE id = v_token_record.passageiro_id;
  
  -- Marcar token como usado
  UPDATE passageiro_qr_tokens
  SET 
    used_at = v_hora_embarque,
    confirmation_method = p_confirmation_method,
    confirmed_by = p_confirmed_by
  WHERE token = p_token;
  
  -- Retornar sucesso com dados
  RETURN jsonb_build_object(
    'success', true,
    'message', '✅ Presença confirmada com sucesso!',
    'data', jsonb_build_object(
      'passageiro', jsonb_build_object(
        'nome', v_passageiro_record.nome,
        'telefone', v_passageiro_record.telefone,
        'cidade_embarque', v_passageiro_record.cidade_embarque,
        'setor_maracana', v_passageiro_record.setor_maracana
      ),
      'viagem', jsonb_build_object(
        'adversario', v_viagem_record.adversario,
        'data_jogo', v_viagem_record.data_jogo,
        'logo_flamengo', v_viagem_record.logo_flamengo,
        'logo_adversario', v_viagem_record.logo_adversario
      ),
      'onibus', CASE 
        WHEN v_onibus_record.id IS NOT NULL THEN
          jsonb_build_object(
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
$$;

-- Comentário
COMMENT ON FUNCTION validate_and_use_qr_token IS 'Valida QR Code e registra presença com hora de embarque';
