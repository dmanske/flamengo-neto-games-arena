-- =====================================================
-- GESTÃO ADMINISTRATIVA DE CRÉDITOS - DATABASE CHANGES
-- =====================================================
-- Este arquivo contém todas as alterações necessárias no banco de dados
-- para implementar funcionalidades administrativas no sistema de créditos.
--
-- IMPORTANTE: Execute este script manualmente no Supabase
-- =====================================================

-- =====================================================
-- 1. ADICIONAR CAMPOS DE AUDITORIA NA TABELA wallet_transacoes
-- =====================================================

-- Adicionar campos para rastreamento de edições
ALTER TABLE wallet_transacoes 
ADD COLUMN IF NOT EXISTS editado_em TIMESTAMP,
ADD COLUMN IF NOT EXISTS editado_por TEXT,
ADD COLUMN IF NOT EXISTS cancelada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT,
ADD COLUMN IF NOT EXISTS valor_original NUMERIC(10,2);

-- Criar índice para melhorar performance em queries de transações canceladas
CREATE INDEX IF NOT EXISTS idx_wallet_transacoes_cancelada 
ON wallet_transacoes(cancelada) 
WHERE cancelada = TRUE;

-- Comentários para documentação
COMMENT ON COLUMN wallet_transacoes.editado_em IS 'Data e hora da última edição da transação';
COMMENT ON COLUMN wallet_transacoes.editado_por IS 'Identificador do administrador que editou';
COMMENT ON COLUMN wallet_transacoes.cancelada IS 'Indica se a transação foi cancelada';
COMMENT ON COLUMN wallet_transacoes.motivo_cancelamento IS 'Motivo do cancelamento da transação';
COMMENT ON COLUMN wallet_transacoes.valor_original IS 'Valor original antes da primeira edição';

-- =====================================================
-- 2. FUNÇÃO: wallet_editar_transacao
-- =====================================================

CREATE OR REPLACE FUNCTION wallet_editar_transacao(
  p_transacao_id UUID,
  p_novo_valor NUMERIC,
  p_nova_descricao TEXT,
  p_editado_por TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transacao RECORD;
  v_diferenca NUMERIC;
  v_resultado JSON;
BEGIN
  -- Buscar transação atual
  SELECT * INTO v_transacao
  FROM wallet_transacoes
  WHERE id = p_transacao_id;

  -- Validar se transação existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transação não encontrada'
    );
  END IF;

  -- Validar se transação não está cancelada
  IF v_transacao.cancelada = TRUE THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Não é possível editar uma transação cancelada'
    );
  END IF;

  -- Validar valor positivo
  IF p_novo_valor <= 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'O valor deve ser maior que zero'
    );
  END IF;

  -- Calcular diferença de valor
  v_diferenca := p_novo_valor - v_transacao.valor;

  -- Salvar valor original se for a primeira edição
  IF v_transacao.valor_original IS NULL THEN
    UPDATE wallet_transacoes
    SET valor_original = v_transacao.valor
    WHERE id = p_transacao_id;
  END IF;

  -- Atualizar transação
  UPDATE wallet_transacoes
  SET 
    valor = p_novo_valor,
    descricao = p_nova_descricao,
    editado_em = NOW(),
    editado_por = p_editado_por
  WHERE id = p_transacao_id;

  -- Atualizar saldo da carteira
  IF v_transacao.tipo = 'deposito' THEN
    -- Se é depósito, ajustar saldo conforme diferença
    UPDATE cliente_wallet
    SET 
      saldo_atual = saldo_atual + v_diferenca,
      total_depositado = total_depositado + v_diferenca,
      updated_at = NOW()
    WHERE cliente_id = v_transacao.cliente_id;
  ELSIF v_transacao.tipo = 'uso' THEN
    -- Se é uso, ajustar saldo inversamente
    UPDATE cliente_wallet
    SET 
      saldo_atual = saldo_atual - v_diferenca,
      total_usado = total_usado + v_diferenca,
      updated_at = NOW()
    WHERE cliente_id = v_transacao.cliente_id;
  END IF;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Transação editada com sucesso',
    'diferenca', v_diferenca
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
COMMENT ON FUNCTION wallet_editar_transacao IS 'Edita uma transação existente e atualiza o saldo da carteira';

-- =====================================================
-- 3. FUNÇÃO: wallet_cancelar_transacao
-- =====================================================

