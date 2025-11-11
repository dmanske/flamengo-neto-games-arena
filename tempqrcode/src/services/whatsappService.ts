// Serviço para envio de WhatsApp via Z-API
// Funciona diretamente no frontend (Vite)

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface ResultadoEnvio {
  passageiro: string;
  telefone: string;
  status: 'enviado' | 'erro';
  erro?: string;
  messageId?: string;
}

// Função para testar a configuração Z-API (usa configuração do banco)
export async function testarConfiguracaoZAPI(): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    console.log('🧪 Testando configuração Z-API...');

    const config = await obterConfiguracaoWhatsApp();
    
    if (config.api_tipo !== 'z-api') {
      throw new Error('Configuração não é do tipo Z-API');
    }

    const { instance, token, client_token } = config.configuracoes;
    
    if (!instance || !token) {
      throw new Error('Instância e token são obrigatórios para Z-API');
    }

    // Headers com client_token se disponível
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (client_token) {
      headers['Client-Token'] = client_token;
    }

    // Testar status da instância
    const response = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/status`, {
      method: 'GET',
      headers
    });

    const data = await response.json();
    console.log('📋 Status da instância:', data);

    if (response.ok && !data.error) {
      console.log(`✅ Instância ${data.connected ? 'conectada' : 'desconectada'}!`);
      return { sucesso: true };
    }

    return {
      sucesso: false,
      erro: data.error || 'Erro desconhecido'
    };
  } catch (error) {
    console.error('❌ Erro ao testar Z-API:', error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para simular envio (para testes)
export async function simularEnvio(passageiros: Passageiro[], mensagem: string, dadosViagem?: Record<string, string>): Promise<ResultadoEnvio[]> {
  console.log('🎭 Iniciando simulação de envio...');

  const resultados: ResultadoEnvio[] = [];

  for (let i = 0; i < passageiros.length; i++) {
    const passageiro = passageiros[i];
    const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${i + 1}`;

    // Simular delay realista
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simular 95% de sucesso
    const sucesso = Math.random() > 0.05;

    resultados.push({
      passageiro: nome,
      telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
      status: sucesso ? 'enviado' : 'erro',
      erro: sucesso ? undefined : 'Erro simulado para demonstração',
      messageId: sucesso ? `sim_${Date.now()}_${i}` : undefined
    });

    console.log(`${sucesso ? '✅' : '❌'} Simulado para ${nome}`);
  }

  console.log(`🎭 Simulação concluída: ${resultados.filter(r => r.status === 'enviado').length} sucessos`);
  return resultados;
}

// Função para substituir variáveis na mensagem
function substituirVariaveis(texto: string, dados: Record<string, string>): string {
  let textoFinal = texto;
  
  // Substituir variáveis no formato {variavel}
  Object.entries(dados).forEach(([chave, valor]) => {
    const regex = new RegExp(`\\{${chave}\\}`, 'g');
    textoFinal = textoFinal.replace(regex, valor || `{${chave}}`);
  });

  return textoFinal;
}

