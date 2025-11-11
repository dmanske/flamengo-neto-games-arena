-- =====================================================
-- SISTEMA DE CONFIRMAÇÃO DE PRESENÇA VIA QR CODE - VERSÃO FINAL FUNCIONAL
-- =====================================================

-- 1. CRIAR TABELA PARA TOKENS DE QR CODE
-- =====================================================

CREATE TABLE IF NOT EXISTS passageiro_qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE,
  qr_code_data TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT unique_token_per_passageiro_viagem 
    UNIQUE(viagem_id, passageiro_id)
);

-- 2. CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_passageiro_qr_tokens_viagem ON passageiro_qr_tokens(viagem_id);
CREATE INDEX IF NOT EXISTS idx_passageiro_qr_tokens_token ON passageiro_qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_passageiro_qr_tokens_expires ON passageiro_qr_tokens(expires_at);

-- 3. ESTENDER TABELA DE PASSAGEIROS
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'viagem_passageiros' AND column_name = 'confirmation_method') THEN
    ALTER TABLE viagem_passageiros ADD COLUMN confirmation_method VARCHAR(20) DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'viagem_passageiros' AND column_name = 'confirmed_at') THEN
    ALTER TABLE viagem_passageiros ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'viagem_passageiros' AND column_name = 'confirmed_by') THEN
    ALTER TABLE viagem_passageiros ADD COLUMN confirmed_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 4. CRIAR TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_confirmed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status_presenca = 'presente' AND (OLD.status_presenca IS NULL OR OLD.status_presenca != 'presente') THEN
    NEW.confirmed_at = NOW();
    IF NEW.confirmation_method IS NULL THEN
      NEW.confirmation_method = 'manual';
    END IF;
  END IF;
  
  IF NEW.status_presenca != 'presente' AND OLD.status_presenca = 'presente' THEN
    NEW.confirmed_at = NULL;
    NEW.confirmation_method = 'manual';
    NEW.confirmed_by = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_confirmed_at ON viagem_passageiros;
CREATE TRIGGER trigger_update_confirmed_at
  BEFORE UPDATE ON viagem_passageiros
  FOR EACH ROW
  EXECUTE FUNCTION update_confirmed_at();

-- 5. CONFIGURAR RLS
-- =====================================================

ALTER TABLE passageiro_qr_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage QR tokens" ON passageiro_qr_tokens;
CREATE POLICY "Authenticated users can manage QR tokens" ON passageiro_qr_tokens
  FOR ALL USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Public can validate tokens" ON passageiro_qr_tokens;
CREATE POLICY "Public can validate tokens" ON passageiro_qr_tokens
  FOR SELECT USING (true);

-- 6. FUNÇÕES UTILITÁRIAS
-- =====================================================

-- Função para gerar token seguro
CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(24), 'base64')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar tokens - VERSÃO SUPER SIMPLES
CREATE OR REPLACE FUNCTION generate_qr_tokens_for_viagem(
  p_viagem_id UUID,
  p_created_by UUID DEFAULT NULL
)
RETURNS TABLE(
  passageiro_id UUID,
  token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  passageiro_nome TEXT,
  passageiro_telefone TEXT
) AS $$
DECLARE
  v_data_jogo TIMESTAMP WITH TIME ZONE;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  rec RECORD;
  v_token TEXT;
