/**
 * Lista centralizada de cidades de embarque
 * Organizadas alfabeticamente para facilitar localização
 */

export const CIDADES_EMBARQUE = [
  "Agrolandia",
  "Agronomica", 
  "Apiuna",
  "Balneário Camboriú",
  "Barra Velha",
  "Blumenau",
  "Criciúma",
  "Curitiba",
  "Florianópolis",
  "Gaspar",
  "Ibirama",
  "Ilhota",
  "Indaial",
  "Itajai",
  "Itapema",
  "Ituporanga",
  "Joinville",
  "Laguna",
  "Lontras",
  "Navegantes",
  "Piçarras",
  "Porto Belo",
  "Presidente Getulio",
  "Rio do Sul",
  "Rodeio",
  "Trombudo Central",
  "Tubarão"
] as const;

/**
 * Opção especial para cidades não listadas
 */
export const CIDADE_OUTRA = "Outra (digitar manualmente)";

/**
 * Lista completa incluindo a opção "Outra"
 */
export const CIDADES_EMBARQUE_COMPLETA = [
  ...CIDADES_EMBARQUE,
  CIDADE_OUTRA
] as const;

/**
 * Função para verificar se uma cidade é a opção "Outra"
 */
export const isCidadeOutra = (cidade: string): boolean => {
  return cidade === CIDADE_OUTRA;
};

/**
 * Função para verificar se uma cidade está na lista predefinida
 */
export const isCidadePredefinida = (cidade: string): boolean => {
  return CIDADES_EMBARQUE.includes(cidade as any);
};

export type CidadeEmbarque = typeof CIDADES_EMBARQUE[number];
export type CidadeEmbarqueCompleta = typeof CIDADES_EMBARQUE_COMPLETA[number];