// Utilitários para validações de grupos e trocas de ônibus

export interface ValidacaoResult {
  valido: boolean;
  erro?: string;
  aviso?: string;
}

/**
 * Valida se um nome de grupo é válido
 */
export function validarNomeGrupo(nome: string, gruposExistentes: string[] = []): ValidacaoResult {
  const nomeNormalizado = nome.trim();
  
  if (!nomeNormalizado) {
    return {
      valido: false,
      erro: 'Nome do grupo é obrigatório'
    };
  }
  
  if (nomeNormalizado.length < 2) {
    return {
      valido: false,
      erro: 'Nome do grupo deve ter pelo menos 2 caracteres'
    };
  }
  
  if (nomeNormalizado.length > 50) {
    return {
      valido: false,
      erro: 'Nome do grupo deve ter no máximo 50 caracteres'
    };
  }
  
  // Verificar caracteres especiais problemáticos
  const caracteresProibidos = /[<>\"'&]/;
  if (caracteresProibidos.test(nomeNormalizado)) {
    return {
      valido: false,
      erro: 'Nome do grupo contém caracteres não permitidos'
    };
  }
  
  // Verificar se já existe (case insensitive)
  const nomeExiste = gruposExistentes.some(
    grupo => grupo.toLowerCase() === nomeNormalizado.toLowerCase()
  );
  
  if (nomeExiste) {
    return {
      valido: false,
      erro: 'Já existe um grupo com este nome'
    };
  }
  
  return { valido: true };
}

/**
 * Valida se uma cor de grupo é válida
 */
export function validarCorGrupo(cor: string, coresUsadas: string[] = []): ValidacaoResult {
  if (!cor) {
    return {
      valido: false,
      erro: 'Cor do grupo é obrigatória'
    };
  }
  
  // Verificar formato hex
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexRegex.test(cor)) {
    return {
      valido: false,
      erro: 'Cor deve estar no formato hexadecimal (#RRGGBB)'
    };
  }
  
  // Verificar se a cor já está sendo usada
  const corUsada = coresUsadas.includes(cor);
  if (corUsada) {
    return {
      valido: true,
      aviso: 'Esta cor já está sendo usada por outro grupo'
    };
  }
  
  return { valido: true };
}

/**
 * Valida se uma troca de ônibus é possível
 */
export function validarTrocaOnibus(
  capacidadeDestino: number,
  ocupacaoAtual: number,
  onibusOrigemId?: string | null,
  onibusDestinoId?: string | null
): ValidacaoResult {
  // Se está removendo do ônibus (destino null), sempre permitir
  if (!onibusDestinoId) {
    return { valido: true };
  }
  
  // Se está movendo para o mesmo ônibus, não permitir
  if (onibusOrigemId === onibusDestinoId) {
    return {
      valido: false,
      erro: 'Passageiro já está neste ônibus'
    };
  }
  
  // Verificar capacidade
  if (ocupacaoAtual >= capacidadeDestino) {
    return {
      valido: false,
      erro: `Ônibus de destino está lotado (${ocupacaoAtual}/${capacidadeDestino} lugares)`
    };
  }
  
  // Aviso se está quase lotado
  const percentualOcupacao = ((ocupacaoAtual + 1) / capacidadeDestino) * 100;
  if (percentualOcupacao >= 90) {
    return {
      valido: true,
      aviso: `Ônibus ficará quase lotado após a troca (${ocupacaoAtual + 1}/${capacidadeDestino})`
    };
  }
  
  return { valido: true };
}

/**
 * Gera mensagens de erro amigáveis para diferentes cenários
 */
export const MENSAGENS_ERRO = {
  // Erros de conexão
  CONEXAO_PERDIDA: 'Conexão perdida. Verifique sua internet e tente novamente.',
  TIMEOUT: 'Operação demorou muito para responder. Tente novamente.',
  SERVIDOR_INDISPONIVEL: 'Servidor temporariamente indisponível. Tente novamente em alguns minutos.',
  
  // Erros de validação
  DADOS_INVALIDOS: 'Dados fornecidos são inválidos. Verifique e tente novamente.',
  PASSAGEIRO_NAO_ENCONTRADO: 'Passageiro não encontrado. A página será recarregada.',
  ONIBUS_NAO_ENCONTRADO: 'Ônibus não encontrado. A página será recarregada.',
  
  // Erros de negócio
  ONIBUS_LOTADO: 'Não é possível realizar a troca. O ônibus de destino está lotado.',
  GRUPO_JA_EXISTE: 'Já existe um grupo com este nome. Escolha outro nome ou junte-se ao grupo existente.',
  COR_OBRIGATORIA: 'Selecione uma cor para o grupo.',
  
  // Erros genéricos
  ERRO_INESPERADO: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
  OPERACAO_CANCELADA: 'Operação cancelada pelo usuário.',
} as const;

/**
 * Converte erros do Supabase em mensagens amigáveis
 */
export function tratarErroSupabase(error: any): string {
  if (!error) return MENSAGENS_ERRO.ERRO_INESPERADO;
  
  const codigo = error.code;
  const mensagem = error.message?.toLowerCase() || '';
  
  // Erros de conexão
  if (codigo === 'PGRST301' || mensagem.includes('network')) {
    return MENSAGENS_ERRO.CONEXAO_PERDIDA;
  }
  
  if (codigo === 'PGRST000' || mensagem.includes('timeout')) {
    return MENSAGENS_ERRO.TIMEOUT;
  }
  
  // Erros de dados
  if (codigo === 'PGRST116' || mensagem.includes('not found')) {
    return MENSAGENS_ERRO.PASSAGEIRO_NAO_ENCONTRADO;
  }
  
  if (codigo === '23505' || mensagem.includes('duplicate')) {
    return MENSAGENS_ERRO.GRUPO_JA_EXISTE;
  }
  
  if (codigo === '23514' || mensagem.includes('check constraint')) {
    return MENSAGENS_ERRO.DADOS_INVALIDOS;
  }
  
  // Erro genérico
  return MENSAGENS_ERRO.ERRO_INESPERADO;
}

/**
 * Função para retry automático com backoff exponencial
 */
export async function executarComRetry<T>(
  operacao: () => Promise<T>,
  maxTentativas: number = 3,
  delayInicial: number = 1000
): Promise<T> {
  let ultimoErro: any;
  
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    try {
      return await operacao();
    } catch (error) {
      ultimoErro = error;
      
      // Se é o último retry, lançar o erro
      if (tentativa === maxTentativas) {
        throw error;
      }
      
      // Calcular delay com backoff exponencial
      const delay = delayInicial * Math.pow(2, tentativa - 1);
      
      // Aguardar antes do próximo retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw ultimoErro;
}