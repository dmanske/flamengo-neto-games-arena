-- =====================================================
-- CORREÇÃO: Check constraint tipo_cobranca
-- Problema: Constraint não permite whatsapp_manual e whatsapp_api
-- =====================================================

-- 1. Ver constraint atual
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'historico_cobrancas_ingressos'::regclass
AND contype = 'c';

-- 2. Remover constraint antiga
ALTER TABLE historico_cobrancas_ingressos 
DROP CONSTRAINT IF EXISTS historico_cobrancas_ingressos_tipo_cobranca_check;

-- 3. Criar nova constraint com tipos corretos
ALTER TABLE historico_cobrancas_ingressos 
ADD CONSTRAINT historico_cobrancas_ingressos_tipo_cobranca_check 
CHECK (tipo_cobranca IN ('whatsapp_manual', 'whatsapp_api', 'email', 'telefone', 'presencial', 'outros'));

-- 4. Atualizar registros antigos para tipos válidos
UPDATE historico_cobrancas_ingressos 
SET tipo_cobranca = 'whatsapp_manual'
WHERE tipo_cobranca = 'whatsapp';

-- 5. Testar a função novamente
SELECT registrar_cobranca_ingresso(
    '64086a49-2a87-4b96-8ffc-096145b0d065'::UUID,
    'whatsapp_manual',
    'Teste de mensagem após correção',
    'Teste de observação',
    'Sistema'
) as teste_funcao_corrigida;

-- 6. Testar WhatsApp API também
SELECT registrar_cobranca_ingresso(
    '64086a49-2a87-4b96-8ffc-096145b0d065'::UUID,
    'whatsapp_api',
    'Teste WhatsApp API',
    'Observação API',
    'Sistema'
) as teste_api;

-- 7. Verificar registros criados
SELECT 
    id,
    tipo_cobranca,
    LEFT(mensagem_enviada, 40) as mensagem,
    observacoes,
    data_envio
FROM historico_cobrancas_ingressos 
WHERE mensagem_enviada LIKE '%Teste%'
ORDER BY created_at DESC;

-- 8. Verificar constraint atualizada
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'historico_cobrancas_ingressos'::regclass
AND contype = 'c';

SELECT '✅ Constraint corrigida! Função pronta para uso.' as resultado;