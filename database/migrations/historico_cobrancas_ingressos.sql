-- =====================================================
-- TABELA: historico_cobrancas_ingressos
-- DESCRIÇÃO: Log de tentativas de cobrança para ingressos pendentes
-- =====================================================

-- Criar tabela historico_cobrancas_ingressos
CREATE TABLE IF NOT EXISTS historico_cobrancas_ingressos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ingresso_id UUID NOT NULL,
    tipo_cobranca TEXT NOT NULL CHECK (tipo_cobranca IN ('whatsapp', 'email', 'telefone', 'presencial', 'outros')),
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'enviado' CHECK (status IN ('enviado', 'visualizado', 'respondido', 'pago', 'ignorado')),
    mensagem_enviada TEXT,
    resposta_cliente TEXT,
    observacoes TEXT,
    enviado_por TEXT, -- Nome do usuário que enviou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar foreign key para ingressos (assumindo que existe tabela ingressos)
ALTER TABLE historico_cobrancas_ingressos 
ADD CONSTRAINT fk_historico_cobrancas_ingresso_id 
FOREIGN KEY (ingresso_id) REFERENCES ingressos(id) ON DELETE CASCADE;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_ingresso_id ON historico_cobrancas_ingressos(ingresso_id);
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_tipo ON historico_cobrancas_ingressos(tipo_cobranca);
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_status ON historico_cobrancas_ingressos(status);
CREATE INDEX IF NOT EXISTS idx_historico_cobrancas_data_envio ON historico_cobrancas_ingressos(data_envio);

-- Políticas RLS (Row Level Security)
ALTER TABLE historico_cobrancas_ingressos ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver todo o histórico (ajustar conforme necessário)
CREATE POLICY "Usuários podem visualizar historico_cobrancas" ON historico_cobrancas_ingressos
    FOR SELECT USING (true);

-- Política: Usuários podem inserir registros de cobrança
CREATE POLICY "Usuários podem inserir historico_cobrancas" ON historico_cobrancas_ingressos
    FOR INSERT WITH CHECK (true);

-- Política: Usuários podem atualizar registros de cobrança
CREATE POLICY "Usuários podem atualizar historico_cobrancas" ON historico_cobrancas_ingressos
    FOR UPDATE USING (true);

-- Política: Usuários podem deletar registros de cobrança
CREATE POLICY "Usuários podem deletar historico_cobrancas" ON historico_cobrancas_ingressos
    FOR DELETE USING (true);

-- Função para registrar cobrança automaticamente
CREATE OR REPLACE FUNCTION registrar_cobranca_ingresso(
    p_ingresso_id UUID,
    p_tipo_cobranca TEXT,
    p_mensagem TEXT DEFAULT NULL,
    p_enviado_por TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_cobranca_id UUID;
BEGIN
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

-- View para estatísticas de cobrança por ingresso
CREATE OR REPLACE VIEW vw_estatisticas_cobranca_ingresso AS
SELECT 
    i.id as ingresso_id,
    c.nome as cliente_nome,
    i.adversario,
    i.jogo_data,
    i.situacao_financeira,
    i.valor_final,
    COUNT(hc.id) as total_tentativas,
    COUNT(CASE WHEN hc.tipo_cobranca = 'whatsapp' THEN 1 END) as tentativas_whatsapp,
    COUNT(CASE WHEN hc.tipo_cobranca = 'email' THEN 1 END) as tentativas_email,
    COUNT(CASE WHEN hc.tipo_cobranca = 'telefone' THEN 1 END) as tentativas_telefone,
    MAX(hc.data_envio) as ultima_cobranca,
    COUNT(CASE WHEN hc.status = 'respondido' THEN 1 END) as respostas_recebidas
FROM ingressos i
LEFT JOIN clientes c ON i.cliente_id = c.id
LEFT JOIN historico_cobrancas_ingressos hc ON i.id = hc.ingresso_id
WHERE i.situacao_financeira = 'pendente'
GROUP BY i.id, c.nome, i.adversario, i.jogo_data, i.situacao_financeira, i.valor_final;

-- Comentários para documentação
COMMENT ON TABLE historico_cobrancas_ingressos IS 'Histórico de tentativas de cobrança para ingressos pendentes';
COMMENT ON COLUMN historico_cobrancas_ingressos.ingresso_id IS 'ID do ingresso relacionado à cobrança';
COMMENT ON COLUMN historico_cobrancas_ingressos.tipo_cobranca IS 'Meio utilizado para cobrança: whatsapp, email, telefone, presencial, outros';
COMMENT ON COLUMN historico_cobrancas_ingressos.status IS 'Status da cobrança: enviado, visualizado, respondido, pago, ignorado';
COMMENT ON COLUMN historico_cobrancas_ingressos.mensagem_enviada IS 'Conteúdo da mensagem enviada ao cliente';
COMMENT ON COLUMN historico_cobrancas_ingressos.resposta_cliente IS 'Resposta do cliente, se houver';
COMMENT ON FUNCTION registrar_cobranca_ingresso IS 'Função para registrar uma nova tentativa de cobrança';
COMMENT ON VIEW vw_estatisticas_cobranca_ingresso IS 'Estatísticas de cobrança por ingresso pendente';