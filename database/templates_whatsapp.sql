-- =====================================================
-- TEMPLATES DE WHATSAPP - ESTRUTURA DO BANCO DE DADOS
-- =====================================================

-- Criar tabela principal de templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  mensagem TEXT NOT NULL,
  variaveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_categoria ON whatsapp_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_ativo ON whatsapp_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_nome ON whatsapp_templates(nome);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_whatsapp_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_whatsapp_templates_updated_at
  BEFORE UPDATE ON whatsapp_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_templates_updated_at();

-- =====================================================
-- INSERIR TEMPLATES INICIAIS
-- =====================================================

-- Template 1: Confirmação de Viagem
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Confirmação de Viagem', 'confirmacao', 
'Olá {NOME}! ✈️ Sua viagem para {DESTINO} está confirmada para {DATA} às {HORARIO}. 

📍 Embarque: {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
💰 Valor: {VALOR}

Qualquer dúvida, estamos aqui! 🔴⚫',
ARRAY['NOME', 'DESTINO', 'DATA', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS', 'VALOR']);

-- Template 2: Link do Grupo
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Link do Grupo', 'grupo',
'Oi {NOME}! 👋 

Entre no grupo da viagem {DESTINO}: 
{LINK_GRUPO}

📱 Lá você receberá todas as informações importantes da viagem!

Nos vemos no embarque! 🚌',
ARRAY['NOME', 'DESTINO', 'LINK_GRUPO']);

-- Template Neto Tours - Convite Grupo Jogo
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Neto Tours - Convite Grupo Jogo', 'grupo',
'⭐️ Olá, {NOME}! Tudo bem?

A cada dia estamos mais próximos de vivermos juntos mais um grande espetáculo no Maracanã 🏟️:

🔴⚫️ Flamengo x {ADVERSARIO} 🔴⚫️
{DATA}
⚽️

Estamos trabalhando com todo cuidado e dedicação para proporcionar a melhor experiência possível para você e sua família 👨‍👩‍👧‍👦✨.

Para iniciarmos da melhor forma, pedimos que entre no grupo exclusivo de passageiros, onde serão repassadas todas as orientações, regras e programação da viagem.

Se estiver viajando com amigos ou familiares, reenvie este link para eles também participarem.

⚠️ Atenção: É obrigatório participar do grupo, pois será por lá que compartilharemos informações oficiais, horários, avisos e comunicados importantes.

Clique abaixo para entrar:
👇
{LINK_GRUPO}

🚍 Neto Tours Viagens – Realizando sonhos, criando histórias',
ARRAY['NOME', 'ADVERSARIO', 'DATA', 'LINK_GRUPO']);

-- Template 3: Lembrete de Embarque
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Lembrete de Embarque', 'lembrete',
'⏰ LEMBRETE IMPORTANTE!

{NOME}, sua viagem para {DESTINO} sai AMANHÃ às {HORARIO}!

📍 Local: {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
⏱️ Chegue 30 minutos antes

Boa viagem! 🎒✈️',
ARRAY['NOME', 'DESTINO', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS']);

-- Template 4: Cobrança Pendente
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Cobrança Pendente', 'cobranca',
'Oi {NOME}! 😊

Sua viagem {DESTINO} em {DATA} está quase chegando e ainda temos R$ {VALOR} pendente.

💳 PIX: (11) 99999-9999
📱 Ou entre em contato conosco

Pode regularizar para garantir sua vaga? 

Obrigado! 🔴⚫',
ARRAY['NOME', 'DESTINO', 'DATA', 'VALOR']);

-- Template 5: Lembrete Final
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Lembrete Final - Hoje', 'lembrete',
'🚨 HOJE É O DIA! 🚨

{NOME}, sua viagem para {DESTINO} sai HOJE às {HORARIO}!

📍 {LOCAL_SAIDA}
🚌 {ONIBUS}
⏰ Chegue às {HORARIO_CHEGADA}

Não se atrase! Boa viagem! 🎉',
ARRAY['NOME', 'DESTINO', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS', 'HORARIO_CHEGADA']);

-- Template 6: Boas Vindas ao Grupo
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Boas Vindas ao Grupo', 'grupo',
'🎉 Bem-vindo(a) ao grupo da viagem {DESTINO}!

Aqui você receberá:
✅ Informações importantes
✅ Horários atualizados  
✅ Contato direto conosco
✅ Fotos da viagem

Vamos juntos torcer pelo Mengão! 🔴⚫⚽',
ARRAY['DESTINO']);

-- Template 7: Pagamento Confirmado
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Pagamento Confirmado', 'confirmacao',
'✅ PAGAMENTO CONFIRMADO!

{NOME}, recebemos seu pagamento de {VALOR} para a viagem {DESTINO}!

🎫 Sua vaga está garantida
📅 Data: {DATA} às {HORARIO}
📍 Embarque: {LOCAL_SAIDA}

Obrigado pela confiança! 🔴⚫',
ARRAY['NOME', 'VALOR', 'DESTINO', 'DATA', 'HORARIO', 'LOCAL_SAIDA']);

-- Template 8: Informações Importantes
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Informações Importantes', 'informativo',
'📋 INFORMAÇÕES IMPORTANTES - {DESTINO}

{NOME}, algumas informações sobre sua viagem:

🕐 Saída: {HORARIO} - {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
📱 Contato emergência: (11) 99999-9999

⚠️ Leve documento com foto
⚠️ Chegue 30min antes
⚠️ Não esqueça o ingresso!

Qualquer dúvida, chame aqui! 📞',
ARRAY['DESTINO', 'NOME', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS']);

-- =====================================================
-- VERIFICAR DADOS INSERIDOS
-- =====================================================

-- Consulta para verificar se os templates foram criados
SELECT 
  id,
  nome,
  categoria,
  array_length(variaveis, 1) as total_variaveis,
  ativo,
  created_at
FROM whatsapp_templates 
ORDER BY categoria, nome;

-- =====================================================
-- COMENTÁRIOS SOBRE AS VARIÁVEIS DISPONÍVEIS
-- =====================================================

/*
VARIÁVEIS DISPONÍVEIS PARA USO NOS TEMPLATES:

{NOME} - Nome do passageiro
{DESTINO} - Destino da viagem  
{DATA} - Data da viagem (formatada: DD/MM/AAAA)
{HORARIO} - Horário de saída (formatado: HH:MM)
{HORARIO_CHEGADA} - Horário sugerido de chegada
{LOCAL_SAIDA} - Local de embarque
{ONIBUS} - Número ou nome do ônibus
{LINK_GRUPO} - Link do grupo WhatsApp (editável por viagem)
{VALOR} - Valor da viagem (formatado: R$ XX,XX)
{TELEFONE} - Telefone de contato da empresa

CATEGORIAS DISPONÍVEIS:
- confirmacao: Templates de confirmação
- grupo: Templates relacionados a grupos
- lembrete: Templates de lembrete e avisos
- cobranca: Templates para cobrança
- informativo: Templates informativos
- promocional: Templates promocionais
- outros: Templates diversos
*/