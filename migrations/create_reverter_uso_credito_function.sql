-- Função para reverter uso de crédito
-- Esta função reverte o valor utilizado de volta para o saldo disponível do crédito

CREATE OR REPLACE FUNCTION reverter_uso_credito(
  p_credito_id UUID,
  p_valor_reverter DECIMAL(10,2)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valor_original DECIMAL(10,2);
  v_novo_saldo DECIMAL(10,2);
  v_novo_status VARCHAR(20);
BEGIN
  -- Buscar valor original e calcular novo saldo
  SELECT valor_credito, saldo_disponivel + p_valor_reverter
  INTO v_valor_original, v_novo_saldo
  FROM cliente_creditos 
  WHERE id = p_credito_id;

  -- Verificar se o crédito foi encontrado
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crédito com ID % não encontrado', p_credito_id;
  END IF;

  -- Calcular novo status baseado no saldo
  IF v_novo_saldo <= 0 THEN
    v_novo_status := 'utilizado';
  ELSIF v_novo_saldo < v_valor_original THEN
    v_novo_status := 'parcial';
  ELSE
    v_novo_status := 'disponivel';
  END IF;

  -- Atualizar o saldo disponível e status do crédito
  UPDATE cliente_creditos 
  SET 
    saldo_disponivel = v_novo_saldo,
    status = v_novo_status,
    updated_at = NOW()
  WHERE id = p_credito_id;

  -- Log da operação (opcional)
  INSERT INTO credito_logs (
    credito_id,
    operacao,
    valor,
    observacoes,
    created_at
  ) VALUES (
    p_credito_id,
    'REVERSAO_USO',
    p_valor_reverter,
    'Reversão de uso de crédito em viagem',
    NOW()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception with more context
    RAISE EXCEPTION 'Erro ao reverter uso do crédito: %', SQLERRM;
END;
$$;

-- Criar tabela de logs se não existir (opcional, para auditoria)
CREATE TABLE IF NOT EXISTS credito_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  credito_id UUID REFERENCES cliente_creditos(id) ON DELETE CASCADE,
  operacao VARCHAR(50) NOT NULL,
  valor DECIMAL(10,2),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários
COMMENT ON FUNCTION reverter_uso_credito IS 'Reverte o uso de crédito, devolvendo o valor para o saldo disponível';
COMMENT ON TABLE credito_logs IS 'Log de operações realizadas nos créditos para auditoria';