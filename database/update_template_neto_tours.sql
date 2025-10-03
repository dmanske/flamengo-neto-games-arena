-- =====================================================
-- ATUALIZAR TEMPLATE NETO TOURS - CONVITE GRUPO JOGO
-- =====================================================

-- Atualizar template existente para usar o formato correto
UPDATE whatsapp_templates 
SET mensagem = '⭐️ Olá, {NOME}! Tudo bem?

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
    variaveis = ARRAY['NOME', 'ADVERSARIO', 'DATA', 'LINK_GRUPO'],
    updated_at = NOW()
WHERE nome = 'Neto Tours - Convite Grupo Jogo';

-- Verificar se foi atualizado
SELECT 
  id,
  nome,
  categoria,
  ativo,
  array_length(variaveis, 1) as total_variaveis,
  updated_at
FROM whatsapp_templates 
WHERE nome = 'Neto Tours - Convite Grupo Jogo'
ORDER BY updated_at DESC;