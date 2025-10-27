-- =====================================================
-- SISTEMA DE CRÉDITOS PRÉ-PAGOS (WALLET) - VERSÃO COMPLETA
-- Script consolidado com todas as correções aplicadas
-- =====================================================

-- =====================================================
-- 1. ESTRUTURA DE TABELAS
-- =====================================================

-- Tabela principal: saldo atual por cliente
CREATE TABLE IF NOT EXISTS cliente_wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) UNIQUE NOT NULL,
  saldo_atual DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (saldo_atual >= 0),
  total_depositado DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (total_depositado >= 0),
  total_usado DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (total_usado >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de transações (histórico completo)
CREATE TABLE IF NOT EXISTS wallet_transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('deposito', 'uso')),
  valor DECIMAL(10,2) NOT NULL CHECK (valor > 0),
  saldo_anterior DECIMAL(10,2) NOT NULL CHECK (saldo_anterior >= 0),
  saldo_posterior DECIMAL(10,2) NOT NULL CHECK (saldo_posterior >= 0),
  descricao TEXT,
  forma_pagamento VARCHAR(50), -- apenas para depósitos
  referencia_externa VARCHAR(100), -- ID da compra/viagem quando aplicável
  usuario_admin VARCHAR(100), -- quem fez a operação
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS wallet_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operacao VARCHAR(20) NOT NULL, -- 'deposito', 'uso', 'consulta', 'relatorio'
  usuario VARCHAR(100) NOT NULL,
  cliente_afetado UUID REFERENCES clientes(id),
  valor DECIMAL(10,2),
  ip_address INET,
  user_agent TEXT,
  detalhes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_wallet_cliente ON cliente_wallet(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente ON wallet_transacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON wallet_transacoes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON wallet_transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_cliente_data ON wallet_transacoes(cliente_id, created_at DESC);

-- Índice para saldo atual (para dashboard)
CREATE INDEX IF NOT EXISTS idx_wallet_saldo_atual ON cliente_wallet(saldo_atual DESC);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON wallet_audit_logs(usuario);
CREATE INDEX IF NOT EXISTS idx_audit_data ON wallet_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_cliente ON wallet_audit_logs(cliente_afetado);

-- =====================================================
-- 3. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_wallet_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para cliente_wallet
DROP TRIGGER IF EXISTS trigger_wallet_updated_at ON cliente_wallet;
CREATE TRIGGER trigger_wallet_updated_at
  BEFORE UPDATE ON cliente_wallet
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_updated_at();

-- =====================================================
-- 4. FUNÇÕES PARA OPERAÇÕES DE WALLET
-- =====================================================

-- Função para fazer depósito (com suporte a data personalizada)
CREATE OR REPLACE FUNCTION wallet_depositar(
  p_cliente_id UUID,
  p_valor DECIMAL(10,2),
  p_descricao TEXT DEFAULT NULL,
  p_forma_pagamento VARCHAR(50) DEFAULT NULL,
  p_usuario_admin VARCHAR(100) DEFAULT NULL,
  p_data_deposito TIMESTAMP DEFAULT NOW()
)
RETURNS UUID AS $$
DECLARE
  v_saldo_anterior DECIMAL(10,2);
  v_saldo_posterior DECIMAL(10,2);
  v_transacao_id UUID;
BEGIN
  -- Validações
  IF p_valor <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser maior que zero';
  END IF;
  
  -- Buscar ou criar wallet do cliente
  INSERT INTO cliente_wallet (cliente_id, saldo_atual, total_depositado, total_usado)
  VALUES (p_cliente_id, 0, 0, 0)
  ON CONFLICT (cliente_id) DO NOTHING;
  
  -- Obter saldo anterior
  SELECT saldo_atual INTO v_saldo_anterior
  FROM cliente_wallet
  WHERE cliente_id = p_cliente_id;
  
  -- Calcular novo saldo
  v_saldo_posterior := v_saldo_anterior + p_valor;
  
  -- Atualizar wallet
  UPDATE cliente_wallet
  SET 
    saldo_atual = v_saldo_posterior,
    total_depositado = total_depositado + p_valor,
    updated_at = NOW()
  WHERE cliente_id = p_cliente_id;
  
  -- Registrar transação com data personalizada (usa meio-dia como hora padrão)
  INSERT INTO wallet_transacoes (
    cliente_id, tipo, valor, saldo_anterior, saldo_posterior,
    descricao, forma_pagamento, usuario_admin, created_at
  )
  VALUES (
    p_cliente_id, 'deposito', p_valor, v_saldo_anterior, v_saldo_posterior,
    p_descricao, p_forma_pagamento, p_usuario_admin, 
    CASE 
      WHEN p_data_deposito IS NOT NULL THEN p_data_deposito::date + TIME '12:00:00'
      ELSE NOW()
    END
  )
  RETURNING id INTO v_transacao_id;
  
  RETURN v_transacao_id;
END;
$$ LANGUAGE plpgsql;

-- Função para usar créditos
CREATE OR REPLACE FUNCTION wallet_usar_creditos(
  p_cliente_id UUID,
  p_valor DECIMAL(10,2),
  p_descricao TEXT DEFAULT NULL,
  p_referencia_externa VARCHAR(100) DEFAULT NULL,
  p_usuario_admin VARCHAR(100) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_saldo_anterior DECIMAL(10,2);
  v_saldo_posterior DECIMAL(10,2);
  v_transacao_id UUID;
BEGIN
  -- Validações
  IF p_valor <= 0 THEN
    RAISE EXCEPTION 'Valor deve ser maior que zero';
  END IF;
  
  -- Obter saldo atual
  SELECT saldo_atual INTO v_saldo_anterior
  FROM cliente_wallet
  WHERE cliente_id = p_cliente_id;
  
  -- Verificar se existe wallet
  IF v_saldo_anterior IS NULL THEN
    RAISE EXCEPTION 'Cliente não possui carteira';
  END IF;
  
  -- Verificar saldo suficiente
  IF v_saldo_anterior < p_valor THEN
    RAISE EXCEPTION 'Saldo insuficiente. Saldo atual: R$ %.2f', v_saldo_anterior;
  END IF;
  
  -- Calcular novo saldo
  v_saldo_posterior := v_saldo_anterior - p_valor;
  
  -- Atualizar wallet
  UPDATE cliente_wallet
  SET 
    saldo_atual = v_saldo_posterior,
    total_usado = total_usado + p_valor,
    updated_at = NOW()
  WHERE cliente_id = p_cliente_id;
  
  -- Registrar transação
  INSERT INTO wallet_transacoes (
    cliente_id, tipo, valor, saldo_anterior, saldo_posterior,
    descricao, referencia_externa, usuario_admin
  )
  VALUES (
    p_cliente_id, 'uso', p_valor, v_saldo_anterior, v_saldo_posterior,
    p_descricao, p_referencia_externa, p_usuario_admin
  )
  RETURNING id INTO v_transacao_id;
  
  RETURN v_transacao_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. VIEW MATERIALIZADA PARA RELATÓRIOS (SIMPLIFICADA)
-- =====================================================

-- Remover view problemática se existir
DROP MATERIALIZED VIEW IF EXISTS wallet_resumo_mensal CASCADE;
DROP TRIGGER IF EXISTS trigger_refresh_wallet_resumo ON wallet_transacoes;
DROP FUNCTION IF EXISTS refresh_wallet_resumo();

-- Criar view materializada simples
CREATE MATERIALIZED VIEW wallet_resumo_mensal AS
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_transacoes,
  COUNT(DISTINCT cliente_id) as clientes_unicos,
  SUM(CASE WHEN tipo = 'deposito' THEN valor ELSE 0 END) as total_depositos,
  SUM(CASE WHEN tipo = 'uso' THEN valor ELSE 0 END) as total_usos,
  SUM(CASE WHEN tipo = 'deposito' THEN valor ELSE -valor END) as saldo_liquido
FROM wallet_transacoes
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- Criar índice único para permitir refresh concorrente
CREATE UNIQUE INDEX idx_wallet_resumo_mensal_mes ON wallet_resumo_mensal(mes);

-- Função para refresh manual (sem trigger automático)
CREATE OR REPLACE FUNCTION refresh_wallet_resumo_manual()
RETURNS void AS $$
BEGIN
  -- Refresh da view materializada
  REFRESH MATERIALIZED VIEW CONCURRENTLY wallet_resumo_mensal;
  
  RAISE NOTICE 'View wallet_resumo_mensal atualizada com sucesso!';
EXCEPTION
  WHEN OTHERS THEN
    -- Se falhar o refresh concorrente, tentar refresh normal
    REFRESH MATERIALIZED VIEW wallet_resumo_mensal;
    RAISE NOTICE 'View wallet_resumo_mensal atualizada (refresh normal)!';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. POLÍTICAS RLS (ROW LEVEL SECURITY) CORRIGIDAS
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE cliente_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_audit_logs ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas que podem causar conflito
DROP POLICY IF EXISTS wallet_policy ON cliente_wallet;
DROP POLICY IF EXISTS wallet_transacoes_policy ON wallet_transacoes;
DROP POLICY IF EXISTS wallet_audit_policy ON wallet_audit_logs;

-- Políticas permissivas para usuários autenticados
CREATE POLICY wallet_admin_policy ON cliente_wallet
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY wallet_transacoes_admin_policy ON wallet_transacoes
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY wallet_audit_admin_policy ON wallet_audit_logs
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

-- Comentários nas tabelas
COMMENT ON TABLE cliente_wallet IS 'Carteira digital - saldo atual por cliente';
COMMENT ON TABLE wallet_transacoes IS 'Histórico completo de transações da carteira';
COMMENT ON TABLE wallet_audit_logs IS 'Logs de auditoria para operações administrativas';

COMMENT ON COLUMN cliente_wallet.saldo_atual IS 'Saldo disponível atual do cliente';
COMMENT ON COLUMN cliente_wallet.total_depositado IS 'Total histórico de depósitos';
COMMENT ON COLUMN cliente_wallet.total_usado IS 'Total histórico de usos';

COMMENT ON COLUMN wallet_transacoes.tipo IS 'Tipo da transação: deposito ou uso';
COMMENT ON COLUMN wallet_transacoes.saldo_anterior IS 'Saldo antes da transação';
COMMENT ON COLUMN wallet_transacoes.saldo_posterior IS 'Saldo após a transação';
COMMENT ON COLUMN wallet_transacoes.referencia_externa IS 'ID da compra/viagem quando aplicável';

-- Comentários nas funções
COMMENT ON FUNCTION wallet_depositar(UUID, DECIMAL, TEXT, VARCHAR, VARCHAR, TIMESTAMP) IS 
'Registra um depósito na carteira do cliente com data personalizada. Atualiza saldo e cria transação.';

COMMENT ON FUNCTION wallet_usar_creditos(UUID, DECIMAL, TEXT, VARCHAR, VARCHAR) IS 
'Registra uso de créditos da carteira do cliente. Valida saldo suficiente e atualiza dados.';

-- =====================================================
-- 8. DADOS INICIAIS E TESTES
-- =====================================================

-- Refresh inicial da view materializada
REFRESH MATERIALIZED VIEW wallet_resumo_mensal;

-- =====================================================
-- 9. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%wallet%'
ORDER BY table_name;

-- Verificar se as funções foram criadas
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE '%wallet%'
ORDER BY routine_name;

-- Verificar se as políticas RLS foram aplicadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('cliente_wallet', 'wallet_transacoes', 'wallet_audit_logs')
ORDER BY tablename, policyname;

-- =====================================================
-- 10. FINALIZAÇÃO
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 ===================================================';
  RAISE NOTICE '✅ SISTEMA DE CRÉDITOS PRÉ-PAGOS INSTALADO COM SUCESSO!';
  RAISE NOTICE '📊 Tabelas: cliente_wallet, wallet_transacoes, wallet_audit_logs';
  RAISE NOTICE '🔧 Funções: wallet_depositar(), wallet_usar_creditos()';
  RAISE NOTICE '📈 View: wallet_resumo_mensal (com refresh manual)';
  RAISE NOTICE '🔒 RLS: Políticas permissivas para usuários autenticados';
  RAISE NOTICE '🧪 PRONTO PARA USAR: Teste fazendo um depósito na interface!';
  RAISE NOTICE '🎉 ===================================================';
END $$;

-- =====================================================
-- EXEMPLO DE TESTE (OPCIONAL - DESCOMENTE PARA TESTAR)
-- =====================================================

-- Para testar o sistema após instalação, descomente e execute:
-- 
-- -- Fazer um depósito de teste
-- SELECT wallet_depositar(
--   (SELECT id FROM clientes LIMIT 1),
--   100.00,
--   'Depósito de teste do sistema',
--   'PIX',
--   'admin',
--   NOW()
-- );
-- 
-- -- Verificar se funcionou
-- SELECT * FROM cliente_wallet LIMIT 5;
-- SELECT * FROM wallet_transacoes ORDER BY created_at DESC LIMIT 5;