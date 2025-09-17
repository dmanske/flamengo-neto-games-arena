/**
 * Utilitário para gerenciar faixas etárias específicas dos passeios
 * Cada passeio tem suas próprias regras de categorização por idade
 */

export interface FaixaEtariaConfig {
  nome: string;
  idadeMin: number;
  idadeMax: number;
  cor: string;
  corTexto: string;
  icone: string;
}

// Configurações específicas por passeio
export const FAIXAS_ETARIAS_PASSEIOS = {
  // Pão de Açúcar
  'pao_de_acucar': [
    { nome: 'Gratuidade', idadeMin: 0, idadeMax: 2, cor: 'bg-green-50', corTexto: 'text-green-800', icone: 'baby' },
    { nome: 'Meia-Entrada', idadeMin: 3, idadeMax: 21, cor: 'bg-purple-50', corTexto: 'text-purple-800', icone: 'graduationCap' },
    { nome: 'Inteira', idadeMin: 22, idadeMax: 59, cor: 'bg-blue-50', corTexto: 'text-blue-800', icone: 'user' },
    { nome: 'Idoso', idadeMin: 60, idadeMax: 120, cor: 'bg-orange-50', corTexto: 'text-orange-800', icone: 'userCheck' }
  ],
  
  // Museu do Flamengo
  'museu_do_flamengo': [
    { nome: 'Gratuidade', idadeMin: 0, idadeMax: 5, cor: 'bg-green-50', corTexto: 'text-green-800', icone: 'baby' },
    { nome: 'Mirim', idadeMin: 6, idadeMax: 12, cor: 'bg-pink-50', corTexto: 'text-pink-800', icone: 'baby' },
    { nome: 'Estudantes', idadeMin: 13, idadeMax: 17, cor: 'bg-purple-50', corTexto: 'text-purple-800', icone: 'graduationCap' },
    { nome: 'Adulto', idadeMin: 18, idadeMax: 59, cor: 'bg-blue-50', corTexto: 'text-blue-800', icone: 'user' },
    { nome: 'Idosos', idadeMin: 60, idadeMax: 120, cor: 'bg-orange-50', corTexto: 'text-orange-800', icone: 'userCheck' }
  ],
  
  // Cristo Redentor (e variações)
  'cristo_redentor': [
    { nome: 'Gratuidade', idadeMin: 0, idadeMax: 6, cor: 'bg-green-50', corTexto: 'text-green-800', icone: 'baby' },
    { nome: 'Tarifa Especial Infantil', idadeMin: 7, idadeMax: 11, cor: 'bg-pink-50', corTexto: 'text-pink-800', icone: 'baby' },
    { nome: 'Inteira', idadeMin: 12, idadeMax: 59, cor: 'bg-blue-50', corTexto: 'text-blue-800', icone: 'user' },
    { nome: 'Tarifa Especial Idoso', idadeMin: 60, idadeMax: 120, cor: 'bg-orange-50', corTexto: 'text-orange-800', icone: 'userCheck' }
  ]
} as const;

// Faixas etárias padrão para outros passeios
export const FAIXAS_ETARIAS_PADRAO: FaixaEtariaConfig[] = [
  { nome: 'Bebê', idadeMin: 0, idadeMax: 2, cor: 'bg-pink-50', corTexto: 'text-pink-800', icone: 'baby' },
  { nome: 'Criança', idadeMin: 3, idadeMax: 11, cor: 'bg-blue-50', corTexto: 'text-blue-800', icone: 'baby' },
  { nome: 'Estudante', idadeMin: 12, idadeMax: 17, cor: 'bg-purple-50', corTexto: 'text-purple-800', icone: 'graduationCap' },
  { nome: 'Adulto', idadeMin: 18, idadeMax: 64, cor: 'bg-green-50', corTexto: 'text-green-800', icone: 'user' },
  { nome: 'Idoso', idadeMin: 65, idadeMax: 120, cor: 'bg-orange-50', corTexto: 'text-orange-800', icone: 'userCheck' }
];

/**
 * Detecta o tipo de passeio baseado no nome
 */
export const detectarTipoPasseio = (nomePasseio: string): keyof typeof FAIXAS_ETARIAS_PASSEIOS | 'padrao' => {
  const nome = nomePasseio.toLowerCase();
  
  // Cristo Redentor e variações (incluindo possíveis erros de digitação)
  if (nome.includes('cristo redentor') || nome.includes('cristo redendor') || nome.includes('cristo')) {
    return 'cristo_redentor';
  }
  
  // Pão de Açúcar (incluindo possíveis variações e erros de digitação)
  if (nome.includes('pão de açúcar') || 
      nome.includes('pao de acucar') || 
      nome.includes('pao de açucar') ||
      nome.includes('pao de acuçar') ||
      nome.includes('pão de acucar') ||
      nome.includes('pao açucar') ||
      nome.includes('pão açúcar') ||
      nome.includes('bondinho') ||
      (nome.includes('pão') && nome.includes('açúcar')) ||
      (nome.includes('pao') && nome.includes('acucar'))) {
    return 'pao_de_acucar';
  }
  
  // Museu do Flamengo
  if (nome.includes('museu do flamengo')) {
    return 'museu_do_flamengo';
  }
  
  // Todos os outros passeios usam faixas padrão
  return 'padrao';
};

/**
 * Obtém as faixas etárias para um passeio específico
 */
export const obterFaixasEtarias = (nomePasseio: string): FaixaEtariaConfig[] => {
  const tipoPasseio = detectarTipoPasseio(nomePasseio);
  
  if (tipoPasseio === 'padrao') {
    return FAIXAS_ETARIAS_PADRAO;
  }
  
  return FAIXAS_ETARIAS_PASSEIOS[tipoPasseio];
};

/**
 * Categoriza uma idade baseada nas faixas etárias de um passeio específico
 */
export const categorizarIdadePorPasseio = (idade: number, nomePasseio: string): FaixaEtariaConfig => {
  const faixas = obterFaixasEtarias(nomePasseio);
  
  for (const faixa of faixas) {
    if (idade >= faixa.idadeMin && idade <= faixa.idadeMax) {
      return faixa;
    }
  }
  
  // Fallback para idade não informada
  return {
    nome: 'Não Informado',
    idadeMin: 0,
    idadeMax: 0,
    cor: 'bg-gray-50',
    corTexto: 'text-gray-800',
    icone: 'users'
  };
};

/**
 * Obtém a descrição da faixa etária (ex: "0-6 anos")
 */
export const obterDescricaoFaixaEtaria = (faixa: FaixaEtariaConfig): string => {
  if (faixa.nome === 'Não Informado') return 'Idade não informada';
  
  if (faixa.idadeMax >= 120) {
    return `${faixa.idadeMin}+ anos`;
  }
  
  if (faixa.idadeMin === faixa.idadeMax) {
    return `${faixa.idadeMin} anos`;
  }
  
  return `${faixa.idadeMin}-${faixa.idadeMax} anos`;
};