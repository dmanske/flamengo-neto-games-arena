-- Corrigir inconsistências de status nos créditos existentes
-- Esta função recalcula o status de todos os créditos baseado no saldo disponível

-- Função para recalcular status de um crédito específico
CREATE OR REPLACE FUNCTION recalcular_status_credito(p_credito_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valor_original DECIMAL(10,2);
  v_saldo_disponivel DECIMAL(10,2);
  v_novo_status VARCHAR(20);
BEGIN
  -- Buscar dados do crédito
  SELECT valor_credito, saldo_disponivel
  INTO v_valor_original, v_saldo_disponivel
  FROM cliente_creditos 
  WHERE id = p_credito_id;

  -- Verificar se o crédito foi encontrado
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crédito com ID % não encontrado', p_credito_id;
  END IF;

  -- Calcular novo status baseado no saldo
  IF v_saldo_disponivel <= 0 THEN
    v_novo_status := 'utilizado';
  ELSIF v_saldo_disponivel < v_valor_original THEN
    v_novo_status := 'parcial';
  ELSE
    v_novo_status := 'disponivel';
  END IF;

  -- Atualizar apenas se o status mudou
  UPDATE cliente_creditos 
  SET 
    status = v_novo_status,
    updated_at = NOW()
  WHERE id = p_credito_id 
    AND status != v_novo_status;

  -- Log se houve mudança
  IF FOUND THEN
    RAISE NOTICE 'Status do crédito % atualizado para %', p_credito_id, v_novo_status;
  END IF;
END;
$$;

-- Função para recalcular status de todos os créditos
CREATE OR REPLACE FUNCTION recalcular_todos_status_creditos()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_credito_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Iterar sobre todos os créditos
  FOR v_credito_id IN 
    SELECT id FROM cliente_creditos 
    ORDER BY created_at
  LOOP
    BEGIN
      PERFORM recalcular_status_credito(v_credito_id);
      v_count := v_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Erro ao recalcular status do crédito %: %', v_credito_id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Processados % créditos', v_count;
  RETURN v_count;
END;
$$;

-- Executar correção imediata para todos os créditos existentes
SELECT recalcular_todos_status_creditos();

-- Comentários
COMMENT ON FUNCTION recalcular_status_credito IS 'Recalcula o status de um crédito específico baseado no saldo disponível';
COMMENT ON FUNCTION recalcular_todos_status_creditos IS 'Recalcula o status de todos os créditos existentes';