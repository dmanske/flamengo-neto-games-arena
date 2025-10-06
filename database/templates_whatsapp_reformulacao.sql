-- =====================================================
-- SQL PARA REFORMULAÇÃO DO WHATSAPP MASSA
-- =====================================================
-- Execute este SQL para garantir que os templates estejam
-- configurados corretamente para o novo sistema

-- Verificar se a tabela existe e tem a estrutura correta
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'whatsapp_templates' 
ORDER BY ordinal_position;

-- Verificar templates existentes
SELECT 
  id,
  nome,
  categoria,
  ativo,
  array_length(variaveis, 1) as total_variaveis,
  created_at
FROM whatsapp_templates 
ORDER BY categoria, nome;

-- Inserir templates básicos se não existirem
-- (Execute apenas se não houver templates ou se quiser adicionar mais)

INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis, ativo) 
SELECT * FROM (VALUES
  -- Template de Confirmação
  ('Confirmação de Viagem Premium', 'confirmacao', 
   'Olá {NOME}! ✅ Sua viagem está confirmada!

🏆 FLAMENGO x {ADVERSARIO}
📅 {DATA} às {HORARIO}
📍 Embarque: {LOCAL_SAIDA}
🚌 {ONIBUS}
💰 Valor: {VALOR}

Nos vemos lá! Vamos Flamengo! 🔴⚫',
   ARRAY['NOME', 'ADVERSARIO', 'DATA', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS', 'VALOR'], 
   true),

  -- Template de Lembrete
  ('Lembrete de Embarque Hoje', 'lembrete',
   '🚨 HOJE É O DIA! 🚨

{NOME}, sua viagem sai HOJE às {HORARIO}!

📍 {LOCAL_SAIDA}
🚌 {ONIBUS}
⏰ Chegue às {HORARIO_CHEGADA}

Não se atrase! Boa viagem! 🎉',
   ARRAY['NOME', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS', 'HORARIO_CHEGADA'], 
   true),

  -- Template de Cobrança
  ('Cobrança Amigável', 'cobranca',
   'Oi {NOME}! 😊

Sua viagem para {ADVERSARIO} em {DATA} está chegando!

💰 Valor pendente: {VALOR}
💳 PIX: (11) 99999-9999

Pode regularizar para garantir sua vaga?

Obrigado! 🔴⚫',
   ARRAY['NOME', 'ADVERSARIO', 'DATA', 'VALOR'], 
   true),

  -- Template de Grupo
  ('Convite Grupo Simples', 'grupo',
   'Oi {NOME}! 👋

Entre no grupo da viagem:
{LINK_GRUPO}

📱 Lá você receberá todas as informações!

Nos vemos no embarque! 🚌',
   ARRAY['NOME', 'LINK_GRUPO'], 
   true),

  -- Template Informativo
  ('Informações Gerais', 'informativo',
   '📋 INFORMAÇÕES - {ADVERSARIO}

{NOME}, detalhes da sua viagem:

🕐 Saída: {HORARIO} - {LOCAL_SAIDA}
🚌 Ônibus: {ONIBUS}
📱 Contato: {TELEFONE}

⚠️ Leve documento com foto
⚠️ Chegue 30min antes

Dúvidas? Chame aqui! 📞',
   ARRAY['ADVERSARIO', 'NOME', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS', 'TELEFONE'], 
   true)
) AS new_templates(nome, categoria, mensagem, variaveis, ativo)
WHERE NOT EXISTS (
  SELECT 1 FROM whatsapp_templates 
  WHERE whatsapp_templates.nome = new_templates.nome
);

-- Verificar se os templates foram inseridos
SELECT 
  'Templates inseridos com sucesso!' as status,
  COUNT(*) as total_templates,
  COUNT(CASE WHEN ativo = true THEN 1 END) as templates_ativos
FROM whatsapp_templates;

-- Verificar templates por categoria
SELECT 
  categoria,
  COUNT(*) as total,
  COUNT(CASE WHEN ativo = true THEN 1 END) as ativos
FROM whatsapp_templates 
GROUP BY categoria
ORDER BY categoria;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- 1. Verificar se há templates ativos
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM whatsapp_templates WHERE ativo = true) = 0 THEN
    RAISE NOTICE 'ATENÇÃO: Nenhum template ativo encontrado! O sistema mostrará estado vazio.';
  ELSE
    RAISE NOTICE 'OK: % templates ativos encontrados.', (SELECT COUNT(*) FROM whatsapp_templates WHERE ativo = true);
  END IF;
END $$;

-- 2. Verificar se há pelo menos uma categoria
DO $$
BEGIN
  IF (SELECT COUNT(DISTINCT categoria) FROM whatsapp_templates WHERE ativo = true) = 0 THEN
    RAISE NOTICE 'ATENÇÃO: Nenhuma categoria encontrada!';
  ELSE
    RAISE NOTICE 'OK: % categorias encontradas: %', 
      (SELECT COUNT(DISTINCT categoria) FROM whatsapp_templates WHERE ativo = true),
      (SELECT string_agg(DISTINCT categoria, ', ') FROM whatsapp_templates WHERE ativo = true);
  END IF;
END $$;

-- 3. Listar templates que serão exibidos no sistema
SELECT 
  '=== TEMPLATES QUE APARECERÃO NO SISTEMA ===' as info;

SELECT 
  categoria,
  nome,
  CASE 
    WHEN LENGTH(mensagem) > 100 THEN LEFT(mensagem, 100) || '...'
    ELSE mensagem
  END as preview,
  array_length(variaveis, 1) as total_variaveis
FROM whatsapp_templates 
WHERE ativo = true
ORDER BY categoria, nome;

-- =====================================================
-- COMANDOS ÚTEIS PARA MANUTENÇÃO
-- =====================================================

-- Para desativar um template (ao invés de deletar):
-- UPDATE whatsapp_templates SET ativo = false WHERE nome = 'Nome do Template';

-- Para ativar um template:
-- UPDATE whatsapp_templates SET ativo = true WHERE nome = 'Nome do Template';

-- Para adicionar um novo template:
-- INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis, ativo) VALUES
-- ('Novo Template', 'categoria', 'Mensagem com {VARIAVEL}', ARRAY['VARIAVEL'], true);

-- Para ver templates inativos:
-- SELECT nome, categoria FROM whatsapp_templates WHERE ativo = false;

COMMIT;