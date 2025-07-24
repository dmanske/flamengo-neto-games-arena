-- =====================================================
-- REMOÇÃO COMPLETA DO SISTEMA DE PARCELAMENTO
-- Volta ao sistema básico original
-- =====================================================

-- =====================================================
-- 1. REMOVER TODAS AS TABELAS DE PARCELAMENTO
-- =====================================================

-- Remover views relacionadas
DROP VIEW IF EXISTS v_parcelas_completas CASCADE;
DROP VIEW IF EXISTS v_dashboard_vencimentos CASCADE;
DROP VIEW IF EXISTS v_pagamentos_passageiros CASCADE;

-- Remover triggers
DROP TRIGGER IF EXISTS update_parcelamento_config_updated_at ON viagem_parcelamento_config;
DROP TRIGGER IF EXISTS update_parcelas_updated_at ON viagem_passageiros_parcelas;
DROP TRIGGER IF EXISTS trigger_calcular_status_parcela ON viagem_passageiros_parcelas;
DROP TRIGGER IF EXISTS trigger_historico_parcela ON viagem_passageiros_parcelas;
DROP TRIGGER IF EXISTS update_pagamentos_simples_updated_at ON pagamentos_simples;

-- Remover funções
DROP FUNCTION IF EXISTS calcular_status_parcela() CASCADE;
DROP FUNCTION IF EXISTS registrar_historico_parcela() CASCADE;

-- Remover tabelas do sistema de parcelamento
DROP TABLE IF EXISTS parcela_historico CASCADE;
DROP TABLE IF EXISTS parcela_alertas CASCADE;
DROP TABLE IF EXISTS viagem_parcelamento_config CASCADE;
DROP TABLE IF EXISTS pagamentos_simples CASCADE;

-- Remover tabela de parcelas se existir
DROP TABLE IF EXISTS viagem_passageiros_parcelas CASCADE;

RAISE NOTICE 'Tabela viagem_passageiros_parcelas removida!';

RAISE NOTICE 'Todas as tabelas de parcelamento foram removidas!';

-- =====================================================
-- 2. GARANTIR QUE TABELAS BÁSICAS EXISTEM
-- =====================================================

-- Verificar se as tabelas básicas existem
DO $
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagens') THEN
        RAISE EXCEPTION 'Tabela "viagens" não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clientes') THEN
        RAISE EXCEPTION 'Tabela "clientes" não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagem_passageiros') THEN
        RAISE EXCEPTION 'Tabela "viagem_passageiros" não encontrada!';
    END IF;
    
    RAISE NOTICE 'Tabelas básicas verificadas e existem!';
END $;

-- =====================================================
-- 3. GARANTIR CAMPOS BÁSICOS NA TABELA VIAGEM_PASSAGEIROS
-- =====================================================

-- Verificar e adicionar campos básicos se não existirem
DO $
BEGIN
    -- Campo status_pagamento
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros' 
                   AND column_name = 'status_pagamento') THEN
        ALTER TABLE viagem_passageiros 
        ADD COLUMN status_pagamento VARCHAR(20) DEFAULT 'Pendente' 
        CHECK (status_pagamento IN ('Pendente', 'Pago', 'Cancelado'));
        RAISE NOTICE 'Campo status_pagamento adicionado!';
    END IF;
    
    -- Campo valor
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros' 
                   AND column_name = 'valor') THEN
        ALTER TABLE viagem_passageiros 
        ADD COLUMN valor DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campo valor adicionado!';
    END IF;
    
    -- Campo desconto
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros' 
                   AND column_name = 'desconto') THEN
        ALTER TABLE viagem_passageiros 
        ADD COLUMN desconto DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Campo desconto adicionado!';
    END IF;
    
    -- Campo setor_maracana
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros' 
                   AND column_name = 'setor_maracana') THEN
        ALTER TABLE viagem_passageiros 
        ADD COLUMN setor_maracana VARCHAR(100);
        RAISE NOTICE 'Campo setor_maracana adicionado!';
    END IF;
    
    -- Campo numero_onibus
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros' 
                   AND column_name = 'numero_onibus') THEN
        ALTER TABLE viagem_passageiros 
        ADD COLUMN numero_onibus VARCHAR(10);
        RAISE NOTICE 'Campo numero_onibus adicionado!';
    END IF;
END $;

-- =====================================================
-- 4. CRIAR VIEW SIMPLES PARA RELATÓRIOS
-- =====================================================

CREATE OR REPLACE VIEW v_passageiros_viagem AS
SELECT 
    vp.id,
    vp.viagem_id,
    vp.cliente_id,
    c.nome as passageiro_nome,
    c.telefone as passageiro_telefone,
    c.email as passageiro_email,
    c.cidade as cidade_embarque,
    v.adversario,
    v.data_jogo,
    vp.valor,
    vp.desconto,
    (vp.valor - COALESCE(vp.desconto, 0)) as valor_final,
    vp.status_pagamento,
    vp.setor_maracana,
    vp.numero_onibus,
    vp.created_at
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id
ORDER BY vp.created_at DESC;

-- =====================================================
-- 5. ÍNDICES BÁSICOS PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_viagem_passageiros_viagem_id ON viagem_passageiros(viagem_id);
CREATE INDEX IF NOT EXISTS idx_viagem_passageiros_cliente_id ON viagem_passageiros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_viagem_passageiros_status ON viagem_passageiros(status_pagamento);

-- =====================================================
-- 6. VERIFICAÇÃO FINAL
-- =====================================================

-- Mostrar estrutura final
SELECT 
    'SISTEMA BÁSICO ATIVO' as status,
    COUNT(*) as total_passageiros,
    COUNT(*) FILTER (WHERE status_pagamento = 'Pago') as passageiros_pagos,
    COUNT(*) FILTER (WHERE status_pagamento = 'Pendente') as passageiros_pendentes,
    COUNT(*) FILTER (WHERE status_pagamento = 'Cancelado') as passageiros_cancelados,
    SUM(valor) as valor_total,
    SUM(CASE WHEN status_pagamento = 'Pago' THEN valor ELSE 0 END) as valor_pago,
    SUM(CASE WHEN status_pagamento = 'Pendente' THEN valor ELSE 0 END) as valor_pendente
FROM viagem_passageiros;

-- Mostrar tabelas ativas
SELECT 
    'TABELAS DO SISTEMA BÁSICO' as categoria,
    table_name,
    CASE 
        WHEN table_name = 'viagens' THEN 'Viagens cadastradas'
        WHEN table_name = 'clientes' THEN 'Clientes cadastrados'
        WHEN table_name = 'viagem_passageiros' THEN 'Passageiros das viagens'
        ELSE 'Outra tabela'
    END as descricao
FROM information_schema.tables 
WHERE table_name IN ('viagens', 'clientes', 'viagem_passageiros')
ORDER BY table_name;

-- Mostrar campos da tabela principal
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros'
ORDER BY ordinal_position;

-- =====================================================
-- REMOÇÃO COMPLETA CONCLUÍDA! ✅
-- =====================================================
-- Sistema voltou ao básico original
-- Apenas tabelas essenciais: viagens, clientes, viagem_passageiros
-- Status simples: Pendente, Pago, Cancelado