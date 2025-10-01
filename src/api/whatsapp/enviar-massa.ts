// API Route para envio em massa via WhatsApp
// Arquivo: pages/api/whatsapp/enviar-massa.ts (Next.js) ou similar

interface PassageiroAPI {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface RequestBody {
  passageiros: PassageiroAPI[];
  mensagem: string;
  apiTipo: 'whatsapp-business' | 'z-api' | 'simulacao';
}

interface ResultadoEnvio {
  passageiro: string;
  telefone: string;
  status: 'enviado' | 'erro';
  erro?: string;
  messageId?: string;
}

// Função para WhatsApp Business API (Meta)
async function enviarViaWhatsAppBusiness(passageiros: PassageiroAPI[], mensagem: string): Promise<ResultadoEnvio[]> {
  const resultados: ResultadoEnvio[] = [];
  
  for (const passageiro of passageiros) {
    try {
      const telefone = (passageiro.telefone || passageiro.clientes?.telefone || '').replace(/\D/g, '');
      const nome = passageiro.nome || passageiro.clientes?.nome || 'Passageiro';
      
      // Personalizar mensagem com nome
      const mensagemPersonalizada = mensagem.replace(/\{nome\}/g, nome);
      
      const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: telefone,
          type: 'text',
          text: {
            body: mensagemPersonalizada
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        resultados.push({
          passageiro: nome,
          telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
          status: 'enviado',
          messageId: result.messages[0].id
        });
      } else {
        throw new Error(result.error?.message || 'Erro desconhecido');
      }
      
    } catch (error) {
      resultados.push({
        passageiro: passageiro.nome || passageiro.clientes?.nome || 'Passageiro',
        telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
    
    // Delay entre envios para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return resultados;
}

// Função para Z-API (Alternativa brasileira mais barata)
async function enviarViaZAPI(passageiros: PassageiroAPI[], mensagem: string): Promise<ResultadoEnvio[]> {
  const resultados: ResultadoEnvio[] = [];
  
  // Preparar mensagens em lote
  const mensagens = passageiros.map(passageiro => {
    const telefone = (passageiro.telefone || passageiro.clientes?.telefone || '').replace(/\D/g, '');
    const nome = passageiro.nome || passageiro.clientes?.nome || 'Passageiro';
    const mensagemPersonalizada = mensagem.replace(/\{nome\}/g, nome);
    
    return {
      phone: telefone,
      message: mensagemPersonalizada
    };
  });
  
  try {
    const response = await fetch(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: mensagens
      })
    });
    
    const result = await response.json();
    
    // Z-API retorna array de resultados
    result.forEach((item: any, index: number) => {
      const passageiro = passageiros[index];
      const nome = passageiro.nome || passageiro.clientes?.nome || 'Passageiro';
      
      resultados.push({
        passageiro: nome,
        telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
        status: item.error ? 'erro' : 'enviado',
        erro: item.error?.message,
        messageId: item.messageId
      });
    });
    
  } catch (error) {
    // Se falhar o lote todo, marcar todos como erro
    passageiros.forEach(passageiro => {
      resultados.push({
        passageiro: passageiro.nome || passageiro.clientes?.nome || 'Passageiro',
        telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro na API'
      });
    });
  }
  
  return resultados;
}

// Função para usar ChatGPT para personalizar mensagens (opcional)
async function personalizarComChatGPT(mensagem: string, nomePassageiro: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que personaliza mensagens de viagem do Flamengo. Mantenha o tom amigável, inclua o nome da pessoa e mantenha a mensagem concisa.'
          },
          {
            role: 'user',
            content: `Personalize esta mensagem para ${nomePassageiro}: "${mensagem}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });
    
    const result = await response.json();
    return result.choices[0].message.content;
    
  } catch (error) {
    console.error('Erro ao personalizar com ChatGPT:', error);
    // Fallback: apenas substituir {nome}
    return mensagem.replace(/\{nome\}/g, nomePassageiro);
  }
}

// Handler principal da API
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  
  try {
    const { passageiros, mensagem, apiTipo }: RequestBody = req.body;
    
    if (!passageiros || !mensagem || !apiTipo) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios faltando' });
    }
    
    let resultados: ResultadoEnvio[] = [];
    
    switch (apiTipo) {
      case 'whatsapp-business':
        resultados = await enviarViaWhatsAppBusiness(passageiros, mensagem);
        break;
        
      case 'z-api':
        resultados = await enviarViaZAPI(passageiros, mensagem);
        break;
        
      case 'simulacao':
        // Simulação para testes
        resultados = passageiros.map((passageiro, index) => ({
          passageiro: passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`,
          telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
          status: Math.random() > 0.1 ? 'enviado' : 'erro', // 90% de sucesso
          erro: Math.random() > 0.1 ? undefined : 'Erro simulado',
          messageId: `sim_${Date.now()}_${index}`
        }));
        break;
        
      default:
        return res.status(400).json({ error: 'Tipo de API inválido' });
    }
    
    const sucessos = resultados.filter(r => r.status === 'enviado').length;
    const erros = resultados.filter(r => r.status === 'erro').length;
    
    return res.status(200).json({
      resultados,
      resumo: {
        total: passageiros.length,
        sucessos,
        erros,
        taxa_sucesso: Math.round((sucessos / passageiros.length) * 100)
      }
    });
    
  } catch (error) {
    console.error('Erro na API de envio em massa:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Exemplo de arquivo .env necessário:
/*
# WhatsApp Business API (Meta)
WHATSAPP_PHONE_ID=sua_phone_id
WHATSAPP_ACCESS_TOKEN=seu_access_token

# Z-API (Alternativa brasileira)
ZAPI_INSTANCE=sua_instancia
ZAPI_TOKEN=seu_token

# OpenAI (Opcional - para personalização com ChatGPT)
OPENAI_API_KEY=sua_chave_openai
*/