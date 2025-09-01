/**
 * Mapeamento dos adversários e seus respectivos estádios
 * Usado para preencher automaticamente o nome do estádio ao selecionar o adversário
 */

export const ESTADIOS_POR_ADVERSARIO: Record<string, string> = {
  // Times do Rio de Janeiro (jogam no Maracanã quando mandantes)
  "Flamengo": "", // Não precisa - sempre no Maracanã quando mandante
  "Fluminense": "", // Não precisa - sempre no Maracanã quando mandante
  "Botafogo": "Estádio Nilton Santos (Engenhão)",
  "Vasco da Gama": "Estádio São Januário",

  // Times de São Paulo
  "Palmeiras": "Allianz Parque",
  "São Paulo": "Estádio do Morumbi",
  "Corinthians": "Neo Química Arena",
  "Santos": "Vila Belmiro",
  "Red Bull Bragantino": "Estádio Nabi Abi Chedid",
  "Mirassol": "Estádio José Maria de Campos Maia",

  // Times do Rio Grande do Sul
  "Grêmio": "Arena do Grêmio",
  "Internacional": "Estádio Beira-Rio",
  "Juventude": "Estádio Alfredo Jaconi",

  // Times de Minas Gerais
  "Atlético Mineiro": "Arena MRV",
  "Cruzeiro": "Estádio Mineirão",

  // Times do Nordeste
  "Bahia": "Arena Fonte Nova",
  "Fortaleza": "Arena Castelão",
  "Sport": "Ilha do Retiro",
  "Vitória": "Estádio Manoel Barradas (Barradão)",
  "Ceará": "Arena Castelão"
} as const;

/**
 * Função para obter o nome do estádio baseado no adversário
 */
export const getEstadioByAdversario = (adversario: string): string => {
  return ESTADIOS_POR_ADVERSARIO[adversario] || "";
};

/**
 * Função para verificar se o adversário joga no Rio de Janeiro
 */
export const isAdversarioDoRio = (adversario: string): boolean => {
  return ["Flamengo", "Fluminense", "Botafogo", "Vasco da Gama"].includes(adversario);
};

/**
 * Função para verificar se deve mostrar o campo nome do estádio
 * Só mostra se não for jogo em casa (Maracanã)
 */
export const shouldShowNomeEstadio = (localJogo: string): boolean => {
  return localJogo !== "casa";
};

/**
 * Função para obter as opções de setor baseado no local do jogo
 */
export const getSetorOptions = (localJogo: string) => {
  // Aceitar tanto "casa" quanto "Rio de Janeiro" para jogos no Maracanã
  if (localJogo === "casa" || localJogo === "Rio de Janeiro") {
    // Usar EXATAMENTE os mesmos setores que já estão cadastrados no sistema
    return [
      "Norte",
      "Sul", 
      "Leste Inferior", 
      "Leste Superior", 
      "Oeste",
      "Maracanã Mais",
      "Sem ingresso"
    ];
  }
  
  return ["Setor Casa", "Setor Visitante", "Sem ingresso"];
};

/**
 * Função para obter o label do campo setor baseado na viagem
 */
export const getSetorLabel = (localJogo: string, nomeEstadio?: string): string => {
  if (localJogo === "casa") {
    return "Setor do Maracanã";
  }
  
  if (nomeEstadio) {
    return `Setor do ${nomeEstadio}`;
  }
  
  return "Setor do Estádio";
};