// Função para enviar via Z-API real
export async function enviarViaZAPI(passageiros: Passageiro[], mensagem: string, dadosViagem?: Record<string, string>): Promise<ResultadoEnvio[]> {
  console.log(`🚀 Iniciando envio real via Z-API para ${passageiros.length} passageiros`);

  // Obter configuração do banco de dados
  const config = await obterConfiguracaoWhatsApp();
  
  if (config.api_tipo !== 'z-api') {
    throw new Error('Configuração não é do tipo Z-API');
  }

  const { instance, token, client_token } = config.configuracoes;
  
  if (!instance || !token) {
    throw new Error('Instância e token são obrigatórios para Z-API');
  }

  const resultados: ResultadoEnvio[] = [];

  for (let i = 0; i < passageiros.length; i++) {
    const passageiro = passageiros[i];
    let telefone = (passageiro.telefone || passageiro.clientes?.telefone || '').replace(/\D/g, '');
    const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${i + 1}`;

    // Garantir formato correto do telefone para Z-API (55 + DDD + número)
    if (!telefone.startsWith('55')) {
      telefone = '55' + telefone;
    }

    // Personalizar mensagem com todas as variáveis
    const dadosCompletos = {
      nome,
      ...dadosViagem
    };
    const mensagemPersonalizada = substituirVariaveis(mensagem, dadosCompletos);

    try {
      console.log(`📱 Enviando para ${nome} (${telefone})`);

      // Headers com client_token se disponível
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (client_token) {
        headers['Client-Token'] = client_token;
      }

      // Formato correto baseado na documentação oficial da Z-API
      const response = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone: telefone,
          message: mensagemPersonalizada
        })
      });

      const result = await response.json();

      console.log(`📋 Resposta da Z-API para ${nome}:`, result);

      // Verificar diferentes tipos de resposta da Z-API
      if (response.ok && result.messageId) {
        // Sucesso com messageId
        resultados.push({
          passageiro: nome,
          telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
          status: 'enviado',
          messageId: result.messageId
        });
        console.log(`✅ Enviado para ${nome} - MessageID: ${result.messageId}`);
      } else if (result.error === "INSTANCE_NOT_CONNECTED") {
        throw new Error('Instância Z-API desconectada. Escaneie o QR Code novamente.');
      } else if (result.error === "PHONE_NUMBER_INVALID") {
        throw new Error(`Número de telefone inválido: ${telefone}`);
      } else if (result.error === "NOT_FOUND") {
        throw new Error('Endpoint da Z-API não encontrado. Verifique se a URL está correta.');
      } else if (result.error === "your client-token is not configured") {
        throw new Error('Token da Z-API inválido. Verifique suas credenciais.');
      } else {
        throw new Error(result.message || result.error || `Erro HTTP ${response.status}: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar para ${nome}:`, error);
      resultados.push({
        passageiro: nome,
        telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Delay entre envios para evitar rate limiting
    if (i < passageiros.length - 1) {
      console.log('⏳ Aguardando 2 segundos...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const sucessos = resultados.filter(r => r.status === 'enviado').length;
  console.log(`🚀 Envio concluído: ${sucessos} sucessos, ${resultados.length - sucessos} erros`);

  return resultados;
}

// Função para enviar mensagem individual de cobrança
export async function enviarMensagemCobranca(
  telefone: string,
  mensagem: string,
  nomeCliente: string
): Promise<{ sucesso: boolean; messageId?: string; erro?: string }> {
  console.log(`📱 Enviando cobrança via WhatsApp para ${nomeCliente} (${telefone})`);

  try {
    // Obter configuração do banco de dados
    const config = await obterConfiguracaoWhatsApp();
    
    if (config.api_tipo !== 'z-api') {
      throw new Error('Configuração não é do tipo Z-API');
    }

    const { instance, token, client_token } = config.configuracoes;
    
    if (!instance || !token) {
      throw new Error('Instância e token são obrigatórios para Z-API');
    }

    // Limpar e formatar telefone
    let telefoneFormatado = telefone.replace(/\D/g, '');
    if (!telefoneFormatado.startsWith('55')) {
      telefoneFormatado = '55' + telefoneFormatado;
    }

    // Personalizar mensagem com nome do cliente
    const mensagemPersonalizada = mensagem.replace(/{NOME}/g, nomeCliente);

    // Headers com client_token se disponível
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (client_token) {
      headers['Client-Token'] = client_token;
    }

    const response = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-text`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phone: telefoneFormatado,
        message: mensagemPersonalizada
      })
    });

    const result = await response.json();
    console.log(`📋 Resposta da Z-API para cobrança:`, result);

    if (response.ok && result.messageId) {
      console.log(`✅ Cobrança enviada para ${nomeCliente} - MessageID: ${result.messageId}`);
      return { 
        sucesso: true, 
        messageId: result.messageId 
      };
    } else {
      let erro = 'Erro desconhecido';
      
      if (result.error === "INSTANCE_NOT_CONNECTED") {
        erro = 'Instância Z-API desconectada. Escaneie o QR Code novamente.';
      } else if (result.error === "PHONE_NUMBER_INVALID") {
        erro = `Número de telefone inválido: ${telefone}`;
      } else if (result.error === "your client-token is not configured") {
        erro = 'Token da Z-API inválido. Verifique suas credenciais.';
      } else {
        erro = result.message || result.error || `Erro HTTP ${response.status}`;
      }

      console.error(`❌ Erro ao enviar cobrança para ${nomeCliente}:`, erro);
      return { sucesso: false, erro };
    }

  } catch (error) {
    const mensagemErro = error instanceof Error ? error.message : 'Erro de conexão';
    console.error(`❌ Erro ao enviar cobrança para ${nomeCliente}:`, mensagemErro);
    return { sucesso: false, erro: mensagemErro };
  }
}

// Função para obter configurações do banco de dados
async function obterConfiguracaoWhatsApp() {
  const { supabase } = await import('@/lib/supabase');
  
  const { data, error } = await supabase
    .from('configuracao_whatsapp')
    .select('*')
    .eq('ativo', true)
    .single();

  if (error || !data) {
    throw new Error('Configuração do WhatsApp não encontrada. Configure primeiro no sistema.');
  }

  return data;
}

