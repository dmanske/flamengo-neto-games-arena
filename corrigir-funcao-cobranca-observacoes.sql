-- =====================================================
-- CORREÇÃO: Função registrar_cobranca_ingresso
-- Problema: Não estava salvando as observações
-- =====================================================

-- Recriar a função com suporte a observações
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
    -- Inserir nova cobrança com observações e timestamps explícitos
    INSERT INTO historico_cobrancas_ingressos (
        ingresso_id,
        tipo_cobranca,
        mensagem_enviada,
        observacoes,
        enviado_por,
        data_envio,
        created_at
    ) VALUES (
        p_ingresso_id,
        p_tipo_cobranca,
        p_mensagem,
        p_observacoes,
        p_enviado_por,
        NOW(),
        NOW()
    ) RETURNING id INTO v_cobranca_id;
    
    RETURN v_cobranca_id;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a função foi criada corretamente
SELECT 
    'Função registrar_cobranca_ingresso corrigida' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
        AND routine_schema = 'public'
    ) THEN '✅ Função atualizada com suporte a observações' 
    ELSE '❌ Erro na atualização' END as status;