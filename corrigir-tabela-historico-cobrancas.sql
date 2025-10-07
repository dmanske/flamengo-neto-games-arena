-- =====================================================
-- CORREÇÃO: Tabela historico_cobrancas_ingressos
-- Problema: Trigger tentando atualizar campo updated_at que não existe
-- =====================================================

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'historico_cobrancas_ingressos'
ORDER BY ordinal_position;

-- 2. Adicionar campo updated_at se não existir
ALTER TABLE historico_cobrancas_ingressos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Recriar a função do trigger corretamente
CREATE OR REPLACE FUNCTION update_historico_cobrancas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Remover trigger antigo se existir
DROP TRIGGER IF EXISTS update_historico_cobrancas_updated_at_trigger ON historico_cobrancas_ingressos;

-- 5. Criar novo trigger
CREATE TRIGGER update_historico_cobrancas_updated_at_trigger
    BEFORE UPDATE ON historico_cobrancas_ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_historico_cobrancas_updated_at();

-- 6. Verificar se a tabela está correta agora
SELECT 
    'Tabela historico_cobrancas_ingressos' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'historico_cobrancas_ingressos' 
        AND column_name = 'updated_at'
    ) THEN '✅ Campo updated_at existe' 
    ELSE '❌ Campo updated_at não encontrado' END as status_campo,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'update_historico_cobrancas_updated_at_trigger'
    ) THEN '✅ Trigger funcionando' 
    ELSE '❌ Trigger não encontrado' END as status_trigger;

-- 7. Testar a função registrar_cobranca_ingresso
SELECT 
    'Função registrar_cobranca_ingresso' as funcao,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
        AND routine_schema = 'public'
    ) THEN '✅ Função existe e pronta para usar' 
    ELSE '❌ Execute o arquivo corrigir-funcao-cobranca-observacoes.sql primeiro' END as status;