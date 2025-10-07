-- =====================================================
-- CORREÇÃO SIMPLES: Apenas a função de cobrança
-- Não mexe no trigger problemático
-- =====================================================

-- 1. Adicionar campo updated_at se não existir
ALTER TABLE historico_cobrancas_ingressos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Corrigir a função do trigger para não dar erro
CREATE OR REPLACE FUNCTION update_historico_cobrancas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Só atualiza se o campo existir
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar função de cobrança corrigida (com observações)
CREATE OR REPLACE FUNCTION registrar_cobranca_ingresso(
    p_ingresso_id UUID,
    p_tipo_cobranca VARCHAR(20),
    p_mensagem TEXT DEFAULT NULL,
    p_observacoes TEXT DEFAULT NULL,
    p_enviado_por VARCHAR(255) DEFAULT 'Sistema'
)
RETURNS UUID AS $$
DECLARE
    v_cobranca_id UUID;
BEGIN
    -- Inserir nova cobrança com todos os campos necessários
    INSERT INTO historico_cobrancas_ingressos (
        ingresso_id,
        tipo_cobranca,
        mensagem_enviada,
        observacoes,
        enviado_por,
        data_envio,
        status,
        created_at,
        updated_at
    ) VALUES (
        p_ingresso_id,
        p_tipo_cobranca,
        p_mensagem,
        p_observacoes,
        p_enviado_por,
        NOW(),
        'enviado',
        NOW(),
        NOW()
    ) RETURNING id INTO v_cobranca_id;
    
    RETURN v_cobranca_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Verificação final
SELECT 
    'Sistema de cobranças' as sistema,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historico_cobrancas_ingressos' 
        AND column_name = 'updated_at'
    ) THEN '✅ Campo updated_at OK' 
    ELSE '❌ Campo updated_at faltando' END as campo_updated_at,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
    ) THEN '✅ Função registrar_cobranca_ingresso OK' 
    ELSE '❌ Função faltando' END as funcao_cobranca;

SELECT '🎉 Correção simples aplicada! Função pronta para uso.' as resultado;