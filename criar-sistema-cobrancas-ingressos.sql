-- Script para criar sistema completo de cobranças de ingressos
-- Execute no Supabase SQL Editor

-- 1. Criar tabela de histórico de cobranças
CREATE TABLE IF NOT EXISTS historico_cobrancas_ingressos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ingresso_id UUID NOT NULL REFERENCES ingressos(id) ON DELETE CASCADE,
    tipo_cobranca VARCHAR(20) NOT NULL CHECK (tipo_cobranca IN ('whatsapp', 'email', 'telefone', 'presencial', 'outros')),
    data_envio TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'enviado' CHECK (status IN ('enviado', 'visualizado', 'respondido', 'pago', 'ignorado')),
    mensagem_enviada TEXT,
    resposta_cliente TEXT,
    observacoes TEXT,
    enviado_por VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_ingresso_id ON historico_cobrancas_ingressos(ingresso_id);
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_data_envio ON historico_cobrancas_ingressos(data_envio);
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_status ON historico_cobrancas_ingressos(status);

-- 3. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_historico_cobrancas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_historico_cobrancas_updated_at ON historico_cobrancas_ingressos;
CREATE TRIGGER trigger_update_historico_cobrancas_updated_at
    BEFORE UPDATE ON historico_cobrancas_ingressos
    FOR EACH ROW
    EXECUTE FUNCTION update_historico_cobrancas_updated_at();

-- 4. Criar função para registrar cobrança
CREATE OR REPLACE FUNCTION registrar_cobranca_ingresso(
    p_ingresso_id UUID,
    p_tipo_cobranca VARCHAR(20),
    p_mensagem TEXT DEFAULT NULL,
    p_enviado_por VARCHAR(255) DEFAULT 'Sistema'
)
RETURNS UUID AS $$
DECLARE
    v_cobranca_id UUID;
BEGIN
    -- Inserir nova cobrança
    INSERT INTO historico_cobrancas_ingressos (
        ingresso_id,
        tipo_cobranca,
        mensagem_enviada,
        enviado_por
    ) VALUES (
        p_ingresso_id,
        p_tipo_cobranca,
        p_mensagem,
        p_enviado_por
    ) RETURNING id INTO v_cobranca_id;
    
    RETURN v_cobranca_id;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar view para estatísticas de cobrança
CREATE OR REPLACE VIEW vw_estatisticas_cobranca_ingresso AS
SELECT 
    i.id as ingresso_id,
    c.nome as cliente_nome,
    i.adversario,
    i.jogo_data,
    i.situacao_financeira,
    i.valor_final,
    COALESCE(stats.total_tentativas, 0) as total_tentativas,
    COALESCE(stats.tentativas_whatsapp, 0) as tentativas_whatsapp,
    COALESCE(stats.tentativas_email, 0) as tentativas_email,
    COALESCE(stats.tentativas_telefone, 0) as tentativas_telefone,
    stats.ultima_cobranca,
    COALESCE(stats.respostas_recebidas, 0) as respostas_recebidas
FROM ingressos i
LEFT JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN (
    SELECT 
        ingresso_id,
        COUNT(*) as total_tentativas,
        COUNT(CASE WHEN tipo_cobranca = 'whatsapp' THEN 1 END) as tentativas_whatsapp,
        COUNT(CASE WHEN tipo_cobranca = 'email' THEN 1 END) as tentativas_email,
        COUNT(CASE WHEN tipo_cobranca = 'telefone' THEN 1 END) as tentativas_telefone,
        MAX(data_envio) as ultima_cobranca,
        COUNT(CASE WHEN status = 'respondido' THEN 1 END) as respostas_recebidas
    FROM historico_cobrancas_ingressos
    GROUP BY ingresso_id
) stats ON i.id = stats.ingresso_id
WHERE i.situacao_financeira = 'pendente';

