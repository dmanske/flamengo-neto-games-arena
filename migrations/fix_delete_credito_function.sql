-- Atualizar função para deletar crédito com remoção correta de passageiros
-- Esta versão corrige o problema onde passageiros não eram removidos das viagens

CREATE OR REPLACE FUNCTION delete_credito_with_cleanup(p_credito_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vinculacoes_count INTEGER;
  v_passageiros_removidos INTEGER := 0;
  v_viagem_record RECORD;
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

  -- 2. SEGUNDO: Remover APENAS passageiros que foram CRIADOS via crédito
  -- Identificar passageiros que têm pago_por_credito = true E credito_origem_id = este crédito
  -- Estes são passageiros que foram adicionados especificamente por este crédito
  FOR v_viagem_record IN 
    SELECT DISTINCT vp.id, vp.viagem_id, vp.cliente_id, c.nome
    FROM credito_viagem_vinculacoes cvv
    JOIN viagem_passageiros vp ON vp.cliente_id = cvv.passageiro_id 
                                AND vp.viagem_id = cvv.viagem_id
                                AND vp.credito_origem_id = cvv.credito_id
    JOIN clientes c ON c.id = vp.cliente_id
    WHERE cvv.credito_id = p_credito_id
      AND vp.pago_por_credito = true
  LOOP
    -- Remover o passageiro específico
    DELETE FROM viagem_passageiros 
    WHERE id = v_viagem_record.id;
    
    -- Contar quantos foram removidos
    GET DIAGNOSTICS v_passageiros_removidos = ROW_COUNT;
    
    IF v_passageiros_removidos > 0 THEN
      RAISE NOTICE 'Removido passageiro % (%) da viagem %', 
        v_viagem_record.nome, v_viagem_record.cliente_id, v_viagem_record.viagem_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Processo de remoção de passageiros concluído';

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

  RAISE NOTICE 'Crédito deletado com sucesso';

EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e re-raise
    RAISE EXCEPTION 'Erro ao deletar crédito %: %', p_credito_id, SQLERRM;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION delete_credito_with_cleanup IS 'Deleta um crédito e todos os dados relacionados, removendo passageiros das viagens de forma correta';