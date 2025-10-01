// Configurações das APIs de WhatsApp

export interface WhatsAppAPIConfig {
  nome: string;
  descricao: string;
  custoEstimado: number; // em reais por mensagem
  configuracaoNecessaria: string[];
  vantagens: string[];
  desvantagens: string[];
}

export const WHATSAPP_APIS: Record<string, WhatsAppAPIConfig> = {
  'simulacao': {
    nome: 'Simulação (Teste)',
    descricao: 'Modo de teste que simula o envio sem enviar mensagens reais',
    custoEstimado: 0,
    configuracaoNecessaria: [],
    vantagens: [
      'Gratuito',
      'Sem configuração necessária',
      'Perfeito para testes',
      'Simula resultados realistas'
    ],
    desvantagens: [
      'Não envia mensagens reais',
      'Apenas para demonstração'
    ]
  },
  
  'z-api': {
    nome: 'Z-API (Brasileiro)',
    descricao: 'API brasileira não oficial, mais barata e fácil de configurar',
    custoEstimado: 0.05,
    configuracaoNecessaria: [
      'ZAPI_INSTANCE - ID da sua instância',
      'ZAPI_TOKEN - Token de acesso'
    ],
    vantagens: [
      'Mais barato (R$ 0,05/mensagem)',
      'Configuração simples',
      'Suporte em português',
      'Envio em lote',
      'Sem aprovação prévia necessária'
    ],
    desvantagens: [
      'API não oficial',
      'Risco de bloqueio pelo WhatsApp',
      'Menos estável que a API oficial'
    ]
  },
  
  'whatsapp-business': {
    nome: 'WhatsApp Business API (Meta)',
    descricao: 'API oficial do Meta/Facebook, mais confiável mas cara',
    custoEstimado: 0.25,
    configuracaoNecessaria: [
      'WHATSAPP_PHONE_ID - ID do número de telefone',
      'WHATSAPP_ACCESS_TOKEN - Token de acesso',
      'Aprovação do Meta Business',
      'Verificação do número de telefone'
    ],
    vantagens: [
      'API oficial do WhatsApp',
      'Máxima confiabilidade',
      'Sem risco de bloqueio',
      'Suporte oficial',
      'Recursos avançados (templates, botões, etc.)'
    ],
    desvantagens: [
      'Mais caro (R$ 0,10-0,50/mensagem)',
      'Configuração complexa',
      'Precisa de aprovação do Meta',
      'Processo burocrático'
    ]
  }
};

// Função para calcular custo estimado
export const calcularCustoEstimado = (api: string, quantidadePassageiros: number): number => {
  const config = WHATSAPP_APIS[api];
  if (!config) return 0;
  
  return config.custoEstimado * quantidadePassageiros;
};

// Função para obter instruções de configuração
export const obterInstrucoesConfiguracao = (api: string): string[] => {
  const config = WHATSAPP_APIS[api];
  if (!config) return [];
  
  const instrucoes = [
    `## Como configurar ${config.nome}:`,
    '',
    '### Variáveis de ambiente necessárias (.env):',
    ...config.configuracaoNecessaria.map(item => `- ${item}`),
    '',
    '### Vantagens:',
    ...config.vantagens.map(item => `✅ ${item}`),
    '',
    '### Desvantagens:',
    ...config.desvantagens.map(item => `❌ ${item}`)
  ];
  
  if (api === 'z-api') {
    instrucoes.push(
      '',
      '### Passos para configurar Z-API:',
      '1. Acesse https://z-api.io',
      '2. Crie uma conta gratuita',
      '3. Crie uma instância do WhatsApp',
      '4. Escaneie o QR Code com seu WhatsApp',
      '5. Copie o ID da instância e token',
      '6. Adicione no arquivo .env do projeto'
    );
  }
  
  if (api === 'whatsapp-business') {
    instrucoes.push(
      '',
      '### Passos para configurar WhatsApp Business API:',
      '1. Acesse https://business.facebook.com',
      '2. Crie uma conta Meta Business',
      '3. Configure o WhatsApp Business API',
      '4. Solicite aprovação do Meta',
      '5. Configure webhook e tokens',
      '6. Adicione credenciais no .env'
    );
  }
  
  return instrucoes;
};

// Exemplo de arquivo .env
export const EXEMPLO_ENV = `
# WhatsApp Business API (Meta) - Oficial mas mais caro
WHATSAPP_PHONE_ID=sua_phone_id_aqui
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui

# Z-API - Brasileiro, mais barato
ZAPI_INSTANCE=sua_instancia_aqui
ZAPI_TOKEN=seu_token_aqui

# OpenAI - Opcional para personalização de mensagens
OPENAI_API_KEY=sua_chave_openai_aqui
`;