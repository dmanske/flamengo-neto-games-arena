-- =====================================================
-- ATUALIZAÇÃO: Permitir Excluir Carteira com Saldo
-- =====================================================
-- Execute este SQL no Supabase para atualizar a função
-- =====================================================

CREATE OR REPLACE FUNCTION wallet_deletar_carteira(
  p_cliente_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saldo_atual NUMERIC;
  v_total_transacoes INTEGER;
BEGIN
  -- Buscar saldo atual
  SELECT saldo_atual INTO v_saldo_atual
  FROM cliente_wallet
  WHERE cliente_id = p_cliente_id;

  -- Validar se carteira existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Carteira não encontrada'
    );
  END IF;

  -- REMOVIDA VALIDAÇÃO DE SALDO = 0
  -- Agora permite excluir mesmo com saldo positivo

  -- Contar transações
  SELECT COUNT(*) INTO v_total_transacoes
  FROM wallet_transacoes
  WHERE cliente_id = p_cliente_id;

  -- Deletar todas as transações
  DELETE FROM wallet_transacoes
  WHERE cliente_id = p_cliente_id;

  -- Deletar carteira
  DELETE FROM cliente_wallet
  WHERE cliente_id = p_cliente_id;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Carteira excluída com sucesso',
    'transacoes_deletadas', v_total_transacoes,
    'saldo_perdido', v_saldo_atual
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION wallet_deletar_carteira IS 'Deleta uma carteira e todas as suas transações (PERMITE EXCLUSÃO COM SALDO)';

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se a função foi atualizada
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'wallet_deletar_carteira';

-- =====================================================
-- PRONTO!
-- =====================================================
-- Agora você pode excluir carteiras mesmo com saldo positivo
-- O sistema irá avisar sobre a perda do saldo, mas permitirá a exclusão
