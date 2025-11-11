-- Adicionar template de QR Code para lista de presença

INSERT INTO templates_whatsapp_personalizados (
  nome_template,
  categoria,
  conteudo,
  variaveis_disponiveis,
  ativo
)
VALUES (
  'qrcode_lista_presenca',
  'qrcode',
  '🔥 *{time_principal} vs {adversario}*
📅 *Data:* {data_jogo}

👋 Olá *{nome}*!

📱 *SEU QR CODE PARA LISTA DE PRESENÇA*

✅ *Como usar:*
1️⃣ Mostre este QR code na tela do seu celular
2️⃣ O responsável irá escanear com o celular dele
3️⃣ Sua presença será confirmada automaticamente

🔗 *Link direto:* {link_qrcode}

⚠️ *IMPORTANTE:*
• Mantenha a tela ligada e com bom brilho
• Chegue com antecedência ao local de embarque
• Em caso de dúvidas, entre em contato',
  ARRAY['time_principal', 'adversario', 'data_jogo', 'nome', 'link_qrcode'],
  true
)
ON CONFLICT DO NOTHING;
