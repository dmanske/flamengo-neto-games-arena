-- =====================================================
-- INSERIR TEMPLATE NETO TOURS - CONVITE GRUPO JOGO
-- =====================================================

INSERT INTO whatsapp_templates (
  nome,
  categoria,
  mensagem,
  variaveis,
  ativo
) VALUES (
  'Neto Tours - Convite Grupo Jogo',
  'convite',
  'Olá {NOME}! 👋

🔴⚫ FLAMENGO x {ADVERSARIO} 🔴⚫

� Data: {DATA}
� EmbarquDe: {HORARIO} - {LOCAL_SAIDA}
🎯 Chegada recomendada: {HORARIO_CHEGADA}

📱 Entre no nosso grupo do WhatsApp para receber todas as informações importantes da viagem:
{LINK_GRUPO}

🚨 IMPORTANTE: Chegue com 30 minutos de antecedência!

Qualquer dúvida, entre em contato: {TELEFONE}

Vamos juntos torcer pelo Mengão! 🔴⚫⚽',
  ARRAY['NOME', 'ADVERSARIO', 'DATA', 'HORARIO', 'LOCAL_SAIDA', 'HORARIO_CHEGADA', 'LINK_GRUPO', 'TELEFONE'],
  true
);

-- Verificar se foi inserido
SELECT 
  id,
  nome,
  categoria,
  ativo,
  created_at
FROM whatsapp_templates 
WHERE nome = 'Neto Tours - Convite Grupo Jogo';