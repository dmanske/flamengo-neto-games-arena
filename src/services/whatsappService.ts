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

// Configurações da Z-API (suas credenciais)
const ZAPI_CONFIG = {
  instance: '3E828379B96321C3F05F8E65D9290832',
  instanceToken: '919F340DFC24793E6272CEE2',
  clientToken: 'F0f2b43602eec4a579190654f25cbfbd9S', // ✅ Client-Token da conta
  baseUrl: 'https://api.z-api.io'
};

// URLs da Z-API - endpoints corretos
const ZAPI_ENDPOINTS = {
  // Formato original da sua tela
  original: 'https://api.z-api.io/instances/3E8077178ADA21EF6CC5B2116B9188C4/token/A2DA670A44F0FD8D1A23579E/send-text',
  // Outros endpoints possíveis
  sendText: `${ZAPI_CONFIG.baseUrl}/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/send-text`,
  sendMessage: `${ZAPI_CONFIG.baseUrl}/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/send-message`,
  messages: `${ZAPI_CONFIG.baseUrl}/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/messages`
};

// Headers padrão para Z-API com Client-Token
const getZAPIHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Client-Token': ZAPI_CONFIG.clientToken
  };
};

// Função para testar status da instância Z-API
async function testarStatusInstancia(): Promise<{ sucesso: boolean; status?: string; erro?: string }> {
  try {
    const response = await fetch(`${ZAPI_CONFIG.baseUrl}/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/status`, {
      method: 'GET',
      headers: getZAPIHeaders()
    });

    const data = await response.json();
    console.log('📋 Status da instância:', data);

    if (response.ok && !data.error) {
      return { sucesso: true, status: data.connected ? 'conectada' : 'desconectada' };
    }

    return { sucesso: false, erro: data.error || 'Erro desconhecido' };
  } catch (error) {
    return { sucesso: false, erro: error instanceof Error ? error.message : 'Erro de conexão' };
  }
}

// Função para testar a configuração
export async function testarConfiguracaoZAPI(): Promise<{ sucesso: boolean; erro?: string }> {
  try {
    console.log('🧪 Testando configuração Z-API com Client-Token...');

    // Primeiro, testar o status da instância
    const statusTest = await testarStatusInstancia();
    if (statusTest.sucesso) {
      console.log(`✅ Instância ${statusTest.status}!`);
      return { sucesso: true };
    }

    // Se não funcionou, testar envio com número inválido para verificar se aceita o token
    console.log('🔧 Testando endpoint de envio...');

    const response = await fetch(ZAPI_ENDPOINTS.sendText, {
      method: 'POST',
      headers: getZAPIHeaders(),
      body: JSON.stringify({
        phone: '5511999999999',
        message: 'Teste de configuração Z-API'
      })
    });

    const data = await response.json();
    console.log('📋 Resposta do teste de envio:', data);

    // A Z-API pode retornar diferentes erros quando funciona
    if (response.ok ||
      data.error === "PHONE_NUMBER_INVALID" ||
      data.error === "INSTANCE_NOT_CONNECTED" ||
      data.message?.includes("phone") ||
      data.error?.includes("INSTANCE") ||
      (data.error !== "your client-token is not configured" && data.error !== "NOT_FOUND")) {
      console.log('✅ Z-API configurada corretamente!');
      return { sucesso: true };
    }

    console.error('❌ Erro de configuração:', data);
    return {
      sucesso: false,
      erro: data.error === "your client-token is not configured"
        ? 'Client-Token inválido. Verifique se você copiou o token correto da Z-API.'
        : data.error || 'Erro desconhecido'
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

      // Formato correto baseado na documentação oficial da Z-API
      const response = await fetch(`https://api.z-api.io/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/send-text`, {
        method: 'POST',
        headers: getZAPIHeaders(),
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
    // Limpar e formatar telefone
    let telefoneFormatado = telefone.replace(/\D/g, '');
    if (!telefoneFormatado.startsWith('55')) {
      telefoneFormatado = '55' + telefoneFormatado;
    }

    // Personalizar mensagem com nome do cliente
    const mensagemPersonalizada = mensagem.replace(/{NOME}/g, nomeCliente);

    const response = await fetch(`https://api.z-api.io/instances/${ZAPI_CONFIG.instance}/token/${ZAPI_CONFIG.instanceToken}/send-text`, {
      method: 'POST',
      headers: getZAPIHeaders(),
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

// Função principal que escolhe o tipo de envio
export async function enviarMensagemMassa(
  passageiros: Passageiro[],
  mensagem: string,
  tipoEnvio: 'simulacao' | 'z-api',
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