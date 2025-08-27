-- Função para desvincular passageiro de viagem mantendo o crédito ativo
-- Remove o passageiro da viagem e restaura o saldo do crédito

CREATE OR REPLACE FUNCTION desvincular_passageiro_viagem(
  p_viagem_passageiro_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_passageiro_record RECORD;
  v_vinculacao_record RECORD;
  v_credito_record RECORD;
  v_novo_saldo DECIMAL;
  v_novo_status TEXT;
  v_resultado JSON;
BEGIN
  -- Log da operação
  RAISE NOTICE 'Iniciando desvinculação do passageiro: %', p_viagem_passageiro_id;

  -- 1. Buscar dados do passageiro
  SELECT 
    vp.id,
    vp.cliente_id,
    vp.viagem_id,
    vp.credito_origem_id,
    vp.valor_credito_utilizado,
    vp.pago_por_credito,
    c.nome as cliente_nome,
    v.adversario as viagem_nome
  INTO v_passageiro_record
  FROM viagem_passageiros vp
  JOIN clientes c ON c.id = vp.cliente_id
  JOIN viagens v ON v.id = vp.viagem_id
  WHERE vp.id = p_viagem_passageiro_id;

  -- Verificar se o passageiro existe
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Passageiro não encontrado: %', p_viagem_passageiro_id;
  END IF;

  -- Verificar se foi pago por crédito
  IF NOT v_passageiro_record.pago_por_credito OR v_passageiro_record.credito_origem_id IS NULL THEN
    RAISE EXCEPTION 'Passageiro não foi pago por crédito, não pode ser desvinculado';
  END IF;

  RAISE NOTICE 'Passageiro encontrado: % - Viagem: % - Valor utilizado: %', 
    v_passageiro_record.cliente_nome, 
    v_passageiro_record.viagem_nome,
    v_passageiro_record.valor_credito_utilizado;

  -- 2. Buscar dados do crédito
  SELECT 
    id,
    valor_credito,
    saldo_disponivel,
    status
  INTO v_credito_record
  FROM cliente_creditos
  WHERE id = v_passageiro_record.credito_origem_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Crédito não encontrado: %', v_passageiro_record.credito_origem_id;
  END IF;

  -- 3. Buscar vinculação
  SELECT *
  INTO v_vinculacao_record
  FROM credito_viagem_vinculacoes
  WHERE credito_id = v_passageiro_record.credito_origem_id
    AND viagem_id = v_passageiro_record.viagem_id
    AND passageiro_id = v_passageiro_record.cliente_id;

  -- 4. Calcular novo saldo do crédito
  v_novo_saldo := v_credito_record.saldo_disponivel + v_passageiro_record.valor_credito_utilizado;
  
  -- Determinar novo status
  IF v_novo_saldo = v_credito_record.valor_credito THEN
    v_novo_status := 'disponivel';
  ELSIF v_novo_saldo > 0 THEN
    v_novo_status := 'parcial';
  ELSE
    v_novo_status := 'utilizado';
  END IF;

  RAISE NOTICE 'Restaurando saldo: % + % = %', 
    v_credito_record.saldo_disponivel,
    v_passageiro_record.valor_credito_utilizado,
    v_novo_saldo;

  -- 5. Remover o passageiro da viagem
  DELETE FROM viagem_passageiros 
  WHERE id = p_viagem_passageiro_id;

  RAISE NOTICE 'Passageiro removido da viagem';

  -- 6. Remover a vinculação (se existir)
  IF FOUND THEN
    DELETE FROM credito_viagem_vinculacoes
    WHERE id = v_vinculacao_record.id;
    RAISE NOTICE 'Vinculação removida';
  END IF;

  -- 7. Atualizar saldo do crédito
  UPDATE cliente_creditos
  SET 
    saldo_disponivel = v_novo_saldo,
    status = v_novo_status,
    updated_at = NOW()
  WHERE id = v_passageiro_record.credito_origem_id;

  RAISE NOTICE 'Crédito atualizado - Novo saldo: % - Novo status: %', v_novo_saldo, v_novo_status;

  -- 8. Criar entrada no histórico
  INSERT INTO credito_historico (
    credito_id,
    tipo_movimentacao,
    valor_anterior,
    valor_movimentado,
    valor_posterior,
    descricao,
    viagem_id
  ) VALUES (
    v_passageiro_record.credito_origem_id,
    'desvinculacao',
    v_credito_record.saldo_disponivel,
    v_passageiro_record.valor_credito_utilizado,
    v_novo_saldo,
    format('Passageiro %s desvinculado da viagem %s - Valor restaurado: R$ %.2f',
      v_passageiro_record.cliente_nome,
      v_passageiro_record.viagem_nome,
      v_passageiro_record.valor_credito_utilizado
    ),
    v_passageiro_record.viagem_id
  );

  RAISE NOTICE 'Entrada criada no histórico';

  -- 9. Preparar resultado
  v_resultado := json_build_object(
    'success', true,
    'passageiro_removido', true,
    'credito_id', v_passageiro_record.credito_origem_id,
    'valor_restaurado', v_passageiro_record.valor_credito_utilizado,
    'novo_saldo', v_novo_saldo,
    'novo_status', v_novo_status,
    'cliente_nome', v_passageiro_record.cliente_nome,
    'viagem_nome', v_passageiro_record.viagem_nome
  );

  RAISE NOTICE 'Desvinculação concluída com sucesso';

  RETURN v_resultado;

EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e re-raise
    RAISE EXCEPTION 'Erro ao desvincular passageiro %: %', p_viagem_passageiro_id, SQLERRM;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION desvincular_passageiro_viagem IS 'Remove passageiro da viagem e restaura saldo do crédito (desistência)';