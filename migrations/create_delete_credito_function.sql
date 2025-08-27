-- Criar função para deletar crédito com limpeza automática de referências
-- Esta função garante que todas as referências sejam removidas antes de deletar o crédito

CREATE OR REPLACE FUNCTION delete_credito_with_cleanup(p_credito_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vinculacoes_count INTEGER;
  v_passageiros_removidos INTEGER := 0;
BEGIN
  -- Log da operação
  RAISE NOTICE 'Iniciando exclusão do crédito: %', p_credito_id;

  -- Contar vinculações existentes
  SELECT COUNT(*) INTO v_vinculacoes_count
  FROM credito_viagem_vinculacoes 
  WHERE credito_id = p_credito_id;

  RAISE NOTICE 'Encontradas % vinculações para o crédito', v_vinculacoes_count;

  -- 1. PRIMEIRO: Limpar TODAS as referências ao crédito na tabela viagem_passageiros
  UPDATE viagem_passageiros 
  SET 
    pago_por_credito = false,
    credito_origem_id = null,
    valor_credito_utilizado = null,
    status_pagamento = 'Pendente'
  WHERE credito_origem_id = p_credito_id;

  RAISE NOTICE 'Referências ao crédito removidas de viagem_passageiros';

  -- 2. SEGUNDO: Remover TODOS os passageiros vinculados ao crédito (independente do valor)
  -- Isso garante que qualquer passageiro que foi adicionado via crédito seja removido
  WITH passageiros_para_remover AS (
    SELECT DISTINCT vp.id as passageiro_id, vp.cliente_id, cvv.viagem_id
    FROM credito_viagem_vinculacoes cvv
    JOIN viagem_passageiros vp ON vp.cliente_id = cvv.passageiro_id AND vp.viagem_id = cvv.viagem_id
    WHERE cvv.credito_id = p_credito_id
  )
  DELETE FROM viagem_passageiros 
  WHERE id IN (SELECT passageiro_id FROM passageiros_para_remover);

  GET DIAGNOSTICS v_passageiros_removidos = ROW_COUNT;
  RAISE NOTICE 'Removidos % passageiros das viagens', v_passageiros_removidos;

  -- 3. TERCEIRO: Deletar todas as vinculações
  DELETE FROM credito_viagem_vinculacoes 
  WHERE credito_id = p_credito_id;

  RAISE NOTICE 'Vinculações do crédito removidas';

  -- 4. QUARTO: Deletar histórico do crédito (se existir)
  DELETE FROM credito_historico 
  WHERE credito_id = p_credito_id;

  RAISE NOTICE 'Histórico do crédito removido';

  -- 5. QUINTO: Deletar o crédito
  DELETE FROM cliente_creditos 
  WHERE id = p_credito_id;

  RAISE NOTICE 'Crédito deletado com sucesso. Passageiros removidos: %', v_passageiros_removidos;

EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e re-raise
    RAISE EXCEPTION 'Erro ao deletar crédito %: %', p_credito_id, SQLERRM;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION delete_credito_with_cleanup IS 'Deleta um crédito e todos os dados relacionados, removendo passageiros das viagens quando apropriado';