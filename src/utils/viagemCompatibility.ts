// Utilitários para compatibilidade entre sistema antigo e novo de passeios

export interface ViagemLegacy {
  id: string;
  passeios_pagos?: string[];
  outro_passeio?: string;
  created_at: string;
}

export interface ViagemNova {
  id: string;
  viagem_passeios?: Array<{
    passeio_id: string;
    passeios?: {
      nome: string;
      valor: number;
      categoria: string;
    };
  }>;
  outro_passeio?: string;
  created_at: string;
}

export type ViagemHibrida = ViagemLegacy & ViagemNova;

/**
 * Detecta se uma viagem usa o sistema novo de passeios
 */
export const isViagemNova = (viagem: ViagemHibrida): boolean => {
  // Verifica se tem relacionamentos na nova tabela viagem_passeios
  return !!(viagem.viagem_passeios && viagem.viagem_passeios.length > 0);
};

/**
 * Detecta se uma viagem usa o sistema antigo de passeios
 */
export const isViagemLegacy = (viagem: ViagemHibrida): boolean => {
  // Verifica se tem passeios no campo antigo e NÃO tem no novo
  return !!(viagem.passeios_pagos && viagem.passeios_pagos.length > 0 && !isViagemNova(viagem));
};

/**
 * Formata passeios para exibição, independente do sistema
 */
export const formatarPasseiosParaExibicao = (viagem: ViagemHibrida): string[] => {
  if (isViagemNova(viagem)) {
    // Sistema novo - usar viagem_passeios
    return viagem.viagem_passeios?.map(vp => vp.passeios?.nome || 'Passeio') || [];
  } else if (isViagemLegacy(viagem)) {
    // Sistema antigo - usar passeios_pagos
    return viagem.passeios_pagos || [];
  }
  
  return [];
};

/**
 * Calcula valor total dos passeios, independente do sistema
 */
export const calcularValorTotalPasseios = (viagem: ViagemHibrida): number => {
  if (isViagemNova(viagem)) {
    // Sistema novo - somar valores dos relacionamentos
    return viagem.viagem_passeios?.reduce((total, vp) => total + (vp.passeios?.valor || 0), 0) || 0;
  } else {
    // Sistema antigo - não tem valores específicos
    return 0;
  }
};

/**
 * Obtém informações de compatibilidade da viagem
 */
export const getViagemCompatibilityInfo = (viagem: ViagemHibrida) => {
  try {
    const isNova = isViagemNova(viagem);
    const isLegacy = isViagemLegacy(viagem);
    const passeios = formatarPasseiosParaExibicao(viagem);
    const valorPasseios = calcularValorTotalPasseios(viagem);
    
    return {
      isNova,
      isLegacy,
      sistema: isNova ? 'novo' : isLegacy ? 'legacy' : 'sem_passeios',
      passeios,
      valorPasseios,
      temPasseios: passeios.length > 0,
      outroPasseio: viagem.outro_passeio
    };
  } catch (error) {
    console.error('Erro ao processar compatibilidade da viagem:', error);
    return {
      isNova: false,
      isLegacy: false,
      sistema: 'erro' as const,
      passeios: [],
      valorPasseios: 0,
      temPasseios: false,
      outroPasseio: undefined
    };
  }
};