-- 6. Criar função para calcular valor pendente real (considerando pagamentos)
CREATE OR REPLACE FUNCTION calcular_valor_pendente_real(p_ingresso_id UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_valor_final DECIMAL(10,2);
    v_total_pago DECIMAL(10,2);
    v_saldo_devedor DECIMAL(10,2);
BEGIN
    -- Buscar valor final do ingresso
    SELECT valor_final INTO v_valor_final
    FROM ingressos
    WHERE id = p_ingresso_id;
    
    -- Buscar total pago
    SELECT COALESCE(SUM(valor_pago), 0) INTO v_total_pago
    FROM historico_pagamentos_ingressos
    WHERE ingresso_id = p_ingresso_id;
    
    -- Calcular saldo devedor
    v_saldo_devedor := GREATEST(0, v_valor_final - v_total_pago);
    
    RETURN v_saldo_devedor;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar view melhorada para ingressos pendentes com valores reais
CREATE OR REPLACE VIEW vw_ingressos_pendentes_real AS
SELECT 
    i.*,
    c.nome as cliente_nome,
    c.telefone as cliente_telefone,
    c.email as cliente_email,
    calcular_valor_pendente_real(i.id) as valor_pendente_real,
    COALESCE(SUM(hpi.valor_pago), 0) as total_pago,
    COALESCE(hc.total_tentativas, 0) as total_tentativas_cobranca,
    hc.ultima_tentativa,
    -- Usar DATE() para comparação de datas ignorando timestamp e fuso horário
    DATE(i.jogo_data AT TIME ZONE 'America/Sao_Paulo') as jogo_data_local,
    CASE 
        WHEN calcular_valor_pendente_real(i.id) > 200 AND EXTRACT(DAY FROM NOW() - i.jogo_data) > 7 THEN 'alta'
        WHEN calcular_valor_pendente_real(i.id) > 100 OR EXTRACT(DAY FROM NOW() - i.jogo_data) > 3 THEN 'media'
        ELSE 'baixa'
    END as prioridade,
    GREATEST(0, EXTRACT(DAY FROM NOW() - i.jogo_data)) as dias_em_atraso
FROM ingressos i
LEFT JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN historico_pagamentos_ingressos hpi ON i.id = hpi.ingresso_id
LEFT JOIN (
    SELECT 
        ingresso_id,
        COUNT(*) as total_tentativas,
        MAX(data_envio) as ultima_tentativa
    FROM historico_cobrancas_ingressos
    GROUP BY ingresso_id
) hc ON i.id = hc.ingresso_id
WHERE i.situacao_financeira = 'pendente'
GROUP BY i.id, c.nome, c.telefone, c.email, hc.total_tentativas, hc.ultima_tentativa;

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE historico_cobrancas_ingressos ENABLE ROW LEVEL SECURITY;

-- 9. Criar política RLS para permitir todas as operações
DROP POLICY IF EXISTS "Permitir todas as operações em historico_cobrancas_ingressos" ON historico_cobrancas_ingressos;
CREATE POLICY "Permitir todas as operações em historico_cobrancas_ingressos" 
ON historico_cobrancas_ingressos
FOR ALL 
USING (true)
WITH CHECK (true);

-- 10. Adicionar coluna de observações internas aos ingressos (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ingressos' 
        AND column_name = 'observacoes_internas'
    ) THEN
        ALTER TABLE ingressos ADD COLUMN observacoes_internas TEXT;
        RAISE NOTICE 'Coluna observacoes_internas adicionada à tabela ingressos!';
    ELSE
        RAISE NOTICE 'Coluna observacoes_internas já existe na tabela ingressos!';
    END IF;
END $$;

-- 11. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela historico_cobrancas_ingressos' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'historico_cobrancas_ingressos'
    ) THEN '✅ Criada' ELSE '❌ Não encontrada' END as status
UNION ALL
SELECT 
    'Função registrar_cobranca_ingresso' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'registrar_cobranca_ingresso'
    ) THEN '✅ Criada' ELSE '❌ Não encontrada' END as status
UNION ALL
SELECT 
    'View vw_estatisticas_cobranca_ingresso' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'vw_estatisticas_cobranca_ingresso'
    ) THEN '✅ Criada' ELSE '❌ Não encontrada' END as status
UNION ALL
SELECT 
    'View vw_ingressos_pendentes_real' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'vw_ingressos_pendentes_real'
    ) THEN '✅ Criada' ELSE '❌ Não encontrada' END as status;

SELECT 'Sistema de cobranças de ingressos criado com sucesso! 🎉' as resultado;