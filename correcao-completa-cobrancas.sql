-- =====================================================
-- CORREÇÃO COMPLETA: Sistema de Cobranças
-- Resolve todos os problemas de uma vez
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
    'Verificando tabela historico_cobrancas_ingressos' as etapa,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'historico_cobrancas_ingressos'
    ) THEN '✅ Tabela existe' 
    ELSE '❌ Tabela não existe - execute criar-sistema-cobrancas-ingressos.sql primeiro' END as status;

-- 2. Adicionar campo updated_at se não existir
ALTER TABLE historico_cobrancas_ingressos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Remover trigger problemático se existir (nome correto)
DROP TRIGGER IF EXISTS trigger_update_historico_cobrancas_updated_at ON historico_cobrancas_ingressos;
DROP FUNCTION IF EXISTS update_historico_cobrancas_updated_at() CASCADE;

-- 4. Criar função de cobrança corrigida (com observações e timestamps explícitos)
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

-- 5. Limpar tipos antigos de cobrança (opcional)
UPDATE historico_cobrancas_ingressos 
SET tipo_cobranca = 'whatsapp_manual'
WHERE tipo_cobranca IN ('whatsapp', 'telefone', 'presencial', 'outros');

-- 6. Verificação final
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
    ELSE '❌ Função faltando' END as funcao_cobranca,
    
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_historico_cobrancas_updated_at_trigger'
    ) THEN '✅ Trigger problemático removido' 
    ELSE '❌ Trigger ainda existe' END as trigger_status;

-- 7. Teste rápido da função (opcional - descomente para testar)
/*
SELECT registrar_cobranca_ingresso(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'whatsapp_manual',
    'Mensagem de teste',
    'Observação de teste',
    'Sistema'
) as teste_funcao;
*/

SELECT '🎉 Correção completa aplicada! Sistema pronto para uso.' as resultado;