CREATE OR REPLACE FUNCTION wallet_cancelar_transacao(
  p_transacao_id UUID,
  p_motivo TEXT,
  p_cancelado_por TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transacao RECORD;
  v_saldo_atual NUMERIC;
  v_novo_saldo NUMERIC;
BEGIN
  -- Buscar transação
  SELECT * INTO v_transacao
  FROM wallet_transacoes
  WHERE id = p_transacao_id;

  -- Validar se transação existe
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Transação não encontrada'
    );
  END IF;

  -- Validar se já está cancelada
  IF v_transacao.cancelada = TRUE THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Esta transação já está cancelada'
    );
  END IF;

  -- Validar motivo obrigatório
  IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'O motivo do cancelamento é obrigatório'
    );
  END IF;

  -- Buscar saldo atual
  SELECT saldo_atual INTO v_saldo_atual
  FROM cliente_wallet
  WHERE cliente_id = v_transacao.cliente_id;

  -- Calcular novo saldo após cancelamento
  IF v_transacao.tipo = 'deposito' THEN
    -- Cancelar depósito: subtrair do saldo
    v_novo_saldo := v_saldo_atual - v_transacao.valor;
  ELSIF v_transacao.tipo = 'uso' THEN
    -- Cancelar uso: adicionar ao saldo
    v_novo_saldo := v_saldo_atual + v_transacao.valor;
  ELSE
    -- Cancelar ajuste: reverter ajuste
    v_novo_saldo := v_saldo_atual - v_transacao.valor;
  END IF;

  -- Validar se saldo não ficará negativo
  IF v_novo_saldo < 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Não é possível cancelar: saldo ficaria negativo (R$ ' || v_novo_saldo || ')'
    );
  END IF;

  -- Marcar transação como cancelada
  UPDATE wallet_transacoes
  SET 
    cancelada = TRUE,
    motivo_cancelamento = p_motivo,
    editado_em = NOW(),
    editado_por = p_cancelado_por
  WHERE id = p_transacao_id;

  -- Atualizar saldo da carteira
  IF v_transacao.tipo = 'deposito' THEN
    UPDATE cliente_wallet
    SET 
      saldo_atual = saldo_atual - v_transacao.valor,
      total_depositado = total_depositado - v_transacao.valor,
      updated_at = NOW()
    WHERE cliente_id = v_transacao.cliente_id;
  ELSIF v_transacao.tipo = 'uso' THEN
    UPDATE cliente_wallet
    SET 
      saldo_atual = saldo_atual + v_transacao.valor,
      total_usado = total_usado - v_transacao.valor,
      updated_at = NOW()
    WHERE cliente_id = v_transacao.cliente_id;
  END IF;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Transação cancelada com sucesso',
    'novo_saldo', v_novo_saldo
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
COMMENT ON FUNCTION wallet_cancelar_transacao IS 'Cancela uma transação e reverte o valor no saldo';

-- =====================================================
-- 4. FUNÇÃO: wallet_ajustar_saldo
-- =====================================================

CREATE OR REPLACE FUNCTION wallet_ajustar_saldo(
  p_cliente_id UUID,
  p_novo_saldo NUMERIC,
  p_motivo TEXT,
  p_ajustado_por TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saldo_atual NUMERIC;
  v_diferenca NUMERIC;
  v_transacao_id UUID;
BEGIN
  -- Validar saldo não negativo
  IF p_novo_saldo < 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'O saldo não pode ser negativo'
    );
  END IF;

  -- Validar motivo obrigatório
  IF p_motivo IS NULL OR TRIM(p_motivo) = '' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'O motivo do ajuste é obrigatório'
    );
  END IF;

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

  -- Calcular diferença
  v_diferenca := p_novo_saldo - v_saldo_atual;

  -- Se diferença é zero, não fazer nada
  IF v_diferenca = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'O novo saldo é igual ao saldo atual'
    );
  END IF;

  -- Criar transação de ajuste
  INSERT INTO wallet_transacoes (
    cliente_id,
    tipo,
    valor,
    descricao,
    editado_por,
    created_at
  ) VALUES (
    p_cliente_id,
    'ajuste',
    v_diferenca,
    'AJUSTE MANUAL: ' || p_motivo,
    p_ajustado_por,
    NOW()
  ) RETURNING id INTO v_transacao_id;

  -- Atualizar saldo da carteira
  UPDATE cliente_wallet
  SET 
    saldo_atual = p_novo_saldo,
    updated_at = NOW()
  WHERE cliente_id = p_cliente_id;

  -- Retornar sucesso
  RETURN json_build_object(
    'success', true,
    'message', 'Saldo ajustado com sucesso',
    'saldo_anterior', v_saldo_atual,
    'novo_saldo', p_novo_saldo,
    'diferenca', v_diferenca,
    'transacao_id', v_transacao_id
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
COMMENT ON FUNCTION wallet_ajustar_saldo IS 'Ajusta manualmente o saldo de uma carteira';

-- =====================================================
-- 5. FUNÇÃO: wallet_deletar_carteira
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

  -- Aviso se tem saldo (mas permite exclusão)
  -- Removida validação de saldo = 0 para permitir exclusão forçada

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
    'transacoes_deletadas', v_total_transacoes
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
COMMENT ON FUNCTION wallet_deletar_carteira IS 'Deleta uma carteira e todas as suas transações (apenas se saldo = 0)';

-- =====================================================
-- 6. VERIFICAÇÃO E TESTES
-- =====================================================

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'wallet_transacoes'
  AND column_name IN ('editado_em', 'editado_por', 'cancelada', 'motivo_cancelamento', 'valor_original')
ORDER BY column_name;

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name IN (
  'wallet_editar_transacao',
  'wallet_cancelar_transacao',
  'wallet_ajustar_saldo',
  'wallet_deletar_carteira'
)
ORDER BY routine_name;

-- =====================================================
-- 7. PERMISSÕES (OPCIONAL - AJUSTAR CONFORME NECESSÁRIO)
-- =====================================================

-- Garantir que as funções podem ser executadas
-- GRANT EXECUTE ON FUNCTION wallet_editar_transacao TO authenticated;
-- GRANT EXECUTE ON FUNCTION wallet_cancelar_transacao TO authenticated;
-- GRANT EXECUTE ON FUNCTION wallet_ajustar_saldo TO authenticated;
-- GRANT EXECUTE ON FUNCTION wallet_deletar_carteira TO authenticated;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- IMPORTANTE: Após executar este script:
-- 1. Verifique se todas as colunas foram adicionadas
-- 2. Verifique se todas as funções foram criadas
-- 3. Teste cada função individualmente antes de usar no frontend
-- 4. Faça backup do banco antes de executar em produção