// Headers padrão para Evolution API
const getEvolutionHeaders = (apiKey: string) => {
  return {
    'Content-Type': 'application/json',
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}` // Algumas Evolution APIs usam Bearer token
  };
};

// Função para testar configuração Evolution API
export async function testarConfiguracaoEvolution(): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    console.log('🧪 Testando configuração Evolution API...');

    const config = await obterConfiguracaoWhatsApp();
    
    if (config.api_tipo !== 'evolution-api') {
      throw new Error('Configuração não é do tipo Evolution API');
    }

    const { base_url, api_key } = config.configuracoes;
    
    if (!base_url || !api_key) {
      throw new Error('URL base e API key são obrigatórios');
    }

    // Remover barra final da URL se existir
    const cleanUrl = base_url.replace(/\/$/, '');

    const response = await fetch(`${cleanUrl}/instance/fetchInstances`, {
      method: 'GET',
      headers: getEvolutionHeaders(api_key)
    });

    const data = await response.json();
    console.log('📋 Resposta do Evolution API:', data);

    if (response.ok) {
      console.log('✅ Evolution API configurada corretamente!');
      return { sucesso: true };
    }

    return {
      sucesso: false,
      erro: data.message || data.error || 'Erro desconhecido'
    };
  } catch (error) {
    console.error('❌ Erro ao testar Evolution API:', error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Função para enviar via Evolution API
export async function enviarViaEvolution(passageiros: Passageiro[], mensagem: string, dadosViagem?: Record<string, string>): Promise<ResultadoEnvio[]> {
  console.log(`🚀 Iniciando envio real via Evolution API para ${passageiros.length} passageiros`);

  let base_url: string;
  let instance_name: string;
  let api_key: string;

  // Tentar obter do banco de dados primeiro
  try {
    const config = await obterConfiguracaoWhatsApp();
    
    if (config.api_tipo === 'evolution-api') {
      base_url = config.configuracoes.base_url;
      instance_name = config.configuracoes.instance_name;
      api_key = config.configuracoes.api_key;
    } else {
      throw new Error('Configuração não é do tipo Evolution API');
    }
  } catch (error) {
    // Fallback para variáveis de ambiente
    console.log('⚠️ Usando configuração das variáveis de ambiente');
    base_url = import.meta.env.VITE_EVOLUTION_BASE_URL || '';
    instance_name = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME || '';
    api_key = import.meta.env.VITE_EVOLUTION_API_KEY || '';
  }
  
  if (!base_url || !instance_name || !api_key) {
    throw new Error('URL base, nome da instância e API key são obrigatórios');
  }

  console.log(`📋 Usando instância: ${instance_name}`);

  // Remover barra final da URL se existir
  const cleanUrl = base_url.replace(/\/$/, '');

  const resultados: ResultadoEnvio[] = [];

  for (let i = 0; i < passageiros.length; i++) {
    const passageiro = passageiros[i];
    let telefone = (passageiro.telefone || passageiro.clientes?.telefone || '').replace(/\D/g, '');
    const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${i + 1}`;

    // Garantir formato correto do telefone para Evolution API (55 + DDD + número)
    if (!telefone.startsWith('55')) {
      telefone = '55' + telefone;
    }

    // Personalizar mensagem com todas as variáveis
    const dadosCompletos = {
      nome,
      ...dadosViagem
    };
    const mensagemPersonalizada = substituirVariaveis(mensagem, dadosCompletos);

    try {
      console.log(`📱 Enviando para ${nome} (${telefone})`);

      const response = await fetch(`${cleanUrl}/message/sendText/${instance_name}`, {
        method: 'POST',
        headers: getEvolutionHeaders(api_key),
        body: JSON.stringify({
          number: telefone,
          text: mensagemPersonalizada
        })
      });

      const result = await response.json();
      console.log(`📋 Resposta da Evolution API para ${nome}:`, result);

      if (response.ok && result.key) {
        resultados.push({
          passageiro: nome,
          telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
          status: 'enviado',
          messageId: result.key.id
        });
        console.log(`✅ Enviado para ${nome} - MessageID: ${result.key.id}`);
      } else {
        throw new Error(result.message || result.error || `Erro HTTP ${response.status}: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error(`❌ Erro ao enviar para ${nome}:`, error);
      resultados.push({
        passageiro: nome,
        telefone: passageiro.telefone || passageiro.clientes?.telefone || '',
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Delay entre envios para evitar rate limiting
    if (i < passageiros.length - 1) {
      console.log('⏳ Aguardando 1 segundo...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const sucessos = resultados.filter(r => r.status === 'enviado').length;
  console.log(`🚀 Envio concluído: ${sucessos} sucessos, ${resultados.length - sucessos} erros`);

  return resultados;
}

// Função para enviar QR codes via WhatsApp
export async function enviarQRCodesWhatsApp(
  qrCodes: Array<{
    token: string;
    qrCodeBase64: string;
    passageiro: {
      nome: string;
      telefone: string;
    };
  }>,
  dadosViagem: Record<string, string>,
  tipoEnvio: 'simulacao' | 'z-api' | 'evolution-api' = 'z-api'
): Promise<{
  resultados: ResultadoEnvio[];
  resumo: {
    total: number;
    sucessos: number;
    erros: number;
    taxa_sucesso: number;
  };
}> {
  console.log(`🚀 Enviando ${qrCodes.length} QR codes via WhatsApp`);

  // Obter configuração esportiva
  const { supabase } = await import('@/lib/supabase');
  const { data: configEsportiva } = await supabase
    .from('configuracao_esportiva')
    .select('time_principal, estadio_principal')
    .eq('ativo', true)
    .single();

  const resultados: ResultadoEnvio[] = [];

  // Buscar template personalizado do banco de dados
  let mensagemTemplate = `🔥 *{time_principal} vs {adversario}*
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
• Em caso de dúvidas, entre em contato`;

  // Tentar buscar template personalizado
  try {
    const { data: templatePersonalizado } = await supabase
      .from('templates_whatsapp_personalizados')
      .select('conteudo')
      .eq('nome_template', 'qrcode_lista_presenca')
      .eq('ativo', true)
      .single();

    if (templatePersonalizado) {
      mensagemTemplate = templatePersonalizado.conteudo;
    }
  } catch (error) {
    console.log('Usando template padrão de QR Code');
  }

  for (let i = 0; i < qrCodes.length; i++) {
    const qrData = qrCodes[i];
    const { nome, telefone } = qrData.passageiro;

    try {
      // Personalizar mensagem
      const linkQRCode = `${window.location.origin}/meu-qrcode/${qrData.token}`;
      const dadosCompletos = {
        nome,
        link_qrcode: linkQRCode,
        time_principal: (configEsportiva?.time_principal || 'Time Principal').toUpperCase(),
        ...dadosViagem
      };
      const mensagemPersonalizada = substituirVariaveis(mensagemTemplate, dadosCompletos);

      let resultado: { sucesso: boolean; messageId?: string; erro?: string };

      if (tipoEnvio === 'simulacao') {
        // Simular envio
        await new Promise(resolve => setTimeout(resolve, 500));
        resultado = { sucesso: Math.random() > 0.05 };
        if (!resultado.sucesso) {
          resultado.erro = 'Erro simulado para demonstração';
        }
      } else {
        // Envio real com imagem
        resultado = await enviarQRCodeReal(
          telefone,
          mensagemPersonalizada,
          qrData.qrCodeBase64,
          nome,
          tipoEnvio
        );
      }

      resultados.push({
        passageiro: nome,
        telefone,
        status: resultado.sucesso ? 'enviado' : 'erro',
        erro: resultado.erro,
        messageId: resultado.messageId
      });

      console.log(`${resultado.sucesso ? '✅' : '❌'} QR code para ${nome}`);

    } catch (error) {
      console.error(`❌ Erro ao enviar QR code para ${nome}:`, error);
      resultados.push({
        passageiro: nome,
        telefone,
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }

    // Delay entre envios
    if (i < qrCodes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const sucessos = resultados.filter(r => r.status === 'enviado').length;
  const erros = resultados.filter(r => r.status === 'erro').length;

  console.log(`🚀 Envio de QR codes concluído: ${sucessos} sucessos, ${erros} erros`);

  return {
    resultados,
    resumo: {
      total: qrCodes.length,
      sucessos,
      erros,
      taxa_sucesso: Math.round((sucessos / qrCodes.length) * 100)
    }
  };
}

// Função auxiliar para enviar QR code real
async function enviarQRCodeReal(
  telefone: string,
  mensagem: string,
  qrCodeBase64: string,
  nomeCliente: string,
  tipoApi: 'z-api' | 'evolution-api'
): Promise<{ sucesso: boolean; messageId?: string; erro?: string }> {
  try {
    // Limpar e formatar telefone
    let telefoneFormatado = telefone.replace(/\D/g, '');
    if (!telefoneFormatado.startsWith('55')) {
      telefoneFormatado = '55' + telefoneFormatado;
    }

    if (tipoApi === 'z-api') {
      return await enviarQRCodeZAPI(telefoneFormatado, mensagem, qrCodeBase64, nomeCliente);
    } else {
      return await enviarQRCodeEvolution(telefoneFormatado, mensagem, qrCodeBase64, nomeCliente);
    }

  } catch (error) {
    console.error(`❌ Erro ao enviar QR code para ${nomeCliente}:`, error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Envio via Z-API com imagem
async function enviarQRCodeZAPI(
  telefone: string,
  mensagem: string,
  qrCodeBase64: string,
  nomeCliente: string
): Promise<{ sucesso: boolean; messageId?: string; erro?: string }> {
  try {
    // Obter configuração do banco de dados
    const config = await obterConfiguracaoWhatsApp();
    
    if (config.api_tipo !== 'z-api') {
      throw new Error('Configuração não é do tipo Z-API');
    }

    const { instance, token, client_token } = config.configuracoes;
    
    if (!instance || !token) {
      throw new Error('Instância e token são obrigatórios para Z-API');
    }

    // Headers com client_token se disponível
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (client_token) {
      headers['Client-Token'] = client_token;
    }

    // Primeiro enviar a imagem
    const imageResponse = await fetch(`https://api.z-api.io/instances/${instance}/token/${token}/send-image`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phone: telefone,
        image: qrCodeBase64,
        caption: mensagem
      })
    });

    const imageResult = await imageResponse.json();

    if (imageResponse.ok && imageResult.messageId) {
      return {
        sucesso: true,
        messageId: imageResult.messageId
      };
    } else {
      throw new Error(imageResult.message || imageResult.error || 'Erro ao enviar imagem');
    }

  } catch (error) {
    console.error(`❌ Erro Z-API para ${nomeCliente}:`, error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro Z-API'
    };
  }
}

