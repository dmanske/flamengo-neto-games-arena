-- =====================================================
-- SISTEMA DE PARCELAMENTO INTELIGENTE - ESTRUTURA DE BANCO
-- =====================================================
-- Data: Janeiro 2025
-- Objetivo: Implementar parcelamento automático com regra de 5 dias antes da viagem

-- =====================================================
-- 1. CONFIGURAÇÃO DE PARCELAMENTO POR VIAGEM
-- =====================================================

CREATE TABLE IF NOT EXISTS viagem_parcelamento_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL,
  desconto_avista_percent DECIMAL(5,2) DEFAULT 0 CHECK (desconto_avista_percent >= 0 AND desconto_avista_percent <= 100),
  prazo_limite_dias INTEGER DEFAULT 5 CHECK (prazo_limite_dias > 0),
  intervalo_minimo_dias INTEGER DEFAULT 15 CHECK (intervalo_minimo_dias > 0),
  max_parcelas INTEGER DEFAULT 6 CHECK (max_parcelas > 0),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_viagem_config UNIQUE (viagem_id)
);

-- =====================================================
-- 2. MELHORIAS NA TABELA DE PARCELAS EXISTENTE
-- =====================================================

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar data_vencimento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'data_vencimento') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN data_vencimento DATE NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    
    -- Adicionar numero_parcela se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'numero_parcela') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN numero_parcela INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    -- Adicionar total_parcelas se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'total_parcelas') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN total_parcelas INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    -- Adicionar status se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'status') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN status VARCHAR(20) DEFAULT 'pendente' 
        CHECK (status IN ('pendente', 'pago', 'vencido', 'cancelado'));
    END IF;
    
    -- Adicionar tipo_parcelamento se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'tipo_parcelamento') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN tipo_parcelamento VARCHAR(20) DEFAULT 'avista' 
        CHECK (tipo_parcelamento IN ('avista', 'parcelado', 'personalizado'));
    END IF;
    
    -- Adicionar desconto_aplicado se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'desconto_aplicado') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN desconto_aplicado DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- Adicionar valor_original se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'valor_original') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN valor_original DECIMAL(10,2);
    END IF;
    
    -- Adicionar observacoes se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'observacoes') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN observacoes TEXT;
    END IF;
    
    -- Adicionar updated_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'viagem_passageiros_parcelas' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE viagem_passageiros_parcelas 
        ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 3. SISTEMA DE ALERTAS DE PARCELAS
-- =====================================================

CREATE TABLE IF NOT EXISTS parcela_alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL,
  tipo_alerta VARCHAR(20) NOT NULL CHECK (tipo_alerta IN ('5_dias_antes', 'vencimento', 'atraso_1dia', 'atraso_7dias')),
  canal VARCHAR(20) DEFAULT 'whatsapp' CHECK (canal IN ('whatsapp', 'email', 'sms')),
  template_usado VARCHAR(100),
  mensagem_enviada TEXT,
  data_envio TIMESTAMP DEFAULT NOW(),
  status_envio VARCHAR(20) DEFAULT 'enviado' CHECK (status_envio IN ('enviado', 'lido', 'respondido', 'erro')),
  resposta_recebida TEXT,
  tentativas INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. HISTÓRICO DE ALTERAÇÕES EM PARCELAS
-- =====================================================

CREATE TABLE IF NOT EXISTS parcela_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL,
  acao VARCHAR(50) NOT NULL, -- 'criada', 'data_alterada', 'valor_alterado', 'pago', 'cancelada', 'status_alterado'
  valor_anterior JSONB,
  valor_novo JSONB,
  usuario_id UUID, -- referência ao usuário que fez a alteração (se aplicável)
  ip_address INET,
  user_agent TEXT,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 5. FOREIGN KEYS (executar após verificar se tabelas existem)
-- =====================================================

