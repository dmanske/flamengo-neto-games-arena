/**
 * Configuração dos passeios disponíveis no sistema
 * Organizados em duas categorias: Pagos à Parte e Gratuitos
 */

export const PASSEIOS_CONFIG = {
  pagos: {
    titulo: "Passeios Pagos à Parte",
    descricao: "Passeios com custo adicional",
    lista: [
      "Cristo Redentor",
      "Pão de Açúcar",
      "Museu do Flamengo",
      "Aquário",
      "Roda-Gigante",
      "Museu do Amanhã",
      "Tour do Maracanã",
      "Rocinha",
      "Vidigal",
      "Rocinha + Vidigal",
      "Tour da Gávea",
      "Museu do Mar"
    ]
  },
  gratuitos: {
    titulo: "Passeios Gratuitos",
    descricao: "Passeios inclusos no pacote",
    lista: [
      "Lapa",
      "Escadaria Selarón",
      "Igreja Catedral Metropolitana",
      "Teatro Municipal",
      "Copacabana",
      "Ipanema",
      "Leblon",
      "Barra da Tijuca",
      "Museu do Amanhã",
      "Boulevard Olímpico",
      "Cidade do Samba",
      "Pedra do Sal",
      "Parque Lage"
    ]
  }
} as const;

// Tipos TypeScript derivados da configuração
export type PasseioPago = typeof PASSEIOS_CONFIG.pagos.lista[number];
export type PasseioGratuito = typeof PASSEIOS_CONFIG.gratuitos.lista[number];

// Tipo união para todos os passeios disponíveis
export type PasseioDisponivel = PasseioPago | PasseioGratuito;

// Função utilitária para validar se um passeio é válido
export const isPasseioValido = (passeio: string): passeio is PasseioDisponivel => {
  const todosPasseios = [
    ...PASSEIOS_CONFIG.pagos.lista,
    ...PASSEIOS_CONFIG.gratuitos.lista
  ];
  return todosPasseios.includes(passeio as PasseioDisponivel);
};

// Função utilitária para verificar se um passeio é pago
export const isPasseioPago = (passeio: string): passeio is PasseioPago => {
  return PASSEIOS_CONFIG.pagos.lista.includes(passeio as PasseioPago);
};

// Função utilitária para verificar se um passeio é gratuito
export const isPasseioGratuito = (passeio: string): passeio is PasseioGratuito => {
  return PASSEIOS_CONFIG.gratuitos.lista.includes(passeio as PasseioGratuito);
};

// Função para obter todos os passeios em uma única lista
export const getTodosPasseios = (): PasseioDisponivel[] => {
  return [
    ...PASSEIOS_CONFIG.pagos.lista,
    ...PASSEIOS_CONFIG.gratuitos.lista
  ];
};

// Função de validação para verificar se uma lista de passeios é válida
export const validatePasseios = (passeios: string[]): boolean => {
  if (!Array.isArray(passeios)) return false;
  
  return passeios.every(passeio => isPasseioValido(passeio));
};

// Função para filtrar passeios válidos de uma lista
export const filterPasseiosValidos = (passeios: string[]): PasseioDisponivel[] => {
  if (!Array.isArray(passeios)) return [];
  
  return passeios.filter((passeio): passeio is PasseioDisponivel => 
    isPasseioValido(passeio)
  );
};

// Função para separar passeios em pagos e gratuitos
export const separarPasseios = (passeios: string[]) => {
  const passeiosValidos = filterPasseiosValidos(passeios);
  
  return {
    pagos: passeiosValidos.filter(isPasseioPago),
    gratuitos: passeiosValidos.filter(isPasseioGratuito)
  };
};