BEGIN
  -- Buscar data do jogo
  SELECT data_jogo INTO v_data_jogo FROM viagens WHERE id = p_viagem_id;
  
  IF v_data_jogo IS NULL THEN
    RAISE EXCEPTION 'Viagem não encontrada';
  END IF;
  
  -- Calcular expiração
  v_expires_at := v_data_jogo + INTERVAL '24 hours';
  
  -- Deletar tokens existentes
  DELETE FROM passageiro_qr_tokens WHERE viagem_id = p_viagem_id;
  
  -- Loop pelos passageiros
  FOR rec IN 
    SELECT vp.id, c.nome, c.telefone
    FROM viagem_passageiros vp
    JOIN clientes c ON c.id = vp.cliente_id
    WHERE vp.viagem_id = p_viagem_id
  LOOP
    -- Gerar token
    v_token := generate_secure_token();
    
    -- Inserir token
    INSERT INTO passageiro_qr_tokens (viagem_id, passageiro_id, token, expires_at, created_by)
    VALUES (p_viagem_id, rec.id, v_token, v_expires_at, p_created_by);
    
    -- Retornar dados
    passageiro_id := rec.id;
    token := v_token;
    expires_at := v_expires_at;
    passageiro_nome := rec.nome;
    passageiro_telefone := rec.telefone;
    
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Função para validar token
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
  
  -- Marcar como usado
  UPDATE passageiro_qr_tokens SET used_at = NOW() WHERE id = v_token_record.id;
  
  -- Confirmar presença
  UPDATE viagem_passageiros
  SET status_presenca = 'presente', confirmation_method = p_confirmation_method, confirmed_by = p_confirmed_by
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

-- Função para info do token
CREATE OR REPLACE FUNCTION get_qr_token_info(p_token TEXT)
RETURNS JSON AS $$
DECLARE
  v_token_record RECORD;
  v_passageiro_record RECORD;
  v_viagem_record RECORD;
  v_onibus_record RECORD;
BEGIN
  SELECT * INTO v_token_record FROM passageiro_qr_tokens WHERE token = p_token;
  
  IF v_token_record IS NULL THEN
    RETURN json_build_object('valid', false, 'error', 'TOKEN_NOT_FOUND', 'message', 'QR Code inválido');
  END IF;
  
  IF v_token_record.used_at IS NOT NULL THEN
    RETURN json_build_object('valid', false, 'error', 'TOKEN_ALREADY_USED', 'message', 'QR Code já utilizado');
  END IF;
  
  IF v_token_record.expires_at < NOW() THEN
    RETURN json_build_object('valid', false, 'error', 'TOKEN_EXPIRED', 'message', 'QR Code expirado');
  END IF;
  
  -- Buscar dados
  SELECT vp.*, c.nome, c.telefone, c.cpf
  INTO v_passageiro_record
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  WHERE vp.id = v_token_record.passageiro_id;
  
  SELECT * INTO v_viagem_record FROM viagens WHERE id = v_token_record.viagem_id;
  
  IF v_passageiro_record.onibus_id IS NOT NULL THEN
    SELECT * INTO v_onibus_record FROM viagem_onibus WHERE id = v_passageiro_record.onibus_id;
  END IF;
  
  RETURN json_build_object(
    'valid', true,
    'data', json_build_object(
      'passageiro', json_build_object(
        'nome', v_passageiro_record.nome,
        'telefone', v_passageiro_record.telefone,
        'cpf', v_passageiro_record.cpf,
        'cidade_embarque', v_passageiro_record.cidade_embarque,
        'setor_maracana', v_passageiro_record.setor_maracana,
        'status_presenca', v_passageiro_record.status_presenca
      ),
      'viagem', json_build_object(
        'adversario', v_viagem_record.adversario,
        'data_jogo', v_viagem_record.data_jogo,
        'logo_flamengo', v_viagem_record.logo_flamengo,
        'logo_adversario', v_viagem_record.logo_adversario,
        'status_viagem', v_viagem_record.status_viagem
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
      'token_info', json_build_object(
        'expires_at', v_token_record.expires_at,
        'created_at', v_token_record.created_at
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONCLUÍDO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de QR Code instalado com sucesso!';
  RAISE NOTICE '🚀 Funções disponíveis:';
  RAISE NOTICE '   • generate_qr_tokens_for_viagem(viagem_id)';
  RAISE NOTICE '   • validate_and_use_qr_token(token)';
  RAISE NOTICE '   • get_qr_token_info(token)';
END $$;