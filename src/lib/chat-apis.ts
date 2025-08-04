// Configurações para APIs de chat
export const CHAT_CONFIG = {
  // Evolution API (WhatsApp)
  evolution: {
    baseUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'http://localhost:8080',
    apiKey: import.meta.env.VITE_EVOLUTION_API_KEY,
    instanceName: import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || 'flamengo-viagens',
  },
  
  // WhatsApp Business API (Meta - backup)
  whatsapp: {
    token: import.meta.env.VITE_WHATSAPP_TOKEN,
    phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_ID,
    webhookToken: import.meta.env.VITE_WHATSAPP_WEBHOOK_TOKEN,
  },
  
  // Telegram Bot
  telegram: {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN,
  },
  
  // Configurações gerais
  defaultCountryCode: '55', // Brasil
};

// Evolution API (WhatsApp)
export const enviarMensagemEvolution = async (telefone: string, mensagem: string) => {
  const { baseUrl, apiKey, instanceName } = CHAT_CONFIG.evolution;
  
  if (!apiKey || !instanceName) {
    throw new Error('Evolution API não configurada. Configure VITE_EVOLUTION_API_KEY e VITE_EVOLUTION_INSTANCE_NAME');
  }

  try {
    const telefoneClean = telefone.replace(/\D/g, '');
    const numeroCompleto = telefoneClean.startsWith('55') ? telefoneClean : `55${telefoneClean}`;
    
    const response = await fetch(`${baseUrl}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        number: `${numeroCompleto}@s.whatsapp.net`,
        text: mensagem
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem Evolution:', error);
    throw error;
  }
};

// WhatsApp Business API (Meta - backup)
export const enviarMensagemWhatsApp = async (telefone: string, mensagem: string) => {
  const { token, phoneNumberId } = CHAT_CONFIG.whatsapp;
  
  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API não configurada. Configure VITE_WHATSAPP_TOKEN e VITE_WHATSAPP_PHONE_ID');
  }

  try {
    const telefoneClean = telefone.replace(/\D/g, '');
    
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: telefoneClean,
        text: { body: mensagem }
      })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error);
    throw error;
  }
};

// Telegram Bot
export const enviarMensagemTelegram = async (chatId: string, mensagem: string) => {
  const { botToken } = CHAT_CONFIG.telegram;
  
  if (!botToken) {
    throw new Error('Telegram Bot não configurado. Configure VITE_TELEGRAM_BOT_TOKEN');
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagem,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao enviar mensagem Telegram:', error);
    throw error;
  }
};

// Função genérica para enviar mensagem
export const enviarMensagem = async (
  tipo: 'evolution' | 'whatsapp' | 'telegram' | 'whatsapp-web',
  destinatario: string,
  mensagem: string
) => {
  switch (tipo) {
    case 'evolution':
      return await enviarMensagemEvolution(destinatario, mensagem);
    
    case 'whatsapp':
      return await enviarMensagemWhatsApp(destinatario, mensagem);
    
    case 'telegram':
      return await enviarMensagemTelegram(destinatario, mensagem);
    
    case 'whatsapp-web':
      const telefoneClean = destinatario.replace(/\D/g, '');
      const url = `https://web.whatsapp.com/send?phone=${CHAT_CONFIG.defaultCountryCode}${telefoneClean}&text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
      return { success: true, method: 'whatsapp-web' };
    
    default:
      throw new Error(`Tipo de chat não suportado: ${tipo}`);
  }
};

// Webhook para processar mensagens recebidas (Evolution API)
export const processarWebhookEvolution = (webhookData: any) => {
  try {
    console.log('📨 Webhook Evolution recebido:', webhookData);
    
    // Evolution API estrutura
    if (webhookData.event === 'messages.upsert') {
      const message = webhookData.data;
      
      return {
        id: message.key?.id,
        from: message.key?.remoteJid?.replace('@s.whatsapp.net', ''),
        timestamp: new Date(message.messageTimestamp * 1000),
        type: message.message ? Object.keys(message.message)[0] : 'unknown',
        text: message.message?.conversation || 
              message.message?.extendedTextMessage?.text || 
              message.message?.imageMessage?.caption || '',
        isFromMe: message.key?.fromMe || false,
        instanceName: webhookData.instance
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao processar webhook Evolution:', error);
    return null;
  }
};

// Webhook para processar mensagens recebidas (WhatsApp Business API)
export const processarWebhookWhatsApp = (webhookData: any) => {
  try {
    const changes = webhookData.entry?.[0]?.changes?.[0];
    
    if (changes?.field === 'messages') {
      const { messages, contacts } = changes.value;
      
      if (messages) {
        return messages.map((message: any) => ({
          id: message.id,
          from: message.from,
          timestamp: new Date(parseInt(message.timestamp) * 1000),
          type: message.type,
          text: message.text?.body || '',
          contact: contacts?.find((c: any) => c.wa_id === message.from)
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao processar webhook WhatsApp:', error);
    return [];
  }
};

// Verificar status da instância Evolution
export const verificarStatusEvolution = async () => {
  const { baseUrl, apiKey, instanceName } = CHAT_CONFIG.evolution;
  
  try {
    const response = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
      headers: { 'apikey': apiKey }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        conectado: data.instance?.state === 'open',
        estado: data.instance?.state,
        qrCode: data.instance?.qrcode
      };
    }
    
    return { conectado: false, estado: 'unknown' };
  } catch (error) {
    console.error('Erro ao verificar status Evolution:', error);
    return { conectado: false, estado: 'error' };
  }
};

// Verificar se APIs estão configuradas
export const verificarConfiguracao = () => {
  const status = {
    evolution: !!(CHAT_CONFIG.evolution.apiKey && CHAT_CONFIG.evolution.instanceName),
    whatsapp: !!(CHAT_CONFIG.whatsapp.token && CHAT_CONFIG.whatsapp.phoneNumberId),
    telegram: !!CHAT_CONFIG.telegram.botToken,
  };
  
  return {
    ...status,
    algumConfigurado: Object.values(status).some(Boolean),
    melhorOpcao: status.evolution ? 'evolution' : 
                 status.whatsapp ? 'whatsapp' : 
                 status.telegram ? 'telegram' : 'whatsapp-web'
  };
};