DO $$
BEGIN
    -- FK para viagem_parcelamento_config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagens') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'fk_parcelamento_config_viagem') THEN
            ALTER TABLE viagem_parcelamento_config 
            ADD CONSTRAINT fk_parcelamento_config_viagem 
            FOREIGN KEY (viagem_id) REFERENCES viagens(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- FK para parcela_alertas
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagem_passageiros_parcelas') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'fk_alertas_parcela') THEN
            ALTER TABLE parcela_alertas 
            ADD CONSTRAINT fk_alertas_parcela 
            FOREIGN KEY (parcela_id) REFERENCES viagem_passageiros_parcelas(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- FK para parcela_historico
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'viagem_passageiros_parcelas') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'fk_historico_parcela') THEN
            ALTER TABLE parcela_historico 
            ADD CONSTRAINT fk_historico_parcela 
            FOREIGN KEY (parcela_id) REFERENCES viagem_passageiros_parcelas(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para viagem_parcelamento_config
CREATE INDEX IF NOT EXISTS idx_parcelamento_config_viagem ON viagem_parcelamento_config(viagem_id);
CREATE INDEX IF NOT EXISTS idx_parcelamento_config_ativo ON viagem_parcelamento_config(ativo);

-- Índices para viagem_passageiros_parcelas (novos)
CREATE INDEX IF NOT EXISTS idx_parcela_vencimento_status ON viagem_passageiros_parcelas(data_vencimento, status);
CREATE INDEX IF NOT EXISTS idx_parcela_status ON viagem_passageiros_parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcela_tipo ON viagem_passageiros_parcelas(tipo_parcelamento);
CREATE INDEX IF NOT EXISTS idx_parcela_passageiro_status ON viagem_passageiros_parcelas(viagem_passageiro_id, status);

-- Índices para parcela_alertas
CREATE INDEX IF NOT EXISTS idx_alertas_parcela ON parcela_alertas(parcela_id);
CREATE INDEX IF NOT EXISTS idx_alertas_data_tipo ON parcela_alertas(data_envio, tipo_alerta);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON parcela_alertas(status_envio);

-- Índices para parcela_historico
CREATE INDEX IF NOT EXISTS idx_historico_parcela ON parcela_historico(parcela_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON parcela_historico(created_at);
CREATE INDEX IF NOT EXISTS idx_historico_acao ON parcela_historico(acao);

-- =====================================================
-- 7. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para viagem_parcelamento_config
DROP TRIGGER IF EXISTS update_parcelamento_config_updated_at ON viagem_parcelamento_config;
CREATE TRIGGER update_parcelamento_config_updated_at 
    BEFORE UPDATE ON viagem_parcelamento_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para viagem_passageiros_parcelas (se a coluna updated_at existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'viagem_passageiros_parcelas' 
               AND column_name = 'updated_at') THEN
        
        EXECUTE 'DROP TRIGGER IF EXISTS update_parcelas_updated_at ON viagem_passageiros_parcelas';
        EXECUTE 'CREATE TRIGGER update_parcelas_updated_at 
                 BEFORE UPDATE ON viagem_passageiros_parcelas 
                 FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()';
    END IF;
END $$;

-- =====================================================
-- 8. FUNÇÃO PARA CALCULAR STATUS DE PARCELA
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_status_parcela()
RETURNS TRIGGER AS $$
BEGIN
    -- Se foi pago, manter como pago
    IF NEW.data_pagamento IS NOT NULL AND NEW.valor_parcela > 0 THEN
        NEW.status = 'pago';
    -- Se passou do vencimento e não foi pago
    ELSIF NEW.data_vencimento < CURRENT_DATE AND (NEW.data_pagamento IS NULL OR NEW.valor_parcela = 0) THEN
        NEW.status = 'vencido';
    -- Se ainda não venceu
    ELSIF NEW.data_vencimento >= CURRENT_DATE AND (NEW.data_pagamento IS NULL OR NEW.valor_parcela = 0) THEN
        NEW.status = 'pendente';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para calcular status automaticamente
DROP TRIGGER IF EXISTS trigger_calcular_status_parcela ON viagem_passageiros_parcelas;
CREATE TRIGGER trigger_calcular_status_parcela
    BEFORE INSERT OR UPDATE ON viagem_passageiros_parcelas
    FOR EACH ROW EXECUTE FUNCTION calcular_status_parcela();

-- =====================================================
-- 9. FUNÇÃO PARA REGISTRAR HISTÓRICO AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_historico_parcela()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir no histórico
    IF TG_OP = 'INSERT' THEN
        INSERT INTO parcela_historico (parcela_id, acao, valor_novo, observacoes)
        VALUES (NEW.id, 'criada', to_jsonb(NEW), 'Parcela criada automaticamente');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Verificar o que mudou
        IF OLD.data_vencimento != NEW.data_vencimento THEN
            INSERT INTO parcela_historico (parcela_id, acao, valor_anterior, valor_novo, observacoes)
            VALUES (NEW.id, 'data_alterada', 
                   jsonb_build_object('data_vencimento', OLD.data_vencimento),
                   jsonb_build_object('data_vencimento', NEW.data_vencimento),
                   'Data de vencimento alterada');
        END IF;
        
        IF OLD.valor_parcela != NEW.valor_parcela THEN
            INSERT INTO parcela_historico (parcela_id, acao, valor_anterior, valor_novo, observacoes)
            VALUES (NEW.id, 'valor_alterado',
                   jsonb_build_object('valor_parcela', OLD.valor_parcela),
                   jsonb_build_object('valor_parcela', NEW.valor_parcela),
                   'Valor da parcela alterado');
        END IF;
        
        IF OLD.status != NEW.status THEN
            INSERT INTO parcela_historico (parcela_id, acao, valor_anterior, valor_novo, observacoes)
            VALUES (NEW.id, 'status_alterado',
                   jsonb_build_object('status', OLD.status),
                   jsonb_build_object('status', NEW.status),
                   'Status da parcela alterado');
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para histórico automático
DROP TRIGGER IF EXISTS trigger_historico_parcela ON viagem_passageiros_parcelas;
CREATE TRIGGER trigger_historico_parcela
    AFTER INSERT OR UPDATE ON viagem_passageiros_parcelas
    FOR EACH ROW EXECUTE FUNCTION registrar_historico_parcela();

-- =====================================================
-- 10. VIEWS ÚTEIS PARA CONSULTAS
-- =====================================================

-- View para parcelas com informações completas
CREATE OR REPLACE VIEW v_parcelas_completas AS
SELECT 
    p.*,
    vp.valor as valor_total_passageiro,
    vp.desconto as desconto_passageiro,
    c.nome as passageiro_nome,
    c.telefone as passageiro_telefone,
    v.adversario,
    v.data_jogo,
    v.data_jogo - INTERVAL '5 days' as prazo_limite_pagamento,
    CASE 
        WHEN p.status = 'pago' THEN 0
        WHEN p.data_vencimento < CURRENT_DATE THEN CURRENT_DATE - p.data_vencimento
        ELSE 0
    END as dias_atraso,
    CASE
        WHEN p.status = 'pago' THEN 'pago'
        WHEN p.data_vencimento < CURRENT_DATE THEN 'atrasado'
        WHEN p.data_vencimento = CURRENT_DATE THEN 'vence_hoje'
        WHEN p.data_vencimento <= CURRENT_DATE + INTERVAL '5 days' THEN 'vence_em_breve'
        ELSE 'normal'
    END as urgencia
FROM viagem_passageiros_parcelas p
JOIN viagem_passageiros vp ON p.viagem_passageiro_id = vp.id
JOIN clientes c ON vp.cliente_id = c.id
JOIN viagens v ON vp.viagem_id = v.id;

-- View para dashboard de vencimentos
CREATE OR REPLACE VIEW v_dashboard_vencimentos AS
SELECT 
    urgencia,
    COUNT(*) as quantidade,
    SUM(valor_parcela) as valor_total,
    ARRAY_AGG(DISTINCT adversario) as viagens
FROM v_parcelas_completas
WHERE status IN ('pendente', 'vencido')
GROUP BY urgencia;

-- =====================================================
-- 11. DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir configuração padrão para viagens existentes (se necessário)
-- INSERT INTO viagem_parcelamento_config (viagem_id, desconto_avista_percent)
-- SELECT id, 5.0 FROM viagens WHERE id NOT IN (SELECT viagem_id FROM viagem_parcelamento_config);

-- =====================================================
-- 12. VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN (
    'viagem_parcelamento_config', 
    'parcela_alertas', 
    'parcela_historico'
)
ORDER BY tablename;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'viagem_passageiros_parcelas'
    AND column_name IN (
        'data_vencimento', 'numero_parcela', 'total_parcelas', 
        'status', 'tipo_parcelamento', 'desconto_aplicado', 
        'valor_original', 'observacoes', 'updated_at'
    )
ORDER BY column_name;

-- Verificar índices criados
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename IN (
    'viagem_parcelamento_config', 
    'viagem_passageiros_parcelas', 
    'parcela_alertas', 
    'parcela_historico'
)
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- ESTRUTURA CRIADA COM SUCESSO! ✅
-- =====================================================
-- Próximo passo: Implementar calculadora de parcelamento
-- Arquivo: src/lib/parcelamento-calculator.ts