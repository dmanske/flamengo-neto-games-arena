-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS - FORNECEDORES
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Criar tabela de fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_fornecedor VARCHAR(50) NOT NULL CHECK (tipo_fornecedor IN ('ingressos', 'transporte', 'hospedagem', 'alimentacao', 'eventos')),
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cnpj VARCHAR(18),
    contato_principal VARCHAR(255),
    observacoes TEXT,
    mensagem_padrao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_fornecedor VARCHAR(50) NOT NULL,
    assunto VARCHAR(255),
    corpo_mensagem TEXT NOT NULL,
    variaveis_disponiveis TEXT[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nome, tipo_fornecedor)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_fornecedores_tipo ON fornecedores(tipo_fornecedor);
CREATE INDEX IF NOT EXISTS idx_fornecedores_ativo ON fornecedores(ativo);
CREATE INDEX IF NOT EXISTS idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX IF NOT EXISTS idx_templates_tipo ON message_templates(tipo_fornecedor);
CREATE INDEX IF NOT EXISTS idx_templates_ativo ON message_templates(ativo);

-- 4. Criar função para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar triggers para updated_at
DROP TRIGGER IF EXISTS update_fornecedores_updated_at ON fornecedores;
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON message_templates;
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas RLS (permitir tudo para usuários autenticados)
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON fornecedores;
CREATE POLICY "Permitir tudo para usuários autenticados" ON fornecedores
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON message_templates;
CREATE POLICY "Permitir tudo para usuários autenticados" ON message_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- 8. Inserir dados de exemplo (opcional)
INSERT INTO fornecedores (nome, tipo_fornecedor, email, telefone, whatsapp, endereco, contato_principal, observacoes, mensagem_padrao) VALUES
('Ingressos Maracanã', 'ingressos', 'contato@ingressosmaracana.com', '(21) 99999-1111', '(21) 99999-1111', 'Rua do Maracanã, 123 - Maracanã, Rio de Janeiro - RJ', 'João Silva', 'Fornecedor principal de ingressos para jogos no Maracanã', 'Olá! Preciso de um orçamento para ingressos do Flamengo. Podem me passar os valores disponíveis? Obrigado!'),
('Transportes Flamengo', 'transporte', 'vendas@transportesflamengo.com', '(21) 88888-2222', '(21) 88888-2222', 'Av. das Américas, 456 - Barra da Tijuca, Rio de Janeiro - RJ', 'Maria Santos', 'Empresa especializada em transporte de torcedores', 'Oi! Gostaria de solicitar um orçamento para transporte de torcedores. Podem me enviar as opções disponíveis?'),
('Hotel Copacabana Palace', 'hospedagem', 'reservas@copacabanapalace.com', '(21) 77777-3333', '(21) 77777-3333', 'Av. Atlântica, 1702 - Copacabana, Rio de Janeiro - RJ', 'Carlos Oliveira', 'Hotel de luxo para hospedagem em jogos especiais', 'Bom dia! Preciso verificar disponibilidade para hospedagem durante um jogo do Flamengo. Podem me passar informações e valores?')
ON CONFLICT DO NOTHING;

INSERT INTO message_templates (nome, tipo_fornecedor, assunto, corpo_mensagem, variaveis_disponiveis) VALUES
('Solicitação de Ingressos', 'ingressos', 'Solicitação de Ingressos - {viagem_nome}', 
'Olá {fornecedor_nome},

Espero que esteja bem!

Gostaria de solicitar um orçamento para ingressos da seguinte viagem:

🏆 Jogo: {adversario}
📅 Data: {data_jogo}
🏟️ Estádio: {estadio}
👥 Quantidade de passageiros: {quantidade_passageiros}
🗓️ Data de ida: {data_ida}
🗓️ Data de volta: {data_volta}

Por favor, me envie as opções disponíveis e valores.

Aguardo seu retorno.

Atenciosamente,
{contato_responsavel}
Flamengo Viagens', 
ARRAY['{viagem_nome}', '{adversario}', '{data_jogo}', '{estadio}', '{quantidade_passageiros}', '{data_ida}', '{data_volta}', '{fornecedor_nome}', '{contato_responsavel}']),

('Solicitação Rápida de Ingressos', 'ingressos', 'Pedido de Ingressos - Flamengo', 
'Olá {fornecedor_nome},

Preciso de um orçamento urgente para ingressos:

🎫 Tipo: [SERÁ PREENCHIDO AUTOMATICAMENTE]
👥 Quantidade: [SERÁ PREENCHIDO AUTOMATICAMENTE]

Pode me passar os valores disponíveis?

Obrigado!
{contato_responsavel}
Flamengo Viagens', 
ARRAY['{fornecedor_nome}', '{contato_responsavel}']),

('Solicitação de Transporte', 'transporte', 'Solicitação de Transporte - {viagem_nome}', 
'Olá {fornecedor_nome},

Preciso de um orçamento para transporte da seguinte viagem:

🏆 Destino: {estadio}
📅 Data do jogo: {data_jogo}
👥 Quantidade de passageiros: {quantidade_passageiros}
🗓️ Data de ida: {data_ida}
🗓️ Data de volta: {data_volta}

Aguardo suas opções e valores.

Atenciosamente,
{contato_responsavel}
Flamengo Viagens', 
ARRAY['{viagem_nome}', '{estadio}', '{data_jogo}', '{quantidade_passageiros}', '{data_ida}', '{data_volta}', '{fornecedor_nome}', '{contato_responsavel}']),

('Solicitação de Hospedagem', 'hospedagem', 'Reserva de Hospedagem - {viagem_nome}', 
'Olá {fornecedor_nome},

Gostaria de solicitar um orçamento para hospedagem:

🏨 Evento: {adversario}
📅 Data do jogo: {data_jogo}
🏟️ Local: {estadio}
👥 Quantidade de hóspedes: {quantidade_passageiros}
🗓️ Check-in: {data_ida}
🗓️ Check-out: {data_volta}

Aguardo disponibilidade e valores.

Atenciosamente,
{contato_responsavel}
Flamengo Viagens', 
ARRAY['{viagem_nome}', '{adversario}', '{data_jogo}', '{estadio}', '{quantidade_passageiros}', '{data_ida}', '{data_volta}', '{fornecedor_nome}', '{contato_responsavel}'])
ON CONFLICT DO NOTHING;

-- 9. Verificar se tudo foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
SELECT COUNT(*) as total_fornecedores FROM fornecedores;
SELECT COUNT(*) as total_templates FROM message_templates;