// Envio via Evolution API com imagem
async function enviarQRCodeEvolution(
  telefone: string,
  mensagem: string,
  qrCodeBase64: string,
  nomeCliente: string
): Promise<{ sucesso: boolean; messageId?: string; erro?: string }> {
  try {
    const config = await obterConfiguracaoWhatsApp();
    const { base_url, instance_name, api_key } = config.configuracoes;
    const cleanUrl = base_url.replace(/\/$/, '');

    // Remover o prefixo data:image/png;base64, se existir
    const base64Limpo = qrCodeBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch(`${cleanUrl}/message/sendMedia/${instance_name}`, {
      method: 'POST',
      headers: getEvolutionHeaders(api_key),
      body: JSON.stringify({
        number: telefone,
        mediatype: 'image',
        media: base64Limpo,
        caption: mensagem
      })
    });

    const result = await response.json();
    console.log('📋 Resposta Evolution API:', result);

    if (response.ok && result.key) {
      return {
        sucesso: true,
        messageId: result.key.id
      };
    } else {
      throw new Error(result.message || result.error || 'Erro Evolution API');
    }

  } catch (error) {
    console.error(`❌ Erro Evolution API para ${nomeCliente}:`, error);
    return {
      sucesso: false,
      erro: error instanceof Error ? error.message : 'Erro Evolution API'
    };
  }
}

// Função principal que escolhe o tipo de envio
export async function enviarMensagemMassa(
  passageiros: Passageiro[],
  mensagem: string,
  tipoEnvio: 'simulacao' | 'z-api' | 'evolution-api',
  dadosViagem?: Record<string, string>
): Promise<{
  resultados: ResultadoEnvio[];
  resumo: {
    total: number;
    sucessos: number;
    erros: number;
    taxa_sucesso: number;
  };
}> {
  let resultados: ResultadoEnvio[] = [];

  if (tipoEnvio === 'simulacao') {
    resultados = await simularEnvio(passageiros, mensagem, dadosViagem);
  } else if (tipoEnvio === 'z-api') {
    resultados = await enviarViaZAPI(passageiros, mensagem, dadosViagem);
  } else if (tipoEnvio === 'evolution-api') {
    resultados = await enviarViaEvolution(passageiros, mensagem, dadosViagem);
  }

  const sucessos = resultados.filter(r => r.status === 'enviado').length;
  const erros = resultados.filter(r => r.status === 'erro').length;

  return {
    resultados,
    resumo: {
      total: passageiros.length,
      sucessos,
      erros,
      taxa_sucesso: Math.round((sucessos / passageiros.length) * 100)
    }
  };
}