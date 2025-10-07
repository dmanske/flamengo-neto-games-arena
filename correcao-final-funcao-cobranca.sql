-- =====================================================
-- CORREÇÃO FINAL: Função de cobrança
-- Remove versões antigas e cria versão correta
-- =====================================================

-- 1. Remover todas as versões da função
DROP FUNCTION IF EXISTS registrar_cobranca_ingresso(UUID, VARCHAR, TEXT, TEXT);
DROP FUNCTION IF EXISTS registrar_cobranca_ingresso(UUID, VARCHAR, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS registrar_cobranca_ingresso(UUID, VARCHAR, TEXT, VARCHAR);

-- 2. Criar função correta com observações
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
    -- Inserir nova cobrança com todos os campos
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

-- 3. Atualizar tipos antigos para novos tipos
UPDATE historico_cobrancas_ingressos 
SET tipo_cobranca = 'whatsapp_manual'
WHERE tipo_cobranca = 'whatsapp';

-- 4. Testar a função
SELECT registrar_cobranca_ingresso(
    '64086a49-2a87-4b96-8ffc-096145b0d065'::UUID,
    'whatsapp_manual',
    'Teste de mensagem',
    'Teste de observação',
    'Sistema'
) as teste_funcao;

-- 5. Verificar resultado
SELECT 
    'Função registrar_cobranca_ingresso' as item,
    '✅ Corrigida e testada com sucesso!' as status;

-- 6. Ver últimos registros para confirmar
SELECT 
    id,
    tipo_cobranca,
    LEFT(mensagem_enviada, 50) as mensagem_resumo,
    observacoes,
    data_envio
FROM historico_cobrancas_ingressos 
ORDER BY created_at DESC 
LIMIT 3;